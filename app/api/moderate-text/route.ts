import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/lib/rateLimit';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Startup validation: Check OpenAI API key at module load time
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  CRITICAL: OPENAI_API_KEY not configured. Content moderation will fail!');
  console.error('⚠️  Please set OPENAI_API_KEY environment variable to enable content moderation.');
}

interface ModerationRequest {
  text: string;
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
    const { text, contentType = 'general' } = body;

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

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

        if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long (max 10000 characters)' },
        { status: 400 }
      );
    }

            const moderation = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: text,
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

      moderationResult.reason = `Content violates policy: ${formatCategoryNames(flaggedCategories).join(', ')}`;
    }

        try {
      await logModerationResult(supabase, {
        userId,
        contentType,
        text,
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
    console.error('Text moderation error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to moderate text. Please try again.' },
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

    const mediumCategories = ['hate', 'harassment', 'sexual'];
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

async function logModerationResult(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  data: {
    userId: string;
    contentType: string;
    text: string;
    flagged: boolean;
    categories: { [key: string]: boolean };
    scores: CategoryScore;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }
): Promise<void> {
  try {
    // Create content hash for audit trail (don't store actual content for privacy)
    const contentHash = crypto.createHash('sha256').update(data.text).digest('hex');

    const flaggedCategories = Object.entries(data.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    // Store in moderation_logs table for audit trail
    await supabase.from('moderation_logs').insert({
      user_id: data.userId,
      content_type: data.contentType,
      content_hash: contentHash,
      content_length: data.text.length,
      flagged: data.flagged,
      categories: data.categories || {},
      category_scores: data.scores || {},
      severity: data.severity,
      decision: data.flagged ? 'BLOCKED' : 'APPROVED',
    });
  } catch (err) {
    console.error('Failed to log moderation:', err);
  }
}
