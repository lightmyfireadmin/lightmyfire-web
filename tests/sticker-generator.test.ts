import { describe, it, expect, vi } from 'vitest';
import { generateStickerSheets } from '../lib/sticker-generator';

// Mock sharp
vi.mock('sharp', () => {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const sharpInstance = {
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.concat([pngSignature, Buffer.from('mock-buffer')])),
    metadata: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
    composite: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
  };
  const sharpFn = vi.fn(() => sharpInstance);
  return { default: sharpFn };
});

// Mock QRCode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
  },
}));

describe('sticker-generator', () => {
  it('should generate sticker sheets', async () => {
    const stickers = [
      {
        name: 'Test Sticker',
        pinCode: 'TST-001',
        backgroundColor: '#FF6B6B',
        language: 'en',
      },
    ];

    const sheets = await generateStickerSheets(stickers);

    expect(sheets).toHaveLength(1);
    expect(sheets[0].filename).toContain('lightmyfire-stickers-sheet-1.png');
    // The buffer should start with PNG signature
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    expect(sheets[0].buffer.subarray(0, 8).equals(pngSignature)).toBe(true);
  });
});
