# Color Picker Upgrade - Lightweight Modal Solution

## The Problem

The native `<input type="color">` popup modal is unpractical on Android devices.

## The Solution

Replace native color picker with **react-colorful** (2.8 KB) + HTML5 `<dialog>` element (0 KB).

**Total bundle impact: 2.8 KB gzipped** ✅

## Installation

```bash
npm install react-colorful
```

## Implementation

Replace `/app/[locale]/save-lighter/components/ColorPicker.tsx` with the upgraded version:

### Key Changes:

1. **Native picker removed** - Replaced `<input type="color">` with "Pick Color" button
2. **Modal color picker** - Uses HTML5 `<dialog>` element (no library needed)
3. **Touch-optimized** - react-colorful is specifically designed for mobile/touch
4. **Same features kept** - Presets, HEX input, history, contrast warnings all remain

### New Component Structure:

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import { useI18n } from '@/locales/client';

// ... PRESET_COLORS stays the same ...

export default function ColorPicker({ value, onChange, disabled, showPreview, className }: ColorPickerProps) {
  const t = useI18n() as any;
  const [hexInput, setHexInput] = useState(value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Color history (localStorage)
  const [colorHistory, setColorHistory] = useState<string[]>([]);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  // Load color history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('colorHistory');
    if (saved) {
      try {
        setColorHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse color history:', e);
      }
    }
  }, []);

  // Open/close modal
  const openModal = () => {
    if (dialogRef.current && !disabled) {
      dialogRef.current.showModal();
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
      setIsModalOpen(false);
    }
  };

  // Handle color change from modal picker
  const handleModalColorChange = (newColor: string) => {
    handleColorChange(newColor);
  };

  const handleColorChange = (newColor: string) => {
    setHexInput(newColor);
    onChange(newColor);

    // Add to history (max 10 colors)
    const updated = [newColor, ...colorHistory.filter(c => c !== newColor)].slice(0, 10);
    setColorHistory(updated);
    localStorage.setItem('colorHistory', JSON.stringify(updated));

    // Haptic feedback on mobile
    if (navigator?.vibrate) {
      navigator.vibrate(10);
    }
  };

  // Handle HEX input
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setHexInput(input);

    if (/^#[0-9A-Fa-f]{6}$/.test(input)) {
      handleColorChange(input);
    }
  };

  // Contrast warning
  const isLowContrast = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 50;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Popular Colors Palette */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t('colorPicker.popularColors')}
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              type="button"
              onClick={() => handleColorChange(color.hex)}
              disabled={disabled}
              className={cn(
                'group relative h-10 w-10 rounded-full border-2 transition-all',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'active:scale-95',
                value === color.hex
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={`${color.name} (${color.hex})`}
              title={color.name}
            >
              {value === color.hex && (
                <svg
                  className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* HEX Input + Modal Picker Button */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {t('colorPicker.customColor')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            disabled={disabled}
            placeholder="#000000"
            maxLength={7}
            className={cn(
              'flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'font-mono uppercase'
            )}
            aria-label={t('colorPicker.hexCodeLabel')}
          />

          {/* Button to open modal picker */}
          <button
            type="button"
            onClick={openModal}
            disabled={disabled}
            className={cn(
              'rounded-md border border-border bg-background px-4 py-2 text-sm font-medium',
              'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'flex items-center gap-2'
            )}
            aria-label={t('colorPicker.pickColor')}
          >
            <div
              className="h-4 w-4 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            {t('colorPicker.pickColor')}
          </button>
        </div>
      </div>

      {/* Color History */}
      {colorHistory.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('colorPicker.recentColors')}
          </label>
          <div className="flex flex-wrap gap-2">
            {colorHistory.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                onClick={() => handleColorChange(color)}
                disabled={disabled}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  'active:scale-95',
                  value === color ? 'border-primary' : 'border-border hover:border-primary',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
                style={{ backgroundColor: color }}
                aria-label={color}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contrast Warning */}
      {isLowContrast(value) && (
        <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
          ⚠️ {t('colorPicker.contrastWarning')}
        </div>
      )}

      {/* Color Preview */}
      {showPreview && (
        <div className="rounded-md border border-border p-4">
          <div className="mb-2 text-sm font-medium text-foreground">
            {t('colorPicker.preview')}
          </div>
          <div
            className="h-16 rounded-md border border-border"
            style={{ backgroundColor: value }}
            aria-label={t('colorPicker.previewLabel')}
          />
        </div>
      )}

      {/* Modal Color Picker Dialog */}
      <dialog
        ref={dialogRef}
        className="rounded-lg border border-border bg-background p-6 shadow-xl backdrop:bg-black/50"
        onClick={(e) => {
          // Close when clicking backdrop
          if (e.target === dialogRef.current) {
            closeModal();
          }
        }}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {t('colorPicker.pickColorTitle')}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md p-2 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* react-colorful Picker */}
          <HexColorPicker color={value} onChange={handleModalColorChange} />

          {/* Selected Color Display */}
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-md border-2 border-border"
              style={{ backgroundColor: value }}
            />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {t('colorPicker.selectedColor')}
              </div>
              <div className="font-mono text-sm text-muted-foreground">
                {value}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeModal}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {t('colorPicker.done')}
          </button>
        </div>
      </dialog>
    </div>
  );
}
```

## Required i18n Keys

Add these to your locale files:

```typescript
colorPicker: {
  popularColors: 'Popular Colors',
  customColor: 'Custom Color',
  hexCodeLabel: 'HEX Color Code',
  pickColor: 'Pick Color',
  pickColorTitle: 'Choose a Color',
  selectedColor: 'Selected Color',
  done: 'Done',
  recentColors: 'Recent Colors',
  contrastWarning: 'This color may have low contrast on dark backgrounds',
  preview: 'Preview',
  previewLabel: 'Color preview',
}
```

## Benefits Over Native Picker

✅ **Mobile-optimized** - Touch-friendly color area, not cramped native picker
✅ **Consistent UX** - Same experience across iOS, Android, desktop
✅ **Better visibility** - Large color area, easy to see and adjust
✅ **Fast selection** - Visual picker is faster than native sliders
✅ **Lightweight** - Only 2.8 KB bundle size
✅ **Accessible** - WAI-ARIA compliant, keyboard navigation

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- HTML5 `<dialog>` element is supported in all modern browsers

## Styling

The modal uses Tailwind classes and respects your app's existing design system (dark mode, colors, etc.).

To customize the react-colorful picker appearance, add to your global CSS:

```css
.react-colorful {
  width: 100%;
  height: 200px;
}

.react-colorful__saturation {
  border-radius: 8px 8px 0 0;
}

.react-colorful__hue {
  height: 24px;
  border-radius: 0 0 8px 8px;
}

.react-colorful__pointer {
  width: 20px;
  height: 20px;
}
```

## Testing

1. Install dependency: `npm install react-colorful`
2. Replace ColorPicker component
3. Add i18n keys
4. Test on Android device
5. Compare with old native picker experience

## Rollback

If you need to revert, the original `<input type="color">` version is saved in git history.
