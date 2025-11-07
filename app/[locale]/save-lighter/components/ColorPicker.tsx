'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Color Definitions
// ============================================================================

/**
 * Preset color palette - carefully selected for good contrast and variety
 */
const PRESET_COLORS = [
  // Warm colors (Reds, Oranges, Yellows)
  { hex: '#FF6B6B', name: 'Coral Red' },
  { hex: '#FF8B6B', name: 'Sunset Orange' },
  { hex: '#FFA500', name: 'Warm Orange' },
  { hex: '#FFD700', name: 'Golden Yellow' },
  { hex: '#FFEB3B', name: 'Bright Yellow' },

  // Cool colors (Greens, Blues, Purples)
  { hex: '#90EE90', name: 'Light Green' },
  { hex: '#4CAF50', name: 'Forest Green' },
  { hex: '#20B2AA', name: 'Turquoise' },
  { hex: '#87CEEB', name: 'Sky Blue' },
  { hex: '#4169E1', name: 'Royal Blue' },
  { hex: '#00CED1', name: 'Dark Turquoise' },

  // Accent colors (Purples, Pinks)
  { hex: '#8A2BE2', name: 'Blue Violet' },
  { hex: '#800080', name: 'Deep Purple' },
  { hex: '#FF1493', name: 'Deep Pink' },
  { hex: '#FFB6C1', name: 'Light Pink' },
];

/**
 * LightMyFire brand colors - signature palette
 */
const BRAND_COLORS = [
  { hex: '#FF6B35', name: 'Fire Orange', icon: '🔥', description: 'Our signature color' },
  { hex: '#1E88E5', name: 'Ocean Blue', icon: '🌊', description: 'Journey & adventure' },
  { hex: '#388E3C', name: 'Forest Green', icon: '🌲', description: 'Nature & growth' },
  { hex: '#FFB74D', name: 'Sunset Gold', icon: '🌅', description: 'Warmth & memories' },
];

// ============================================================================
// Color Utility Functions
// ============================================================================

/**
 * Validate HEX color format
 */
const isValidHex = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

/**
 * Format HEX input (auto-add # and limit to 6 chars)
 */
const formatHexInput = (input: string): string => {
  let cleaned = input.replace(/[^0-9A-Fa-f]/g, '');
  if (cleaned.length > 6) cleaned = cleaned.slice(0, 6);
  return cleaned ? `#${cleaned.toUpperCase()}` : '';
};

/**
 * Convert HEX to RGB
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

/**
 * Calculate relative luminance (WCAG formula)
 */
const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors
 */
const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if color has good contrast with white or black text (WCAG AA: 4.5:1)
 */
const hasGoodContrast = (bgColor: string): boolean => {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  return Math.max(whiteContrast, blackContrast) >= 4.5;
};

/**
 * Get recommended text color (black or white) for background
 */
const getTextColor = (bgColor: string): string => {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

// ============================================================================
// Color History (LocalStorage)
// ============================================================================

const COLOR_HISTORY_KEY = 'lightmyfire_color_history';
const MAX_HISTORY = 10;

const useColorHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLOR_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load color history:', error);
    }
  }, []);

  const addToHistory = useCallback((color: string) => {
    if (!isValidHex(color)) return;

    setHistory(prev => {
      // Remove duplicates and add to front
      const updated = [color, ...prev.filter(c => c.toLowerCase() !== color.toLowerCase())]
        .slice(0, MAX_HISTORY);

      try {
        localStorage.setItem(COLOR_HISTORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save color history:', error);
      }

      return updated;
    });
  }, []);

  return { history, addToHistory };
};

