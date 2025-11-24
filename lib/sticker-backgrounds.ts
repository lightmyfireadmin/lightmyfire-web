
/**
 * Configuration for sticker background themes.
 * Contains color palettes, illustration keys, and descriptive text for each theme.
 */
export const BACKGROUND_THEMES = {
  FIRE: {
    name: 'Fire & Flame',
    colors: {
      primary: '#FF6B35',
      secondary: '#FFD166',
      accent: '#F25F5C',
      background: '#2C1810',
    },
    illustration: 'flames',
    description: 'Warm orange and red tones with flame illustrations',
  },
  OCEAN: {
    name: 'Ocean Journey',
    colors: {
      primary: '#1E88E5',
      secondary: '#4FC3F7',
      accent: '#0277BD',
      background: '#0D1B2A',
    },
    illustration: 'waves',
    description: 'Cool blue tones with wave and compass illustrations',
  },
  FOREST: {
    name: 'Forest Adventure',
    colors: {
      primary: '#388E3C',
      secondary: '#81C784',
      accent: '#2E7D32',
      background: '#1B3A1C',
    },
    illustration: 'leaves',
    description: 'Green tones with leaf and tree illustrations',
  },
  SUNSET: {
    name: 'Sunset Memories',
    colors: {
      primary: '#FF6F61',
      secondary: '#FFB74D',
      accent: '#F57C00',
      background: '#3E2723',
    },
    illustration: 'sun',
    description: 'Warm sunset tones with sun and mountain illustrations',
  },
  GALAXY: {
    name: 'Galaxy Explorer',
    colors: {
      primary: '#7B1FA2',
      secondary: '#BA68C8',
      accent: '#4A148C',
      background: '#1A0D2E',
    },
    illustration: 'stars',
    description: 'Purple and pink tones with star and planet illustrations',
  },
  MINIMAL: {
    name: 'Minimal Elegance',
    colors: {
      primary: '#424242',
      secondary: '#757575',
      accent: '#212121',
      background: '#FAFAFA',
    },
    illustration: 'geometric',
    description: 'Clean monochrome with geometric patterns',
  },
} as const;

/** Type alias for valid theme keys. */
export type ThemeName = keyof typeof BACKGROUND_THEMES;

/**
 * Sticker sheet dimensions configuration.
 * Defines physical sizes and pixel resolutions for printing at 600 DPI.
 */
export const SHEET_DIMENSIONS = {
  SMALL: {
    width: 4,
    height: 6,
    dpi: 600,
    widthPx: 2400,
    heightPx: 3600,
  },
  MEDIUM: {
    width: 8.5,
    height: 11,
    dpi: 600,
    widthPx: 5100,
    heightPx: 6600,
  },
  LARGE: {
    width: 12,
    height: 18,
    dpi: 600,
    widthPx: 7200,
    heightPx: 10800,
  },
} as const;

/**
 * SVG illustration fragments for corners, keyed by theme illustration type.
 * Each entry contains SVG strings for different corner positions.
 */
