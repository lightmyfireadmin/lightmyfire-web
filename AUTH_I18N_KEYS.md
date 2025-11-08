# Required i18n Keys for Auth Improvements

Add these keys to your locale files (`locales/en.ts`, `locales/fr.ts`, etc.):

## English (`locales/en.ts`)

```typescript
auth: {
  // Common
  email_label: 'Email address',
  email_placeholder: 'your@email.com',
  password_label: 'Password',
  password_placeholder: 'Enter your password',
  email_required: 'Email is required',
  or: 'or',

  // Login/Signup
  sign_in: 'Sign in',
  sign_up: 'Sign up',
  signing_in: 'Signing in...',
  signing_up: 'Signing up...',
  continue_with: 'Continue with',
  already_have_account: 'Already have an account? Sign in',
  dont_have_account: 'Don\'t have an account? Sign up',
  login_signup: 'Login / Sign up',

  // Forgot Password
  forgot_password: 'Forgot password?',
  forgot_password_title: 'Reset your password',
  forgot_password_subtitle: 'Enter your email and we\'ll send you a reset link',
  send_reset_link: 'Send reset link',
  sending: 'Sending...',
  back_to_login: 'Back to login',
  remember_password: 'Remember your password?',

  // Reset Email Sent
  reset_email_sent: 'Password reset email sent',
  reset_email_sent_title: 'Check your email',
  reset_email_sent_description: 'We\'ve sent a password reset link to:',
  send_to_different_email: 'Send to a different email',

  // Reset Password
  reset_password_title: 'Create new password',
  reset_password_subtitle: 'Enter your new password below',
  new_password_label: 'New password',
  confirm_password_label: 'Confirm password',
  confirm_password_placeholder: 'Confirm your password',
  update_password: 'Update password',
  updating_password: 'Updating password...',
  verifying_reset_link: 'Verifying reset link...',
  invalid_reset_link: 'Invalid or expired reset link',

  // Password Requirements
  password_requirements: 'Password requirements:',
  min_6_characters: 'At least 6 characters',
  passwords_match: 'Passwords match',
  passwords_dont_match: 'Passwords don\'t match',
  password_too_short: 'Password must be at least 6 characters',

  // Success Messages
  login_success: 'Welcome back!',
  signup_success: 'Account created successfully!',
  password_updated: 'Password updated successfully',

  // Error Messages
  login_failed: 'Login failed. Please try again.',
  login_error: 'An error occurred during login',
  session_error: 'Session error. Please try logging in again.',
  session_error_retry: 'Verifying session, please wait...',
  reset_failed: 'Failed to send reset email',
  password_update_failed: 'Failed to update password',
},
```

## French (`locales/fr.ts`)

```typescript
auth: {
  // Commun
  email_label: 'Adresse email',
  email_placeholder: 'votre@email.fr',
  password_label: 'Mot de passe',
  password_placeholder: 'Entrez votre mot de passe',
  email_required: 'L\'email est requis',
  or: 'ou',

  // Connexion/Inscription
  sign_in: 'Se connecter',
  sign_up: 'S\'inscrire',
  signing_in: 'Connexion...',
  signing_up: 'Inscription...',
  continue_with: 'Continuer avec',
  already_have_account: 'Vous avez déjà un compte ? Connectez-vous',
  dont_have_account: 'Pas de compte ? Inscrivez-vous',
  login_signup: 'Connexion / Inscription',

  // Mot de passe oublié
  forgot_password: 'Mot de passe oublié ?',
  forgot_password_title: 'Réinitialiser votre mot de passe',
  forgot_password_subtitle: 'Entrez votre email et nous vous enverrons un lien',
  send_reset_link: 'Envoyer le lien',
  sending: 'Envoi...',
  back_to_login: 'Retour à la connexion',
  remember_password: 'Vous vous souvenez de votre mot de passe ?',

  // Email de réinitialisation envoyé
  reset_email_sent: 'Email de réinitialisation envoyé',
  reset_email_sent_title: 'Vérifiez votre email',
  reset_email_sent_description: 'Nous avons envoyé un lien de réinitialisation à :',
  send_to_different_email: 'Envoyer à un autre email',

  // Réinitialiser le mot de passe
  reset_password_title: 'Créer un nouveau mot de passe',
  reset_password_subtitle: 'Entrez votre nouveau mot de passe ci-dessous',
  new_password_label: 'Nouveau mot de passe',
  confirm_password_label: 'Confirmer le mot de passe',
  confirm_password_placeholder: 'Confirmez votre mot de passe',
  update_password: 'Mettre à jour le mot de passe',
  updating_password: 'Mise à jour...',
  verifying_reset_link: 'Vérification du lien...',
  invalid_reset_link: 'Lien invalide ou expiré',

  // Exigences du mot de passe
  password_requirements: 'Exigences du mot de passe :',
  min_6_characters: 'Au moins 6 caractères',
  passwords_match: 'Les mots de passe correspondent',
  passwords_dont_match: 'Les mots de passe ne correspondent pas',
  password_too_short: 'Le mot de passe doit contenir au moins 6 caractères',

  // Messages de succès
  login_success: 'Bienvenue !',
  signup_success: 'Compte créé avec succès !',
  password_updated: 'Mot de passe mis à jour',

  // Messages d\'erreur
  login_failed: 'Échec de la connexion. Réessayez.',
  login_error: 'Une erreur s\'est produite',
  session_error: 'Erreur de session. Reconnectez-vous.',
  session_error_retry: 'Vérification de la session...',
  reset_failed: 'Échec de l\'envoi de l\'email',
  password_update_failed: 'Échec de la mise à jour',
},
```

## Implementation Notes

1. **Add these to your existing locale files** - Don't replace, merge with existing translations
2. **Adjust for other locales** - If you support more languages, translate accordingly
3. **Test all flows** - Forgot password, reset password, login, signup
4. **Update as needed** - Some keys may already exist in your i18n files

## Features Added

✅ **Forgot Password Workflow** - Complete email recovery flow
✅ **Reset Password Page** - Secure password reset with validation
✅ **Improved Login UX** - Loading states, error handling, session verification
✅ **Toast Notifications** - Success/error feedback for all auth actions
✅ **Better State Management** - Prevents multiple login attempts, verifies sessions
✅ **i18n Support** - Fully translated for English and French
