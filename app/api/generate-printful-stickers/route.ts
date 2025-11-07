import { createCanvas, loadImage, Image, Canvas, CanvasRenderingContext2D as NodeCanvasContext, registerFont } from 'canvas';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Register Poppins fonts for sticker text
try {
  const poppinsExtraBold = path.join(process.cwd(), 'public', 'fonts', 'Poppins-ExtraBold.ttf');
  const poppinsBold = path.join(process.cwd(), 'public', 'fonts', 'Poppins-Bold.ttf');
  const poppinsMedium = path.join(process.cwd(), 'public', 'fonts', 'Poppins-Medium.ttf');

  // Register ExtraBold for bold text
  if (fs.existsSync(poppinsExtraBold)) {
    registerFont(poppinsExtraBold, { family: 'Poppins', weight: '800' });
    console.log('Registered Poppins ExtraBold');
  } else {
    console.error('Poppins-ExtraBold.ttf not found at:', poppinsExtraBold);
  }

  // Register Bold for medium-bold text
  if (fs.existsSync(poppinsBold)) {
    registerFont(poppinsBold, { family: 'Poppins', weight: 'bold' });
    console.log('Registered Poppins Bold');
  } else {
    console.error('Poppins-Bold.ttf not found at:', poppinsBold);
  }

  // Register Medium for normal weight text
  if (fs.existsSync(poppinsMedium)) {
    registerFont(poppinsMedium, { family: 'Poppins', weight: '500' });
    console.log('Registered Poppins Medium');
  } else {
    console.error('Poppins-Medium.ttf not found at:', poppinsMedium);
  }
} catch (error) {
  console.error('Font registration error:', error);
}

// Printful sheet dimensions: 5.83 x 8.27 inches at 600 DPI (double quality for print perfection)
const SHEET_WIDTH_INCHES = 5.83;
const SHEET_HEIGHT_INCHES = 8.27;
const DPI = 600;
const SHEET_WIDTH_PX = Math.round(SHEET_WIDTH_INCHES * DPI); // 3498px
const SHEET_HEIGHT_PX = Math.round(SHEET_HEIGHT_INCHES * DPI); // 4962px

// Background Colors
const CARD_BG_COLOR = '#FFFFFF';
const LOGO_BG_COLOR = '#FFFBEB'; // Light cream for logo section

// Sticker dimensions: 5cm high x 2cm wide
const STICKER_WIDTH_CM = 2;
const STICKER_HEIGHT_CM = 5;
const CM_TO_INCHES = 1 / 2.54;
const STICKER_WIDTH_INCHES = STICKER_WIDTH_CM * CM_TO_INCHES;
const STICKER_HEIGHT_INCHES = STICKER_HEIGHT_CM * CM_TO_INCHES;
const STICKER_WIDTH_PX = Math.round(STICKER_WIDTH_INCHES * DPI);
const STICKER_HEIGHT_PX = Math.round(STICKER_HEIGHT_INCHES * DPI);

// Gap between stickers: 1cm (for proper lighter fit and spacing)
const GAP_CM = 1.0;
const GAP_INCHES = GAP_CM * CM_TO_INCHES;
const GAP_PX = Math.round(GAP_INCHES * DPI);

// Reserved area (bottom-right): 3" × 3"
const RESERVED_INCHES = 3;
const RESERVED_CM = RESERVED_INCHES / CM_TO_INCHES;
const RESERVED_PX = Math.round(RESERVED_INCHES * DPI);

// Calculate sticker grid
const STICKER_WITH_GAP_PX = STICKER_WIDTH_PX + GAP_PX;
const STICKER_WITH_GAP_HEIGHT_PX = STICKER_HEIGHT_PX + GAP_PX;

// Top section (full width, above reserved area)
const TOP_SECTION_HEIGHT_PX = SHEET_HEIGHT_PX - RESERVED_PX;
const STICKERS_PER_ROW = Math.floor(SHEET_WIDTH_PX / STICKER_WITH_GAP_PX);
const ROWS_TOP = Math.floor(TOP_SECTION_HEIGHT_PX / STICKER_WITH_GAP_HEIGHT_PX);

