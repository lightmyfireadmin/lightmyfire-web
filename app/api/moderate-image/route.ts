import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface ModerationRequest {
  imageUrl: string;
  imageBase64?: string;
  contentType?: string; }

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

export async function POST(request: NextRequest) {
  try {
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

    const rateLimitResult = rateLimit(request, 'moderation', userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many moderation requests. Please try again later.' },
        { status: 429 }
      );
    }

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

    if (imageBase64) {
            const cleanBase64 = imageBase64.includes(',')
        ? imageBase64.split(',')[1]
        : imageBase64;

            if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
        return NextResponse.json(
          { error: 'Invalid base64 image data' },
          { status: 400 }
        );
      }

      imageInput = `data:image/png;base64,${cleanBase64}`;
    } else if (imageUrl) {
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

        const categoriesObj: { [key: string]: boolean } = {};
    const scoresObj: CategoryScore = {};

        for (const [key, value] of Object.entries(result.categories)) {
      categoriesObj[key] = value as boolean;
    }

    for (const [key, value] of Object.entries(result.category_scores)) {
      scoresObj[key] = value as number;
    }

        const severity = calculateSeverity(scoresObj, categoriesObj);

    const moderationResult: ModerationResult = {
      flagged: result.flagged,
      categories: categoriesObj,
      category_scores: scoresObj,
      severityLevel: severity,
    };

        if (result.flagged) {
      const flaggedCategories = Object.entries(categoriesObj)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);

      moderationResult.reason = `Image violates policy: ${formatCategoryNames(flaggedCategories).join(', ')}`;
    }

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

function calculateSeverity(
  scores: CategoryScore,
  categories: { [key: string]: boolean }
): 'low' | 'medium' | 'high' {
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

    const mediumCategories = ['sexual', 'hate', 'harassment'];
  const hasMediumScore = mediumCategories.some((cat) => (scores[cat] || 0) > 0.5);

  if (hasMediumScore) {
    return 'medium';
  }

    return 'low';
}

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
            console.log('Image moderation check completed:', {
      userId: data.userId,
      contentType: data.contentType,
      flagged: data.flagged,
      severity: data.severity,
    });
  } catch (err) {
    console.error('Failed to log image moderation:', err);
      }
}
