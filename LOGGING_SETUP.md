# Logging Service Documentation

## Overview

The logging service provides a structured, environment-aware logging system for LightMyFire. It helps with debugging, monitoring, and error tracking throughout the application.

## Features

- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR
- **Environment-Aware**: Different verbosity in development vs production
- **Structured Logging**: Timestamps and context data included
- **Error Tracking**: Built-in error information capture
- **External Service Ready**: Extensible for integration with Sentry, DataDog, LogRocket, etc.
- **Type-Safe**: Full TypeScript support

## Basic Usage

### Server-Side (Node.js)

```typescript
import { logger } from '@/lib/services/logger';

// Debug logging
logger.debug('User logged in', { userId: '123' });

// Info logging
logger.info('New lighter created', { lighterId: 'abc-123', name: 'My Lighter' });

// Warning logging
logger.warn('High memory usage detected', { memoryUsage: '85%' });

// Error logging
logger.error('Failed to fetch posts', error, { endpoint: '/api/posts' });
```

### Client-Side (React)

```typescript
'use client';

import { useLogger } from '@/lib/hooks/useLogger';

export default function MyComponent() {
  const logger = useLogger('MyComponent');

  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit-btn' });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Log Levels

### DEBUG
- **Use case**: Detailed debugging information
- **Environment**: Development only by default
- **Example**: Function entry/exit, variable values, state changes

```typescript
logger.debug('Processing user data', { userId, email, status });
```

### INFO
- **Use case**: General informational messages
- **Environment**: Both development and production
- **Example**: User actions, system events, milestone events

```typescript
logger.info('User registration completed', { userId, email });
```

### WARN
- **Use case**: Warning about potential issues
- **Environment**: Both development and production
- **Example**: Deprecated API usage, unusual behavior, performance issues

```typescript
logger.warn('API response time exceeded threshold', { endpoint: '/api/posts', time: '5000ms' });
```

### ERROR
- **Use case**: Error conditions that need attention
- **Environment**: Both development and production
- **Example**: Exceptions, API failures, validation errors

```typescript
logger.error('Failed to save lighter', error, { lighterId, reason: 'Database error' });
```

## Configuration

The logger is configured in `lib/services/logger.ts`:

```typescript
const logger = new Logger({
  enableConsole: true,           // Enable console output
  enableExternalService: false,  // Integrate with external service
  minLevel: LogLevel.DEBUG,      // Minimum log level to display
  contextData: {},               // Global context data
});
```

### Environment-Based Configuration

By default:
- **Development**: Logs DEBUG level and above
- **Production**: Logs WARN level and above

## Context and Metadata

### Add Context to Logs

```typescript
logger.debug('User action', {
  userId: '123',
  action: 'viewed-lighter',
  lighterName: 'My Lighter',
  timestamp: Date.now(),
});
```

### Set Global Context

```typescript
import { logger } from '@/lib/services/logger';

// In your app initialization
logger.setContext({
  version: '1.0.0',
  environment: process.env.NODE_ENV,
  user: userId,
});
```

### Clear Global Context

```typescript
logger.clearContext();
```

## External Service Integration

### Setup External Service

To enable external service integration (e.g., Sentry, DataDog):

1. Uncomment the external service code in `lib/services/logger.ts`
2. Update the endpoint and headers as needed
3. Enable in logger configuration

```typescript
const logger = new Logger({
  enableExternalService: true,
});
```

### Example: Sentry Integration

```typescript
// In lib/services/logger.ts
private async sendToExternalService(entry: LogEntry): Promise<void> {
  if (!this.config.enableExternalService) return;

  try {
    // Send to Sentry
    if (entry.level === LogLevel.ERROR && entry.error) {
      Sentry.captureException(entry.error, {
        extra: entry.context,
      });
    }
  } catch (error) {
    if (this.isDevelopment) {
      console.error('Failed to send log to external service:', error);
    }
  }
}
```

## Best Practices

### Do's ✅

- Log meaningful context information
- Use appropriate log levels
- Include user/request IDs for tracing
- Log errors with full error objects
- Use the structured logging format

```typescript
logger.info('Post created successfully', {
  postId: post.id,
  lighterId: post.lighter_id,
  postType: post.post_type,
  userId: post.user_id,
});
```

### Don'ts ❌

- Don't log sensitive information (passwords, tokens, SSNs)
- Don't use console.log directly (use logger instead)
- Don't log large objects that could cause performance issues
- Don't overuse DEBUG level in production

```typescript
// ❌ Bad
logger.debug('User logged in with password:', { password: user.password });