export const CORNER_ILLUSTRATIONS = {
  flames: {
    topLeft: `
      <g transform="translate(50, 50)">
        <path d="M 0,80 Q 10,60 15,40 T 20,10 Q 25,20 30,40 T 40,80 Q 30,70 20,70 T 0,80 Z"
              fill="#FF6B35" opacity="0.8"/>
        <path d="M 10,70 Q 15,55 18,40 T 22,15 Q 24,25 28,45 T 35,75 Q 28,68 22,68 T 10,70 Z"
              fill="#FFD166" opacity="0.9"/>
        <path d="M 18,65 Q 20,52 22,40 T 24,20 Q 25,28 27,42 T 30,68 Q 26,62 24,62 T 18,65 Z"
              fill="#F25F5C" opacity="0.95"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-50, 50) scale(-1, 1)">
        <path d="M 0,80 Q 10,60 15,40 T 20,10 Q 25,20 30,40 T 40,80 Q 30,70 20,70 T 0,80 Z"
              fill="#FF6B35" opacity="0.8"/>
        <path d="M 10,70 Q 15,55 18,40 T 22,15 Q 24,25 28,45 T 35,75 Q 28,68 22,68 T 10,70 Z"
              fill="#FFD166" opacity="0.9"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(50, -50) scale(1, -1)">
        <path d="M 0,80 Q 10,60 15,40 T 20,10 Q 25,20 30,40 T 40,80 Q 30,70 20,70 T 0,80 Z"
              fill="#FF6B35" opacity="0.6"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-50, -50) scale(-1, -1)">
        <path d="M 0,80 Q 10,60 15,40 T 20,10 Q 25,20 30,40 T 40,80 Q 30,70 20,70 T 0,80 Z"
              fill="#FF6B35" opacity="0.6"/>
      </g>
    `,
  },
  waves: {
    topLeft: `
      <g transform="translate(20, 20)">
        <path d="M 0,60 Q 20,40 40,50 T 80,60" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.8"/>
        <path d="M 0,70 Q 20,50 40,60 T 80,70" stroke="#1E88E5" stroke-width="3" fill="none" opacity="0.9"/>
        <path d="M 0,80 Q 20,60 40,70 T 80,80" stroke="#0277BD" stroke-width="3" fill="none" opacity="0.7"/>
        <circle cx="70" cy="30" r="15" fill="none" stroke="#4FC3F7" stroke-width="2" opacity="0.6"/>
        <circle cx="70" cy="30" r="10" fill="none" stroke="#4FC3F7" stroke-width="2" opacity="0.8"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-20, 20) scale(-1, 1)">
        <path d="M 0,60 Q 20,40 40,50 T 80,60" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.8"/>
        <path d="M 0,70 Q 20,50 40,60 T 80,70" stroke="#1E88E5" stroke-width="3" fill="none" opacity="0.9"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(20, -20) scale(1, -1)">
        <path d="M 0,60 Q 20,40 40,50 T 80,60" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.6"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-20, -20) scale(-1, -1)">
        <path d="M 0,60 Q 20,40 40,50 T 80,60" stroke="#4FC3F7" stroke-width="3" fill="none" opacity="0.6"/>
      </g>
    `,
  },
  leaves: {
    topLeft: `
      <g transform="translate(40, 40)">
        <path d="M 0,0 Q 10,-15 20,-10 Q 15,0 20,10 Q 10,5 0,0 Z"
              fill="#81C784" opacity="0.8" transform="rotate(-15)"/>
        <path d="M 30,10 Q 40,-5 50,0 Q 45,10 50,20 Q 40,15 30,10 Z"
              fill="#388E3C" opacity="0.9" transform="rotate(15)"/>
        <path d="M 15,30 Q 25,15 35,20 Q 30,30 35,40 Q 25,35 15,30 Z"
              fill="#2E7D32" opacity="0.85" transform="rotate(-30)"/>
        <ellipse cx="40" cy="50" rx="8" ry="15" fill="#81C784" opacity="0.7" transform="rotate(45 40 50)"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-40, 40) scale(-1, 1)">
        <path d="M 0,0 Q 10,-15 20,-10 Q 15,0 20,10 Q 10,5 0,0 Z"
              fill="#81C784" opacity="0.8"/>
        <path d="M 30,10 Q 40,-5 50,0 Q 45,10 50,20 Q 40,15 30,10 Z"
              fill="#388E3C" opacity="0.9"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(40, -40) scale(1, -1)">
        <path d="M 0,0 Q 10,-15 20,-10 Q 15,0 20,10 Q 10,5 0,0 Z"
              fill="#81C784" opacity="0.6"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-40, -40) scale(-1, -1)">
        <path d="M 0,0 Q 10,-15 20,-10 Q 15,0 20,10 Q 10,5 0,0 Z"
              fill="#81C784" opacity="0.6"/>
      </g>
    `,
  },
  sun: {
    topLeft: `
      <g transform="translate(60, 60)">
        <circle cx="0" cy="0" r="30" fill="#FFB74D" opacity="0.8"/>
        <circle cx="0" cy="0" r="20" fill="#FF6F61" opacity="0.9"/>
        <line x1="-40" y1="0" x2="-35" y2="0" stroke="#F57C00" stroke-width="3" opacity="0.8"/>
        <line x1="35" y1="0" x2="40" y2="0" stroke="#F57C00" stroke-width="3" opacity="0.8"/>
        <line x1="0" y1="-40" x2="0" y2="-35" stroke="#F57C00" stroke-width="3" opacity="0.8"/>
        <line x1="0" y1="35" x2="0" y2="40" stroke="#F57C00" stroke-width="3" opacity="0.8"/>
        <line x1="-28" y1="-28" x2="-25" y2="-25" stroke="#F57C00" stroke-width="3" opacity="0.7"/>
        <line x1="25" y1="-28" x2="28" y2="-25" stroke="#F57C00" stroke-width="3" opacity="0.7"/>
        <line x1="-28" y1="25" x2="-25" y2="28" stroke="#F57C00" stroke-width="3" opacity="0.7"/>
        <line x1="25" y1="25" x2="28" y2="28" stroke="#F57C00" stroke-width="3" opacity="0.7"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-60, 60)">
        <path d="M 0,50 L 20,30 L 10,30 L 30,10 L 20,10 L 40,0 L 20,20 L 30,20 L 10,40 L 20,40 L 0,50 Z"
              fill="#FF6F61" opacity="0.7"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(60, -60)">
        <path d="M 0,0 L 15,25 L 30,20 L 20,35 L 35,45 L 15,40 L 10,55 L 5,40 L -10,50 L 0,35 L -15,25 L 0,30 Z"
              fill="#FFB74D" opacity="0.6"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-60, -60)">
        <circle cx="0" cy="0" r="25" fill="#FF6F61" opacity="0.5"/>
        <circle cx="0" cy="0" r="18" fill="#FFB74D" opacity="0.6"/>
      </g>
    `,
  },
  stars: {
    topLeft: `
      <g transform="translate(50, 50)">
        <path d="M 0,-10 L 2,0 L 10,0 L 4,5 L 6,12 L 0,7 L -6,12 L -4,5 L -10,0 L -2,0 Z"
              fill="#BA68C8" opacity="0.9"/>
        <path d="M 40,-5 L 42,-2 L 45,-2 L 43,0 L 44,3 L 40,1 L 36,3 L 37,0 L 35,-2 L 38,-2 Z"
              fill="#7B1FA2" opacity="0.85"/>
        <circle cx="20" cy="30" r="3" fill="#BA68C8" opacity="0.8"/>
        <circle cx="50" cy="25" r="2" fill="#4A148C" opacity="0.7"/>
        <circle cx="10" cy="45" r="2.5" fill="#BA68C8" opacity="0.75"/>
        <path d="M 30,50 L 32,52 L 35,52 L 33,54 L 34,57 L 30,55 L 26,57 L 27,54 L 25,52 L 28,52 Z"
              fill="#7B1FA2" opacity="0.8"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-50, 50) scale(-1, 1)">
        <path d="M 0,-10 L 2,0 L 10,0 L 4,5 L 6,12 L 0,7 L -6,12 L -4,5 L -10,0 L -2,0 Z"
              fill="#BA68C8" opacity="0.9"/>
        <circle cx="20" cy="30" r="3" fill="#BA68C8" opacity="0.8"/>
        <circle cx="50" cy="25" r="2" fill="#4A148C" opacity="0.7"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(50, -50) scale(1, -1)">
        <path d="M 40,-5 L 42,-2 L 45,-2 L 43,0 L 44,3 L 40,1 L 36,3 L 37,0 L 35,-2 L 38,-2 Z"
              fill="#7B1FA2" opacity="0.7"/>
        <circle cx="10" cy="15" r="2" fill="#BA68C8" opacity="0.6"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-50, -50) scale(-1, -1)">
        <circle cx="20" cy="20" r="2.5" fill="#BA68C8" opacity="0.6"/>
        <circle cx="40" cy="10" r="2" fill="#4A148C" opacity="0.5"/>
      </g>
    `,
  },
  geometric: {
    topLeft: `
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="40" height="40" fill="none" stroke="#757575" stroke-width="2" opacity="0.6" transform="rotate(45 20 20)"/>
        <rect x="10" y="10" width="30" height="30" fill="none" stroke="#424242" stroke-width="2" opacity="0.7" transform="rotate(45 25 25)"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#757575" stroke-width="2" opacity="0.6"/>
        <circle cx="50" cy="50" r="10" fill="none" stroke="#424242" stroke-width="2" opacity="0.7"/>
      </g>
    `,
    topRight: `
      <g transform="translate(-30, 30) scale(-1, 1)">
        <rect x="0" y="0" width="40" height="40" fill="none" stroke="#757575" stroke-width="2" opacity="0.6" transform="rotate(45 20 20)"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#757575" stroke-width="2" opacity="0.6"/>
      </g>
    `,
    bottomLeft: `
      <g transform="translate(30, -30) scale(1, -1)">
        <rect x="10" y="10" width="30" height="30" fill="none" stroke="#424242" stroke-width="2" opacity="0.5" transform="rotate(45 25 25)"/>
      </g>
    `,
    bottomRight: `
      <g transform="translate(-30, -30) scale(-1, -1)">
        <circle cx="40" cy="40" r="12" fill="none" stroke="#757575" stroke-width="2" opacity="0.5"/>
      </g>
    `,
  },
};

