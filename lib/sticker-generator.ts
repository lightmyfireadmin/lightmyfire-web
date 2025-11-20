import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { logger } from '@/lib/logger';

// Font handling configuration
logger.log('Font handling configured for SVG text elements');

const SHEET_WIDTH_INCHES = 5.83;
const SHEET_HEIGHT_INCHES = 8.27;
const DPI = 600;
const SHEET_WIDTH_PX = Math.round(SHEET_WIDTH_INCHES * DPI);
const SHEET_HEIGHT_PX = Math.round(SHEET_HEIGHT_INCHES * DPI);
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

export interface StickerData {
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
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return 0;
  }

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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'\\"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return "'\'";
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export interface GeneratedSheet {
  filename: string;
  buffer: Buffer;
  data: string; // Base64
  size: number;
}

export async function generateStickerSheets(stickers: StickerData[]): Promise<GeneratedSheet[]> {
  if (!Array.isArray(stickers) || stickers.length === 0) {
    throw new Error('Please provide an array of stickers');
  }

  const numSheets = Math.ceil(stickers.length / TOTAL_STICKERS);

  // Generate all sheets
  const sheets: GeneratedSheet[] = [];

  for (let i = 0; i < numSheets; i++) {
    const startIdx = i * TOTAL_STICKERS;
    const endIdx = Math.min(startIdx + TOTAL_STICKERS, stickers.length);
    const sheetStickers = stickers.slice(startIdx, endIdx);

    const buffer = await generateSingleSheet(sheetStickers);

    // Verify PNG signature to ensure buffer is valid
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    if (!buffer.subarray(0, 8).equals(pngSignature)) {
      throw new Error(`Invalid PNG buffer for sheet ${i + 1}`);
    }

    sheets.push({
      filename: `lightmyfire-stickers-sheet-${i + 1}.png`,
      buffer,
      data: buffer.toString('base64'),
      size: buffer.length
    });
  }

  logger.info('Generated sticker sheets', { numSheets: sheets.length });
  return sheets;
}

async function generateSingleSheet(stickers: StickerData[]): Promise<Buffer> {
  // Create a white background canvas with transparency support
  const canvas = await sharp({
    create: {
      width: SHEET_WIDTH_PX,
      height: SHEET_HEIGHT_PX,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
    }
  });

  const composite: sharp.OverlayOptions[] = [];

  const topSectionUsedWidth = STICKERS_PER_ROW * STICKER_WIDTH_PX + (STICKERS_PER_ROW - 1) * GAP_PX;
  const topOffsetX = Math.round((SHEET_WIDTH_PX - topSectionUsedWidth) / 2);
  const topOffsetY = Math.round(GAP_PX / 2);

  let stickerIndex = 0;
  for (let row = 0; row < ROWS_TOP && stickerIndex < stickers.length; row++) {
    for (let col = 0; col < STICKERS_PER_ROW && stickerIndex < stickers.length; col++) {
      const x = topOffsetX + col * (STICKER_WIDTH_PX + GAP_PX);
      const y = topOffsetY + row * (STICKER_HEIGHT_PX + GAP_PX);
      const stickerBuffer = await generateStickerImage(stickers[stickerIndex], x, y);
      composite.push({
        input: stickerBuffer,
        top: y,
        left: x
      });
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
      const stickerBuffer = await generateStickerImage(stickers[stickerIndex], x, y);
      composite.push({
        input: stickerBuffer,
        top: y,
        left: x
      });
      stickerIndex++;
    }
  }

  const finalCanvas = await canvas.composite(composite).png().toBuffer();
  return finalCanvas;
}

