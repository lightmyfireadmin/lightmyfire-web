'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function UpdateAuthForm() {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        className="btn-secondary"
      >
        {loading ? 'Saving...' : 'Update Auth Details'}
      </button>
      {message && <p className="text-sm text-green-500">{message}</p>}
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
