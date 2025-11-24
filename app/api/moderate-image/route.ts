import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import crypto from 'crypto';

/**
 * Forces the route to be dynamic to ensure authentication checks run on every request.
 */
export const dynamic = 'force-dynamic';

// Startup validation: Check OpenAI API key at module load time
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  CRITICAL: OPENAI_API_KEY not configured. Image moderation will fail!');
  console.error('⚠️  Please set OPENAI_API_KEY environment variable to enable content moderation.');
}

interface ModerationRequest {
  imageUrl: string;
  imageBase64?: string;
  contentType?: string;
}

interface ModerationImageInput {
  type: 'image_url';
  image_url: {
    url: string;
  };
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
 * Handles POST requests to moderate image content using OpenAI's Moderation API.
 *
 * This endpoint validates the image (URL or Base64), sends it to OpenAI for analysis,
 * and returns a moderation result indicating if the content violates safety policies.
 * It also logs the result to the database for audit purposes.
 *
 * @param {NextRequest} request - The incoming request containing image data.
 * @returns {Promise<NextResponse>} A JSON response with moderation results or an error.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to moderate content.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json() as ModerationRequest;
    const { imageUrl, imageBase64, contentType = 'general' } = body;

    // Enforce rate limiting
    const rateLimitResult = rateLimit(request, 'moderation', userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many moderation requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check API configuration
    if (!process.env.OPENAI_API_KEY) {
      console.error('CRITICAL: OPENAI_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'Content moderation system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    let imageInput: string;

    // Process image input (Base64 or URL)
    if (imageBase64) {
      // Ensure proper format
      const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

      // Basic base64 validation
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

    // Call OpenAI Moderation API
    const moderation = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: {
            url: imageInput,
          },
        } as ModerationImageInput,
      ] as ModerationImageInput[],
    });

    const result = moderation.results[0];

    // Process results
    const categoriesObj: { [key: string]: boolean } = {};
    const scoresObj: CategoryScore = {};

    // Convert OpenAI response to standard object format
    for (const [key, value] of Object.entries(result.categories)) {
      categoriesObj[key] = value as boolean;
    }

    for (const [key, value] of Object.entries(result.category_scores)) {
      scoresObj[key] = value as number;
    }

    // Calculate severity level
    const severity = calculateSeverity(scoresObj, categoriesObj);

    const moderationResult: ModerationResult = {
      flagged: result.flagged,
      categories: categoriesObj,
      category_scores: scoresObj,
      severityLevel: severity,
    };

    // Add detailed reason if flagged
    if (result.flagged) {
      const flaggedCategories = Object.entries(categoriesObj)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);

      moderationResult.reason = `Image violates policy: ${formatCategoryNames(flaggedCategories).join(', ')}`;
    }

    // Log result to database (non-blocking)
    try {
      await logModerationResult(supabase, {
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
      // Don't fail request if logging fails
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
 * Calculates the severity level of the flagged content based on categories and scores.
 *
 * @param {CategoryScore} scores - The scores returned by the moderation API.
 * @param {{ [key: string]: boolean }} categories - The categories flagged by the API.
 * @returns {'low' | 'medium' | 'high'} The calculated severity level.
 */
function calculateSeverity(
  scores: CategoryScore,
  categories: { [key: string]: boolean }
): 'low' | 'medium' | 'high' {
    // Critical categories that immediately trigger high severity
    const criticalCategories = [
    'child_sexual_abuse_material_csat',
    'self_harm',
    'violence',
  ];

    for (const category of criticalCategories) {
    if (categories[category]) {
      return 'high';
    }
  }

    // Medium severity check based on scores
    const mediumCategories = ['sexual', 'hate', 'harassment'];
  const hasMediumScore = mediumCategories.some((cat) => (scores[cat] || 0) > 0.5);

  if (hasMediumScore) {
    return 'medium';
  }

    return 'low';
}

/**
 * Formats category keys into human-readable names.
 *
 * @param {string[]} categories - Array of category keys.
 * @returns {string[]} Array of human-readable category names.
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
 * Logs the moderation result to the database for auditing and compliance.
 *
 * @param {ReturnType<typeof createServerSupabaseClient>} supabase - The Supabase client instance.
 * @param {object} data - The moderation result data to log.
 * @returns {Promise<void>} A promise that resolves when logging is complete.
 */
async function logModerationResult(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  data: {
    userId: string;
    contentType: string;
    imageUrl: string;
    flagged: boolean;
    categories: { [key: string]: boolean };
    scores: CategoryScore;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }
): Promise<void> {
  try {
    // Create URL hash for audit trail identity
    const urlHash = crypto.createHash('sha256').update(data.imageUrl).digest('hex');

    const flaggedCategories = Object.entries(data.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category); // eslint-disable-line @typescript-eslint/no-unused-vars

    // Store in moderation_logs table for audit trail
    await supabase.from('moderation_logs').insert({
      user_id: data.userId,
      content_type: data.contentType,
      content_hash: urlHash,
      content_length: null, // Images don't have content length in char count
      flagged: data.flagged,
      categories: data.categories || {},
      category_scores: data.scores || {},
      severity: data.severity,
      decision: data.flagged ? 'BLOCKED' : 'APPROVED',
    });
  } catch (err) {
    console.error('Failed to log image moderation:', err);
  }
}
