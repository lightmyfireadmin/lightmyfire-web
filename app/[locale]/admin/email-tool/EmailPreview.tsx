'use client';

interface EmailPreviewProps {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export default function EmailPreview({ from, to, subject, html }: EmailPreviewProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-card border-b border-border p-4">
        <h2 className="text-xl font-bold text-foreground mb-3">Email Preview</h2>

        {/* Email Header */}
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="font-medium text-foreground w-20">From:</span>
            <span className="text-muted-foreground">{from || '(not set)'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-foreground w-20">To:</span>
            <span className="text-muted-foreground">{to || '(not set)'}</span>
          </div>
          <div className="flex">
            <span className="font-medium text-foreground w-20">Subject:</span>
            <span className="text-muted-foreground">{subject || '(no subject)'}</span>
          </div>
        </div>
      </div>

      {/* Email Body Preview */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
        {html ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div
              dangerouslySetInnerHTML={{ __html: html }}
              className="email-preview-content"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Email preview will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
