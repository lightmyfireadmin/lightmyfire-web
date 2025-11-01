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
  { code: 'ar', label: 'Arabic', name: 'العربية' },
  { code: 'de', label: 'German', name: 'Deutsch' },
  { code: 'es', label: 'Spanish', name: 'Español' },
  { code: 'fa', label: 'Persian', name: 'فارسی' },
  { code: 'fr', label: 'French', name: 'Français' },
  { code: 'hi', label: 'Hindi', name: 'हिन्दी' },
  { code: 'id', label: 'Indonesian', name: 'Bahasa Indonesia' },
  { code: 'it', label: 'Italian', name: 'Italiano' },
  { code: 'ja', label: 'Japanese', name: '日本語' },
  { code: 'ko', label: 'Korean', name: '한국어' },
  { code: 'mr', label: 'Marathi', name: 'मराठी' },
  { code: 'nl', label: 'Dutch', name: 'Nederlands' },
  { code: 'pl', label: 'Polish', name: 'Polski' },
  { code: 'pt', label: 'Portuguese', name: 'Português' },
  { code: 'ru', label: 'Russian', name: 'Русский' },
  { code: 'te', label: 'Telugu', name: 'తెలుగు' },
  { code: 'th', label: 'Thai', name: 'ไทย' },
  { code: 'tr', label: 'Turkish', name: 'Türkçe' },
  { code: 'uk', label: 'Ukrainian', name: 'Українська' },
  { code: 'ur', label: 'Urdu', name: 'اردو' },
  { code: 'vi', label: 'Vietnamese', name: 'Tiếng Việt' },
  { code: 'zh-CN', label: 'Mandarin', name: '中文' },
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
      name: '',
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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          Customize Your Stickers
        </h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Personalize each lighter sticker. Your sticker will display: &quot;Hello, my name is
          <span className="font-semibold text-foreground"> [Your Name]</span>, ready my story :&quot;
        </p>
      </div>

      {/* Apply All Checkbox - ABOVE the cards */}
      {customizations.length > 1 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useApplyAll}
              onChange={(e) => handleApplyAllChange(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              Use same properties on every lighter
            </span>
          </label>
        </div>
      )}

      {/* Personalization Cards */}
      <div className="space-y-4">
        {visibleCustomizations.map((customization, index) => {
          const actualIndex = useApplyAll ? 1 : index + 1;
          const nameLength = customization.name.length;
          const isNameValid = nameLength >= 3 && nameLength <= 16;

          return (
            <div
              key={customization.id}
              className="rounded-lg border border-border bg-background/95 p-4 shadow"
            >
              <div className="mb-3">
                <h4 className="text-base font-semibold text-foreground">
                  Lighter #{useApplyAll ? '1' : actualIndex}
                </h4>
              </div>

              {/* Sticker Preview Placeholder */}
              <div className="mb-4 p-4 border-2 border-dashed border-border rounded-md bg-muted/30 flex items-center justify-center h-32">
                <p className="text-xs text-muted-foreground text-center">
                  Sticker Preview<br/>
                  <span className="text-xs italic">(Coming soon)</span>
                </p>
              </div>

              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lighter Name (3-16 characters)
                </label>
                <input
                  type="text"
                  value={customization.name}
                  onChange={(e) =>
                    handleNameChange(customization.id, e.target.value)
                  }
                  minLength={3}
                  maxLength={16}
                  className={`w-full px-3 py-2 rounded-md border ${
                    nameLength > 0 && !isNameValid
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-input focus:ring-primary'
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2`}
                  placeholder="Enter lighter name..."
                />
                <p className={`mt-1 text-xs ${
                  nameLength > 0 && !isNameValid ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {nameLength}/16 characters {nameLength > 0 && !isNameValid && '(minimum 3 characters required)'}
                </p>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pick Background Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        handleColorChange(customization.id, color)
                      }
                      className={`h-10 w-10 rounded-full transition-transform ${
                        customization.backgroundColor === color
                          ? 'ring-3 ring-primary scale-105'
                          : 'hover:scale-95'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="h-12 w-20 rounded border border-border shadow-sm"
                    style={{ backgroundColor: customization.backgroundColor }}
                  />
                  <div className="text-xs">
                    <p className="font-mono font-semibold text-foreground">
                      {customization.backgroundColor}
                    </p>
                    <p className="text-xs text-muted-foreground">Selected</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Language Selection - After all lighter cards */}
      <div className="rounded-lg border border-border bg-background/95 p-4 shadow">
        <h4 className="text-base font-semibold text-foreground mb-3">
          Second Language on Sticker
        </h4>
        <p className="text-muted-foreground text-xs mb-3">
          Choose a second language for your sticker. English will always be included.
        </p>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
              {lang.code === 'en' ? ' (Primary)' : ' + English'}
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
