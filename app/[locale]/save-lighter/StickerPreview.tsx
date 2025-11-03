'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';

interface StickerDesign {
  id: string;
  name: string;
  backgroundColor: string;
}

interface StickerPreviewProps {
  stickers: StickerDesign[];
  orderId: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: (success: boolean, filename?: string) => void;
}

export default function StickerPreview({
  stickers,
  orderId,
  onDownloadStart,
  onDownloadComplete,
}: StickerPreviewProps) {
  const t = useI18n();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();

    try {
      const response = await fetch('/api/generate-sticker-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickers,
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stickers-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onDownloadComplete?.(true, `stickers-${orderId}.pdf`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onDownloadComplete?.(false);
      console.error('PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (stickers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-6">
        <p className="text-center text-muted-foreground">
          No stickers to preview. Customize stickers first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sticker Preview Grid */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stickers.map((sticker) => (
            <div
              key={sticker.id}
              className="aspect-square rounded-lg flex items-center justify-center shadow-sm border border-border overflow-hidden"
              style={{ backgroundColor: sticker.backgroundColor }}
            >
              <span className="text-white text-center text-xs font-semibold px-2 text-shadow">
                {sticker.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {stickers.length} stickers ready for printing
        </p>
      </div>

      {/* PDF Generation Section */}
      <div className="rounded-lg border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Generate Print File</h3>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200 mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Generate a high-quality PDF file optimized for printing (300 DPI, CMYK color space).
        </p>

        <button
          onClick={handleGeneratePDF}
          disabled={isGenerating}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner color="foreground" size="sm" />
              Generating PDF...
            </>
          ) : (
            <>
              📄 Download Sticker PDF
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
          The PDF will be generated at 300 DPI for professional print quality. File includes all {stickers.length} sticker{stickers.length !== 1 ? 's' : ''} optimized for printing.
        </p>
      </div>

      {/* Print Instructions */}
      <div className="rounded-lg border border-border bg-background/50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Print Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            <span>Use glossy sticker paper for best results</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            <span>Print color as &apos;best photo&apos; or &apos;maximum&apos; quality</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            <span>Allow ink to dry completely before cutting</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            <span>Use a sharp blade or sticker cutter for clean edges</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            <span>Handle stickers with care to preserve finish</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