// Bottom-left section
const BOTTOM_LEFT_WIDTH_PX = SHEET_WIDTH_PX - RESERVED_PX;
const STICKERS_PER_ROW_BOTTOM = Math.floor(BOTTOM_LEFT_WIDTH_PX / STICKER_WITH_GAP_PX);
const ROWS_BOTTOM = Math.floor(RESERVED_PX / STICKER_WITH_GAP_HEIGHT_PX);

const TOTAL_STICKERS = (STICKERS_PER_ROW * ROWS_TOP) + (STICKERS_PER_ROW_BOTTOM * ROWS_BOTTOM);

interface StickerData {
  name: string;
  pinCode: string;
  backgroundColor: string;
  language: string;
}

// Helper function to calculate luminance of a hex color
function getLuminance(hex: string): number {
  let r = 0, g = 0, b = 0;

  // 3-digit hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6-digit hex
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return 0; // Default to black on error
  }

  // Convert to sRGB and then to luminance
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const linR = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const linG = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const linB = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

  // Relative luminance formula
  return 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
}

// Helper function to get contrasting text color (black or white) based on background
function getContrastingTextColor(backgroundColorHex: string): string {
  const luminance = getLuminance(backgroundColorHex);
  // Threshold is 0.65. Dark backgrounds (< 0.65) get white text, light backgrounds get black text.
  return luminance < 0.65 ? '#ffffff' : '#000000';
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify authentication before allowing resource-intensive sticker generation
    // This prevents unauthorized users from abusing the endpoint for DoS attacks
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to generate stickers.' },
        { status: 401 }
      );
    }

    const { stickers, brandingText } = await request.json();

    if (!Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of stickers' },
        { status: 400 }
      );
    }

    // Calculate how many sheets we need
    const numSheets = Math.ceil(stickers.length / TOTAL_STICKERS);

    // If only one sheet, return PNG directly (backward compatibility)
    if (numSheets === 1) {
      const buffer = await generateSingleSheet(stickers);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="lightmyfire-stickers-printful.png"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    }

    // Multiple sheets - generate all sheets and package in ZIP
    const sheets: { filename: string; buffer: Buffer }[] = [];

    for (let i = 0; i < numSheets; i++) {
      const startIdx = i * TOTAL_STICKERS;
      const endIdx = Math.min(startIdx + TOTAL_STICKERS, stickers.length);
      const sheetStickers = stickers.slice(startIdx, endIdx);

      const buffer = await generateSingleSheet(sheetStickers);
      sheets.push({
        filename: `lightmyfire-stickers-sheet-${i + 1}.png`,
        buffer
      });
    }

    // Create ZIP file
    const { Readable } = await import('stream');
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    // Collect ZIP data
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Wait for ZIP to finish
    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    // Add all sheets to ZIP
    for (const sheet of sheets) {
      archive.append(sheet.buffer, { name: sheet.filename });
    }

    // Finalize ZIP
    await archive.finalize();
    const zipBuffer = await zipPromise;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="lightmyfire-stickers-printful.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating Printful sticker sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate sticker sheet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate a single sheet of stickers (up to 10 stickers)
 */
