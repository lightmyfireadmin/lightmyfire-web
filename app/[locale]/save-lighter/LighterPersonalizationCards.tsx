'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import { getSecondLanguageOptions, languageNames } from '@/locales/languages';

interface LighterCustomization {
  id: string;
  name: string;
  backgroundColor: string;
}

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
  '#00CED1', // Dark Turquoise
];

// Get available languages for second language dropdown (exclude English)
const SECOND_LANGUAGES = getSecondLanguageOptions();

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
  // Default to first non-English language if available, otherwise 'en'
  const [selectedLanguage, setSelectedLanguage] = useState(
    SECOND_LANGUAGES.length > 0 ? SECOND_LANGUAGES[0].code : 'en'
  );
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Customize Your Stickers
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            Personalize each lighter
          </p>
        </div>
        {customizations.length > 1 && (
          <label className="flex items-center gap-2 cursor-pointer bg-primary/10 px-3 py-2 rounded-md border border-primary/20">
            <input
              type="checkbox"
              checked={useApplyAll}
              onChange={(e) => handleApplyAllChange(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <span className="text-xs font-medium text-primary">
              Apply to All
            </span>
          </label>
        )}
      </div>

      {/* Personalization Cards */}
      <div className="space-y-4">
        {visibleCustomizations.map((customization, index) => {
          const actualIndex = useApplyAll ? 1 : index + 1;
          const nameLength = customization.name.length;
          const isNameValid = nameLength >= 3 && nameLength <= 16;

          return (
            <div
              key={customization.id}
              className="rounded-lg border border-border/50 bg-background/80 p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Lighter #{useApplyAll ? '1' : actualIndex}
              </h4>

              {/* Sticker Preview Placeholder */}
              <div className="mb-3 p-3 border-2 border-dashed border-border/50 rounded-md bg-muted/20 flex items-center justify-center h-24">
                <div className="text-center">
                  <div
                    className="h-12 w-12 rounded-md mx-auto mb-1 border border-border"
                    style={{ backgroundColor: customization.backgroundColor }}
                  />
                  <p className="text-xs text-muted-foreground">Preview</p>
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-foreground mb-1">
                  Name (3-16 characters)
                </label>
                <input
                  type="text"
                  value={customization.name}
                  onChange={(e) =>
                    handleNameChange(customization.id, e.target.value)
                  }
                  minLength={3}
                  maxLength={16}
                  className={`w-full px-2 py-1.5 rounded text-sm border ${
                    nameLength > 0 && !isNameValid
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-input focus:ring-primary'
                  } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1`}
                  placeholder="Lighter name..."
                />
                <p className={`mt-0.5 text-xs ${
                  nameLength > 0 && !isNameValid ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {nameLength}/16 {nameLength > 0 && !isNameValid && '(min 3)'}
                </p>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Pick Background Color
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        handleColorChange(customization.id, color)
                      }
                      className={`h-8 w-8 rounded-full transition-transform border-2 ${
                        customization.backgroundColor === color
                          ? 'ring-2 ring-primary border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-8 w-12 rounded border border-border shadow-sm"
                    style={{ backgroundColor: customization.backgroundColor }}
                  />
                  <input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) =>
                      handleColorChange(customization.id, e.target.value)
                    }
                    placeholder="#FF6B6B"
                    maxLength={7}
                    className="w-24 px-2 py-1 text-xs font-mono rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Language Selection - After all lighter cards */}
      <div className="rounded-lg border border-border/50 bg-background/80 p-3 shadow-sm">
        <label className="block text-sm font-bold text-foreground mb-2">
          Second Language on Sticker (+ English)
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-2 py-1.5 rounded text-sm border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SECOND_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary - Compact */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <ul className="space-y-1 text-xs">
          <li className="flex items-center gap-2 text-foreground">
            <span className="text-primary font-bold">✓</span>
            <span><span className="font-semibold">{useApplyAll ? 1 : customizations.length}</span> design{useApplyAll ? '' : 's'}</span>
          </li>
          <li className="flex items-center gap-2 text-foreground">
            <span className="text-primary font-bold">✓</span>
            <span><span className="font-semibold">{languageNames[selectedLanguage as keyof typeof languageNames]?.nativeName}</span> + English</span>
          </li>
          {useApplyAll && (
            <li className="flex items-center gap-2 text-foreground">
              <span className="text-primary font-bold">✓</span>
              <span>All <span className="font-semibold">{stickerCount}</span> identical</span>
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
