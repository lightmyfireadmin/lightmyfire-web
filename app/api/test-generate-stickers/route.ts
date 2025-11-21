import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

    const testStickers = [
    { name: 'Sunset Beach', pinCode: 'ABC-123', backgroundColor: '#FF6B6B', language: 'en' },
    { name: 'Mountain Peak', pinCode: 'DEF-456', backgroundColor: '#4ECDC4', language: 'fr' },
    { name: 'City Lights', pinCode: 'GHI-789', backgroundColor: '#45B7D1', language: 'es' },
    { name: 'Forest Trail', pinCode: 'JKL-012', backgroundColor: '#96CEB4', language: 'de' },
    { name: 'Ocean Wave', pinCode: 'MNO-345', backgroundColor: '#FFEAA7', language: 'it' },
    { name: 'Desert Dune', pinCode: 'PQR-678', backgroundColor: '#DFE6E9', language: 'pt' },
    { name: 'River Bend', pinCode: 'STU-901', backgroundColor: '#74B9FF', language: 'ja' },
    { name: 'Canyon View', pinCode: 'VWX-234', backgroundColor: '#A29BFE', language: 'ko' },
    { name: 'Lake Shore', pinCode: 'YZA-567', backgroundColor: '#FD79A8', language: 'zh-CN' },
    { name: 'Valley Green', pinCode: 'BCD-890', backgroundColor: '#FDCB6E', language: 'nl' },
  ];

  return generateStickers(request, testStickers);
}

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { stickers, count } = await request.json();

    let testStickers = stickers;

        if (count && !stickers) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E'];
      const languages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'zh-CN', 'nl'];

      testStickers = Array.from({ length: count }, (_, i) => ({
        name: `Test Lighter ${i + 1}`,
        pinCode: `TST-${String(i + 1).padStart(3, '0')}`,
        backgroundColor: colors[i % colors.length],
        language: languages[i % languages.length],
      }));
    }

    return generateStickers(request, testStickers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body. Expected { stickers: [...] } or { count: number }' },
      { status: 400 }
    );
  }
}

async function generateStickers(request: NextRequest, stickers: unknown[]) {
  try {
        const generateResponse = await fetch(`${request.nextUrl.origin}/api/generate-printful-stickers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-test': 'true'
      },
      body: JSON.stringify({
        stickers: stickers,
        brandingText: 'LightMyFire',
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      return NextResponse.json(
        { error: 'Sticker generation failed', details: errorText },
        { status: 500 }
      );
    }

    const pngBuffer = await generateResponse.arrayBuffer();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="test-stickers-${timestamp}.png"`,
        'Content-Length': pngBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Test sticker generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test stickers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
