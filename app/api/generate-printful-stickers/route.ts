import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { verifyInternalAuthToken } from '@/lib/internal-auth';
import { generateStickerSheets, StickerData } from '@/lib/sticker-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const internalAuth = request.headers.get('x-internal-auth');
    const userId = request.headers.get('x-user-id');
    const isTestEndpoint = request.headers.get('x-internal-test') === 'true';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    let isInternalAuth = false;
    if (internalAuth && userId) {
      isInternalAuth = verifyInternalAuthToken(internalAuth, userId);
    }

    if (!isInternalAuth && !(isTestEndpoint && isDevelopment)) {
      const cookieStore = cookies();
      const supabase = createServerSupabaseClient(cookieStore);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in to generate stickers.' },
          { status: 401 }
        );
      }
    }

    const { stickers } = await request.json();

    if (!Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of stickers' },
        { status: 400 }
      );
    }

    const sheets = await generateStickerSheets(stickers as StickerData[]);

    // Return JSON response with all sheets as base64
    return NextResponse.json({
      success: true,
      numSheets: sheets.length,
      sheets: sheets.map(sheet => ({
        filename: sheet.filename,
        data: sheet.data,
        size: sheet.size
      }))
    });
  } catch (error) {
    console.error('Error generating Printful sticker sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate sticker sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}