async function generateSingleSheet(stickers: StickerData[]): Promise<Buffer> {
  // Create canvas with transparent background
  const canvas = createCanvas(SHEET_WIDTH_PX, SHEET_HEIGHT_PX);
  const ctx = canvas.getContext('2d');

  // Transparent background (Printful requirement for kiss-cut)
  ctx.clearRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

  // Calculate centering offset for top section
  const topSectionUsedWidth = STICKERS_PER_ROW * STICKER_WIDTH_PX + (STICKERS_PER_ROW - 1) * GAP_PX;
  const topOffsetX = Math.round((SHEET_WIDTH_PX - topSectionUsedWidth) / 2);
  const topOffsetY = Math.round(GAP_PX / 2);

  // Draw stickers in top section
  let stickerIndex = 0;
  for (let row = 0; row < ROWS_TOP && stickerIndex < stickers.length; row++) {
    for (let col = 0; col < STICKERS_PER_ROW && stickerIndex < stickers.length; col++) {
      const x = topOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
      const y = topOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
      await drawSticker(ctx, stickers[stickerIndex], x, y);
      stickerIndex++;
    }
  }

  // Draw stickers in bottom-left section
  const bottomLeftUsedWidth = STICKERS_PER_ROW_BOTTOM * STICKER_WIDTH_PX + (STICKERS_PER_ROW_BOTTOM - 1) * GAP_PX;
  const bottomOffsetX = Math.round((BOTTOM_LEFT_WIDTH_PX - bottomLeftUsedWidth) / 2);
  const bottomOffsetY = SHEET_HEIGHT_PX - RESERVED_PX + Math.round(GAP_PX / 2);

  for (let row = 0; row < ROWS_BOTTOM && stickerIndex < stickers.length; row++) {
    for (let col = 0; col < STICKERS_PER_ROW_BOTTOM && stickerIndex < stickers.length; col++) {
      const x = bottomOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
      const y = bottomOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
      await drawSticker(ctx, stickers[stickerIndex], x, y);
      stickerIndex++;
    }
  }

  // Leave branding area empty (branding will be on physical background)
  // The 3"×3" bottom-right area is reserved but left transparent for branding on the background

  // Convert to PNG buffer
  return canvas.toBuffer('image/png', {
    compressionLevel: 9,
    filters: Canvas.PNG_FILTER_NONE
  });
}

