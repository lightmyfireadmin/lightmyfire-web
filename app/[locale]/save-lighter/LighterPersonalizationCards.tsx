'use client';

import { useState } from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { getSecondLanguageOptions, getDefaultStickerLanguage, languageNames } from '@/locales/languages';
import FullStickerPreview from './FullStickerPreview';
import ColorPicker from './components/ColorPicker';

interface LighterCustomization {
  id: string;
  name: string;
  backgroundColor: string;
}

const SECOND_LANGUAGES = getSecondLanguageOptions();

export default function LighterPersonalizationCards({
  stickerCount,
  onSave,
}: {
  stickerCount: number;
  onSave: (customizations: LighterCustomization[], language: string) => void;
}) {
  const t = useI18n();
  const currentLocale = useCurrentLocale();
  // Default colors for initial lighter customizations (matches ColorPicker presets)
  const DEFAULT_COLORS = [
    '#FF6B6B', '#FF8B6B', '#FFA500', '#FFD700', '#90EE90',
    '#4CAF50', '#20B2AA', '#87CEEB', '#4169E1', '#8A2BE2',
    '#FF1493', '#FFB6C1', '#D3D3D3', '#800080', '#00CED1',
  ];

  const [customizations, setCustomizations] = useState<LighterCustomization[]>(
    Array.from({ length: stickerCount }, (_, i) => ({
      id: `lighter-${i}`,
      name: '',
      backgroundColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }))
  );
  
  const [selectedLanguage, setSelectedLanguage] = useState(
    getDefaultStickerLanguage(currentLocale)
  );
  const [useApplyAll, setUseApplyAll] = useState(false);

  const handleNameChange = (id: string, newName: string) => {
    if (useApplyAll) {
      
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
    
    const finalCustomizations = useApplyAll
      ? customizations.map((c) => ({
          ...c,
          name: customizations[0].name,
          backgroundColor: customizations[0].backgroundColor,
        }))
      : customizations;

    onSave(finalCustomizations, selectedLanguage);
  };

  
  const isFormValid = () => {
    if (useApplyAll) {
      
      const firstLighter = customizations[0];
      return firstLighter.name.length >= 3 && firstLighter.name.length <= 16;
    } else {
      
      return customizations.every(
        (c) => c.name.length >= 3 && c.name.length <= 16
      );
    }
  };

  const canSave = isFormValid();

  
  const visibleCustomizations = useApplyAll ? [customizations[0]] : customizations;

  return (
    <div className="space-y-4">
      {}
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
        <p className="text-xs text-muted-foreground mt-1">
          English will always be included on your stickers
        </p>
      </div>

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

      {}
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

              {/* Desktop: Side-by-side layout, Mobile: Stacked */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Preview Section */}
                <div className="lg:w-1/3 flex-shrink-0">
                  <div className="p-3 border-2 border-dashed border-border/50 rounded-md bg-muted/20 h-full flex items-center justify-center">
                    {customization.name.length >= 3 ? (
                      <FullStickerPreview
                        lighterName={customization.name}
                        pinCode="ABC-123"
                        backgroundColor={customization.backgroundColor}
                        language={selectedLanguage}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-24">
                        <p className="text-xs text-muted-foreground text-center">
                          Enter a name (min 3 characters) to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customization Controls */}
                <div className="flex-1 space-y-3">
                  {/* Name Input */}
                  <div>
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
                    <ColorPicker
                      value={customization.backgroundColor}
                      onChange={(color) => handleColorChange(customization.id, color)}
                      showPreview={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {}
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

      {/* Sticker Quality Information */}
      <div className="rounded-lg border border-border bg-background/80 p-3">
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <span>✨</span>
          <span>{t('order.quality.title')}</span>
        </h4>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>{t('order.quality.glossy_finish')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>{t('order.quality.fast_application')}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary">•</span>
            <span>{t('order.quality.durability')}</span>
          </li>
        </ul>
      </div>

      {/* Application Guidelines */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-3">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>{t('order.guidelines.title')}</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">1.</span>
            <span>{t('order.guidelines.step1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">2.</span>
            <span>{t('order.guidelines.step2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">3.</span>
            <span>{t('order.guidelines.step3')}</span>
          </li>
        </ul>
      </div>

      {}
      {!canSave && (
        <div className="rounded-lg border border-yellow-500/50 bg-gray-200 sm:bg-gray-100 dark:bg-gray-700 dark:sm:bg-gray-800 p-3">
          <p className="text-sm text-yellow-800 sm:text-yellow-700 dark:text-yellow-500 dark:sm:text-yellow-600 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              {useApplyAll
                ? t('order.customization.validation_warning_single')
                : t('order.customization.validation_warning_multiple')}
            </span>
          </p>
        </div>
      )}

      {}
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full text-lg py-3 flex items-center justify-center gap-2 transition-all ${
          canSave
            ? 'btn-primary hover:shadow-lg'
            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
        }`}
      >
        <span>💾</span>
        <span>{t('order.customization.save_button')}</span>
      </button>
    </div>
  );
}
