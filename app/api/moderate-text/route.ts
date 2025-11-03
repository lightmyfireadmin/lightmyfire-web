import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';

interface ModerationRequest {
  text: string;
  userId: string;
  contentType?: string; // 'post', 'comment', 'lighter_name', etc.
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
 * Moderate text content using OpenAI's multimodal Moderation API
 * Uses the new omni-moderation-latest model (free)
 * Checks for: sexual content, hate speech, harassment, violence, self-harm, illegal activities, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize OpenAI at request time to avoid build-time errors
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await request.json() as ModerationRequest;
    const { text, userId, contentType = 'general' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate text length
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    // Use OpenAI's omni-moderation-latest model (free, multimodal)
    const moderation = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: text,
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

    // Determine severity level based on flagged categories and scores
    const severity = calculateSeverity(scoresObj, categoriesObj);

    const moderationResult: ModerationResult = {
      flagged: result.flagged,
      categories: categoriesObj,
      category_scores: scoresObj,
      severityLevel: severity,
    };

    // If flagged, add detailed reason and flagged categories
    if (result.flagged) {
      const flaggedCategories = Object.entries(categoriesObj)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);

      moderationResult.reason = `Content violates policy: ${formatCategoryNames(flaggedCategories).join(', ')}`;
    }

    // Log moderation result to database for audit trail
    try {
      await logModerationResult({
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
      // Don't fail the request if logging fails
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
  const mediumCategories = ['hate', 'harassment', 'sexual'];
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
  text: string;
  flagged: boolean;
  categories: { [key: string]: boolean };
  scores: CategoryScore;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}): Promise<void> {
  // TODO: Implement database logging
  // This would insert into a moderation_queue table in Supabase:
  // INSERT INTO moderation_queue (user_id, content_type, content, flagged, categories, scores, severity, created_at)
  // VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

  console.log('Moderation result logged:', {
    userId: data.userId,
    contentType: data.contentType,
    flagged: data.flagged,
    severity: data.severity,
    timestamp: data.timestamp,
  });
}
