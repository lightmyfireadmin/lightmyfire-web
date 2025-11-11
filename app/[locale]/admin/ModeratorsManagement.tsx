'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Moderator {
  user_id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

interface ModeratorsManagementProps {
  initialModerators: Moderator[];
}

export default function ModeratorsManagement({ initialModerators }: ModeratorsManagementProps) {
  const [moderators, setModerators] = useState<Moderator[]>(initialModerators);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const refreshModerators = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_moderators');
      if (error) throw error;
      setModerators(data || []);
    } catch (error: any) {
      console.error('Error refreshing moderators:', error);
    }
  };

  const handleGrantModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeratorEmail.trim()) {
      showMessage('error', 'Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_grant_moderator', {
        p_user_email: newModeratorEmail.trim(),
      });

      if (error) throw error;

      if (data.success) {
        showMessage('success', data.message);
        setNewModeratorEmail('');
        await refreshModerators();
      } else {
        showMessage('error', data.error);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to grant moderator role');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeModerator = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke moderator access from ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_revoke_moderator', {
        p_user_id: userId,
      });

      if (error) throw error;

      if (data.success) {
        showMessage('success', data.message);
        await refreshModerators();
      } else {
        showMessage('error', data.error);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to revoke moderator role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-foreground mb-4">Moderator Management</h2>

      {}
      {message && (
        <div
          className={`mb-4 rounded-md p-4 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Grant Moderator Access</h3>
        <form onSubmit={handleGrantModerator} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter user email..."
            value={newModeratorEmail}
            onChange={(e) => setNewModeratorEmail(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Grant Access'}
          </button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          The user must have an account on the platform. They will need to sign out and back in for changes to take effect.
        </p>
      </div>

      {}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Current Moderators & Admins ({moderators.length})
        </h3>

        {moderators.length === 0 ? (
          <p className="text-muted-foreground text-sm">No moderators found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Username</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-foreground">Joined</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderators.map((moderator) => (
                  <tr key={moderator.user_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground">
                      {moderator.username || <span className="text-muted-foreground italic">No username</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{moderator.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          moderator.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        }`}
                      >
                        {moderator.role.charAt(0).toUpperCase() + moderator.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(moderator.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {moderator.role === 'moderator' ? (
                        <button
                          onClick={() => handleRevokeModerator(moderator.user_id, moderator.email)}
                          disabled={loading}
                          className="rounded-md bg-red-100 dark:bg-red-900/30 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Revoke
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Cannot revoke admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      <div className="mt-6 rounded-md bg-blue-50 dark:bg-blue-950/20 p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Role Hierarchy</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li><strong>Admin:</strong> Full access (orders, refunds, moderator management)</li>
          <li><strong>Moderator:</strong> Content moderation only (cannot manage orders or other moderators)</li>
          <li><strong>User:</strong> Standard platform access</li>
        </ul>
      </div>
    </div>
  );
}