/**
 * Generates an SVG string for a custom sticker background.
 *
 * The SVG includes:
 * - A solid background color.
 * - A subtle radial gradient overlay.
 * - Decorative corner illustrations based on the selected theme.
 * - A subtle center pattern.
 * - A faint brand watermark at the bottom.
 *
 * @param {ThemeName} [theme='FIRE'] - The theme to use for colors and illustrations.
 * @param {keyof typeof SHEET_DIMENSIONS} [size='MEDIUM'] - The target physical dimensions of the sheet.
 * @returns {string} The complete SVG string.
 */
export function generateStickerBackground(
  theme: ThemeName = 'FIRE',
  size: keyof typeof SHEET_DIMENSIONS = 'MEDIUM'
): string {
  const themeConfig = BACKGROUND_THEMES[theme];
  const dimensions = SHEET_DIMENSIONS[size];
  const illustrations = CORNER_ILLUSTRATIONS[themeConfig.illustration];

  const svg = `
<svg
  width="${dimensions.widthPx}"
  height="${dimensions.heightPx}"
  viewBox="0 0 ${dimensions.widthPx} ${dimensions.heightPx}"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Background -->
  <rect width="${dimensions.widthPx}" height="${dimensions.heightPx}" fill="${themeConfig.colors.background}"/>

  <!-- Gradient overlay -->
  <defs>
    <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${themeConfig.colors.primary};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:${themeConfig.colors.background};stop-opacity:1" />
    </radialGradient>
  </defs>
  <rect width="${dimensions.widthPx}" height="${dimensions.heightPx}" fill="url(#bgGradient)"/>

  <!-- Corner Illustrations -->
  <!-- Top Left -->
  ${illustrations.topLeft}

  <!-- Top Right -->
  <g transform="translate(${dimensions.widthPx}, 0)">
    ${illustrations.topRight}
  </g>

  <!-- Bottom Left -->
  <g transform="translate(0, ${dimensions.heightPx})">
    ${illustrations.bottomLeft}
  </g>

  <!-- Bottom Right -->
  <g transform="translate(${dimensions.widthPx}, ${dimensions.heightPx})">
    ${illustrations.bottomRight}
  </g>

  <!-- Center pattern (subtle) -->
  <g opacity="0.05">
    <pattern id="dots" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <circle cx="50" cy="50" r="3" fill="${themeConfig.colors.primary}"/>
    </pattern>
    <rect width="${dimensions.widthPx}" height="${dimensions.heightPx}" fill="url(#dots)"/>
  </g>

  <!-- Brand watermark (very subtle) -->
  <text
    x="${dimensions.widthPx / 2}"
    y="${dimensions.heightPx - 50}"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="${themeConfig.colors.secondary}"
    opacity="0.15"
    text-anchor="middle"
  >
    LightMyFire
  </text>
</svg>
  `.trim();

  return svg;
}