// ✅ Good
logger.info('User logged in', { userId: user.id, email: user.email });
```

## Console Output Format

### Development

Development logs include color-coding and detailed formatting:

```
[2024-11-01T14:23:45.123Z] [INFO] User registration completed
{userId: '123', email: 'user@example.com'}
```

### Production

Production logs are concise and machine-readable:

```
[2024-11-01T14:23:45.123Z] [INFO] User registration completed
```

## Troubleshooting

### Logs not appearing?

1. Check log level configuration
2. Verify `enableConsole` is true
3. Check browser DevTools console filter
4. Ensure logger is imported correctly

### Too many DEBUG logs?

Set minimum log level in logger configuration:

```typescript
const logger = new Logger({
  minLevel: LogLevel.INFO,  // Skip DEBUG logs
});
```

### External service not receiving logs?

1. Check network tab in DevTools
2. Verify endpoint URL is correct
3. Check CORS headers
4. Ensure `enableExternalService` is true

## API Reference

### `logger.debug(message, context?)`

Logs a debug message.

**Parameters:**
- `message` (string): The log message
- `context?` (Record<string, any>): Additional context data

### `logger.info(message, context?)`

Logs an informational message.

**Parameters:**
- `message` (string): The log message
- `context?` (Record<string, any>): Additional context data

### `logger.warn(message, context?)`

Logs a warning message.

**Parameters:**
- `message` (string): The log message
- `context?` (Record<string, any>): Additional context data

### `logger.error(message, error?, context?)`

Logs an error message with optional error object.

**Parameters:**
- `message` (string): The log message
- `error?` (Error | null): The error object
- `context?` (Record<string, any>): Additional context data

### `logger.setContext(contextData)`

Sets global context data that will be included in all logs.

**Parameters:**
- `contextData` (Record<string, any>): The context data

### `logger.clearContext()`

Clears all global context data.

## Examples

### Logging API Requests

```typescript
import { logger } from '@/lib/services/logger';

async function fetchPosts(lighterId: string) {
  logger.debug('Fetching posts', { lighterId });

  try {
    const response = await fetch(`/api/posts?lighter_id=${lighterId}`);
    const data = await response.json();

    logger.info('Posts fetched successfully', {
      lighterId,
      count: data.length,
      duration: Date.now() - startTime,
    });

    return data;
  } catch (error) {
    logger.error('Failed to fetch posts', error, {
      lighterId,
      endpoint: '/api/posts',
    });

    throw error;
  }
}
```

### Logging User Actions

```typescript
import { useLogger } from '@/lib/hooks/useLogger';

export default function PostCard({ post, userId }) {
  const logger = useLogger('PostCard');

  const handleLike = async () => {
    logger.info('User liked post', {
      postId: post.id,
      userId,
      lighterId: post.lighter_id,
    });

    try {
      await likePost(post.id);
      logger.debug('Like operation successful', { postId: post.id });
    } catch (error) {
      logger.error('Failed to like post', error, { postId: post.id });
    }
  };

  return <button onClick={handleLike}>Like</button>;
}
```

## Future Enhancements

- [ ] Sentry integration
- [ ] DataDog integration
- [ ] LogRocket integration
- [ ] Custom log formatters
- [ ] Log filtering and search
- [ ] Performance monitoring integration
- [ ] User session tracking
