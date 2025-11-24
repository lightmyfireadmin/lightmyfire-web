/**
 * Log levels supported by the logger.
 */
type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug' | 'event' | 'perf';

/**
 * Interface for structured context data in logs.
 */
interface LogContext {
  [key: string]: unknown;
}

/**
 * Interface defining the methods available on the logger instance.
 */
interface Logger {
  /** Basic logging (development only). Similar to `console.log`. */
  log: (...args: unknown[]) => void;
  /** Debug logging (development only). Similar to `console.debug`. */
  debug: (...args: unknown[]) => void;

  /** Error logging (always shown). Use for exceptions and critical failures. */
  error: (...args: unknown[]) => void;
  /** Warning logging (always shown, structured). Use for non-critical issues or potential problems. */
  warn: (message: string, context?: LogContext) => void;

  /** Informational logs (always shown). Use for general system information. */
  info: (message: string, context?: LogContext) => void;

  /** Business event logs (always shown). Use for tracking key user actions (e.g., 'order_placed', 'user_signup'). */
  event: (eventName: string, data?: LogContext) => void;

  /** Performance logs. Shows execution time. In production, only logged if duration exceeds threshold. */
  perf: (operation: string, duration: number, context?: LogContext) => void;

  /** Start a timer for performance tracking. */
  time: (label: string) => void;
  /** End a timer and log the duration. */
  timeEnd: (label: string) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Formats a log message with a timestamp and optional JSON context.
 *
 * @param {string} level - The log level (e.g., 'INFO', 'WARN').
 * @param {string} message - The main log message.
 * @param {LogContext} [context] - Optional key-value pairs to include in the log.
 * @returns {string} The formatted log string: `[Timestamp] [Level] Message {Context}`.
 */
const formatLog = (level: string, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
};

/**
 * Creates and configures a structured logger instance for the application.
 *
 * The logger behaves differently based on the environment:
 * - **Development**: All logs are shown. `perf` logs always show.
 * - **Production**: `log` and `debug` are suppressed. `perf` logs only show if duration > 1000ms.
 *   `warn` is shown if context is provided.
 *
 * @returns {Logger} The configured logger instance.
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

/**
 * Global singleton logger instance.
 * Import this to log messages throughout the application.
 */
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
