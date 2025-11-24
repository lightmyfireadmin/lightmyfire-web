/**
 * Standard API Response Types
 *
 * Provides consistent response structures across all API routes
 * for better type safety, error handling, and client-side consumption.
 */

/**
 * Represents a standard successful API response.
 *
 * @template T - The type of the data payload.
 */
export interface ApiSuccessResponse<T = unknown> {
  /** Indicates the request was successful. */
  success: true;
  /** The payload returned by the API. */
  data: T;
  /** An optional human-readable message (e.g., "Operation successful"). */
  message?: string;
  /** Optional metadata about the response. */
  meta?: {
    /** The timestamp when the response was generated. */
    timestamp?: string;
    /** The unique ID of the request. */
    requestId?: string;
    /** Any additional metadata fields. */
    [key: string]: unknown;
  };
}

/**
 * Represents a standard error API response.
 */
export interface ApiErrorResponse {
  /** Indicates the request failed. */
  success: false;
  /** The error details. */
  error: {
    /** A machine-readable error code (e.g., "VALIDATION_ERROR"). */
    code: string;
    /** A human-readable error message. */
    message: string;
    /** Optional detailed error information (e.g., validation errors). */
    details?: unknown;
  };
  /** Optional metadata about the response. */
  meta?: {
    /** The timestamp when the response was generated. */
    timestamp?: string;
    /** The unique ID of the request. */
    requestId?: string;
    /** Any additional metadata fields. */
    [key: string]: unknown;
  };
}

/**
 * A union type representing either a successful or an error API response.
 *
 * @template T - The type of the data payload in case of success.
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Creates a standardized success response object.
 *
 * @template T - The type of the data payload.
 * @param {T} data - The data payload to return to the client.
 * @param {string} [message] - An optional success message.
 * @param {Record<string, unknown>} [meta] - Optional metadata to include in the response.
 * @returns {ApiSuccessResponse<T>} A formatted success response object.
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
 * Creates a standardized error response object.
 *
 * @param {string} code - The machine-readable error code.
 * @param {string} message - A human-readable error message.
 * @param {unknown} [details] - Optional details about the error (e.g., validation failures).
 * @param {Record<string, unknown>} [meta] - Optional metadata to include in the response.
 * @returns {ApiErrorResponse} A formatted error response object.
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
 * Common error codes used throughout the application.
 * These constants should be used instead of magic strings for error codes.
 */
export const ErrorCodes = {
  // Authentication & Authorization
  /** User is not authorized to perform the action. */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** User is authenticated but forbidden from performing the action. */
  FORBIDDEN: 'FORBIDDEN',
  /** The user's session has expired. */
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  /** Generic validation error. */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** The input provided is invalid. */
  INVALID_INPUT: 'INVALID_INPUT',
  /** A required field is missing. */
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Business Logic
  /** User does not have sufficient permissions. */
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  /** The requested resource was not found. */
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  /** A resource with the same identifier already exists. */
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  /** The operation failed due to a business rule violation. */
  OPERATION_FAILED: 'OPERATION_FAILED',

  // Rate Limiting
  /** The user has exceeded the allowed rate limit. */
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External Services
  /** An error occurred with an external service. */
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  /** An error occurred during payment processing. */
  PAYMENT_PROCESSING_ERROR: 'PAYMENT_PROCESSING_ERROR',
  /** An error occurred when interacting with the database. */
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Server Errors
  /** An internal server error occurred. */
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  /** The service is currently unavailable. */
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

/**
 * Type representing one of the defined error codes.
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Metadata for paginated responses.
 */
export interface PaginationMeta {
  /** The current page number (1-based). */
  page: number;
  /** The number of items per page. */
  pageSize: number;
  /** The total number of items available. */
  totalItems: number;
  /** The total number of pages. */
  totalPages: number;
  /** Whether there is a next page. */
  hasNextPage: boolean;
  /** Whether there is a previous page. */
  hasPrevPage: boolean;
}

/**
 * Represents a standardized paginated successful API response.
 *
 * @template T - The type of the items in the data array.
 */
export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  /** Pagination metadata. */
  pagination: PaginationMeta;
}

/**
 * Creates a standardized paginated response object.
 *
 * @template T - The type of the items in the data array.
 * @param {T[]} data - The array of data items for the current page.
 * @param {PaginationMeta} pagination - The pagination metadata.
 * @param {string} [message] - An optional success message.
 * @returns {ApiPaginatedResponse<T>} A formatted paginated response object.
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
