import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

interface StickerData {
  id: string;
  name: string;
  backgroundColor: string;
  language?: string;
  pinCode?: string;
}

/**
 * Generates a PNG from sticker DOM elements using dom-to-image
 * This ensures proper font rendering compared to server-side canvas
 */
export async function generateStickerPNG(
  stickers: StickerData[],
  format: 'printful' | 'stickiply',
  orderId: string
): Promise<Blob> {
  // Set dimensions based on format (300 DPI)
  const dimensions = format === 'printful'
    ? { width: 5.83, height: 8.27 } // A5 inches
    : { width: 7.5, height: 5 }; // Stickiply inches

  const DPI = 300;
  const widthPx = Math.round(dimensions.width * DPI);
  const heightPx = Math.round(dimensions.height * DPI);

  // Create a high-resolution container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px'; // Hide off-screen
  container.style.top = '0';
  container.style.width = `${widthPx}px`;
  container.style.height = `${heightPx}px`;
  container.style.backgroundColor = 'transparent';
  container.style.overflow = 'hidden';

  document.body.appendChild(container);

  try {
    // Calculate sticker layout based on format
    const layout = calculateStickerLayout(format, stickers.length, DPI);

    // Create and position each sticker manually
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

    // Add branding area for Printful format
    if (format === 'printful') {
      const brandingArea = createBrandingArea(widthPx, heightPx);
      container.appendChild(brandingArea);
    }

    // Wait for images to load
    await waitForImagesToLoad(container);

    // Additional delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PNG using html2canvas with high quality settings
    const canvas = await html2canvas(container, {
      width: widthPx,
      height: heightPx,
      backgroundColor: null, // transparent
      scale: 1, // Already at 300 DPI dimensions
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Convert canvas to blob
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
    // Clean up
    document.body.removeChild(container);
  }
}

interface StickerLayout {
  stickerWidth: number;
  stickerHeight: number;
  positions: { x: number; y: number }[];
}

/**
 * Create a sticker DOM element with all the styling and content
 */
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
  stickerDiv.style.borderRadius = `${Math.round(height * 0.016)}px`; // Rounded corners for sticker

  // Scaled padding (12px at 500px height = 2.4%)
  const padding = Math.round(height * 0.024);
  const contentWidth = width - padding * 2;

  let currentY = padding;

  // Top card: "You found me" + name
  const borderRadius = `${Math.round(height * 0.008)}px`; // Rounded corners for cards
  const cardHeight = Math.round(height * 0.13);
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
  topCard.style.padding = `${Math.round(height * 0.020)}px ${Math.round(height * 0.012)}px`;
  topCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.030)}px; font-weight: bold; line-height: 1.1;">You found me</div>
    <div style="color: #000000; font-size: ${Math.round(height * 0.028)}px; font-weight: bold; line-height: 1.1;">I'm ${sticker.name}</div>
  `;
  stickerDiv.appendChild(topCard);

  currentY += cardHeight + Math.round(height * 0.012);

  // Invitation text
  const translations: { [key: string]: { readStory: string; typeCode: string } } = {
    en: {
      readStory: 'Read my story and expand it',
      typeCode: 'and type my code',
    },
    fr: {
      readStory: 'Lis mon histoire et enrichis-la',
      typeCode: 'et entre mon code',
    },
    es: {
      readStory: 'Lee mi historia y ampliala',
      typeCode: 'e introduce mi código',
    },
    de: {
      readStory: 'Lesen Sie meine Geschichte',
      typeCode: 'und gib meinen Code ein',
    },
    it: {
      readStory: 'Leggi la mia storia e ampliala',
      typeCode: 'e digita il mio codice',
    },
    pt: {
      readStory: 'Leia minha história e expanda',
      typeCode: 'e digite meu código',
    },
  };

  const trans = translations[sticker.language || 'en'] || translations.en;

  // Invitation text - optimized for readability
  const invitationText = document.createElement('div');
  invitationText.style.position = 'absolute';
  invitationText.style.left = '0';
  invitationText.style.top = `${currentY}px`;
  invitationText.style.width = `${width}px`;
  invitationText.style.textAlign = 'center';
  invitationText.style.color = '#ffffff';
  invitationText.style.fontWeight = 'bold';
  invitationText.style.lineHeight = '1.15';
  invitationText.style.padding = `0 ${padding}px`;
  invitationText.innerHTML = `
    <div style="font-size: ${Math.round(height * 0.024)}px; line-height: 1.15;">Read my story</div>
    <div style="font-size: ${Math.round(height * 0.024)}px; line-height: 1.15;">and expand it</div>
    <div style="font-size: ${Math.round(height * 0.020)}px; margin-top: ${Math.round(height * 0.006)}px; line-height: 1.15;">${trans.readStory}</div>
  `;
  stickerDiv.appendChild(invitationText);

  currentY += Math.round(height * 0.085);

  // QR Code
  const qrSize = Math.round(height * 0.18);
  const qrPadding = Math.round(height * 0.016);
  const qrCodeDiv = document.createElement('div');
  qrCodeDiv.style.position = 'absolute';
  qrCodeDiv.style.left = `${(width - qrSize - qrPadding * 2) / 2}px`;
  qrCodeDiv.style.top = `${currentY}px`;
  qrCodeDiv.style.width = `${qrSize + qrPadding * 2}px`;
  qrCodeDiv.style.height = `${qrSize + qrPadding * 2}px`;
  qrCodeDiv.style.backgroundColor = '#ffffff';
  qrCodeDiv.style.padding = `${qrPadding}px`;
  qrCodeDiv.style.borderRadius = borderRadius;

  // Generate QR code
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

  currentY += qrSize + qrPadding * 2 + Math.round(height * 0.012);

  // URL card - optimized sizing
  const urlBgHeight = Math.round(height * 0.095);
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
  urlCard.style.padding = `${Math.round(height * 0.016)}px ${Math.round(height * 0.012)}px`;
  urlCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.020)}px; font-weight: bold; line-height: 1.1;">or go to</div>
    <div style="color: #000000; font-size: ${Math.round(height * 0.022)}px; font-weight: bold; line-height: 1.1;">lightmyfire.app</div>
  `;
  stickerDiv.appendChild(urlCard);

  currentY += urlBgHeight + Math.round(height * 0.012);

  // Code text - optimized for readability
  const codeText = document.createElement('div');
  codeText.style.position = 'absolute';
  codeText.style.left = '0';
  codeText.style.top = `${currentY}px`;
  codeText.style.width = `${width}px`;
  codeText.style.textAlign = 'center';
  codeText.style.color = '#ffffff';
  codeText.style.fontWeight = 'bold';
  codeText.style.lineHeight = '1.15';
  codeText.style.padding = `0 ${padding}px`;
  codeText.innerHTML = `
    <div style="font-size: ${Math.round(height * 0.024)}px; line-height: 1.15;">and type my code</div>
    <div style="font-size: ${Math.round(height * 0.020)}px; margin-top: ${Math.round(height * 0.006)}px; line-height: 1.15;">${trans.typeCode}</div>
  `;
  stickerDiv.appendChild(codeText);

  currentY += Math.round(height * 0.085);

  // PIN code card - optimized sizing
  const pinBgHeight = Math.round(height * 0.11);
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
  pinCard.style.padding = `${Math.round(height * 0.020)}px ${Math.round(height * 0.012)}px`;
  pinCard.innerHTML = `
    <div style="color: #000000; font-size: ${Math.round(height * 0.044)}px; font-weight: bold; letter-spacing: 0.05em;">${sticker.pinCode || 'ABC-123'}</div>
  `;
  stickerDiv.appendChild(pinCard);

  currentY += pinBgHeight + Math.round(height * 0.012);

  // Logo section at bottom (web preview: height 60px at 500px = 12%)
  const logoSectionHeight = Math.round(height * 0.12);
  const logoSection = document.createElement('div');
  logoSection.style.position = 'absolute';
  logoSection.style.left = '0';
  logoSection.style.bottom = '0';
  logoSection.style.width = `${width}px`;
  logoSection.style.height = `${logoSectionHeight}px`;
  logoSection.style.backgroundColor = '#ffffff';
  logoSection.style.display = 'flex';
  logoSection.style.alignItems = 'center';
  logoSection.style.justifyContent = 'center';
  logoSection.style.padding = `0 ${Math.round(width * 0.08)}px`;

  const logoImg = document.createElement('img');
  logoImg.src = '/LOGOLONG.png';
  logoImg.crossOrigin = 'anonymous';
  logoImg.style.width = '100%';
  logoImg.style.maxWidth = `${Math.round(width * 0.75)}px`; // 150px at 200px width
  logoImg.style.height = 'auto';
  logoImg.style.objectFit = 'contain';
  logoSection.appendChild(logoImg);

  stickerDiv.appendChild(logoSection);

  return stickerDiv;
}

