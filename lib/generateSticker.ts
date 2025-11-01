// lib/generateSticker.ts
import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { downloadFile } from './download';

export async function generateStickerPDF(name: string, pin: string) {
  try {
    // 1. Create a new PDF
    const pdfDoc = await PDFDocument.create();
    // A standard sticker size (e.g., 2x1 inches) in PDF points (72 points/inch)
    const pageWidth = 144;
    const pageHeight = 72;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();

    // 2. Generate the QR Code
    // We'll point the QR code to our /find page
    // In production, you'd change 'http://localhost:3000'
    const qrCodeUrl = 'http://localhost:3000/find';
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 60,
      margin: 1,
    });
    const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), (c) =>
      c.charCodeAt(0)
    );
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // 3. Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 4. Draw content on the PDF
    const margin = 5;
    const qrSize = 60; // Size of the QR image
    
    // Draw QR code on the left
    page.drawImage(qrImage, {
      x: margin,
      y: height - qrSize - margin,
      width: qrSize,
      height: qrSize,
    });

    // Draw text on the right
    const textX = qrSize + margin * 2;
    const textY = height - margin - 12; // Start from top

    page.drawText(name, {
      x: textX,
      y: textY,
      size: 12,
      font: font,
    });
    
    page.drawText('PIN:', {
      x: textX,
      y: textY - 20,
      size: 10,
      font: font,
    });
    
    page.drawText(pin, {
      x: textX,
      y: textY - 35,
      size: 14,
      font: font,
    });

    // 5. Save the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    // 6. Trigger the download
    downloadFile(pdfBytes, `${name.replace(/\s+/g, '_')}-sticker.pdf`, 'application/pdf');

  } catch (err) {
    alert('Could not generate sticker PDF. Please try again.');
  }
}