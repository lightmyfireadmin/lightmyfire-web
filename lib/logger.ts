type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

const createLogger = (): Logger => {
  const noop = () => {};

  return {
    log: isDevelopment ? console.log.bind(console) : noop,
    error: console.error.bind(console),
    warn: isDevelopment ? console.warn.bind(console) : noop,
    info: isDevelopment ? console.info.bind(console) : noop,
    debug: isDevelopment ? console.debug.bind(console) : noop,
  };
};

export const logger = createLogger();

export default logger;
