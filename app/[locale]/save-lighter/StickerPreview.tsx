'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import FullStickerPreview from './FullStickerPreview';
import { generateStickerPNG, downloadBlob } from '@/app/utils/stickerToPng';

interface StickerDesign {
  id: string;
  name: string;
  backgroundColor: string;
  language?: string;
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
  const [selectedFormat, setSelectedFormat] = useState<'stickiply' | 'printful'>('printful');

  const handleGeneratePNG = async (format: 'stickiply' | 'printful') => {
    setIsGenerating(true);
    setError(null);
    onDownloadStart?.();

    try {
      
      const stickerData = stickers.map((sticker, index) => ({
        ...sticker,
        pinCode: `LMF-${(index + 1).toString().padStart(2, '0')}`,
      }));

      
      const blob = await generateStickerPNG(stickerData, format, orderId);
      const filename = `stickers-${orderId}-${format}.png`;

      downloadBlob(blob, filename);

      onDownloadComplete?.(true, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onDownloadComplete?.(false);
      console.error('PNG generation failed:', err);
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
      {}
      <div className="rounded-lg border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Preview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {stickers.map((sticker, index) => (
            <div key={sticker.id} className="flex justify-center">
              <div className="transform scale-[0.6] origin-top">
                <FullStickerPreview
                  lighterName={sticker.name}
                  pinCode={`LMF-${(index + 1).toString().padStart(2, '0')}`}
                  backgroundColor={sticker.backgroundColor}
                  language={sticker.language || 'fr'}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {stickers.length} stickers ready for printing (PIN codes will be assigned when saved)
        </p>
      </div>

      {}
      <div className="rounded-lg border border-border bg-background p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Generate Print File</h3>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200 mb-4">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          Generate a high-quality PNG file optimized for printing (300 DPI resolution).
        </p>

        {}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Print Provider Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedFormat('printful')}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedFormat === 'printful'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Printful</div>
              <div className="text-xs text-muted-foreground mt-1">
                A5 Sheet (5.83&quot; × 8.27&quot;)
              </div>
              <div className="text-xs text-primary mt-1">
                12 stickers + branding area
              </div>
            </button>
            <button
              onClick={() => setSelectedFormat('stickiply')}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedFormat === 'stickiply'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">Stickiply</div>
              <div className="text-xs text-muted-foreground mt-1">
                7.5&quot; × 5&quot; Sheet
              </div>
              <div className="text-xs text-primary mt-1">
                15 stickers
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={() => handleGeneratePNG(selectedFormat)}
          disabled={isGenerating}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner color="foreground" size="sm" />
              Generating PNG...
            </>
          ) : (
            <>
              🖼️ Download {selectedFormat === 'printful' ? 'Printful' : 'Stickiply'} PNG
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground mt-4 border-t border-border pt-4">
          {selectedFormat === 'printful' ? (
            <>
              Printful format: A5 sheet (5.83&quot; × 8.27&quot;) with up to 12 stickers.
              3&quot;×3&quot; bottom-right reserved for branding. Kiss-cut ready with 0.64cm gaps.
            </>
          ) : (
            <>
              Stickiply format: 7.5&quot; × 5&quot; sheet with up to 15 stickers optimized for printing.
            </>
          )}
        </p>
      </div>

      {}
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
