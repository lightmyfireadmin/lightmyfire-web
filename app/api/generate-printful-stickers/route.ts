import { createCanvas, loadImage, Image, Canvas, CanvasRenderingContext2D as NodeCanvasContext, registerFont } from 'canvas';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';

try {
  const poppinsExtraBold = path.join(process.cwd(), 'public', 'fonts', 'Poppins-ExtraBold.ttf');
  const poppinsBold = path.join(process.cwd(), 'public', 'fonts', 'Poppins-Bold.ttf');
  const poppinsMedium = path.join(process.cwd(), 'public', 'fonts', 'Poppins-Medium.ttf');

    if (fs.existsSync(poppinsExtraBold)) {
    registerFont(poppinsExtraBold, { family: 'Poppins', weight: '800' });
    console.log('Registered Poppins ExtraBold');
  } else {
    console.error('Poppins-ExtraBold.ttf not found at:', poppinsExtraBold);
  }

    if (fs.existsSync(poppinsBold)) {
    registerFont(poppinsBold, { family: 'Poppins', weight: 'bold' });
    console.log('Registered Poppins Bold');
  } else {
    console.error('Poppins-Bold.ttf not found at:', poppinsBold);
  }

    if (fs.existsSync(poppinsMedium)) {
    registerFont(poppinsMedium, { family: 'Poppins', weight: '500' });
    console.log('Registered Poppins Medium');
  } else {
    console.error('Poppins-Medium.ttf not found at:', poppinsMedium);
  }
} catch (error) {
  console.error('Font registration error:', error);
}

const SHEET_WIDTH_INCHES = 5.83;
const SHEET_HEIGHT_INCHES = 8.27;
const DPI = 600;
const SHEET_WIDTH_PX = Math.round(SHEET_WIDTH_INCHES * DPI); const SHEET_HEIGHT_PX = Math.round(SHEET_HEIGHT_INCHES * DPI); 
const CARD_BG_COLOR = '#FFFFFF';
const LOGO_BG_COLOR = '#FFF4D6'; 
const STICKER_WIDTH_CM = 2;
const STICKER_HEIGHT_CM = 5;
const CM_TO_INCHES = 1 / 2.54;
const STICKER_WIDTH_INCHES = STICKER_WIDTH_CM * CM_TO_INCHES;
const STICKER_HEIGHT_INCHES = STICKER_HEIGHT_CM * CM_TO_INCHES;
const STICKER_WIDTH_PX = Math.round(STICKER_WIDTH_INCHES * DPI);
const STICKER_HEIGHT_PX = Math.round(STICKER_HEIGHT_INCHES * DPI);

const GAP_CM = 1.0;
const GAP_INCHES = GAP_CM * CM_TO_INCHES;
const GAP_PX = Math.round(GAP_INCHES * DPI);

const RESERVED_INCHES = 3;
const RESERVED_CM = RESERVED_INCHES / CM_TO_INCHES;
const RESERVED_PX = Math.round(RESERVED_INCHES * DPI);

const STICKER_WITH_GAP_PX = STICKER_WIDTH_PX + GAP_PX;
const STICKER_WITH_GAP_HEIGHT_PX = STICKER_HEIGHT_PX + GAP_PX;

const TOP_SECTION_HEIGHT_PX = SHEET_HEIGHT_PX - RESERVED_PX;
const STICKERS_PER_ROW = Math.floor(SHEET_WIDTH_PX / STICKER_WITH_GAP_PX);
const ROWS_TOP = Math.floor(TOP_SECTION_HEIGHT_PX / STICKER_WITH_GAP_HEIGHT_PX);

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

