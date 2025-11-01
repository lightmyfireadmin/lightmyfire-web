import { useEffect } from 'react';
import { logger } from '@/lib/services/logger';

/**
 * useLogger Hook
 * Provides access to the logger service in React components
 * Automatically logs component mount/unmount in development
 */
export function useLogger(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Component mounted: ${componentName}`);

      return () => {
        logger.debug(`Component unmounted: ${componentName}`);
      };
    }
  }, [componentName]);

  return logger;
}
