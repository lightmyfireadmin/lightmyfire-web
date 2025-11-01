'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import type { User } from '@supabase/supabase-js';

export default function UpdateAuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Check if user is logged in via OAuth (Google, etc.)
  const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();
  }, []);

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail || undefined,
      password: newPassword || undefined,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage('Update successful! Please check your email to confirm the changes if you updated your email address.');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  if (isOAuthUser) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Account Settings</h3>
        <div className="rounded-md bg-blue-50 p-4 mb-4">
          <p className="text-sm text-blue-800">
            ✓ You are logged in via {user?.app_metadata?.provider === 'google' ? 'Google' : 'an external provider'}.
            Your authentication is managed securely by your provider.
          </p>
        </div>

        <div>
          <label htmlFor="current-email" className="block text-sm font-medium text-muted-foreground">
            Current Email
          </label>
          <input
            type="email"
            id="current-email"
            value={user?.email || ''}
            disabled
            className="mt-1 block w-full rounded-lg border-input bg-muted p-3 text-muted-foreground cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Your email is managed by your {user?.app_metadata?.provider === 'google' ? 'Google' : 'external'} account.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          To change your email or authentication method, please visit your{' '}
          <a
            href={user?.app_metadata?.provider === 'google' ? 'https://myaccount.google.com' : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80"
          >
            {user?.app_metadata?.provider === 'google' ? 'Google Account' : 'provider account'} settings
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdateAuth} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Update Email / Password</h3>
      <div>
        <label htmlFor="new-email" className="block text-sm font-medium text-muted-foreground">
          New Email
        </label>
        <input
          type="email"
          id="new-email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder="Enter new email"
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-muted-foreground">
          New Password
        </label>
        <input
          type="password"
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder="Leave blank to keep current password"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-muted-foreground">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border-input bg-background p-3 text-foreground focus:border-primary focus:ring-primary"
          placeholder="Confirm new password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-secondary flex justify-center items-center gap-2 py-2 hover:shadow-md transition-shadow duration-200"
      >
        {loading ? (
          <LoadingSpinner size="sm" color="foreground" label="Saving..." />
        ) : (
          <>
            <span>🔐</span>
            <span>Update Auth Details</span>
          </>
        )}
      </button>
      {message && <p className="text-sm text-green-500">{message}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