/**
 * Generates a Base64-encoded Data URL representing the sticker background.
 *
 * This is useful for embedding the background image directly into HTML or other contexts
 * where a URL is required but the file is generated on the fly.
 *
 * @param {ThemeName} [theme='FIRE'] - The theme to use.
 * @param {keyof typeof SHEET_DIMENSIONS} [size='MEDIUM'] - The sheet size.
 * @returns {Promise<string>} A promise resolving to the Data URL string.
 */
export async function generatePrintableBackground(
  theme: ThemeName = 'FIRE',
  size: keyof typeof SHEET_DIMENSIONS = 'MEDIUM'
): Promise<string> {
  const svg = generateStickerBackground(theme, size);

  // Convert to Base64 (this handles unicode correctly in node environment)
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Retrieves a list of all available background themes.
 *
 * @returns {Array} An array of theme objects, each including its ID and properties.
 */
export function getAllThemes() {
  return Object.entries(BACKGROUND_THEMES).map(([key, theme]) => ({
    id: key as ThemeName,
    ...theme,
  }));
}

/**
 * Generates a configuration object for creating a Printful product using a specific theme.
 *
 * This helper function constructs the necessary JSON structure required by Printful's API
 * to create a product variant with the generated background image.
 *
 * @param {ThemeName} [theme='FIRE'] - The theme to apply.
 * @param {keyof typeof SHEET_DIMENSIONS} [size='MEDIUM'] - The size of the sticker sheet.
 * @returns {object} The configuration object compatible with Printful's API.
 */
export function getPrintfulTemplateConfig(
  theme: ThemeName = 'FIRE',
  size: keyof typeof SHEET_DIMENSIONS = 'MEDIUM'
) {
  const dimensions = SHEET_DIMENSIONS[size];

  return {
    variant_id: 9413, // Example variant ID for standard sticker sheet
    files: [
      {
        type: 'back', // Usually applied to back or default area
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/sticker-backgrounds/${theme}/${size}`,
      },
    ],
    options: [
      {
        id: 'stitch_color',
        value: '#FFFFFF', // White background
      },
    ],
    dimensions: {
      width: dimensions.width,
      height: dimensions.height,
      unit: 'inches',
    },
  };
}
