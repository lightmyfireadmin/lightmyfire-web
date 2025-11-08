

import { FILE_UPLOAD } from './constants';

const FILE_SIGNATURES = {
  PNG: {
    signature: [0x89, 0x50, 0x4e, 0x47],
    mimeType: 'image/png',
    extension: '.png',
  },
  JPEG: {
    signature: [0xff, 0xd8, 0xff],
    mimeType: 'image/jpeg',
    extension: '.jpg',
  },
  GIF: {
    signature: [0x47, 0x49, 0x46],
    mimeType: 'image/gif',
    extension: '.gif',
  },
} as const;

interface FileValidationResult {
  valid: boolean;
  error?: string;
  detectedMimeType?: string;
}

export async function validateFileSignature(
  file: File
): Promise<FileValidationResult> {
  try {
        const buffer = await file.slice(0, 4).arrayBuffer();
    const view = new Uint8Array(buffer);

        for (const [key, sig] of Object.entries(FILE_SIGNATURES)) {
      const isMatch = sig.signature.every(
        (byte, index) => view[index] === byte
      );
      if (isMatch) {
        return {
          valid: true,
          detectedMimeType: sig.mimeType,
        };
      }
    }

    return {
      valid: false,
      error: 'File type not supported. Please upload a PNG, JPEG, or GIF image.',
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate file. Please try again.',
    };
  }
}

export function validateFileSize(file: File): string | null {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB.`;
  }
  return null;
}

export async function validateFile(
  file: File
): Promise<FileValidationResult> {
    const sizeError = validateFileSize(file);
  if (sizeError) {
    return {
      valid: false,
      error: sizeError,
    };
  }

    if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type as 'image/png' | 'image/jpeg' | 'image/gif')) {
          }

    const signatureResult = await validateFileSignature(file);
  if (!signatureResult.valid) {
    return signatureResult;
  }

  return {
    valid: true,
    detectedMimeType: signatureResult.detectedMimeType,
  };
}

export function sanitizeFilename(filename: string): string {
    return filename
    .replace(/^.*[\\/]/, '')     .replace(/[^a-z0-9._-]/gi, '_')     .toLowerCase();
}

export function generateSafeFilename(
  userId: string,
  originalFilename: string
): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'bin';
  const sanitized = sanitizeFilename(originalFilename.split('.')[0]);

  return `${userId}-${timestamp}-${sanitized}.${extension}`;
}

const fileValidationUtils = {
  validateFile,
  validateFileSize,
  validateFileSignature,
  sanitizeFilename,
  generateSafeFilename,
};

export default fileValidationUtils;
