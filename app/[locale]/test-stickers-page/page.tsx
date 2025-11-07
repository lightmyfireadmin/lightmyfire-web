'use client';

import { useState } from 'react';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function TestStickersPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(10);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">This page is only available in development mode.</p>
        </div>
      </div>
    );
  }

  const handleGenerate = async (useDefault: boolean = true) => {
    setIsGenerating(true);
    setError(null);

    try {
      const url = useDefault
        ? '/api/test-generate-stickers'
        : '/api/test-generate-stickers';

      const options: RequestInit = useDefault
        ? { method: 'GET' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count }),
          };

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate stickers');
      }

      // Download the file (PNG for 10 stickers, ZIP for 20/50 stickers)
      const blob = await response.blob();
      const contentType = response.headers.get('Content-Type');
      const extension = contentType === 'application/zip' ? 'zip' : 'png';

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `test-stickers-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-background rounded-2xl shadow-2xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">🧪 Sticker Test Lab</h1>
            <p className="text-muted-foreground">
              Quickly generate test stickers without going through payment
            </p>
            <div className="mt-4 inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ Development Only - Not available in production
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Default Test Stickers */}
            <div className="border border-border rounded-lg p-6 bg-muted/50">
              <h2 className="text-xl font-semibold text-foreground mb-3">Quick Test (10 Stickers)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Generate 10 pre-configured test stickers with variety of colors and languages
              </p>
              <button
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner color="primary" size="sm" label="" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🎨</span> Generate Default Test Stickers
                  </>
                )}
              </button>
            </div>

            {/* Custom Count */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-3">Custom Test</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a custom number of test stickers (10, 20, or 50)
              </p>
              <div className="mb-4">
                <label htmlFor="count" className="block text-sm font-medium text-foreground mb-2">
                  Number of Stickers
                </label>
                <select
                  id="count"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value={10}>10 stickers (1 sheet)</option>
                  <option value={20}>20 stickers (2 sheets)</option>
                  <option value={50}>50 stickers (5 sheets)</option>
                </select>
              </div>
              <button
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner color="primary" size="sm" label="" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span>⚡</span> Generate {count} Test Stickers
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span>💡</span> How it works
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Bypasses payment and database operations</li>
                <li>• Generates PNG directly using your latest sticker code</li>
                <li>• Test different pack sizes (10, 20, 50 stickers)</li>
                <li>• Automatically downloads the PNG file</li>
                <li>• Perfect for testing fonts, layouts, and QR codes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
