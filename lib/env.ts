
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

const PAYMENT_ENV_VARS = {
  STRIPE_SECRET_KEY: {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key for payment processing',
    serverOnly: true,
  },
  STRIPE_WEBHOOK_SECRET: {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook signature verification secret',
    serverOnly: true,
  },
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key',
  },
  RESEND_API_KEY: {
    name: 'RESEND_API_KEY',
    description: 'Resend API key for sending emails',
    serverOnly: true,
  },
  FULFILLMENT_EMAIL: {
    name: 'FULFILLMENT_EMAIL',
    description: 'Email address for order fulfillment notifications',
    serverOnly: true,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key for admin operations',
    serverOnly: true,
  },
} as const;

/**
 * Validates that all required environment variables are present.
 * Throws an error if any are missing.
 *
 * @throws {Error} If any required environment variable is missing.
 */
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

/**
 * Retrieves an environment variable, optionally enforcing its presence.
 *
 * @param {string} key - The environment variable key.
 * @param {boolean} [required=false] - Whether the variable is required.
 * @returns {string | null} The value of the environment variable, or null if not set (and not required).
 * @throws {Error} If required is true and the variable is not set.
 */
export function getEnvVar(key: string, required = false): string | null {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable not set: ${key}`);
  }

  return value || null;
}

/**
 * Validates the environment variables required for payment processing.
 *
 * @returns {{ valid: boolean; errors: string[] }} Object containing validity status and any error messages.
 */
export function validatePaymentEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  Object.entries(PAYMENT_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key];

    if (!value || value.trim() === '') {
      const serverOnlyNote = 'serverOnly' in config && config.serverOnly ? ' (server-side only)' : '';
      errors.push(`${config.name}: ${config.description}${serverOnlyNote}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
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
  validatePaymentEnvironment,
  getEnvVar,
};

export default envUtils;
