'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';

interface LighterCustomization {
  id: string;
  name: string;
  backgroundColor: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', name: 'English' },
  { code: 'fr', label: 'French', name: 'Français' },
  { code: 'es', label: 'Spanish', name: 'Español' },
  { code: 'de', label: 'German', name: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', name: 'Português' },
  { code: 'zh', label: 'Mandarin', name: '中文' },
  { code: 'ar', label: 'Arabic', name: 'العربية' },
  { code: 'ru', label: 'Russian', name: 'Русский' },
  { code: 'it', label: 'Italian', name: 'Italiano' },
];

const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#FF8B6B', // Orange-Red
  '#FFA500', // Orange
  '#FFD700', // Gold
  '#90EE90', // Light Green
  '#4CAF50', // Green
  '#20B2AA', // Teal
  '#87CEEB', // Sky Blue
  '#4169E1', // Royal Blue
  '#8A2BE2', // Blue Violet
  '#FF1493', // Deep Pink
  '#FFB6C1', // Light Pink
  '#D3D3D3', // Light Gray
  '#800080', // Purple
  '#FFA500', // Orange
  '#00CED1', // Dark Turquoise
];

export default function LighterPersonalizationCards({
  stickerCount,
  onSave,
}: {
  stickerCount: number;
  onSave: (customizations: LighterCustomization[], language: string) => void;
}) {
  const t = useI18n();
  const [customizations, setCustomizations] = useState<LighterCustomization[]>(
    Array.from({ length: stickerCount }, (_, i) => ({
      id: `lighter-${i}`,
      name: `My Lighter ${i + 1}`,
      backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length],
    }))
  );
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [useApplyAll, setUseApplyAll] = useState(false);

  const handleNameChange = (id: string, newName: string) => {
    if (useApplyAll) {
      // Apply to all
      setCustomizations(
        customizations.map((c) => ({
          ...c,
          name: newName,
        }))
      );
    } else {
      setCustomizations(
        customizations.map((c) =>
          c.id === id ? { ...c, name: newName } : c
        )
      );
    }
  };

  const handleColorChange = (id: string, newColor: string) => {
    if (useApplyAll) {
      // Apply to all
      setCustomizations(
        customizations.map((c) => ({
          ...c,
          backgroundColor: newColor,
        }))
      );
    } else {
      setCustomizations(
        customizations.map((c) =>
          c.id === id ? { ...c, backgroundColor: newColor } : c
        )
      );
    }
  };

  const handleApplyAllChange = (checked: boolean) => {
    setUseApplyAll(checked);
  };

  const handleSave = () => {
    // If useApplyAll is true, apply the first customization to all
    const finalCustomizations = useApplyAll
      ? customizations.map((c) => ({
          ...c,
          name: customizations[0].name,
          backgroundColor: customizations[0].backgroundColor,
        }))
      : customizations;

    onSave(finalCustomizations, selectedLanguage);
  };

  // If useApplyAll, only show the first card
  const visibleCustomizations = useApplyAll ? [customizations[0]] : customizations;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Customize Your Stickers
        </h3>
        <p className="text-muted-foreground mb-6">
          Personalize each lighter sticker. Your sticker will display: &quot;Hello, my name is
          <span className="font-semibold text-foreground"> [Your Name]</span>, ready my story :&quot;
        </p>
      </div>

      {/* Personalization Cards */}
      <div className="space-y-6">
        {visibleCustomizations.map((customization, index) => (
          <div
            key={customization.id}
            className="rounded-lg border-2 border-border bg-background/95 p-6 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-foreground">
                Sticker {useApplyAll ? '(All)' : index + 1}
              </h4>
              {index === 0 && customizations.length > 1 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useApplyAll}
                    onChange={(e) => handleApplyAllChange(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Use these properties for all {stickerCount} stickers
                  </span>
                </label>
              )}
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Lighter Name
              </label>
              <div className="flex gap-2 items-center">
                <span className="text-muted-foreground text-sm">Hello, my name is</span>
                <input
                  type="text"
                  value={customization.name}
                  onChange={(e) =>
                    handleNameChange(customization.id, e.target.value)
                  }
                  maxLength={30}
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Phoenix"
                />
                <span className="text-muted-foreground text-sm">, ready my story:</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {customization.name.length}/30 characters
              </p>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Sticker Background Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      handleColorChange(customization.id, color)
                    }
                    className={`h-12 w-12 rounded-full transition-transform ${
                      customization.backgroundColor === color
                        ? 'ring-4 ring-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-16 w-24 rounded-md border-2 border-border shadow-sm"
                  style={{ backgroundColor: customization.backgroundColor }}
                />
                <div className="text-sm">
                  <p className="font-mono font-semibold text-foreground">
                    {customization.backgroundColor}
                  </p>
                  <p className="text-xs text-muted-foreground">Selected color</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Language Selection */}
      <div className="rounded-lg border-2 border-border bg-background/95 p-6 shadow-md">
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Sticker Language
        </h4>
        <p className="text-muted-foreground text-sm mb-4">
          Choose the language for your sticker text. English will always be displayed underneath.
        </p>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-4 py-3 rounded-md border-2 border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
              {lang.code === 'en' ? ' (always included)' : ' + English'}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
        <h4 className="text-lg font-semibold text-foreground mb-3">Summary</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">✓</span>
            <span className="text-foreground">
              <span className="font-semibold">{useApplyAll ? 1 : customizations.length}</span>{' '}
              sticker design{useApplyAll ? '' : 's'} configured
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary font-bold">✓</span>
            <span className="text-foreground">
              Language: <span className="font-semibold">{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
            </span>
          </li>
          {useApplyAll && (
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span>
              <span className="text-foreground">
                All <span className="font-semibold">{stickerCount}</span> stickers will use the same design
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full btn-primary text-lg py-3 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
      >
        <span>💾</span>
        <span>Save Sticker Customizations</span>
      </button>
    </div>
  );
}
