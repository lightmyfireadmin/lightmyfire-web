

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

/**
 * Validates image dimensions
 * @param file - Image file to validate
 * @param maxWidth - Maximum width in pixels (default: 4096)
 * @param maxHeight - Maximum height in pixels (default: 4096)
 * @param minWidth - Minimum width in pixels (default: 100)
 * @param minHeight - Minimum height in pixels (default: 100)
 * @returns Promise with validation result
 */
export async function validateImageDimensions(
  file: File,
  maxWidth = 4096,
  maxHeight = 4096,
  minWidth = 100,
  minHeight = 100
): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({
            valid: false,
            error: `Image dimensions too large. Maximum ${maxWidth}x${maxHeight} pixels.`,
          });
          return;
        }

        if (img.width < minWidth || img.height < minHeight) {
          resolve({
            valid: false,
            error: `Image dimensions too small. Minimum ${minWidth}x${minHeight} pixels.`,
          });
          return;
        }

        resolve({
          valid: true,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          error: 'Failed to load image. File may be corrupted.',
        });
      };

      img.src = objectUrl;
    } catch (error) {
      resolve({
        valid: false,
        error: 'Failed to validate image dimensions.',
      });
    }
  });
}

export async function validateFile(
  file: File,
  validateDimensions = true
): Promise<FileValidationResult> {
  // Validate file size
  const sizeError = validateFileSize(file);
  if (sizeError) {
    return {
      valid: false,
      error: sizeError,
    };
  }

  // Validate MIME type
  if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type as 'image/png' | 'image/jpeg' | 'image/gif')) {
    return {
      valid: false,
      error: 'Invalid file type. Only PNG, JPEG, and GIF images are allowed.',
    };
  }

  // Validate file signature (prevents file extension spoofing)
  const signatureResult = await validateFileSignature(file);
  if (!signatureResult.valid) {
    return signatureResult;
  }

  // Validate image dimensions (optional, enabled by default)
  if (validateDimensions) {
    const dimensionsResult = await validateImageDimensions(file);
    if (!dimensionsResult.valid) {
      return dimensionsResult;
    }
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
  validateImageDimensions,
  sanitizeFilename,
  generateSafeFilename,
};

export default fileValidationUtils;
