/**
 * File Upload Validation
 * Validates files by checking magic numbers (file signatures) instead of just extensions
 */

import { FILE_UPLOAD } from './constants';

// File signatures (magic numbers) for validation
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

/**
 * Check file signature (magic number) to verify file type
 * @param file - The file to check
 * @returns Promise with validation result
 */
export async function validateFileSignature(
  file: File
): Promise<FileValidationResult> {
  try {
    // Read the first 4 bytes of the file
    const buffer = await file.slice(0, 4).arrayBuffer();
    const view = new Uint8Array(buffer);

    // Check against known signatures
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

/**
 * Validate file size
 * @param file - The file to check
 * @returns Error message if invalid, null if valid
 */
export function validateFileSize(file: File): string | null {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Comprehensive file validation
 * Checks size, mime type, and magic number
 * @param file - The file to validate
 * @returns Promise with validation result
 */
export async function validateFile(
  file: File
): Promise<FileValidationResult> {
  // Check file size
  const sizeError = validateFileSize(file);
  if (sizeError) {
    return {
      valid: false,
      error: sizeError,
    };
  }

  // Check MIME type (client-side check, not reliable alone)
  if (!FILE_UPLOAD.ACCEPTED_TYPES.includes(file.type)) {
    // Don't block immediately - check magic number instead
    // This allows for files with wrong MIME type but correct content
  }

  // Check magic number (file signature) - most reliable
  const signatureResult = await validateFileSignature(file);
  if (!signatureResult.valid) {
    return signatureResult;
  }

  return {
    valid: true,
    detectedMimeType: signatureResult.detectedMimeType,
  };
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param filename - The original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  return filename
    .replace(/^.*[\\/]/, '') // Remove path
    .replace(/[^a-z0-9._-]/gi, '_') // Replace special chars
    .toLowerCase();
}

/**
 * Generate safe filename for upload
 * @param userId - The user ID
 * @param originalFilename - The original filename
 * @returns Safe filename for storage
 */
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
