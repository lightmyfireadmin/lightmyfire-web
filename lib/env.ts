/**
 * Environment Variable Validation
 * Ensures required environment variables are set at runtime
 */

/**
 * List of required environment variables for the application
 */
const REQUIRED_ENV_VARS = {
  // Supabase (Public - safe in browser)
  NEXT_PUBLIC_SUPABASE_URL: {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
  },
  // YouTube API (Server-side only)
  YOUTUBE_API_KEY: {
    name: 'YOUTUBE_API_KEY',
    description: 'YouTube API key (server-side only, never expose)',
    serverOnly: true,
  },
} as const;

/**
 * Validates that all required environment variables are set
 * @throws Error if any required environment variables are missing
 */
export function validateEnvironmentVariables() {
  const missingVars: string[] = [];
  const errors: string[] = [];

  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key];

    if (!value || value.trim() === '') {
      missingVars.push(config.name);
      errors.push(
        `${config.name}: ${config.description}${
          config.serverOnly ? ' (server-side only)' : ''
        }`
      );
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${errors.join(
      '\n'
    )}\n\nPlease check your .env.local file.`;

    // In development, log more details
    if (process.env.NODE_ENV === 'development') {
      console.error(errorMessage);
    }

    throw new Error(
      `Application failed to start: Missing ${missingVars.length} environment variable(s)`
    );
  }
}

/**
 * Get environment variable with type safety
 * @param key - The environment variable key
 * @param required - Whether the variable is required
 * @returns The environment variable value or null
 */
export function getEnvVar(key: string, required = false): string | null {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable not set: ${key}`);
  }

  return value || null;
}

/**
 * Verify environment variables on module load (development only)
 */
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Run validation on server-side in development
  // This helps catch issues early without waiting for a request
  try {
    validateEnvironmentVariables();
  } catch (error) {
    // Log but don't throw in case we're in a build process
    if (error instanceof Error) {
      console.warn(`Environment validation warning: ${error.message}`);
    }
  }
}

export default {
  validateEnvironmentVariables,
  getEnvVar,
};