async function drawSticker(
  ctx: NodeCanvasContext,
  sticker: StickerData,
  x: number,
  y: number
) {
  // Pixel-perfect rendering settings for crisp text and graphics
  ctx.imageSmoothingEnabled = false;
  (ctx as any).antialias = 'none';
  (ctx as any).textDrawingMode = 'glyph';

  // Internal padding: 5% of sticker width
  const padding = Math.round(STICKER_WIDTH_PX * 0.05); // 24px at 600 DPI
  const contentWidth = STICKER_WIDTH_PX - padding * 2; // 424px at 600 DPI
  const contentHeight = STICKER_HEIGHT_PX - padding * 2; // 1134px at 600 DPI
  const cornerRadius = Math.round(STICKER_WIDTH_PX * 0.14); // ~67px at 600 DPI - rounder corners
  const cardRadius = Math.round(STICKER_WIDTH_PX * 0.05); // ~24px at 600 DPI - rounder cards
  const smallGap = 4; // Very tight gap between cards for ultra-compact design

  // Draw colored background with rounded corners (kiss-cut sticker shape)
  ctx.fillStyle = sticker.backgroundColor;
  roundRect(ctx, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX, cornerRadius);
  ctx.fill();

  // Get contrasting text color for this background (black for light backgrounds, white for dark)
  const textColor = getContrastingTextColor(sticker.backgroundColor);

  // Draw sticker_bg_layer.png overlay (between background and content)
  // Clipped to sticker bounds to prevent cutting glitches
  try {
    const bgLayerPath = path.join(process.cwd(), 'public', 'newassets', 'sticker_bg_layer.png');
    const bgLayerBuffer = fs.readFileSync(bgLayerPath);
    const { Image } = await import('canvas');
    const bgLayerImage = new Image();
    bgLayerImage.src = bgLayerBuffer;

    // Save context state
    ctx.save();
    // Clip to sticker shape to prevent overflow beyond background
    roundRect(ctx, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX, cornerRadius);
    ctx.clip();
    // Draw layer within clipped region
    ctx.drawImage(bgLayerImage, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX);
    // Restore context (remove clip)
    ctx.restore();
  } catch (error) {
    console.error('Background layer loading error:', error);
  }

  let currentY = y + padding;

  // White card for "You found me! I'm" + name
  // Reduced to fit text tightly + padding
  const cardHeight = 140; // Compact height for 2 text lines (doubled for 600 DPI)

  // Draw white background with rounded corners
  ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, cardHeight, cardRadius);
  ctx.fill();

  // "You found me! I'm" text - on same line
  ctx.fillStyle = '#000000';
  ctx.font = `500 36px Poppins, Arial, sans-serif`; // Doubled for 600 DPI
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText("You found me! I'm", x + STICKER_WIDTH_PX / 2, currentY + 44); // Doubled for 600 DPI

  // Name text
  ctx.font = `800 48px Poppins, Arial, sans-serif`; // Doubled for 600 DPI
  ctx.fillText(sticker.name, x + STICKER_WIDTH_PX / 2, currentY + 96); // Doubled for 600 DPI

  currentY += cardHeight + padding;

  // Move invitation section and QR up for better spacing
  currentY -= 10;

  // "Tell them how we met" - more intriguing and engaging call-to-action
  ctx.fillStyle = textColor; // Use contrasting color
  ctx.font = `800 34px Poppins, Arial, sans-serif`; // Slightly reduced to prevent overflow
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Tell them how we met', x + STICKER_WIDTH_PX / 2, currentY + 4);

  // Translation - Complete language support (adapted for "Tell them how we met")
  // Optimized to prevent overflow on stickers
  const translations: { [key: string]: string } = {
    fr: 'Dis comment on s\'est rencontrés',  // Shortened for space
    es: 'Diles cómo nos conocimos',           // Optimized
    de: 'Erzähl von unserem Treffen',       // Shortened
    it: 'Racconta il nostro incontro',      // Optimized
    pt: 'Conte como nos conhecemos',        // Already good
    ar: 'أخبرهم بلقائنا',                   // Shortened
    fa: 'از ملاقاتمان بگو',                 // Shortened
    hi: 'बताओ हम कैसे मिले',                // Already good
    id: 'Ceritakan pertemuan kita',         // Optimized
    ja: '出会いを語って',                     // Shortened
    ko: '만남을 말해줘',                      // Shortened
    mr: 'सांग आम्ही कसे भेटलो',             // Already good
    nl: 'Vertel hoe we elkaar vonden',      // Optimized
    pl: 'Opowiedz jak się poznaliśmy',      // Already good
    ru: 'Расскажи о встрече',                // Shortened
    te: 'మన కలయిక చెప్పు',                   // Shortened
    th: 'บอกว่าเราเจอกันอย่างไร',            // Optimized
    tr: 'Tanışmamızı anlat',                 // Shortened
    uk: 'Розкажи про зустріч',               // Shortened
    ur: 'ملاقات بتائیں',                     // Shortened
    vi: 'Kể về cuộc gặp gỡ',                 // Optimized
    'zh-CN': '讲讲我们的相遇',                 // Optimized
  };

  const translationText = translations[sticker.language] || translations.fr;
  ctx.font = `500 28px Poppins, Arial, sans-serif`; // Reduced for overflow prevention
  ctx.textBaseline = 'top';
  ctx.fillText(translationText, x + STICKER_WIDTH_PX / 2, currentY + 42);

  currentY += 80; // Adjusted spacing after invitation section

  // QR Code on white card - reduced by 0.7x factor for more color visibility
  const qrCardSize = Math.round(contentWidth * 0.7); // ~148px (70% of 212)
  const qrSize = Math.round(qrCardSize * 0.89); // ~132px

  // Draw square white card for QR code (same padding on all sides)
  ctx.fillStyle = CARD_BG_COLOR;
  const qrCardX = x + padding + (contentWidth - qrCardSize) / 2; // Center the card
  roundRect(ctx, qrCardX, currentY, qrCardSize, qrCardSize, cardRadius);
  ctx.fill();

  try {
    // Generate unique QR code for each lighter with pre-filled PIN
    // Points to index page with PIN pre-filled to provide full context
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lightmyfire.app';
    const qrUrl = `${baseUrl}/?pin=${sticker.pinCode}`;

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const qrImage = await loadImage(qrDataUrl);
    const qrX = Math.round(x + STICKER_WIDTH_PX / 2 - qrSize / 2);
    const qrY = currentY + (qrCardSize - qrSize) / 2;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  } catch (error) {
    console.error('QR code generation error:', error);
  }

  currentY += qrCardSize + smallGap;

  // "or go to lightmyfire.app" section
  const urlBgHeight = 58; // Fixed size per programmer's spec

  // Draw white background with rounded corners
  ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, urlBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `500 16px Poppins, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('or go to', x + STICKER_WIDTH_PX / 2, currentY + 19);
  // Use Poppins-Bold and all caps for better letter spacing and readability at small scale
  ctx.font = `bold 18px Poppins, Arial, sans-serif`;
  ctx.fillText('LIGHTMYFIRE.APP', x + STICKER_WIDTH_PX / 2, currentY + 40);

  currentY += urlBgHeight + smallGap;

  // "and type my code"
  ctx.fillStyle = textColor; // Use contrasting color
  ctx.font = `500 18px Poppins, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('and type my code', x + STICKER_WIDTH_PX / 2, currentY + 2);

  // Translation - Complete language support (shorter versions)
  const codeTranslations: { [key: string]: string } = {
    fr: 'et entre mon code',
    es: 'e introduce mi código',
    de: 'und gib meinen Code ein',
    it: 'e digita il mio codice',
    pt: 'e digite meu código',
    ar: 'وأدخل رمزي',
    fa: 'و کد من را وارد کنید',
    hi: 'और मेरा कोड टाइप करें',
    id: 'dan ketik kodeku',
    ja: '私のコードを入力',
    ko: '내 코드를 입력하세요',
    mr: 'आणि माझा कोड टाइप करा',
    nl: 'en typ mijn code',
    pl: 'i wpisz mój kod',
    ru: 'и введи мой код',
    te: 'మరియు నా కోడ్ టైప్ చేయండి',
    th: 'และพิมพ์รหัสของฉัน',
    tr: 've kodumu yaz',
    uk: 'і введи мій код',
    ur: 'اور میرا کوڈ ٹائپ کریں',
    vi: 'và nhập mã của tôi',
    'zh-CN': '并输入我的代码',
  };

  const codeText = codeTranslations[sticker.language] || codeTranslations.fr;
  ctx.font = `500 14px Poppins, Arial, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText(codeText, x + STICKER_WIDTH_PX / 2, currentY + 23);

  currentY += 38; // Section height
  currentY += smallGap;

  // PIN code
  const pinBgHeight = 52; // Fixed size per programmer's spec

  // Draw white background with rounded corners
  ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, pinBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `800 32px Poppins, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.pinCode, x + STICKER_WIDTH_PX / 2, currentY + pinBgHeight / 2);

  currentY += pinBgHeight + smallGap;

  // Logo section at bottom - compact cream background wrapping logo
  // Load and draw logo first to get dimensions
  try {
    const { Image } = await import('canvas');
    const fs = await import('fs');
    const path = await import('path');

    const logoPath = path.join(process.cwd(), 'public', 'LOGOLONG.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoImage = new Image();
    logoImage.src = logoBuffer;

    const logoTargetWidth = 160; // Fixed size per programmer's spec
    const logoAspectRatio = logoImage.height / logoImage.width;
    const logoTargetHeight = Math.round(logoTargetWidth * logoAspectRatio);

    // Create compact cream background wrapping logo with padding
    const logoPadding = 12; // Small padding around logo
    const logoBgWidth = logoTargetWidth + (logoPadding * 2);
    const logoBgHeight = logoTargetHeight + (logoPadding * 2);

    // Position logo (vertically centered in remaining space)
    const remainingHeight = STICKER_HEIGHT_PX - currentY + y - padding;
    const logoBgY = currentY + (remainingHeight - logoBgHeight) / 2;

    // Center cream background horizontally
    const centerX = x + STICKER_WIDTH_PX / 2;
    const logoBgX = Math.round(centerX - logoBgWidth / 2);

    // Draw compact cream background
    ctx.fillStyle = LOGO_BG_COLOR;
    roundRect(ctx, logoBgX, logoBgY, logoBgWidth, logoBgHeight, cardRadius);
    ctx.fill();

    // Draw logo centered in cream background
    const logoX = logoBgX + logoPadding;
    const logoImageY = logoBgY + logoPadding;

    ctx.drawImage(logoImage, logoX, logoImageY, logoTargetWidth, logoTargetHeight);
  } catch (error) {
    console.error('Logo loading error:', error);
  }
}

// NOTE: drawBrandingArea function removed
// The 3"×3" bottom-right reserved area is intentionally left empty/transparent
// Branding will be printed on the physical sticker sheet background, not on the PNG
// This allows for customizable branding for events, brands, etc.

function roundRect(
  ctx: NodeCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  // Ensure radius doesn't exceed half of width or height
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
