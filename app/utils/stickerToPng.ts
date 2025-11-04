import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface StickerData {
  id: string;
  name: string;
  backgroundColor: string;
  language?: string;
  pinCode?: string;
}

function getLuminance(hexColor: string): number {
  
  const hex = hexColor.replace('#', '');

  
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

function getContrastTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export async function generateStickerPNG(
  stickers: StickerData[],
  format: 'printful' | 'stickiply',
  orderId: string
): Promise<Blob> {
  
  const dimensions = format === 'printful'
    ? { width: 5.83, height: 8.27 } 
    : { width: 7.5, height: 5 }; 

  const DPI = 300;
  const widthPx = Math.round(dimensions.width * DPI);
  const heightPx = Math.round(dimensions.height * DPI);

  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px'; 
  container.style.top = '0';
  container.style.width = `${widthPx}px`;
  container.style.height = `${heightPx}px`;
  container.style.backgroundColor = 'transparent';
  container.style.overflow = 'hidden';

  document.body.appendChild(container);

  try {
    
    const layout = calculateStickerLayout(format, stickers.length, DPI);

    
    for (let i = 0; i < stickers.length && i < layout.positions.length; i++) {
      const sticker = stickers[i];
      const position = layout.positions[i];

      const stickerElement = await createStickerElement(
        sticker,
        layout.stickerWidth,
        layout.stickerHeight
      );

      stickerElement.style.position = 'absolute';
      stickerElement.style.left = `${position.x}px`;
      stickerElement.style.top = `${position.y}px`;

      container.appendChild(stickerElement);
    }

    
    if (format === 'printful') {
      const brandingArea = createBrandingArea(widthPx, heightPx);
      container.appendChild(brandingArea);
    }

    
    await waitForImagesToLoad(container);

    
    await new Promise(resolve => setTimeout(resolve, 500));

    
    const canvas = await html2canvas(container, {
      width: widthPx,
      height: heightPx,
      backgroundColor: null, 
      scale: 1, 
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG blob'));
        }
      }, 'image/png', 1.0);
    });

    return blob;
  } finally {
    
    document.body.removeChild(container);
  }
}

interface StickerLayout {
  stickerWidth: number;
  stickerHeight: number;
  positions: { x: number; y: number }[];
}

