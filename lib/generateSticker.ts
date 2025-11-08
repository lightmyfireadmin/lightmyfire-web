import { PDFDocument, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { downloadFile } from './download';

export async function generateStickerPDF(name: string, pin: string) {
  try {
        const pdfDoc = await PDFDocument.create();
        const pageWidth = 144;
    const pageHeight = 72;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();

                const qrCodeUrl = 'http://localhost:3000/find';
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
      width: 60,
      margin: 1,
    });
    const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), (c) =>
      c.charCodeAt(0)
    );
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const margin = 5;
    const qrSize = 60;     
        page.drawImage(qrImage, {
      x: margin,
      y: height - qrSize - margin,
      width: qrSize,
      height: qrSize,
    });

        const textX = qrSize + margin * 2;
    const textY = height - margin - 12; 
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

        const pdfBytes = await pdfDoc.save();

        downloadFile(pdfBytes, `${name.replace(/\s+/g, '_')}-sticker.pdf`, 'application/pdf');

  } catch (err) {
    alert('Could not generate sticker PDF. Please try again.');
  }
}