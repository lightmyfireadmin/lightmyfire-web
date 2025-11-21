type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug' | 'event' | 'perf';

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  // Basic logging (development only)
  log: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;

  // Error and warning (always shown)
  error: (...args: unknown[]) => void;
  warn: (message: string, context?: LogContext) => void;

  // Informational logs (always shown)
  info: (message: string, context?: LogContext) => void;

  // Business event logs (always shown) - for tracking user actions, orders, etc.
  event: (eventName: string, data?: LogContext) => void;

  // Performance logs (shown in dev or if slow)
  perf: (operation: string, duration: number, context?: LogContext) => void;

  // Utility for timing operations
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format log message with timestamp and context
 */
const formatLog = (level: string, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Structured logger for LightMyFire application
 *
 * Usage:
 * - logger.error(): Always shown - for errors
 * - logger.warn(): Development only - for warnings
 * - logger.info(): Always shown - for operational info
 * - logger.event(): Always shown - for business events
 * - logger.perf(): Smart - shown in dev or if operation is slow
 * - logger.log/debug(): Development only - for debugging
 */
const createLogger = (): Logger => {
  const noop = () => {};

  return {
    // Basic logging - development only
    log: isDevelopment ? console.log.bind(console) : noop,
    debug: isDevelopment ? console.debug.bind(console) : noop,

    // Error logging - always enabled
    error: (...args: unknown[]) => {
      console.error(...args);
    },

    // Warning logging - always enabled with structure
    warn: (message: string, context?: LogContext) => {
      if (isDevelopment) {
        console.warn(formatLog('WARN', message, context));
      } else if (isProduction) {
        // In production, only log warnings with context (structured)
        if (context) {
          console.warn(formatLog('WARN', message, context));
        }
      }
    },

    // Informational logging - always enabled
    info: (message: string, context?: LogContext) => {
      console.info(formatLog('INFO', message, context));
    },

    // Business event logging - always enabled
    event: (eventName: string, data?: LogContext) => {
      const logData = {
        event: eventName,
        ...(data || {}),
      };
      console.log(formatLog('EVENT', eventName, logData));
    },

    // Performance logging - smart threshold
    perf: (operation: string, duration: number, context?: LogContext) => {
      const threshold = isDevelopment ? 0 : 1000; // 1s threshold in production

      if (duration > threshold) {
        const perfContext = {
          duration_ms: duration,
          ...(context || {}),
        };
        console.log(formatLog('PERF', operation, perfContext));
      }
    },

    // Timer utilities
    time: (label: string) => {
      console.time(label);
    },

    timeEnd: (label: string) => {
      console.timeEnd(label);
    },
  };
};

export const logger = createLogger();

export default logger;

/**
 * Example usage:
 *
 * // Error logging (always shown)
 * logger.error('Payment processing failed', { orderId, error });
 *
 * // Business events (always shown)
 * logger.event('order_created', { orderId, userId, amount });
 * logger.event('user_registered', { userId, email });
 *
 * // Operational info (always shown)
 * logger.info('Email sent successfully', { emailId, recipient });
 *
 * // Performance tracking
 * const start = Date.now();
 * await processOrder();
 * logger.perf('process_order', Date.now() - start, { orderId });
 *
 * // Debug logging (development only)
 * logger.log('Processing lighter data:', lighterData);
 * logger.debug('Intermediate calculation:', value);
 *
 * // Warnings (development + structured production)
 * logger.warn('Rate limit approaching', { remaining: 10, userId });
 */