async function generateStickerImage(sticker: StickerData, x: number, y: number): Promise<Buffer> {
  const canvas = await sharp({
    create: {
      width: STICKER_WIDTH_PX,
      height: STICKER_HEIGHT_PX,
      channels: 4,
      background: {
        r: parseInt(sticker.backgroundColor.slice(1, 3), 16),
        g: parseInt(sticker.backgroundColor.slice(3, 5), 16),
        b: parseInt(sticker.backgroundColor.slice(5, 7), 16),
        alpha: 1
      }
    }
  });

  const composite: sharp.OverlayOptions[] = [];

  const padding = Math.round(STICKER_WIDTH_PX * 0.05);
  const contentWidth = STICKER_WIDTH_PX - padding * 2;
  const cardRadius = Math.round(STICKER_WIDTH_PX * 0.05);
  const textColor = getContrastingTextColor(sticker.backgroundColor);

  const texts = getStickerTexts(sticker.language);

  // Try to add background layer
  try {
    const bgLayerPath = path.join(process.cwd(), 'public', 'newassets', 'sticker_bg_layer.png');
    if (fs.existsSync(bgLayerPath)) {
      const bgLayerBuffer = await sharp(bgLayerPath).resize(STICKER_WIDTH_PX, STICKER_HEIGHT_PX).toBuffer();
      composite.push({
        input: bgLayerBuffer,
        top: 0,
        left: 0
      });
    }
  } catch (error) {
    console.error('Background layer loading error:', error);
  }

  // Create SVG for text elements
  let currentY = padding;

  // Card for name section (140px height)
  const nameCardSvg = `
    <svg width="${contentWidth}" height="140" xmlns="http://www.w3.org/2000/svg">
      <rect width="${contentWidth}" height="140" rx="${cardRadius}" fill="${CARD_BG_COLOR}"/>
    </svg>
  `;
  composite.push({
    input: Buffer.from(nameCardSvg),
    top: currentY,
    left: padding
  });

  // Text elements for name section
  const nameTextSvg = `
    <svg width="${contentWidth}" height="140" xmlns="http://www.w3.org/2000/svg">
      <text x="${contentWidth / 2}" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="500" fill="#000000">${texts.youFoundMe}</text>
      <text x="${contentWidth / 2}" y="96" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#000000">${escapeXml(sticker.name)}</text>
    </svg>
  `;
  composite.push({
    input: Buffer.from(nameTextSvg),
    top: currentY,
    left: padding
  });

  currentY += 140 + padding;
  currentY -= 10;

  // Tell them how we met text
  const tellThemTextSvg = `
    <svg width="${contentWidth}" height="100" xmlns="http://www.w3.org/2000/svg">
      <text x="${contentWidth / 2}" y="4" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="${textColor}">${texts.tellThemHowWeMet}</text>
    </svg>
  `;
  composite.push({
    input: Buffer.from(tellThemTextSvg),
    top: currentY + 4,
    left: padding
  });

  currentY += 100;

  // QR Code section
  const qrCardSize = Math.round(contentWidth * 0.7);
  const qrSize = Math.round(qrCardSize * 0.89);
  const qrCardX = padding + (contentWidth - qrCardSize) / 2;
  
  const qrCardSvg = `
    <svg width="${qrCardSize}" height="${qrCardSize}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${qrCardSize}" height="${qrCardSize}" rx="${cardRadius}" fill="${CARD_BG_COLOR}"/>
    </svg>
  `;
  composite.push({
    input: Buffer.from(qrCardSvg),
    top: currentY,
    left: qrCardX
  });

  // Generate and add QR code
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lightmyfire.app';
    const qrUrl = `${baseUrl}/?pin=${sticker.pinCode}`;

    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrX = Math.round(STICKER_WIDTH_PX / 2 - qrSize / 2);
    const qrY = currentY + (qrCardSize - qrSize) / 2;
    
    composite.push({
      input: qrBuffer,
      top: qrY,
      left: qrX
    });
  } catch (error) {
    console.error('QR code generation error:', error);
  }

  currentY += qrCardSize + (4 * 6);

  // URL section
  const urlBgHeight = 116;
  const urlCardSvg = `
    <svg width="${contentWidth}" height="${urlBgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${contentWidth}" height="${urlBgHeight}" rx="${cardRadius}" fill="${CARD_BG_COLOR}"/>
    </svg>
  `;
  composite.push({
    input: Buffer.from(urlCardSvg),
    top: currentY,
    left: padding
  });

  const urlTextSvg = `
    <svg width="${contentWidth}" height="${urlBgHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="${contentWidth / 2}" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="500" fill="#000000">${texts.orGoTo}</text>
      <text x="${contentWidth / 2}" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#000000">${texts.website}</text>
    </svg>
  `;
  composite.push({
    input: Buffer.from(urlTextSvg),
    top: currentY,
    left: padding
  });

  currentY += urlBgHeight + 4;

  // And type my code text
  const codeTextSvg = `
    <svg width="${contentWidth}" height="76" xmlns="http://www.w3.org/2000/svg">
      <text x="${contentWidth / 2}" y="4" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="800" fill="${textColor}">${texts.andTypeMyCode}</text>
    </svg>
  `;
  composite.push({
    input: Buffer.from(codeTextSvg),
    top: currentY + 4,
    left: padding
  });

  currentY += 76 + (4 * 3);

  // PIN code section
  const pinBgHeight = 104;
  const pinCardSvg = `
    <svg width="${contentWidth}" height="${pinBgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${contentWidth}" height="${pinBgHeight}" rx="${cardRadius}" fill="${CARD_BG_COLOR}"/>
    </svg>
  `;
  composite.push({
    input: Buffer.from(pinCardSvg),
    top: currentY,
    left: padding
  });

  const pinTextSvg = `
    <svg width="${contentWidth}" height="${pinBgHeight}" xmlns="http://www.w3.org/2000/svg">
      <text x="${contentWidth / 2}" y="${pinBgHeight / 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#000000" dominant-baseline="middle">${sticker.pinCode}</text>
    </svg>
  `;
  composite.push({
    input: Buffer.from(pinTextSvg),
    top: currentY,
    left: padding
  });

  currentY += pinBgHeight + (4 * 4);

  // Logo and disclaimer section
  try {
    const creamBgTop = currentY + 5;
    const creamBgBottom = STICKER_HEIGHT_PX + 5;

    const logoPath = path.join(process.cwd(), 'public', 'LOGOLONG.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = await sharp(logoPath).toBuffer();
      const logo = await sharp(logoBuffer);
      const metadata = await logo.metadata();
      
      const logoPadding = 40;
      const logoBaseWidth = STICKER_WIDTH_PX - (logoPadding * 2);
      const logoTargetWidth = Math.round(logoBaseWidth * 0.6);
      const logoAspectRatio = metadata.height / metadata.width;
      const logoTargetHeight = Math.round(logoTargetWidth * logoAspectRatio);

      const logoX = (STICKER_WIDTH_PX - logoTargetWidth) / 2;
      const logoY = creamBgTop + (creamBgBottom - creamBgTop - logoTargetHeight) / 2;

      // Resize logo and add to composite
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoTargetWidth, logoTargetHeight)
        .toBuffer();
      
      composite.push({
        input: resizedLogo,
        top: Math.round(logoY),
        left: Math.round(logoX)
      });

      logger.log('Logo drawn successfully', { x: logoX, y: logoY, width: logoTargetWidth, height: logoTargetHeight });
    }
  } catch (error) {
    console.error('Logo loading error:', error);
  }

  const finalCanvas = await canvas.composite(composite).png().toBuffer();
  return finalCanvas;
}
