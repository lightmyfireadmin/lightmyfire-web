'use client';

import { useId, useState } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'ru', name: 'Русский' },
  { code: 'pl', name: 'Polski' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh-CN', name: '中文' },
];

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DFE6E9', '#74B9FF', '#A29BFE', '#FD79A8', '#FDCB6E',
  '#FF7675', '#6C5CE7', '#00B894', '#FDCB6E', '#E17055'
];

export default function TestStickerGenerator() {
  const [lighterName, setLighterName] = useState('Test Lighter');
  const [backgroundColor, setBackgroundColor] = useState('#FF6B6B');
  const [language, setLanguage] = useState('en');
  const [sheetCount, setSheetCount] = useState<1 | 2 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lighterNameId = useId();
  const backgroundColorId = useId();
  const languageId = useId();
  const sheetCountId = useId();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
            const totalStickers = sheetCount * 10;

            const stickers = Array.from({ length: totalStickers }, (_, i) => ({
        name: lighterName,
        pinCode: `TST-${String(i + 1).padStart(3, '0')}`,
        backgroundColor: backgroundColor,
        language: language,
      }));

            const response = await fetch('/api/generate-sticker-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stickers: stickers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate stickers');
      }

            const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-stickers-${sheetCount}sheet${sheetCount > 1 ? 's' : ''}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Sticker generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate stickers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">🧪 Test Sticker Generator</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Generate test sticker sheets without calling Printful. Creates PNG files with stickers that have identical properties except pin codes.
      </p>

      <div className="space-y-4">
        {}
        <div>
          <label htmlFor={lighterNameId} className="block text-sm font-medium text-foreground mb-2">
            Lighter Name
          </label>
          <input
            type="text"
            id={lighterNameId}
            value={lighterName}
            onChange={(e) => setLighterName(e.target.value)}
            className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary"
            placeholder="Enter lighter name"
            maxLength={50}
          />
        </div>

        {}
        <div>
          <label htmlFor={backgroundColorId} className="block text-sm font-medium text-foreground mb-2">
            Background Color
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              id={backgroundColorId}
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-20 rounded border border-input cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 rounded-lg border border-input p-2 text-foreground bg-background focus:border-primary focus:ring-primary"
              placeholder="#FF6B6B"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBackgroundColor(color)}
                className="w-8 h-8 rounded border-2 border-border hover:border-primary transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {}
        <div>
          <label htmlFor={languageId} className="block text-sm font-medium text-foreground mb-2">
            Sticker Language
          </label>
          <select
            id={languageId}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-input p-3 text-foreground bg-background focus:border-primary focus:ring-primary"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {}
        <div id={sheetCountId} role="group" aria-labelledby={`${sheetCountId}-label`}>
          <span id={`${sheetCountId}-label`} className="block text-sm font-medium text-foreground mb-2">
            Number of Sheets (10 stickers per sheet)
          </span>
          <div className="flex gap-3">
            {([1, 2, 5] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSheetCount(count)}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                  sheetCount === count
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50'
                }`}
              >
                {count} Sheet{count > 1 ? 's' : ''}
                <span className="block text-xs opacity-75 mt-1">
                  ({count * 10} stickers)
                </span>
              </button>
            ))}
          </div>
        </div>

        {}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !lighterName.trim()}
          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <title>Generating stickers</title>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            `Generate ${sheetCount * 10} Test Stickers`
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          This will download a PNG file with {sheetCount} sheet{sheetCount > 1 ? 's' : ''} of identical stickers
        </p>
      </div>
    </div>
  );
}
