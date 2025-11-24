import { FILE_UPLOAD } from './constants';

/**
 * Magic numbers (file signatures) for verifying file types.
 */
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

/**
 * Result structure for file validation operations.
 */
interface FileValidationResult {
  /** True if the file passed validation, false otherwise. */
  valid: boolean;
  /** Error message if validation failed. */
  error?: string;
  /** The detected MIME type of the file (if signature validation passed). */
  detectedMimeType?: string;
}

/**
 * Validates a file's signature (magic numbers) to verify its true type.
 * This prevents users from bypassing type checks by simply renaming extensions.
 * Supports PNG, JPEG, and GIF.
 *
 * @param {File} file - The file object to validate.
 * @returns {Promise<FileValidationResult>} A promise resolving to the validation result.
 */
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

/**
 * Validates that a file's size is within the allowed limits defined in constants.
 *
 * @param {File} file - The file object to validate.
 * @returns {string | null} An error message if the file is too large, or null if it's valid.
 */
export function validateFileSize(file: File): string | null {
  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${FILE_UPLOAD.MAX_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * Validates image dimensions (width and height) to ensure they are within acceptable bounds.
 * This requires loading the image into an HTML Image element.
 *
 * @param {File} file - The image file to validate.
 * @param {number} [maxWidth=4096] - Maximum allowed width in pixels (default: 4096).
 * @param {number} [maxHeight=4096] - Maximum allowed height in pixels (default: 4096).
 * @param {number} [minWidth=100] - Minimum allowed width in pixels (default: 100).
 * @param {number} [minHeight=100] - Minimum allowed height in pixels (default: 100).
 * @returns {Promise<FileValidationResult>} A promise resolving to the validation result.
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

/**
 * Performs comprehensive file validation including size check, MIME type check,
 * signature verification, and optional dimension validation.
 *
 * @param {File} file - The file to validate.
 * @param {boolean} [validateDimensions=true] - Whether to perform image dimension validation (default: true).
 * @returns {Promise<FileValidationResult>} A promise resolving to the combined validation result.
 */
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

/**
 * Sanitizes a filename by removing path components and replacing potentially unsafe characters.
 *
 * @param {string} filename - The original filename.
 * @returns {string} The sanitized filename containing only alphanumeric characters, underscores, dots, and hyphens.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/^.*[\\/]/, '') // Remove directory paths
    .replace(/[^a-z0-9._-]/gi, '_') // Replace non-alphanumeric chars with underscore
    .toLowerCase();
}

/**
 * Generates a safe, unique filename by combining the user ID, timestamp, and sanitized original filename.
 *
 * @param {string} userId - The ID of the user uploading the file.
 * @param {string} originalFilename - The original name of the file.
 * @returns {string} A unique and safe filename (e.g., "user123-1678901234567-image.png").
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
  validateImageDimensions,
  sanitizeFilename,
  generateSafeFilename,
};

export default fileValidationUtils;
