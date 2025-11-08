'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PRESET_COLORS = [
    { hex: '#FF6B6B', name: 'Coral Red' },
  { hex: '#FF8B6B', name: 'Sunset Orange' },
  { hex: '#FFA500', name: 'Warm Orange' },
  { hex: '#FFD700', name: 'Golden Yellow' },
  { hex: '#FFEB3B', name: 'Bright Yellow' },

    { hex: '#90EE90', name: 'Light Green' },
  { hex: '#4CAF50', name: 'Forest Green' },
  { hex: '#20B2AA', name: 'Turquoise' },
  { hex: '#87CEEB', name: 'Sky Blue' },
  { hex: '#4169E1', name: 'Royal Blue' },

    { hex: '#8A2BE2', name: 'Blue Violet' },
  { hex: '#FF1493', name: 'Deep Pink' },
  { hex: '#FFB6C1', name: 'Light Pink' },
  { hex: '#D3D3D3', name: 'Light Gray' },
  { hex: '#808080', name: 'Gray' },
];

const isValidHex = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

const formatHexInput = (input: string): string => {
  let cleaned = input.replace(/[^0-9A-Fa-f]/g, '');
  if (cleaned.length > 6) cleaned = cleaned.slice(0, 6);
  return cleaned ? `#${cleaned.toUpperCase()}` : '';
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

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

const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

const hasGoodContrast = (bgColor: string): boolean => {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  return Math.max(whiteContrast, blackContrast) >= 4.5;
};

const getTextColor = (bgColor: string): string => {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
};

const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / diff + 2) * 60;
    } else {
      h = ((r - g) / diff + 4) * 60;
    }
  }

  return [h, s, v];
};

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

interface ModernColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor: string;
  onColorSelect: (color: string) => void;
}

function ModernColorPickerModal({ isOpen, onClose, initialColor, onColorSelect }: ModernColorPickerModalProps) {
  const [rgb] = hexToRgb(initialColor);
  const [hue, setHue] = useState(rgbToHsv(...hexToRgb(initialColor))[0]);
  const [saturation, setSaturation] = useState(1);
  const [value, setValue] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentColor = rgbToHex(...hsvToRgb(hue, saturation, value));

  useEffect(() => {
    if (!isOpen) return;
    const [h, s, v] = rgbToHsv(...hexToRgb(initialColor));
    setHue(h);
    setSaturation(s);
    setValue(v);
  }, [isOpen, initialColor]);

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

        for (let x = 0; x < width; x++) {
      const s = x / width;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);

            for (let y = 0; y < height; y++) {
        const v = 1 - (y / height);
        const [r, g, b] = hsvToRgb(hue, s, v);
        gradient.addColorStop(y / height, `rgb(${r},${g},${b})`);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x, 0, 1, height);
    }
  }, [hue]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.max(0, Math.min(1, 1 - (y / rect.height)));

    setSaturation(newSaturation);
    setValue(newValue);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleSelect = () => {
    onColorSelect(currentColor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Pick a Color</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {}
        <div className="mb-4">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="w-full h-48 rounded-lg border-2 border-border cursor-crosshair touch-none"
            onClick={handleCanvasClick}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleCanvasMove}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={(e) => {
              setIsDragging(true);
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              const newSaturation = Math.max(0, Math.min(1, x / rect.width));
              const newValue = Math.max(0, Math.min(1, 1 - (y / rect.height)));
              setSaturation(newSaturation);
              setValue(newValue);
            }}
            onTouchMove={(e) => {
              if (!isDragging) return;
              const touch = e.touches[0];
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const x = touch.clientX - rect.left;
              const y = touch.clientY - rect.top;
              const newSaturation = Math.max(0, Math.min(1, x / rect.width));
              const newValue = Math.max(0, Math.min(1, 1 - (y / rect.height)));
              setSaturation(newSaturation);
              setValue(newValue);
            }}
            onTouchEnd={() => setIsDragging(false)}
          />
          {}
          <div
            className="relative -mt-48 pointer-events-none"
            style={{
              left: `${saturation * 100}%`,
              top: `${(1 - value) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: currentColor }} />
          </div>
        </div>

        {}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Hue</label>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full h-8 rounded-lg cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #FF0000 0%, #FFFF00 17%, #00FF00 33%, #00FFFF 50%, #0000FF 67%, #FF00FF 83%, #FF0000 100%)',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          />
        </div>

        {}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-16 h-16 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">HEX Code</label>
            <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm font-semibold text-foreground">
              {currentColor}
            </div>
          </div>
        </div>

        {}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  showPreview?: boolean;
  className?: string;
}

export default function ColorPicker({
  value,
  onChange,
  disabled = false,
  showPreview = true,
  className,
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showColorModal, setShowColorModal] = useState(false);
  const { history, addToHistory } = useColorHistory();

    useEffect(() => {
    setHexInput(value);
  }, [value]);

    const handleColorChange = useCallback((newColor: string, saveToHistory = true) => {
    if (isValidHex(newColor) && !disabled) {
      onChange(newColor);

            if (saveToHistory) {
        addToHistory(newColor);

                if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }
  }, [onChange, addToHistory, disabled]);

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatHexInput(e.target.value);
    setHexInput(formatted);

    if (isValidHex(formatted)) {
      handleColorChange(formatted);
    }
  };

    const handleModernPickerSelect = (newColor: string) => {
    handleColorChange(newColor, true);
  };

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
      {}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          🎨 Popular Colors
        </label>
        <div
          className="flex flex-wrap gap-2"
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
                'relative w-10 h-10 sm:w-8 sm:h-8 rounded-md border-2 transition-all duration-200',
                'hover:scale-105 active:scale-95',
                'focus:outline-none focus:ring-1 focus:ring-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                value.toLowerCase() === color.hex.toLowerCase()
                  ? 'border-primary scale-105 shadow-md ring-1 ring-primary'
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

      {}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          ✏️ Custom Color
        </label>

        <div className="flex gap-2">
          {}
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
              {}
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

          {}
          <button
            type="button"
            onClick={() => setShowColorModal(true)}
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

      {}
      <ModernColorPickerModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        initialColor={value}
        onColorSelect={handleModernPickerSelect}
      />

      {}
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

      {}
      {showPreview && isHexValid && (
        <div className="space-y-3">
          {}
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

          {}
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
