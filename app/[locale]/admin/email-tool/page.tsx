'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import EmailComposer from './EmailComposer';
import EmailPreview from './EmailPreview';

export default function EmailToolPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [previewData, setPreviewData] = useState({
    from: '',
    to: '',
    subject: '',
    html: '',
  });

  const handlePreviewChange = (from: string, to: string, subject: string, html: string) => {
    setPreviewData({ from, to, subject, html });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Management Tool</h1>
              <p className="text-muted-foreground mt-1">
                Compose and send custom emails to users with full control
              </p>
            </div>
            <button
              onClick={() => router.push(`/${locale}/admin`)}
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Email Composer (40%) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <EmailComposer onPreviewChange={handlePreviewChange} />
          </div>

          {/* Right Panel - Email Preview (60%) */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <EmailPreview
              from={previewData.from}
              to={previewData.to}
              subject={previewData.subject}
              html={previewData.html}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            ℹ️ How to Use This Tool
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-semibold mb-2">1. Select From Address</h4>
              <p>Choose the appropriate sender address based on the email type:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                <li><strong>orders@lightmyfire.app</strong> - Order confirmations & shipping</li>
                <li><strong>support@lightmyfire.app</strong> - General support & help</li>
                <li><strong>mitch@lightmyfire.app</strong> - Personal messages & moderation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">2. Find Recipient</h4>
              <p>Search for a user by email. Once selected, you'll be able to attach their orders, lighters, and posts to the email.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">3. Choose Template</h4>
              <p>Select a pre-made template or start from scratch with "Custom". Templates support multiple languages.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">4. Customize & Send</h4>
              <p>Edit the email body, insert attachment details, preview the result, and send when ready.</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">⚠️ Important Notes</h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-800 dark:text-blue-200">
              <li>All emails are logged for audit purposes</li>
              <li>Make sure to preview before sending - emails cannot be recalled</li>
              <li>Use attachment info to provide context about orders, lighters, or posts</li>
              <li>Keep emails professional and helpful - you represent LightMyFire</li>
              <li>For bulk operations, send individual emails (no mass mailing feature for safety)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