async function createStickerElement(
  sticker: StickerData,
  width: number,
  height: number
): Promise<HTMLElement> {
  const stickerDiv = document.createElement('div');
  stickerDiv.style.width = `${width}px`;
  stickerDiv.style.height = `${height}px`;
  stickerDiv.style.backgroundColor = sticker.backgroundColor;
  stickerDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';
  stickerDiv.style.position = 'relative';
  stickerDiv.style.overflow = 'hidden';
  stickerDiv.style.borderRadius = `${Math.round(height * 0.016)}px`; 

  
  const textColor = getContrastTextColor(sticker.backgroundColor);

  
  const padding = Math.round(height * 0.024);
  const contentWidth = width - padding * 2;

  let currentY = padding;

  
  const borderRadius = `${Math.round(height * 0.016)}px`; 
  const cardHeight = Math.round(height * 0.16);
  const topCard = document.createElement('div');
  topCard.style.position = 'absolute';
  topCard.style.left = `${padding}px`;
  topCard.style.top = `${currentY}px`;
  topCard.style.width = `${contentWidth}px`;
  topCard.style.height = `${cardHeight}px`;
  topCard.style.backgroundColor = '#ffffff';
  topCard.style.borderRadius = borderRadius;
  topCard.style.display = 'flex';
  topCard.style.flexDirection = 'column';
  topCard.style.alignItems = 'center';
  topCard.style.justifyContent = 'center';
  topCard.style.textAlign = 'center';
  topCard.style.padding = `${Math.round(height * 0.018)}px ${Math.round(height * 0.016)}px ${Math.round(height * 0.026)}px`;
  topCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.034)}px; font-weight: normal; line-height: 1.2; margin-bottom: ${Math.round(height * 0.008)}px;">You found me!</div>
    <div style="color: #000000; font-size: ${Math.round(height * 0.032)}px; font-weight: normal; line-height: 1.2;">I'm</div>
    <div style="color: #000000; font-size: ${Math.round(height * 0.038)}px; font-weight: bold; line-height: 1.2;">${sticker.name}</div>
  `;
  stickerDiv.appendChild(topCard);

  currentY += cardHeight + Math.round(height * 0.01);

  
  const translations: { [key: string]: { readStory: string; typeCode: string } } = {
    en: {
      readStory: 'Read my Story & Write it',
      typeCode: 'and type my code',
    },
    fr: {
      readStory: 'Lis mon histoire et écris-la',
      typeCode: 'et entre mon code',
    },
    es: {
      readStory: 'Lee mi historia y escríbela',
      typeCode: 'e introduce mi código',
    },
    de: {
      readStory: 'Lesen Sie meine Geschichte',
      typeCode: 'und gib meinen Code ein',
    },
    it: {
      readStory: 'Leggi la mia storia e scrivila',
      typeCode: 'e digita il mio codice',
    },
    pt: {
      readStory: 'Leia minha história e expanda',
      typeCode: 'e digite meu código',
    },
  };

  const trans = translations[sticker.language || 'en'] || translations.en;

  
  const invitationText = document.createElement('div');
  invitationText.style.position = 'absolute';
  invitationText.style.left = '0';
  invitationText.style.top = `${currentY}px`;
  invitationText.style.width = `${width}px`;
  invitationText.style.textAlign = 'center';
  invitationText.style.color = textColor;
  invitationText.style.lineHeight = '1.2';
  invitationText.style.padding = `0 ${padding}px`;
  invitationText.innerHTML = `
    <div style="font-size: ${Math.round(height * 0.03)}px; font-weight: bold; line-height: 1.2;">Read my Story & Write it</div>
    <div style="font-size: ${Math.round(height * 0.024)}px; font-weight: normal; margin-top: ${Math.round(height * 0.006)}px; line-height: 1.2;">${trans.readStory}</div>
  `;
  stickerDiv.appendChild(invitationText);

  currentY += Math.round(height * 0.08);

  
  const qrSize = Math.round(height * 0.20); 
  const qrPadding = Math.round(height * 0.018); 
  const qrCodeDiv = document.createElement('div');
  qrCodeDiv.style.position = 'absolute';
  qrCodeDiv.style.left = `${(width - qrSize - qrPadding * 2) / 2}px`;
  qrCodeDiv.style.top = `${currentY}px`;
  qrCodeDiv.style.width = `${qrSize + qrPadding * 2}px`;
  qrCodeDiv.style.height = `${qrSize + qrPadding * 2}px`;
  qrCodeDiv.style.backgroundColor = '#ffffff';
  qrCodeDiv.style.padding = `${qrPadding}px`;
  qrCodeDiv.style.borderRadius = borderRadius;

  
  try {
    const qrUrl = `${window.location.origin}/find`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const qrImg = document.createElement('img');
    qrImg.src = qrDataUrl;
    qrImg.style.width = '100%';
    qrImg.style.height = '100%';
    qrCodeDiv.appendChild(qrImg);
  } catch (error) {
    console.error('QR code generation error:', error);
  }

  stickerDiv.appendChild(qrCodeDiv);

  currentY += qrSize + qrPadding * 2 + Math.round(height * 0.010);

  
  const urlBgHeight = Math.round(height * 0.075);
  const urlCard = document.createElement('div');
  urlCard.style.position = 'absolute';
  urlCard.style.left = `${padding}px`;
  urlCard.style.top = `${currentY}px`;
  urlCard.style.width = `${contentWidth}px`;
  urlCard.style.height = `${urlBgHeight}px`;
  urlCard.style.backgroundColor = '#ffffff';
  urlCard.style.borderRadius = borderRadius;
  urlCard.style.display = 'flex';
  urlCard.style.flexDirection = 'column';
  urlCard.style.alignItems = 'center';
  urlCard.style.justifyContent = 'center';
  urlCard.style.padding = `${Math.round(height * 0.012)}px ${Math.round(height * 0.012)}px`;
  urlCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.022)}px; font-weight: normal; line-height: 1.1;">or go to</div>
    <div style="color: #000000; font-size: ${Math.round(height * 0.026)}px; font-weight: bold; line-height: 1.1;">lightmyfire.app</div>
  `;
  stickerDiv.appendChild(urlCard);

  currentY += urlBgHeight + Math.round(height * 0.010);

  
  const codeText = document.createElement('div');
  codeText.style.position = 'absolute';
  codeText.style.left = '0';
  codeText.style.top = `${currentY}px`;
  codeText.style.width = `${width}px`;
  codeText.style.textAlign = 'center';
  codeText.style.color = textColor;
  codeText.style.lineHeight = '1.2';
  codeText.style.padding = `0 ${padding}px`;
  codeText.innerHTML = `
    <div style="font-size: ${Math.round(height * 0.03)}px; font-weight: bold; line-height: 1.2;">and type my code</div>
    <div style="font-size: ${Math.round(height * 0.024)}px; font-weight: normal; margin-top: ${Math.round(height * 0.006)}px; line-height: 1.2;">${trans.typeCode}</div>
  `;
  stickerDiv.appendChild(codeText);

  currentY += Math.round(height * 0.08);

  
  const pinBgHeight = Math.round(height * 0.10);
  const pinCard = document.createElement('div');
  pinCard.style.position = 'absolute';
  pinCard.style.left = `${padding}px`;
  pinCard.style.top = `${currentY}px`;
  pinCard.style.width = `${contentWidth}px`;
  pinCard.style.height = `${pinBgHeight}px`;
  pinCard.style.backgroundColor = '#ffffff';
  pinCard.style.borderRadius = borderRadius;
  pinCard.style.display = 'flex';
  pinCard.style.alignItems = 'center';
  pinCard.style.justifyContent = 'center';
  pinCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.055)}px; font-weight: bold; letter-spacing: 0.05em;">${sticker.pinCode || 'ABC-123'}</div>
  `;
  stickerDiv.appendChild(pinCard);

  currentY += pinBgHeight + Math.round(height * 0.010);

  
  
  
  const logoSectionHeight = Math.round(height * 0.12);
  const logoSection = document.createElement('div');
  logoSection.style.position = 'absolute';
  logoSection.style.left = '0';
  logoSection.style.bottom = '0';
  logoSection.style.width = `${width}px`;
  logoSection.style.height = `${logoSectionHeight}px`;
  logoSection.style.backgroundColor = '#FFF8F0'; 
  stickerDiv.appendChild(logoSection);

  return stickerDiv;
}

function calculateStickerLayout(
  format: 'printful' | 'stickiply',
  stickerCount: number,
  DPI: number
): StickerLayout {

  
  const STICKER_WIDTH_CM = 2;
  const STICKER_HEIGHT_CM = 5;
  const CM_TO_INCHES = 1 / 2.54;
  const stickerWidth = Math.round(STICKER_WIDTH_CM * CM_TO_INCHES * DPI);
  const stickerHeight = Math.round(STICKER_HEIGHT_CM * CM_TO_INCHES * DPI);

  const positions: { x: number; y: number }[] = [];

  if (format === 'printful') {
    
    const SHEET_WIDTH = Math.round(5.83 * DPI);
    const SHEET_HEIGHT = Math.round(8.27 * DPI);
    const GAP = Math.round(0.64 * CM_TO_INCHES * DPI);
    const RESERVED = Math.round(3 * DPI); 

    const stickersPerRow = Math.floor(SHEET_WIDTH / (stickerWidth + GAP));
    const topSectionHeight = SHEET_HEIGHT - RESERVED;
    const rowsTop = Math.floor(topSectionHeight / (stickerHeight + GAP));

    
    const topUsedWidth = stickersPerRow * stickerWidth + (stickersPerRow - 1) * GAP;
    const topOffsetX = Math.round((SHEET_WIDTH - topUsedWidth) / 2);
    const topOffsetY = Math.round(GAP / 2);

    let stickerIndex = 0;

    
    for (let row = 0; row < rowsTop && stickerIndex < stickerCount; row++) {
      for (let col = 0; col < stickersPerRow && stickerIndex < stickerCount; col++) {
        positions.push({
          x: topOffsetX + col * (stickerWidth + GAP),
          y: topOffsetY + row * (stickerHeight + GAP),
        });
        stickerIndex++;
      }
    }

    
    const bottomLeftWidth = SHEET_WIDTH - RESERVED;
    const stickersPerRowBottom = Math.floor(bottomLeftWidth / (stickerWidth + GAP));
    const rowsBottom = Math.floor(RESERVED / (stickerHeight + GAP));
    const bottomOffsetX = Math.round((bottomLeftWidth - (stickersPerRowBottom * stickerWidth + (stickersPerRowBottom - 1) * GAP)) / 2);
    const bottomOffsetY = SHEET_HEIGHT - RESERVED + Math.round(GAP / 2);

    for (let row = 0; row < rowsBottom && stickerIndex < stickerCount; row++) {
      for (let col = 0; col < stickersPerRowBottom && stickerIndex < stickerCount; col++) {
        positions.push({
          x: bottomOffsetX + col * (stickerWidth + GAP),
          y: bottomOffsetY + row * (stickerHeight + GAP),
        });
        stickerIndex++;
      }
    }
  } else {
    
    const SHEET_WIDTH = Math.round(7.5 * DPI);
    const SHEET_HEIGHT = Math.round(5 * DPI);
    const GAP = Math.round(1 * CM_TO_INCHES * DPI);

    const stickersPerRow = Math.floor((SHEET_WIDTH - GAP * 2 + GAP) / (stickerWidth + GAP));
    const stickersPerColumn = Math.floor((SHEET_HEIGHT - GAP * 2 + GAP) / (stickerHeight + GAP));

    const totalWidth = stickersPerRow * stickerWidth + (stickersPerRow - 1) * GAP;
    const totalHeight = stickersPerColumn * stickerHeight + (stickersPerColumn - 1) * GAP;
    const startX = (SHEET_WIDTH - totalWidth) / 2;
    const startY = (SHEET_HEIGHT - totalHeight) / 2;

    let stickerIndex = 0;
    for (let row = 0; row < stickersPerColumn && stickerIndex < stickerCount; row++) {
      for (let col = 0; col < stickersPerRow && stickerIndex < stickerCount; col++) {
        positions.push({
          x: startX + col * (stickerWidth + GAP),
          y: startY + row * (stickerHeight + GAP),
        });
        stickerIndex++;
      }
    }
  }

  return { stickerWidth, stickerHeight, positions };
}

function createBrandingArea(sheetWidth: number, sheetHeight: number): HTMLElement {
  const RESERVED = Math.round(3 * 300); 

  const brandingDiv = document.createElement('div');
  brandingDiv.style.position = 'absolute';
  brandingDiv.style.left = `${sheetWidth - RESERVED}px`;
  brandingDiv.style.top = `${sheetHeight - RESERVED}px`;
  brandingDiv.style.width = `${RESERVED}px`;
  brandingDiv.style.height = `${RESERVED}px`;
  brandingDiv.style.backgroundColor = '#FFF8F0'; 
  brandingDiv.style.display = 'flex';
  brandingDiv.style.flexDirection = 'column';
  brandingDiv.style.alignItems = 'center';
  brandingDiv.style.justifyContent = 'center';
  brandingDiv.style.padding = `${Math.round(RESERVED * 0.15)}px`;
  brandingDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';

  
  const logo = document.createElement('img');
  logo.src = '/LOGOLONG.png';
  logo.style.width = '80%';
  logo.style.height = 'auto';
  logo.style.marginBottom = `${Math.round(RESERVED * 0.1)}px`;
  brandingDiv.appendChild(logo);

  
  const title = document.createElement('div');
  title.textContent = 'LightMyFire';
  title.style.fontSize = `${Math.round(RESERVED * 0.08)}px`;
  title.style.fontWeight = 'bold';
  title.style.color = '#000000';
  title.style.textAlign = 'center';
  brandingDiv.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.textContent = 'Join our community!';
  subtitle.style.fontSize = `${Math.round(RESERVED * 0.06)}px`;
  subtitle.style.color = '#000000';
  subtitle.style.textAlign = 'center';
  subtitle.style.marginTop = `${Math.round(RESERVED * 0.05)}px`;
  brandingDiv.appendChild(subtitle);

  const url = document.createElement('div');
  url.textContent = 'lightmyfire.app';
  url.style.fontSize = `${Math.round(RESERVED * 0.06)}px`;
  url.style.color = '#000000';
  url.style.textAlign = 'center';
  brandingDiv.appendChild(url);

  return brandingDiv;
}

async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn('Image failed to load:', img.src);
        resolve(); 
      };
      
      setTimeout(() => resolve(), 5000);
    });
  });

  await Promise.all(imagePromises);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
