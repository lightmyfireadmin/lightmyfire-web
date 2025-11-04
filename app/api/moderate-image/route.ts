import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

interface ModerationRequest {
  imageUrl: string;
  imageBase64?: string;
  userId: string;
  contentType?: string; // 'post', 'profile', 'lighter_preview', etc.
}

interface CategoryScore {
  [category: string]: number;
}

interface ModerationResult {
  flagged: boolean;
  categories: {
    [key: string]: boolean;
  };
  category_scores: CategoryScore;
  reason?: string;
  severityLevel?: 'low' | 'medium' | 'high';
}

/**
 * Moderate image content using OpenAI's multimodal Moderation API
 * Uses the new omni-moderation-latest model (free)
 * Checks for: sexual content, hate speech, violence, harassment, self-harm, illegal activities
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ModerationRequest;
    const { imageUrl, imageBase64, userId, contentType = 'general' } = body;

    const rateLimitResult = rateLimit(request, 'moderation', userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many moderation requests. Please try again later.' },
        { status: 429 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    // Prepare image input for OpenAI moderation
    let imageInput: string;

    if (imageBase64) {
      // Ensure base64 string is clean (remove data URL prefix if present)
      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      // Validate base64 format
      if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
        return NextResponse.json(
          { error: 'Invalid base64 image data' },
          { status: 400 }
        );
      }

      imageInput = `data:image/png;base64,${cleanBase64}`;
    } else if (imageUrl) {
      // Validate URL format
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: 'Invalid image URL' },
          { status: 400 }
        );
      }
      imageInput = imageUrl;
    } else {
      throw new Error('No valid image source provided');
    }

    // Use OpenAI's omni-moderation-latest model (free, multimodal)
    const moderation = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: {
            url: imageInput,
          },
        } as any,
      ] as any,
    });

    const result = moderation.results[0];

    // Convert Categories to plain object
    const categoriesObj: { [key: string]: boolean } = {};
    const scoresObj: CategoryScore = {};

    // Extract categories and scores from OpenAI response
    for (const [key, value] of Object.entries(result.categories)) {
      categoriesObj[key] = value as boolean;
    }

    for (const [key, value] of Object.entries(result.category_scores)) {
      scoresObj[key] = value as number;
    }

    // Determine severity level
    const severity = calculateSeverity(scoresObj, categoriesObj);

    const moderationResult: ModerationResult = {
      flagged: result.flagged,
      categories: categoriesObj,
      category_scores: scoresObj,
      severityLevel: severity,
    };

    // If flagged, add detailed reason
    if (result.flagged) {
      const flaggedCategories = Object.entries(categoriesObj)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);

      moderationResult.reason = `Image violates policy: ${formatCategoryNames(flaggedCategories).join(', ')}`;
    }

    // Log moderation result for audit trail
    try {
      await logModerationResult({
        userId,
        contentType,
        imageUrl: imageUrl || 'base64-provided',
        flagged: result.flagged,
        categories: categoriesObj,
        scores: scoresObj,
        severity,
        timestamp: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log moderation result:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(moderationResult, { status: 200 });
  } catch (error) {
    console.error('Image moderation error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to moderate image. Please try again.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate severity level based on flagged categories and scores
 */
function calculateSeverity(
  scores: CategoryScore,
  categories: { [key: string]: boolean }
): 'low' | 'medium' | 'high' {
  // Critical categories that should be marked as high severity
  const criticalCategories = [
    'child_sexual_abuse_material_csat',
    'self_harm',
    'violence',
  ];

  // Check if any critical categories are flagged
  for (const category of criticalCategories) {
    if (categories[category]) {
      return 'high';
    }
  }

  // Check score thresholds for medium severity
  const mediumCategories = ['sexual', 'hate', 'harassment'];
  const hasMediumScore = mediumCategories.some((cat) => (scores[cat] || 0) > 0.5);

  if (hasMediumScore) {
    return 'medium';
  }

  // Everything else is low severity (but still flagged)
  return 'low';
}

/**
 * Format category names for human-readable output
 */
function formatCategoryNames(categories: string[]): string[] {
  const nameMap: { [key: string]: string } = {
    sexual: 'Sexual Content',
    hate: 'Hate Speech',
    harassment: 'Harassment',
    violence: 'Violence',
    'self-harm': 'Self-Harm',
    self_harm: 'Self-Harm',
    illicit: 'Illegal Activities',
    'illegal_activities': 'Illegal Activities',
    'graphic_violence': 'Graphic Violence',
    'child_sexual_abuse_material_csat': 'Child Safety',
  };

  return categories.map((cat) => nameMap[cat] || cat);
}

/**
 * Log moderation results to database for audit trail
 */
async function logModerationResult(data: {
  userId: string;
  contentType: string;
  imageUrl: string;
  flagged: boolean;
  categories: { [key: string]: boolean };
  scores: CategoryScore;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}): Promise<void> {
  try {
    // Call a client-side logging endpoint or log locally for now
    // In production, this would be called by the client after receiving the moderation result
    console.log('Image moderation check completed:', {
      userId: data.userId,
      contentType: data.contentType,
      flagged: data.flagged,
      severity: data.severity,
    });
  } catch (err) {
    console.error('Failed to log image moderation:', err);
    // Don't throw - logging should not block the request
  }
}
