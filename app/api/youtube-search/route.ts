import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimitResult = rateLimit(request, 'youtube', ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many search requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const { query } = await request.json();

        if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query parameter' },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Query too long' },
        { status: 400 }
      );
    }

        const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.error('YOUTUBE_API_KEY is not set');
      return NextResponse.json(
        { error: 'YouTube API is not configured' },
        { status: 500 }
      );
    }

        const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`
    );

    const data = await response.json();

        if (data.error) {
      console.error('YouTube API Error:', data.error);
      return NextResponse.json(
        {
          error: 'YouTube search failed',
          details: data.error.message
        },
        { status: 400 }
      );
    }

        const items = (data.items || []).map((video: any) => ({
      id: { videoId: video.id.videoId },
      snippet: {
        title: video.snippet.title,
        thumbnails: {
          default: { url: video.snippet.thumbnails.default.url }
        }
      }
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error('YouTube Search Route Error:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube' },
      { status: 500 }
    );
  }
}
