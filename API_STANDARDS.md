# API Response Standards

## Overview

All API routes in LightMyFire follow a standardized response format for consistency, type safety, and better client-side error handling.

## Response Format

### Success Response

```typescript
{
  success: true,
  data: T,              // The actual response data
  message?: string,      // Optional human-readable message
  meta?: {               // Optional metadata
    timestamp: string,
    requestId?: string,
    ...
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    code: string,        // Machine-readable error code
    message: string,      // Human-readable error message
    details?: unknown    // Optional error details
  },
  meta?: {               // Optional metadata
    timestamp: string,
    requestId?: string,
    ...
  }
}
```

### Paginated Response

```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  },
  meta?: {
    timestamp: string
  }
}
```

## Usage

### Creating Responses

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  ErrorCodes
} from '@/lib/api-response';

// Success response
return NextResponse.json(
  createSuccessResponse(data, 'Operation successful')
);

// Error response
return NextResponse.json(
  createErrorResponse(
    ErrorCodes.VALIDATION_ERROR,
    'Invalid input provided',
    { field: 'email' }
  ),
  { status: 400 }
);

// Paginated response
return NextResponse.json(
  createPaginatedResponse(items, {
    page: 1,
    pageSize: 20,
    totalItems: 100,
    totalPages: 5,
    hasNextPage: true,
    hasPrevPage: false
  })
);
```

## Error Codes

Standard error codes for consistency:

### Authentication & Authorization
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permissions
- `SESSION_EXPIRED` - Session has expired

### Validation
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_INPUT` - Invalid input format
- `MISSING_REQUIRED_FIELD` - Required field missing

### Business Logic
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `OPERATION_FAILED` - Operation could not be completed

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` - Too many requests

### External Services
- `EXTERNAL_SERVICE_ERROR` - External API error
- `PAYMENT_PROCESSING_ERROR` - Payment failed
- `DATABASE_ERROR` - Database operation failed

### Server Errors
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

## HTTP Status Codes

Map error codes to appropriate HTTP status codes:

- `200` - Success
- `400` - Validation errors, invalid input
- `401` - Authentication required
- `403` - Forbidden, insufficient permissions
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable

## Example Implementation

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.email) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCodes.MISSING_REQUIRED_FIELD,
          'Email is required',
          { field: 'email' }
        ),
        { status: 400 }
      );
    }

    // Business logic
    const result = await processData(body);

    // Success response
    return NextResponse.json(
      createSuccessResponse(result, 'Data processed successfully')
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      createErrorResponse(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to process request'
      ),
      { status: 500 }
    );
  }
}
```

## Migration Guide

### Before (Non-standard)
```typescript
return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
```

### After (Standard)
```typescript
return NextResponse.json(
  createErrorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Something went wrong'),
  { status: 500 }
);
```

## Benefits

1. **Type Safety** - TypeScript types for all responses
2. **Consistency** - Same format across all API routes
3. **Error Handling** - Standardized error codes and messages
4. **Client-Side Parsing** - Easy to handle responses in frontend
5. **Documentation** - Self-documenting API responses
6. **Debugging** - Timestamps and request IDs for tracking

## Adopted Routes

Routes currently using standardized responses:

- ✅ `/api/youtube-search` - Full standard implementation

## Migration Priorities

Routes to migrate (in order of priority):

1. Payment routes (`create-payment-intent`, `process-sticker-order`)
2. Webhook routes (`webhooks/stripe`, `webhooks/printful`)
3. Auth routes (`auth/callback`)
4. Utility routes (`calculate-shipping`, `moderate-image`)
5. All other API routes

## Contributing

When creating new API routes:
1. Always use standard response helpers
2. Use appropriate error codes from `ErrorCodes`
3. Include helpful error details
4. Map to correct HTTP status codes
5. Update this documentation

---

**Status**: 🟢 Active
**Coverage**: 1/30+ routes (expanding)
**Version**: 1.0
