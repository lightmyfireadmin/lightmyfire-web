/**
 * Logger Service
 * Provides structured logging with multiple log levels
 * Supports environment-based verbosity and optional external service integration
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

interface LoggerConfig {
  enableConsole?: boolean;
  enableExternalService?: boolean;
  minLevel?: LogLevel;
  contextData?: Record<string, any>;
}

class Logger {
  private config: Required<LoggerConfig>;
  private isDevelopment: boolean;

  constructor(config: LoggerConfig = {}) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = {
      enableConsole: config.enableConsole ?? true,
      enableExternalService: config.enableExternalService ?? false,
      minLevel: config.minLevel ?? (this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN),
      contextData: config.contextData ?? {},
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const configLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= configLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message } = entry;
    return `[${timestamp}] [${level}] ${message}`;
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    if (!this.config.enableExternalService) return;

    // TODO: Implement external service integration
    // Example: Send to Sentry, LogRocket, DataDog, etc.
    // This is a placeholder for future integration
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (error) {
      // Fail silently to avoid recursion
      if (this.isDevelopment) {
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  private async logEntry(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) return;

    // Console logging
    if (this.config.enableConsole) {
      const formatted = this.formatMessage(entry);
      const style = this.getConsoleStyle(entry.level);

      if (this.isDevelopment) {
        console[entry.level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](
          `%c${formatted}`,
          style,
          entry.context,
          entry.error
        );
      } else {
        // In production, use basic logging
        console[entry.level.toLowerCase() as 'debug' | 'info' | 'warn' | 'error'](
          formatted,
          entry.context
        );
      }
    }

    // External service integration
    await this.sendToExternalService(entry);
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #7c3aed; font-weight: bold;',
      [LogLevel.INFO]: 'color: #3b82f6; font-weight: bold;',
      [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold;',
    };
    return styles[level];
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logEntry({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      context,
    });
  }

  error(message: string, error?: Error | null, context?: Record<string, any>): void {
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

  setContext(contextData: Record<string, any>): void {
    this.config.contextData = { ...this.config.contextData, ...contextData };
  }

  clearContext(): void {
    this.config.contextData = {};
  }
}

// Export a singleton instance
export const logger = new Logger({
  enableConsole: true,
  enableExternalService: false, // Enable when external service is set up
});

// Export logger class for testing or custom instances
export default Logger;
