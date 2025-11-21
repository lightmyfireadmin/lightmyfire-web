import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateStickerSheets, StickerData } from '@/lib/sticker-generator';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const internalAuth = request.headers.get('x-internal-auth');
    const userId = request.headers.get('x-user-id');
    const isTestEndpoint = request.headers.get('x-internal-test') === 'true';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    let isInternalAuth = false;
    if (internalAuth && userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const decoded = Buffer.from(internalAuth, 'base64').toString('utf-8');
        const [authUserId, timestamp, serviceKey] = decoded.split(':');

        const isValidUser = authUserId === userId;
        const isValidKey = serviceKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
        const isRecent = Date.now() - parseInt(timestamp) < 60000; // 1 minute window
        isInternalAuth = isValidUser && isValidKey && isRecent;
      } catch (e) {
        console.error('Internal auth validation failed:', e);
      }
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

    // The client might not send all fields required by StickerData, so we map and default them if necessary
    // But looking at lib/generateSticker.ts we created, we are sending correct fields.
    // Let's ensure compatibility.
    const mappedStickers: StickerData[] = stickers.map((s: any) => ({
      name: s.name,
      pinCode: s.pinCode,
      backgroundColor: s.backgroundColor || '#FFFFFF',
      language: s.language || 'en',
    }));

    const sheets = await generateStickerSheets(mappedStickers);

    if (sheets.length === 1) {
      const sheet = sheets[0];
      return new NextResponse(new Uint8Array(sheet.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${sheet.filename}"`,
          'Content-Length': sheet.buffer.length.toString(),
        },
      });
    }

    // Zip multiple sheets
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Uint8Array[] = [];

    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      archive.on('end', () => {
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        resolve(Buffer.from(result));
      });
      archive.on('error', reject);
    });

    for (const sheet of sheets) {
      archive.append(sheet.buffer, { name: sheet.filename });
    }

    archive.finalize();
    const zipBuffer = await zipPromise;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="lightmyfire-stickers.zip"',
        'Content-Length': zipBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating stickers:', error);
    return NextResponse.json(
      { error: 'Failed to generate stickers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