function calculateStickerLayout(
  format: 'printful' | 'stickiply',
  stickerCount: number,
  DPI: number
): StickerLayout {

  // Sticker dimensions: 2cm x 5cm
  const STICKER_WIDTH_CM = 2;
  const STICKER_HEIGHT_CM = 5;
  const CM_TO_INCHES = 1 / 2.54;
  const stickerWidth = Math.round(STICKER_WIDTH_CM * CM_TO_INCHES * DPI);
  const stickerHeight = Math.round(STICKER_HEIGHT_CM * CM_TO_INCHES * DPI);

  const positions: { x: number; y: number }[] = [];

  if (format === 'printful') {
    // Printful: A5 sheet (5.83" × 8.27") with 0.64cm gaps
    const SHEET_WIDTH = Math.round(5.83 * DPI);
    const SHEET_HEIGHT = Math.round(8.27 * DPI);
    const GAP = Math.round(0.64 * CM_TO_INCHES * DPI);
    const RESERVED = Math.round(3 * DPI); // 3" × 3" bottom-right reserved

    const stickersPerRow = Math.floor(SHEET_WIDTH / (stickerWidth + GAP));
    const topSectionHeight = SHEET_HEIGHT - RESERVED;
    const rowsTop = Math.floor(topSectionHeight / (stickerHeight + GAP));

    // Center stickers in top section
    const topUsedWidth = stickersPerRow * stickerWidth + (stickersPerRow - 1) * GAP;
    const topOffsetX = Math.round((SHEET_WIDTH - topUsedWidth) / 2);
    const topOffsetY = Math.round(GAP / 2);

    let stickerIndex = 0;

    // Top section
    for (let row = 0; row < rowsTop && stickerIndex < stickerCount; row++) {
      for (let col = 0; col < stickersPerRow && stickerIndex < stickerCount; col++) {
        positions.push({
          x: topOffsetX + col * (stickerWidth + GAP),
          y: topOffsetY + row * (stickerHeight + GAP),
        });
        stickerIndex++;
      }
    }

    // Bottom-left section
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
    // Stickiply: 7.5" × 5" sheet with 1cm gaps
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
  const RESERVED = Math.round(3 * 300); // 3" at 300 DPI

  const brandingDiv = document.createElement('div');
  brandingDiv.style.position = 'absolute';
  brandingDiv.style.left = `${sheetWidth - RESERVED}px`;
  brandingDiv.style.top = `${sheetHeight - RESERVED}px`;
  brandingDiv.style.width = `${RESERVED}px`;
  brandingDiv.style.height = `${RESERVED}px`;
  brandingDiv.style.backgroundColor = '#ffffff';
  brandingDiv.style.display = 'flex';
  brandingDiv.style.flexDirection = 'column';
  brandingDiv.style.alignItems = 'center';
  brandingDiv.style.justifyContent = 'center';
  brandingDiv.style.padding = `${Math.round(RESERVED * 0.15)}px`;
  brandingDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';

  // Add logo
  const logo = document.createElement('img');
  logo.src = '/LOGOLONG.png';
  logo.style.width = '80%';
  logo.style.height = 'auto';
  logo.style.marginBottom = `${Math.round(RESERVED * 0.1)}px`;
  brandingDiv.appendChild(logo);

  // Add text
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

/**
 * Wait for all images in a container to load
 */
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
        resolve(); // Continue anyway
      };
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  });

  await Promise.all(imagePromises);
}

/**
 * Download a blob as a file
 */
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
