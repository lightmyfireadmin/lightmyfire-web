import { NextRequest, NextResponse } from 'next/server';
import {
  generateStickerBackground,
  BACKGROUND_THEMES,
  SHEET_DIMENSIONS,
  type ThemeName,
} from '@/lib/sticker-backgrounds';

/**
 * Forces the route to be dynamic to handle route parameters correctly in Next.js App Router.
 */
export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to retrieve a generated SVG background for stickers.
 *
 * This endpoint is used by Printful to fetch the custom background design for printing.
 * It generates an SVG on the fly based on the requested theme and size parameters.
 *
 * @param {NextRequest} request - The incoming request object.
 * @param {object} context - The route parameters.
 * @param {object} context.params - The URL parameters.
 * @param {string} context.params.theme - The name of the background theme (e.g., 'fire', 'ocean').
 * @param {string} context.params.size - The size of the sticker sheet (e.g., 'small', 'medium').
 * @returns {Promise<NextResponse>} An SVG response or a JSON error.
 */
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

/**
 * Handles OPTIONS requests for CORS preflight checks.
 *
 * Allows cross-origin requests, which is necessary for Printful to fetch the image
 * if the domains differ.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A 200 OK response with CORS headers.
 */
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
