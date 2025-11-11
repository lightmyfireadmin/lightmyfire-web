import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/api-response';
import { withCache, generateCacheKey, CacheTTL } from '@/lib/cache';

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimitResult = rateLimit(request, 'youtube', ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many search requests. Please try again later.',
          { resetTime: rateLimitResult.resetTime }
        ),
        { status: 429 }
      );
    }

    const { query } = await request.json();

        if (!query || typeof query !== 'string') {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.INVALID_INPUT, 'Invalid query parameter'),
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Query too long', { maxLength: 100 }),
        { status: 400 }
      );
    }

        const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.error('YOUTUBE_API_KEY is not set');
      return NextResponse.json(
        createErrorResponse(ErrorCodes.SERVICE_UNAVAILABLE, 'YouTube API is not configured'),
        { status: 500 }
      );
    }

    // Generate cache key based on search query
    const cacheKey = generateCacheKey('youtube', query.toLowerCase().trim());

    // Cache search results for 30 minutes
    const items = await withCache(
      cacheKey,
      async () => {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`
        );

        const data = await response.json();

        if (data.error) {
          console.error('YouTube API Error:', data.error);
          throw new Error(data.error.message || 'YouTube API error');
        }

        return (data.items as YouTubeVideo[] || []).map((video) => ({
          id: { videoId: video.id.videoId },
          snippet: {
            title: video.snippet.title,
            thumbnails: {
              default: { url: video.snippet.thumbnails.default.url }
            }
          }
        }));
      },
      CacheTTL.LONG // 30 minutes cache
    );

    return NextResponse.json(
      createSuccessResponse(items, `Found ${items.length} results`)
    );

  } catch (error) {
    console.error('YouTube Search Route Error:', error);
    return NextResponse.json(
      createErrorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to search YouTube'),
      { status: 500 }
    );
  }
}
