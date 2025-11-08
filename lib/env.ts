

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
