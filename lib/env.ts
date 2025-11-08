

const REQUIRED_ENV_VARS = {
    NEXT_PUBLIC_SUPABASE_URL: {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
  },
    YOUTUBE_API_KEY: {
    name: 'YOUTUBE_API_KEY',
    description: 'YouTube API key (server-side only, never expose)',
    serverOnly: true,
  },
} as const;

export function validateEnvironmentVariables() {
  const missingVars: string[] = [];
  const errors: string[] = [];

  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key];

    if (!value || value.trim() === '') {
      missingVars.push(config.name);
      const serverOnlyNote = 'serverOnly' in config && config.serverOnly ? ' (server-side only)' : '';
      errors.push(
        `${config.name}: ${config.description}${serverOnlyNote}`
      );
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${errors.join(
      '\n'
    )}\n\nPlease check your .env.local file.`;

        if (process.env.NODE_ENV === 'development') {
      console.error(errorMessage);
    }

    throw new Error(
      `Application failed to start: Missing ${missingVars.length} environment variable(s)`
    );
  }
}

export function getEnvVar(key: string, required = false): string | null {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable not set: ${key}`);
  }

  return value || null;
}

if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      try {
    validateEnvironmentVariables();
  } catch (error) {
        if (error instanceof Error) {
      console.warn(`Environment validation warning: ${error.message}`);
    }
  }
}

const envUtils = {
  validateEnvironmentVariables,
  getEnvVar,
};

export default envUtils;