const STICKER_TEXTS: Record<string, {
  youFoundMe: string;
  tellThemHowWeMet: string;
  orGoTo: string;
  website: string;
  andTypeMyCode: string;
}> = {
  'en': {
    youFoundMe: "You found me! I'm",
    tellThemHowWeMet: "Tell them how we met",
    orGoTo: "or go to",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "and type my code"
  },
  'fr': {
    youFoundMe: "Je m'appelle",
    tellThemHowWeMet: "Raconte notre rencontre",
    orGoTo: "ou rends-toi ici :",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "et rentre mon code"
  },
  'es': {
    youFoundMe: "Me llamo",
    tellThemHowWeMet: "Diles cómo nos conocimos",
    orGoTo: "o visita",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "e introduce mi código"
  },
  'de': {
    youFoundMe: "Ich bin",
    tellThemHowWeMet: "Erzähl von unserem Treffen",
    orGoTo: "oder geh zu",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "und gib meinen Code ein"
  },
  'it': {
    youFoundMe: "Mi chiamo",
    tellThemHowWeMet: "Racconta il nostro incontro",
    orGoTo: "o vai su",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "e digita il mio codice"
  },
  'pt': {
    youFoundMe: "Meu nome é",
    tellThemHowWeMet: "Conte como nos conhecemos",
    orGoTo: "ou acesse",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "e digite meu código"
  },
  'nl': {
    youFoundMe: "Ik ben",
    tellThemHowWeMet: "Vertel hoe we elkaar vonden",
    orGoTo: "of ga naar",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "en typ mijn code"
  },
  'ru': {
    youFoundMe: "Меня зовут",
    tellThemHowWeMet: "Расскажи о встрече",
    orGoTo: "или зайди на",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "и введи мой код"
  },
  'pl': {
    youFoundMe: "Nazywam się",
    tellThemHowWeMet: "Opowiedz jak się poznaliśmy",
    orGoTo: "lub wejdź na",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "i wpisz mój kod"
  },
  'ja': {
    youFoundMe: "私の名前は",
    tellThemHowWeMet: "出会いを語って",
    orGoTo: "またはこちら：",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "私のコードを入力"
  },
  'ko': {
    youFoundMe: "내 이름은",
    tellThemHowWeMet: "만남을 말해줘",
    orGoTo: "또는 방문:",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "내 코드를 입력하세요"
  },
  'zh-CN': {
    youFoundMe: "我叫",
    tellThemHowWeMet: "讲讲我们的相遇",
    orGoTo: "或访问",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "并输入我的代码"
  },
  'ar': {
    youFoundMe: "اسمي",
    tellThemHowWeMet: "أخبرهم بلقائنا",
    orGoTo: "أو ادخل على",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "وأدخل رمزي"
  },
  'fa': {
    youFoundMe: "اسم من",
    tellThemHowWeMet: "از ملاقاتمان بگو",
    orGoTo: "یا برو به",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "و کد من را وارد کنید"
  },
  'hi': {
    youFoundMe: "मेरा नाम है",
    tellThemHowWeMet: "बताओ हम कैसे मिले",
    orGoTo: "या जाएं",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "और मेरा कोड टाइप करें"
  },
  'id': {
    youFoundMe: "Namaku",
    tellThemHowWeMet: "Ceritakan pertemuan kita",
    orGoTo: "atau kunjungi",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "dan ketik kodeku"
  },
  'mr': {
    youFoundMe: "माझे नाव",
    tellThemHowWeMet: "सांग आम्ही कसे भेटलो",
    orGoTo: "किंवा येथे जा",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "आणि माझा कोड टाइप करा"
  },
  'te': {
    youFoundMe: "నా పేరు",
    tellThemHowWeMet: "మన కలయిక చెప్పు",
    orGoTo: "లేదా వెళ్ళు",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "మరియు నా కోడ్ టైప్ చేయండి"
  },
  'th': {
    youFoundMe: "ฉันชื่อ",
    tellThemHowWeMet: "บอกว่าเราเจอกันอย่างไร",
    orGoTo: "หรือไปที่",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "และพิมพ์รหัสของฉัน"
  },
  'tr': {
    youFoundMe: "Adım",
    tellThemHowWeMet: "Tanışmamızı anlat",
    orGoTo: "veya git",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "ve kodumu yaz"
  },
  'uk': {
    youFoundMe: "Мене звати",
    tellThemHowWeMet: "Розкажи про зустріч",
    orGoTo: "або зайди на",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "і введи мій код"
  },
  'ur': {
    youFoundMe: "میرا نام",
    tellThemHowWeMet: "ملاقات بتائیں",
    orGoTo: "یا جائیں",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "اور میرا کوڈ ٹائپ کریں"
  },
  'vi': {
    youFoundMe: "Tên tôi là",
    tellThemHowWeMet: "Kể về cuộc gặp gỡ",
    orGoTo: "hoặc truy cập",
    website: "LIGHTMYFIRE.APP",
    andTypeMyCode: "và nhập mã của tôi"
  }
};

function getStickerTexts(language: string) {
  return STICKER_TEXTS[language] || STICKER_TEXTS['en'];
}

function getLuminance(hex: string): number {
  let r = 0, g = 0, b = 0;

    if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
    else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return 0;   }

    const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;

  const linR = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const linG = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const linB = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);

    return 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
}

function getContrastingTextColor(backgroundColorHex: string): string {
  const luminance = getLuminance(backgroundColorHex);
    return luminance < 0.65 ? '#ffffff' : '#000000';
}

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
        const isRecent = Date.now() - parseInt(timestamp) < 60000; 
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

    const { stickers, brandingText } = await request.json();

    if (!Array.isArray(stickers) || stickers.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of stickers' },
        { status: 400 }
      );
    }

        const numSheets = Math.ceil(stickers.length / TOTAL_STICKERS);

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

        const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

        const zipPromise = new Promise<Buffer>((resolve, reject) => {
            archive.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

            archive.on('finish', () => {
        const zipBuffer = Buffer.concat(chunks);
        resolve(zipBuffer);
      });

      archive.on('error', (err) => {
        console.error('Archiver error:', err);
        reject(err);
      });

      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Archiver warning:', err);
        } else {
          reject(err);
        }
      });
    });

        for (const sheet of sheets) {
      archive.append(sheet.buffer, { name: sheet.filename });
    }

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

