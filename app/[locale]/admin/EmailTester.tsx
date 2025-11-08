'use client';

import { useState } from 'react';

const EMAIL_TYPES = [
  { value: 'welcome', label: '👋 Welcome Email', description: 'Sent to new users after signup' },
  { value: 'order_confirmation', label: '📦 Order Confirmation', description: 'Sent immediately after payment' },
  { value: 'order_shipped', label: '🚚 Order Shipped', description: 'Sent when order is shipped with tracking' },
  { value: 'first_post', label: '🌟 First Post Celebration', description: 'Sent when user adds their first post' },
  { value: 'trophy_earned', label: '🏆 Trophy Earned', description: 'Sent when user unlocks an achievement' },
  { value: 'lighter_activity', label: '🔔 Lighter Activity', description: 'Sent when someone interacts with user\'s lighter' },
  { value: 'post_flagged', label: '⚠️ Post Flagged', description: 'Sent when user\'s post is flagged' },
  { value: 'post_approved', label: '✅ Post Approved', description: 'Sent when flagged post is approved' },
  { value: 'post_rejected', label: '❌ Post Rejected', description: 'Sent when flagged post is rejected' },
  { value: 'moderator_invite', label: '👮 Moderator Invite', description: 'Sent to invite user to moderation team' },
];

export default function EmailTester() {
  const [selectedEmail, setSelectedEmail] = useState('welcome');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendTestEmail = async () => {
    if (!recipientEmail) {
      setResult({ type: 'error', message: 'Please enter a recipient email address' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: selectedEmail,
          recipientEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setResult({
        type: 'success',
        message: `✅ Test email sent successfully to ${recipientEmail}!`,
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedEmailType = EMAIL_TYPES.find(e => e.value === selectedEmail);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-2xl font-bold text-foreground mb-2">📧 Email Testing Dashboard</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Send test emails with example data to verify email templates and delivery
      </p>

      <div className="space-y-6">
        {/* Email Type Selection */}
        <div>
          <label htmlFor="emailType" className="block text-sm font-medium text-foreground mb-2">
            Email Template
          </label>
          <select
            id="emailType"
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {EMAIL_TYPES.map((emailType) => (
              <option key={emailType.value} value={emailType.value}>
                {emailType.label}
              </option>
            ))}
          </select>
          {selectedEmailType && (
            <p className="mt-2 text-sm text-muted-foreground">
              📝 {selectedEmailType.description}
            </p>
          )}
        </div>

        {/* Recipient Email Input */}
        <div>
          <label htmlFor="recipientEmail" className="block text-sm font-medium text-foreground mb-2">
            Recipient Email
          </label>
          <input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            💡 Tip: Use your own email address to preview the email in your inbox
          </p>
        </div>

        {/* Send Button */}
        <div>
          <button
            onClick={handleSendTestEmail}
            disabled={isSending || !recipientEmail}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              '📨 Send Test Email'
            )}
          </button>
        </div>

        {/* Result Message */}
        {result && (
          <div
            className={`p-4 rounded-md border ${
              result.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            <p className="text-sm font-medium">{result.message}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ℹ️ Email Configuration Status
          </h3>
          <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
            <p><strong>API Provider:</strong> Resend</p>
            <p><strong>From Domains:</strong> noreply@lightmyfire.app, orders@lightmyfire.app, notifications@lightmyfire.app</p>
            <p><strong>Environment Variable:</strong> RESEND_API_KEY</p>
            <p className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
              🔐 All emails use example/test data. Real user data is never used in test sends.
            </p>
          </div>
        </div>

        {/* Available Email Templates Overview */}
        <div className="bg-muted/30 border border-border rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            📋 Available Email Templates ({EMAIL_TYPES.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {EMAIL_TYPES.map((emailType) => (
              <div
                key={emailType.value}
                className={`p-2 rounded border ${
                  selectedEmail === emailType.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border'
                }`}
              >
                <div className="font-medium text-foreground">{emailType.label}</div>
                <div className="text-muted-foreground mt-0.5">{emailType.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
