/**
 * Standard API Response Types
 *
 * Provides consistent response structures across all API routes
 * for better type safety, error handling, and client-side consumption.
 */

/**
 * Standard success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Combined API response type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Helper to create a success response
 *
 * @param {T} data - The data payload to return
 * @param {string} [message] - Optional success message
 * @param {Record<string, unknown>} [meta] - Optional metadata
 * @returns {ApiSuccessResponse<T>} formatted success response object
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && {
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    }),
  };
}

/**
 * Helper to create an error response
 *
 * @param {string} code - The error code
 * @param {string} message - A human-readable error message
 * @param {unknown} [details] - Optional error details
 * @param {Record<string, unknown>} [meta] - Optional metadata
 * @returns {ApiErrorResponse} Formatted error response object
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  meta?: Record<string, unknown>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    ...(meta ? {
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    } : {}),
  };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  OPERATION_FAILED: 'OPERATION_FAILED',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_PROCESSING_ERROR: 'PAYMENT_PROCESSING_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Paginated success response
 */
export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * Helper to create a paginated response
 *
 * @param {T[]} data - Array of data items
 * @param {PaginationMeta} pagination - Pagination metadata
 * @param {string} [message] - Optional message
 * @returns {ApiPaginatedResponse<T>} Formatted paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): ApiPaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    ...(message && { message }),
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
