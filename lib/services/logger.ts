
/**
 * Defines the severity levels for log entries.
 * Ordered by increasing severity: DEBUG < INFO < WARN < ERROR.
 */
export enum LogLevel {
  /** Detailed debug information for development. */
  DEBUG = 'DEBUG',
  /** General informational messages about application flow. */
  INFO = 'INFO',
  /** Warning messages for potentially harmful situations. */
  WARN = 'WARN',
  /** Error messages for serious issues that need attention. */
  ERROR = 'ERROR',
}

/**
 * Represents a single log record.
 */
export interface LogEntry {
  /** The severity level of the log. */
  level: LogLevel;
  /** The main log message. */
  message: string;
  /** ISO string timestamp of when the log occurred. */
  timestamp: string;
  /** Optional contextual data (key-value pairs) related to the log. */
  context?: Record<string, unknown>;
  /** Optional error object if the log is reporting an exception. */
  error?: Error;
}

/**
 * Configuration options for the Logger instance.
 */
interface LoggerConfig {
  /** Whether to output logs to the browser/server console. Default: true. */
  enableConsole?: boolean;
  /** Whether to send logs to an external monitoring service. Default: false. */
  enableExternalService?: boolean;
  /** The minimum severity level to log. Logs below this level are ignored. Default: DEBUG (dev) / WARN (prod). */
  minLevel?: LogLevel;
  /** Global context data included with every log entry. */
  contextData?: Record<string, unknown>;
}

/**
 * A versatile logging service that supports console output and external reporting.
 * It handles log levels, message formatting, and contextual data.
 */
class Logger {
  private config: Required<LoggerConfig>;
  private isDevelopment: boolean;

  /**
   * Creates a new Logger instance.
   *
   * @param {LoggerConfig} [config={}] - The configuration settings for the logger.
   */
  constructor(config: LoggerConfig = {}) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = {
      enableConsole: config.enableConsole ?? true,
      enableExternalService: config.enableExternalService ?? false,
      minLevel: config.minLevel ?? (this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN),
      contextData: config.contextData ?? {},
    };
  }

  /**
   * Determines if a log entry should be processed based on its level.
   *
   * @param {LogLevel} level - The level of the current log entry.
   * @returns {boolean} True if the level meets or exceeds the minimum configured level.
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= configLevelIndex;
  }

  /**
   * Formats a log entry into a standardized string.
   *
   * @param {LogEntry} entry - The log entry to format.
   * @returns {string} The formatted string (e.g., "[TIMESTAMP] [LEVEL] Message").
   */
  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message } = entry;
    return `[${timestamp}] [${level}] ${message}`;
  }

  /**
   * Sends a log entry to an external logging service (e.g., Datadog, Sentry).
   * Currently a placeholder implementation.
   *
   * @param {LogEntry} entry - The log entry to send.
   * @returns {Promise<void>}
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.config.enableExternalService) return;

    try {
      // Placeholder for external service integration
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      if (this.isDevelopment) {
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  /**
   * Internal method to process and output a log entry.
   *
   * @param {LogEntry} entry - The log entry to process.
   * @returns {Promise<void>}
   */
  private async logEntry(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) return;

    if (this.config.enableConsole) {
      const formatted = this.formatMessage(entry);
      const style = this.getConsoleStyle(entry.level);

      // Merge global context with entry context
      const fullContext = { ...this.config.contextData, ...entry.context };

      if (this.isDevelopment) {
        // In development, use rich console formatting
        console[entry.level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](
          `%c${formatted}`,
          style,
          fullContext,
          entry.error || ''
        );
      } else {
        // In production, keep it simple for log parsers
        console[entry.level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](
          formatted,
          fullContext
        );
      }
    }

    await this.sendToExternalService(entry);
  }

  /**
   * Gets CSS styles for browser console logging based on severity.
   *
   * @param {LogLevel} level - The log severity level.
   * @returns {string} The CSS style string.
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #7c3aed; font-weight: bold;',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: bold;',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
    };
    return styles[level];
  }

  /**
   * Logs a message at the DEBUG level.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional context data.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.logEntry({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Logs a message at the INFO level.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional context data.
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.logEntry({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Logs a message at the WARN level.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional context data.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.logEntry({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  /**
   * Logs a message at the ERROR level.
   *
   * @param {string} message - The message to log.
   * @param {Error | null} [error] - The error object, if any.
   * @param {Record<string, unknown>} [context] - Optional context data.
   */
  error(message: string, error?: Error | null, context?: Record<string, unknown>): void {
    this.logEntry({
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      error: error || undefined,
      context: {
        ...context,
        errorMessage: error?.message,
        errorStack: error?.stack,
      },
    });
  }

  /**
   * updates the global context data for the logger.
   * New data is merged with existing data.
   *
   * @param {Record<string, unknown>} contextData - The new context data to add.
   */
  setContext(contextData: Record<string, unknown>): void {
    this.config.contextData = { ...this.config.contextData, ...contextData };
  }

  /**
   * Clears all global context data.
   */
  clearContext(): void {
    this.config.contextData = {};
  }
}

/**
 * Singleton instance of the Logger, configured for the current environment.
 * Default: Console logging enabled, External service disabled.
 */
export const logger = new Logger({
  enableConsole: true,
  enableExternalService: false,
});

export default Logger;
