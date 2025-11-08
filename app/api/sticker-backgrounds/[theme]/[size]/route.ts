
import { NextRequest, NextResponse } from 'next/server';
import {
  generateStickerBackground,
  BACKGROUND_THEMES,
  SHEET_DIMENSIONS,
  type ThemeName,
} from '@/lib/sticker-backgrounds';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { theme: string; size: string } }
) {
  try {
    const theme = params.theme.toUpperCase() as ThemeName;
    const size = params.size.toUpperCase() as keyof typeof SHEET_DIMENSIONS;

        if (!(theme in BACKGROUND_THEMES)) {
      return NextResponse.json(
        { error: 'Invalid theme. Available themes: ' + Object.keys(BACKGROUND_THEMES).join(', ') },
        { status: 400 }
      );
    }

        if (!(size in SHEET_DIMENSIONS)) {
      return NextResponse.json(
        { error: 'Invalid size. Available sizes: ' + Object.keys(SHEET_DIMENSIONS).join(', ') },
        { status: 400 }
      );
    }

        const svg = generateStickerBackground(theme, size);

        return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',       },
    });
  } catch (error) {
    console.error('Error generating background:', error);
    return NextResponse.json(
      { error: 'Failed to generate background' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