async function generateSingleSheet(stickers: StickerData[]): Promise<Buffer> {
    const canvas = createCanvas(SHEET_WIDTH_PX, SHEET_HEIGHT_PX);
  const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, SHEET_WIDTH_PX, SHEET_HEIGHT_PX);

    const topSectionUsedWidth = STICKERS_PER_ROW * STICKER_WIDTH_PX + (STICKERS_PER_ROW - 1) * GAP_PX;
  const topOffsetX = Math.round((SHEET_WIDTH_PX - topSectionUsedWidth) / 2);
  const topOffsetY = Math.round(GAP_PX / 2);

    let stickerIndex = 0;
  for (let row = 0; row < ROWS_TOP && stickerIndex < stickers.length; row++) {
    for (let col = 0; col < STICKERS_PER_ROW && stickerIndex < stickers.length; col++) {
      const x = topOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
      const y = topOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
      await drawSticker(ctx, stickers[stickerIndex], x, y);
      stickerIndex++;
    }
  }

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
    ctx.imageSmoothingEnabled = false;
  (ctx as any).antialias = 'none';
  (ctx as any).textDrawingMode = 'glyph';

    const padding = Math.round(STICKER_WIDTH_PX * 0.05);   const contentWidth = STICKER_WIDTH_PX - padding * 2;   const contentHeight = STICKER_HEIGHT_PX - padding * 2;   const cornerRadius = Math.round(STICKER_WIDTH_PX * 0.14);   const cardRadius = Math.round(STICKER_WIDTH_PX * 0.05);   const smallGap = 4; 
    ctx.fillStyle = sticker.backgroundColor;
  roundRect(ctx, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX, cornerRadius);
  ctx.fill();

    const textColor = getContrastingTextColor(sticker.backgroundColor);

      try {
    const bgLayerPath = path.join(process.cwd(), 'public', 'newassets', 'sticker_bg_layer.png');
    const bgLayerBuffer = fs.readFileSync(bgLayerPath);
    const { Image } = await import('canvas');
    const bgLayerImage = new Image();
    bgLayerImage.src = bgLayerBuffer;

        ctx.save();
        roundRect(ctx, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX, cornerRadius);
    ctx.clip();
        ctx.drawImage(bgLayerImage, x, y, STICKER_WIDTH_PX, STICKER_HEIGHT_PX);
        ctx.restore();
  } catch (error) {
    console.error('Background layer loading error:', error);
  }

  let currentY = y + padding;

      const cardHeight = 140; 
    ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, cardHeight, cardRadius);
  ctx.fill();

    const texts = getStickerTexts(sticker.language);

    ctx.fillStyle = '#000000';
  ctx.font = `500 36px Poppins, Arial, sans-serif`;   ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texts.youFoundMe, x + STICKER_WIDTH_PX / 2, currentY + 44); 
    ctx.font = `800 48px Poppins, Arial, sans-serif`;   ctx.fillText(sticker.name, x + STICKER_WIDTH_PX / 2, currentY + 96); 
  currentY += cardHeight + padding;

    currentY -= 10;

    ctx.fillStyle = textColor;   ctx.font = `800 34px Poppins, Arial, sans-serif`;   ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(texts.tellThemHowWeMet, x + STICKER_WIDTH_PX / 2, currentY + 4);

  currentY += 100; 
    const qrCardSize = Math.round(contentWidth * 0.7);   const qrSize = Math.round(qrCardSize * 0.89); 
    ctx.fillStyle = CARD_BG_COLOR;
  const qrCardX = x + padding + (contentWidth - qrCardSize) / 2;   roundRect(ctx, qrCardX, currentY, qrCardSize, qrCardSize, cardRadius);
  ctx.fill();

  try {
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

  currentY += qrCardSize + (smallGap * 6); 
    const urlBgHeight = 116; 
    ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, urlBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `500 32px Poppins, Arial, sans-serif`;   ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texts.orGoTo, x + STICKER_WIDTH_PX / 2, currentY + 38);     ctx.font = `bold 36px Poppins, Arial, sans-serif`;   ctx.fillText(texts.website, x + STICKER_WIDTH_PX / 2, currentY + 80); 
  currentY += urlBgHeight + smallGap;

    ctx.fillStyle = textColor;   ctx.font = `800 36px Poppins, Arial, sans-serif`;   ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(texts.andTypeMyCode, x + STICKER_WIDTH_PX / 2, currentY + 4);

  currentY += 76;   currentY += (smallGap * 3); 
    const pinBgHeight = 104; 
    ctx.fillStyle = CARD_BG_COLOR;
  roundRect(ctx, x + padding, currentY, contentWidth, pinBgHeight, cardRadius);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = `800 64px Poppins, Arial, sans-serif`;   ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.pinCode, x + STICKER_WIDTH_PX / 2, currentY + pinBgHeight / 2);

  currentY += pinBgHeight + (smallGap * 4); 
    try {
        const creamBgTop = currentY + 5;
    const creamBgBottom = y + STICKER_HEIGHT_PX + 5;     const creamBgHeight = creamBgBottom - creamBgTop;

        ctx.fillStyle = LOGO_BG_COLOR;
        ctx.beginPath();
    ctx.moveTo(x, creamBgTop);     ctx.lineTo(x + STICKER_WIDTH_PX, creamBgTop);     ctx.lineTo(x + STICKER_WIDTH_PX, creamBgBottom - cornerRadius);     ctx.arcTo(x + STICKER_WIDTH_PX, creamBgBottom, x + STICKER_WIDTH_PX - cornerRadius, creamBgBottom, cornerRadius);     ctx.lineTo(x + cornerRadius, creamBgBottom);     ctx.arcTo(x, creamBgBottom, x, creamBgBottom - cornerRadius, cornerRadius);     ctx.lineTo(x, creamBgTop);     ctx.closePath();
    ctx.fill();

        const disclaimerPadding = 10;     const disclaimerWidth = STICKER_WIDTH_PX - (disclaimerPadding * 2);
    const disclaimerText = "LightMyFire (LMF) is a community-driven project aiming at giving value to often deprecated objects. lightmyfire.app was audited to ensure online safety and anonymity. LMF has no affiliation with any legal representation of the support this sticker was found on. LMF cannot be held responsible for any private use of this sticker, i.e. displayed content and location.";

    ctx.fillStyle = '#000000';
    ctx.font = `500 16px Poppins, Arial, sans-serif`;     ctx.textAlign = 'left';     ctx.textBaseline = 'top';

        const wrapText = (text: string, maxWidth: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    const disclaimerLines = wrapText(disclaimerText, disclaimerWidth);
    const lineHeight = 20;
    let disclaimerY = creamBgTop + disclaimerPadding;

        disclaimerLines.forEach((line, index) => {
      const isLastLine = index === disclaimerLines.length - 1;

      if (isLastLine) {
                ctx.textAlign = 'left';
        ctx.fillText(line, x + disclaimerPadding, disclaimerY);
      } else {
                const words = line.split(' ');
        if (words.length === 1) {
          ctx.textAlign = 'left';
          ctx.fillText(line, x + disclaimerPadding, disclaimerY);
        } else {
          const lineWidth = ctx.measureText(line).width;
          const spaceWidth = (disclaimerWidth - lineWidth) / (words.length - 1);
          let wordX = x + disclaimerPadding;

          words.forEach((word, wordIndex) => {
            ctx.fillText(word, wordX, disclaimerY);
            const wordWidth = ctx.measureText(word).width;
            wordX += wordWidth + ctx.measureText(' ').width + spaceWidth;
          });
        }
      }

      disclaimerY += lineHeight;
    });

    const disclaimerTotalHeight = disclaimerLines.length * lineHeight;
    const disclaimerBottomY = creamBgTop + disclaimerPadding + disclaimerTotalHeight;

        const logoPath = path.join(process.cwd(), 'public', 'LOGOLONG.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const { Image } = await import('canvas');
    const logoImage = new Image();
    logoImage.src = logoBuffer;

        const logoPadding = 40;
    const logoBaseWidth = STICKER_WIDTH_PX - (logoPadding * 2);
    const logoTargetWidth = Math.round(logoBaseWidth * 0.6);     const logoAspectRatio = logoImage.height / logoImage.width;
    const logoTargetHeight = Math.round(logoTargetWidth * logoAspectRatio);

        const availableSpace = creamBgBottom - disclaimerBottomY;
    const logoX = x + (STICKER_WIDTH_PX - logoTargetWidth) / 2;     const logoY = disclaimerBottomY + (availableSpace - logoTargetHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(logoImage, logoX, logoY, logoTargetWidth, logoTargetHeight);

    console.log('Logo drawn successfully at', logoX, logoY, 'size:', logoTargetWidth, 'x', logoTargetHeight);
  } catch (error) {
    console.error('Logo loading error:', error);
    console.error('Error details:', error);
  }
}

function roundRect(
  ctx: NodeCanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
