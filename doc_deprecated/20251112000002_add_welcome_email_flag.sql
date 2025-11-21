-- Add welcome_email_sent flag to profiles table
-- This allows us to reliably track whether a user has received their welcome email

-- Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'welcome_email_sent'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN welcome_email_sent BOOLEAN DEFAULT FALSE;

    -- Set existing users to true so they don't get welcome emails
    UPDATE profiles
    SET welcome_email_sent = TRUE
    WHERE created_at < NOW() - INTERVAL '1 hour';

    COMMENT ON COLUMN profiles.welcome_email_sent IS 'Tracks whether the user has received their welcome email';
  END IF;
END $$;
