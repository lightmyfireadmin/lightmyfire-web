'use client';

import { useState, useEffect } from 'react';
import RecipientSearch from './RecipientSearch';
import AttachmentSelector from './AttachmentSelector';
import { wrapEmailTemplate, getTemplateContent } from './emailTemplates';

interface User {
  id: string;
  email: string;
  username: string | null;
}

interface Order {
  id: string;
  quantity: number;
  amount_paid: number;
  lighter_names: string[];
  stripe_payment_intent_id: string;
}

interface Lighter {
  id: string;
  lighter_name: string;
  pin_code: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  lighters: {
    id: string;
    lighter_name: string;
  };
}

interface EmailComposerProps {
  onPreviewChange: (from: string, to: string, subject: string, html: string) => void;
}

const FROM_ADDRESSES = [
  { value: 'LightMyFire Orders <orders@lightmyfire.app>', label: 'orders@lightmyfire.app', display: 'Orders' },
  { value: 'LightMyFire Support <support@lightmyfire.app>', label: 'support@lightmyfire.app', display: 'Support' },
  { value: 'LightMyFire <mitch@lightmyfire.app>', label: 'mitch@lightmyfire.app', display: 'Mitch' },
];

const EMAIL_TEMPLATES = [
  { value: 'custom', label: 'Custom (Blank Template)', subject: '' },
  { value: 'welcome', label: 'Welcome Email', subject: 'Welcome to LightMyFire! 🔥' },
  { value: 'order_confirmation', label: 'Order Confirmation', subject: 'Your LightMyFire Order Confirmation' },
  { value: 'order_shipped', label: 'Order Shipped', subject: 'Your Order Has Shipped! 📦' },
  { value: 'first_post', label: 'First Post Celebration', subject: 'You\'ve Lit Your First Spark! 🌟' },
  { value: 'lighter_activity', label: 'Lighter Activity', subject: 'Someone Interacted with Your Lighter! 🔔' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

export default function EmailComposer({ onPreviewChange }: EmailComposerProps) {
  const [fromAddress, setFromAddress] = useState(FROM_ADDRESSES[0].value);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedLighter, setSelectedLighter] = useState<Lighter | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Update preview whenever any field changes
  useEffect(() => {
    const wrappedHtml = wrapEmailTemplate(emailBody, subject, selectedLanguage);
    onPreviewChange(fromAddress, selectedUser?.email || '', subject, wrappedHtml);
  }, [fromAddress, selectedUser, subject, emailBody, selectedLanguage, onPreviewChange]);

  // Update template content when template or language changes
  useEffect(() => {
    if (selectedTemplate !== 'custom') {
      const template = EMAIL_TEMPLATES.find(t => t.value === selectedTemplate);
      if (template) {
        setSubject(template.subject);
        const content = getTemplateContent(selectedTemplate, selectedLanguage);
        setEmailBody(content);
      }
    } else {
      setSubject('');
      setEmailBody('');
    }
  }, [selectedTemplate, selectedLanguage]);

  // Insert attachment info into email body
  const insertAttachmentInfo = (type: 'order' | 'lighter' | 'post') => {
    let insertText = '';

    if (type === 'order' && selectedOrder) {
      const orderNum = selectedOrder.stripe_payment_intent_id?.slice(-6) || selectedOrder.id.slice(0, 6);
      insertText = `\n\n<div class="section">
  <h3>📦 Order Information</h3>
  <p><strong>Order ID:</strong> #${orderNum}</p>
  <p><strong>Quantity:</strong> ${selectedOrder.quantity} sticker${selectedOrder.quantity > 1 ? 's' : ''}</p>
  <p><strong>Amount:</strong> €${(selectedOrder.amount_paid / 100).toFixed(2)}</p>
  ${selectedOrder.lighter_names.length > 0 ? `<p><strong>Lighters:</strong></p>
  <ul>
    ${selectedOrder.lighter_names.map(name => `<li>${name}</li>`).join('\n    ')}
  </ul>` : ''}
</div>`;
    } else if (type === 'lighter' && selectedLighter) {
      insertText = `\n\n<div class="section">
  <h3>🔥 Lighter Information</h3>
  <p><strong>Lighter Name:</strong> ${selectedLighter.lighter_name}</p>
  <p><strong>PIN Code:</strong> <span class="pin-code">${selectedLighter.pin_code}</span></p>
</div>`;
    } else if (type === 'post' && selectedPost) {
      const preview = selectedPost.content.slice(0, 100) + (selectedPost.content.length > 100 ? '...' : '');
      insertText = `\n\n<div class="section">
  <h3>📝 Post Information</h3>
  <p><strong>Type:</strong> ${selectedPost.post_type}</p>
  <p><strong>Content:</strong> ${preview}</p>
  <p><strong>Lighter:</strong> ${selectedPost.lighters?.lighter_name || 'Unknown'}</p>
</div>`;
    }

    if (insertText) {
      setEmailBody(prev => prev + insertText);
    }
  };

  const handleSendEmail = () => {
    setSendResult(null);

    // Validation
    if (!selectedUser) {
      setSendResult({ type: 'error', message: 'Please select a recipient' });
      return;
    }
    if (!subject.trim()) {
      setSendResult({ type: 'error', message: 'Please enter a subject' });
      return;
    }
    if (!emailBody.trim()) {
      setSendResult({ type: 'error', message: 'Please enter email content' });
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSendEmail = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setSendResult(null);

    try {
      const wrappedHtml = wrapEmailTemplate(emailBody, subject, selectedLanguage);

      const response = await fetch('/api/admin/email-tool/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: selectedUser!.email,
          subject,
          html: wrappedHtml,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSendResult({
        type: 'success',
        message: `Email sent successfully to ${selectedUser!.email}!`,
      });

      // Optional: Clear form or keep it for sending another email
    } catch (error: any) {
      setSendResult({
        type: 'error',
        message: `Error: ${error.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const isFormValid = selectedUser && subject.trim() && emailBody.trim();

  return (
    <div className="h-full flex flex-col">
      <div className="bg-card border-b border-border p-4">
        <h2 className="text-xl font-bold text-foreground">Compose Email</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure and send custom emails to users
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* From Address */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            From Address *
          </label>
          <select
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {FROM_ADDRESSES.map((addr) => (
              <option key={addr.value} value={addr.value}>
                {addr.display} ({addr.label})
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Search */}
        <RecipientSearch
          onSelectUser={setSelectedUser}
          selectedUser={selectedUser}
        />

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {EMAIL_TEMPLATES.map((template) => (
              <option key={template.value} value={template.value}>
                {template.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Attachment Selectors */}
        {selectedUser && (
          <AttachmentSelector
            userId={selectedUser.id}
            onSelectOrder={setSelectedOrder}
            onSelectLighter={setSelectedLighter}
            onSelectPost={setSelectedPost}
            selectedOrder={selectedOrder}
            selectedLighter={selectedLighter}
            selectedPost={selectedPost}
          />
        )}

        {/* Insert Attachment Buttons */}
        {selectedUser && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Insert Attachment Info
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => insertAttachmentInfo('order')}
                disabled={!selectedOrder}
                className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📦 Insert Order
              </button>
              <button
                type="button"
                onClick={() => insertAttachmentInfo('lighter')}
                disabled={!selectedLighter}
                className="px-3 py-1.5 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔥 Insert Lighter
              </button>
              <button
                type="button"
                onClick={() => insertAttachmentInfo('post')}
                disabled={!selectedPost}
                className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📝 Insert Post
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select an attachment above, then click to insert its details into the email
            </p>
          </div>
        )}

        {/* Email Body */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Body * (HTML supported)
          </label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Enter email content (HTML supported)..."
            rows={12}
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            You can use HTML tags for formatting. Use the template as a starting point.
          </p>
        </div>

        {/* Send Result */}
        {sendResult && (
          <div
            className={`p-4 rounded-md border ${
              sendResult.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            <p className="text-sm font-medium">{sendResult.message}</p>
          </div>
        )}

        {/* Send Button */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSendEmail}
            disabled={!isFormValid || isSending}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Email...
              </span>
            ) : (
              '📨 Send Email'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Confirm Send Email</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-foreground w-20">From:</span>
                <span className="text-muted-foreground flex-1 break-all">{fromAddress}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-foreground w-20">To:</span>
                <span className="text-muted-foreground flex-1 break-all">{selectedUser?.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-foreground w-20">Subject:</span>
                <span className="text-muted-foreground flex-1 break-all">{subject}</span>
              </div>
              {(selectedOrder || selectedLighter || selectedPost) && (
                <div className="flex flex-col pt-2 border-t border-border">
                  <span className="font-medium text-foreground mb-1">Attachments:</span>
                  <ul className="text-muted-foreground space-y-1">
                    {selectedOrder && <li>📦 Order #{selectedOrder.stripe_payment_intent_id?.slice(-6) || selectedOrder.id.slice(0, 6)}</li>}
                    {selectedLighter && <li>🔥 Lighter "{selectedLighter.lighter_name}"</li>}
                    {selectedPost && <li>📝 Post on {selectedPost.lighters?.lighter_name}</li>}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80"
              >
                Cancel
              </button>
              <button
                onClick={confirmSendEmail}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