// ============================================================================
// Component Props
// ============================================================================

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ColorPicker({
  value,
  onChange,
  disabled = false,
  showPreview = true,
  className,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const { history, addToHistory } = useColorHistory();

  // Sync hexInput with value prop
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  // Handle color change with history tracking
  const handleColorChange = useCallback((newColor: string) => {
    if (isValidHex(newColor) && !disabled) {
      onChange(newColor);
      addToHistory(newColor);

      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [onChange, addToHistory, disabled]);

  // Handle HEX input change
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHexInput(e.target.value);
    setHexInput(formatted);

    if (isValidHex(formatted)) {
      handleColorChange(formatted);
    }
  };

  // Handle native color picker change
  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    handleColorChange(newColor);
  };

  // Keyboard navigation for preset colors
  const handleColorKeyDown = (e: React.KeyboardEvent, index: number, color: string) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((index + 1) % PRESET_COLORS.length);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((index - 1 + PRESET_COLORS.length) % PRESET_COLORS.length);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + 5, PRESET_COLORS.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(index - 5, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleColorChange(color);
        break;
    }
  };

  const isHexValid = isValidHex(hexInput);
  const hasContrast = isHexValid && hasGoodContrast(value);
  const textColor = isHexValid ? getTextColor(value) : '#000000';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Popular Colors Palette */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          🎨 Popular Colors
        </label>
        <div
          className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5"
          role="radiogroup"
          aria-label="Popular color palette"
        >
          {PRESET_COLORS.map((color, idx) => (
            <button
              key={color.hex}
              type="button"
              role="radio"
              aria-checked={value.toLowerCase() === color.hex.toLowerCase()}
              aria-label={color.name}
              tabIndex={idx === focusedIndex ? 0 : -1}
              disabled={disabled}
              onClick={() => handleColorChange(color.hex)}
              onKeyDown={(e) => handleColorKeyDown(e, idx, color.hex)}
              className={cn(
                'relative w-full aspect-square rounded-lg border-3 transition-all duration-200',
                'hover:scale-110 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                value.toLowerCase() === color.hex.toLowerCase()
                  ? 'border-primary scale-110 shadow-lg ring-2 ring-primary ring-offset-2'
                  : 'border-border hover:border-primary/50'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {value.toLowerCase() === color.hex.toLowerCase() && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold drop-shadow-md">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LightMyFire Brand Colors */}
      <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
        <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <span>🔥</span>
          LightMyFire Signature Colors
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BRAND_COLORS.map((color) => (
            <button
              key={color.hex}
              type="button"
              disabled={disabled}
              onClick={() => handleColorChange(color.hex)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200',
                'hover:scale-102 active:scale-98',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                value.toLowerCase() === color.hex.toLowerCase()
                  ? 'border-primary bg-primary/10 scale-102 shadow-md'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-md flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {color.icon} {color.name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {color.hex}
                </span>
              </div>
              {value.toLowerCase() === color.hex.toLowerCase() && (
                <span className="ml-auto text-primary font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input (HEX + Native Picker) */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          ✏️ Custom Color
        </label>

        <div className="flex gap-2">
          {/* HEX Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                disabled={disabled}
                placeholder="#FF6B6B"
                maxLength={7}
                className={cn(
                  'w-full px-3 py-2.5 pr-10 rounded-lg border-2 font-mono text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-all duration-200',
                  isHexValid
                    ? 'border-border bg-background text-foreground'
                    : 'border-red-300 bg-red-50 text-red-900'
                )}
                aria-label="HEX color code"
                aria-invalid={!isHexValid}
              />
              {/* Color preview swatch in input */}
              {isHexValid && (
                <div
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md border-2 border-white shadow-sm"
                  style={{ backgroundColor: hexInput }}
                  aria-hidden="true"
                />
              )}
            </div>
            {!isHexValid && hexInput && (
              <p className="text-xs text-red-600 mt-1">
                Invalid HEX format (e.g., #FF6B6B)
              </p>
            )}
          </div>

          {/* Native Color Picker Button */}
          <div className="relative">
            <input
              ref={colorInputRef}
              type="color"
              value={value}
              onChange={handleNativePickerChange}
              disabled={disabled}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Visual color picker"
            />
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                'px-4 py-2.5 rounded-lg border-2 border-border bg-background',
                'hover:bg-accent hover:border-primary/50',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'transition-all duration-200',
                'flex items-center gap-2 font-medium text-sm whitespace-nowrap',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Pick Color</span>
            </button>
          </div>
        </div>
      </div>

      {/* Color History */}
      {history.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            📚 Recently Used
          </label>
          <div className="flex flex-wrap gap-2">
            {history.map((color, idx) => (
              <button
                key={`${color}-${idx}`}
                type="button"
                onClick={() => handleColorChange(color)}
                disabled={disabled}
                className={cn(
                  'w-10 h-10 rounded-lg border-2 transition-all duration-200',
                  'hover:scale-110 active:scale-95',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  value.toLowerCase() === color.toLowerCase()
                    ? 'border-primary scale-110 shadow-md'
                    : 'border-border hover:border-primary/50'
                )}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Recently used color ${color}`}
              >
                {value.toLowerCase() === color.toLowerCase() && (
                  <span className="text-white text-sm font-bold drop-shadow-md">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contrast Warning */}
      {showPreview && isHexValid && (
        <div className="space-y-3">
          {/* Preview with current color */}
          <div className="p-4 rounded-lg border-2 border-border">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              👀 Preview
            </label>
            <div
              className="w-full h-24 rounded-lg border-2 border-border flex items-center justify-center transition-colors duration-200"
              style={{ backgroundColor: value }}
            >
              <span
                className="font-bold text-lg px-4 py-2 rounded-md"
                style={{ color: textColor }}
              >
                Sample Text
              </span>
            </div>
          </div>

          {/* Contrast Accessibility Check */}
          {!hasContrast && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div className="text-xs">
                <p className="font-semibold mb-1">Low Contrast Warning</p>
                <p>
                  Text may be hard to read on this background color. Consider choosing
                  a lighter or darker shade for better readability.
                </p>
              </div>
            </div>
          )}

          {hasContrast && (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <span>✓</span>
              <span>Good contrast - text will be readable</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
