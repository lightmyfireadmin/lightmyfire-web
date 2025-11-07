# LightMyFire Sticker Sheet Technical Specifications

## 📐 Canvas Dimensions

### Print Sheet (Printful Standard)
- **Width:** 5.83 inches (14.8 cm) = **1,749 pixels** @ 300 DPI
- **Height:** 8.27 inches (21.0 cm) = **2,481 pixels** @ 300 DPI
- **Resolution:** 300 DPI (print quality)
- **Format:** PNG with transparent background (kiss-cut requirement)
- **Compression:** Level 9, no filters for maximum quality

### Reserved Branding Area
- **Size:** 3" × 3" (7.62 cm × 7.62 cm) = **900 × 900 pixels**
- **Position:** Bottom-right corner
- **Purpose:** Left transparent for physical background branding
- **Note:** Not part of PNG output, allows customization for events/brands

---

## 🏷️ Individual Sticker Dimensions

### Physical Size
- **Width:** 2 cm = 0.787 inches = **236 pixels** @ 300 DPI
- **Height:** 5 cm = 1.969 inches = **591 pixels** @ 300 DPI
- **Aspect Ratio:** 2:5 (vertical orientation)
- **Purpose:** Designed to fit on standard BIC lighters

### Internal Padding
- **Padding:** 5% of sticker width = **~12 pixels**
- **Content Width:** 224 pixels (236 - 12×2)
- **Content Height:** 567 pixels (591 - 12×2)

---

## 📏 Layout & Spacing

### Gap Between Stickers
- **Gap:** 1.0 cm = 0.394 inches = **118 pixels**
- **Purpose:** Allows proper lighter fit and cutting tolerance
- **Sticker + Gap Width:** 236 + 118 = **354 pixels**
- **Sticker + Gap Height:** 591 + 118 = **709 pixels**

### Grid Layout

#### Top Section (Above reserved area)
- **Available Height:** 2,481 - 900 = **1,581 pixels**
- **Stickers per row:** 4
- **Number of rows:** 2
- **Total stickers:** 8
- **Horizontal centering:** Centered within 1,749px width
- **Vertical offset:** 59 pixels (half gap) from top

#### Bottom-Left Section
- **Available Width:** 1,749 - 900 = **849 pixels**
- **Available Height:** **900 pixels** (reserved area height)
- **Stickers per row:** 2
- **Number of rows:** 1
- **Total stickers:** 2
- **Horizontal centering:** Centered within 849px width

### Total Capacity
- **Maximum stickers per sheet:** 10 stickers
- **Sheets for 10 stickers:** 1 sheet
- **Sheets for 20 stickers:** 2 sheets
- **Sheets for 50 stickers:** 5 sheets

---

## 🎨 Typography

### Font Family
- **Primary Font:** Poppins (custom registered)
  - **Bold text:** Poppins-ExtraBold.ttf
  - **Normal text:** Poppins-Medium.ttf
- **Fallback chain:** `Poppins, Arial, sans-serif`

### Font Sizes (relative to sticker height of 591px)

| Element | Size Formula | Actual Size | Weight |
|---------|--------------|-------------|--------|
| "You found me" | 10% of height | **59px** | Normal |
| Lighter name | 9% of height | **53px** | Bold |
| "Read my story" | 6.5% of height | **38px** | Normal |
| Translations | 5.5% of height | **33px** | Normal |
| URL "or go to" | 5.5% of height | **33px** | Normal |
| URL "lightmyfire.app" | 6% of height | **35px** | Bold |
| "and type my code" | 6.5% of height | **38px** | Normal |
| PIN code | 9% of height | **53px** | Bold |

### Text Alignment
- **All text:** Center-aligned horizontally
- **Baseline:** Varies by element (middle, top)

---

## 🎨 Sticker Layout Breakdown

### 1. Header Card (White Background)
- **Height:** 28% of content height = **159 pixels**
- **Color:** `#ffffff`
- **Content:**
  - Line 1: "You found me" (59px, bold, black)
  - Line 2: "I'm [Lighter Name]" (53px, bold, black)
- **Position:** Top of sticker with padding

### 2. Instruction Section (On colored background)
- **Height:** 18% of sticker height = **106 pixels**
- **Text color:** `#ffffff` (white on colored background)
- **Content:**
  - "Read my story" (38px)
  - "and expand it" (38px)
  - **Translation** in selected language (33px)
- **Spacing:** 75px between main text lines, 14px to translation

### 3. QR Code Section
- **Size:** 25.2% of sticker height = **149 × 149 pixels**
- **Colors:**
  - Dark: `#000000` (black)
  - Light: `#ffffff` (white)
- **Content:** URL with pre-filled PIN
  - Format: `https://lightmyfire.app/?pin=[PIN-CODE]`
- **Margin:** 0 (no white border)
- **Alignment:** Center-aligned horizontally

### 4. URL Card (White Background)
- **Height:** 15% of sticker height = **89 pixels**
- **Color:** `#ffffff`
- **Content:**
  - "or go to" (33px, black)
  - "lightmyfire.app" (35px, bold, black)

### 5. Code Instruction Section (On colored background)
- **Height:** 12% of sticker height = **71 pixels**
- **Text color:** `#ffffff`
- **Content:**
  - "and type my code" (38px)
  - **Translation** in selected language (33px)
- **Spacing:** 75px between lines

### 6. PIN Code Card (White Background)
- **Height:** 14% of sticker height = **83 pixels**
- **Color:** `#ffffff`
- **Content:**
  - PIN code in format "XXX-XXX" (53px, bold, black)
- **Alignment:** Vertically centered within card

### 7. Logo Footer (White Background)
- **Height:** Remaining space = **~120 pixels**
- **Color:** `#ffffff`
- **Content:**
  - LightMyFire logo (LOGOLONG.png)
  - Logo width: 80% of sticker width = **189 pixels**
  - Logo maintains aspect ratio
  - Centered both horizontally and vertically

---

## 📦 Input Data Structure

### Required Fields per Sticker

```typescript
interface StickerData {
  name: string;          // Lighter name (e.g., "Sunset Beach")
  pinCode: string;       // PIN in format "XXX-XXX" (e.g., "ABC-123")
  backgroundColor: string; // Hex color (e.g., "#FF6B6B")
  language: string;      // ISO language code (e.g., "en", "fr", "es")
}
```

### API Request Format

```json
{
  "stickers": [
    {
      "name": "Sunset Beach",
      "pinCode": "ABC-123",
      "backgroundColor": "#FF6B6B",
      "language": "en"
    },
    {
      "name": "Mountain Peak",
      "pinCode": "DEF-456",
      "backgroundColor": "#4ECDC4",
      "language": "fr"
    }
  ],
  "brandingText": "LightMyFire"
}
```

---

## 🌍 Supported Languages

The sticker generation supports translations for 23 languages:

| Language | Code | Example Translation |
|----------|------|---------------------|
| English | `en` | "Read my story" / "and type my code" |
| French | `fr` | "Lis mon histoire et enrichis-la" / "et entre mon code" |
| Spanish | `es` | "Lee mi historia y amplíala" / "e introduce mi código" |
| German | `de` | "Lies meine Geschichte" / "und gib meinen Code ein" |
| Italian | `it` | "Leggi la mia storia" / "e digita il mio codice" |
| Portuguese | `pt` | "Leia minha história" / "e digite meu código" |
| Dutch | `nl` | "Lees mijn verhaal" / "en typ mijn code" |
| Russian | `ru` | "Прочитай мою историю" / "и введи мой код" |
| Polish | `pl` | "Przeczytaj moją historię" / "i wpisz mój kod" |
| Japanese | `ja` | "私の物語を読んで" / "私のコードを入力" |
| Korean | `ko` | "내 이야기를 읽어보세요" / "내 코드를 입력하세요" |
| Chinese (Simplified) | `zh-CN` | "阅读我的故事" / "并输入我的代码" |
| Thai | `th` | "อ่านเรื่องราวของฉัน" / "และพิมพ์รหัสของฉัน" |
| Vietnamese | `vi` | "Đọc câu chuyện của tôi" / "và nhập mã của tôi" |
| Hindi | `hi` | "मेरी कहानी पढ़ें" / "और मेरा कोड टाइप करें" |
| Arabic | `ar` | "اقرأ قصتي ووسعها" / "وأدخل رمزي" |
| Persian | `fa` | "داستان من را بخوانید" / "و کد من را وارد کنید" |
| Urdu | `ur` | "میری کہانی پڑھیں" / "اور میرا کوڈ ٹائپ کریں" |
| Marathi | `mr` | "माझी कथा वाचा" / "आणि माझा कोड टाइप करा" |
| Telugu | `te` | "నా కథ చదవండి" / "మరియు నా కోడ్ టైప్ చేయండి" |
| Indonesian | `id` | "Baca ceritaku" / "dan ketik kodeku" |
| Ukrainian | `uk` | "Прочитай мою історію" / "і введи мій код" |
| Turkish | `tr` | "Hikayemi oku" / "ve kodumu yaz" |

**Note:** If an unsupported language code is provided, defaults to French.

---

## 🎨 Color Palette

### Background Colors (Examples)
Stickers support any hex color for the main background. Popular choices:
- Coral Red: `#FF6B6B`
- Turquoise: `#4ECDC4`
- Sky Blue: `#45B7D1`
- Mint Green: `#96CEB4`
- Sunny Yellow: `#FFEAA7`
- Cool Gray: `#DFE6E9`
- Ocean Blue: `#74B9FF`
- Purple: `#A29BFE`
- Pink: `#FD79A8`
- Golden: `#FDCB6E`

### Fixed Colors
- **White cards:** `#ffffff`
- **Text on white:** `#000000` (black)
- **Text on colored background:** `#ffffff` (white)
- **QR code:** Black (`#000000`) and White (`#ffffff`)

---

## 🖼️ Required Assets

### Logo File
- **Path:** `/public/LOGOLONG.png`
- **Format:** PNG with transparency
- **Usage:** Displayed at bottom of each sticker
- **Scaling:** Width = 80% of sticker width, maintains aspect ratio

### Font Files
- **Path:** `/public/fonts/`
- **Required files:**
  - `Poppins-ExtraBold.ttf` (for bold text)
  - `Poppins-Medium.ttf` (for normal weight text)
- **Registration:** Fonts must be registered with node-canvas before use

---

## 🔧 Technical Implementation

### Canvas Library
- **Library:** `node-canvas` (npm package: `canvas`)
- **Backend:** Cairo graphics library
- **Capabilities:** Server-side Canvas API implementation

### Pixel-Perfect Rendering Settings
For crisp text and graphics without anti-aliasing blur:
```javascript
ctx.imageSmoothingEnabled = false;
ctx.antialias = 'none';
ctx.textDrawingMode = 'glyph';
```

### Kiss-Cut Rounded Corners
- **Main sticker shape:** 8% radius (rounded corners for kiss-cut appearance)
- **White content cards:** 4% radius (subtle rounded corners)
- **Implementation:** Custom `roundRect()` function using quadratic curves

### Auto-Contrasting Text Color
- **Algorithm:** Calculates luminance of background color using sRGB conversion
- **Threshold:** 0.5 luminance (light backgrounds get black text, dark get white)
- **Applies to:** Text rendered directly on colored background
- **Benefit:** Ensures readability on both light and dark backgrounds (e.g., #FFEAA7 yellow gets black text)

### QR Code on White Card
- **Card size:** 148×148 pixels with rounded corners
- **QR code size:** 132×132 pixels centered within card
- **Benefit:** Improved scannability with consistent white background regardless of sticker color

### Background Layer Overlay
- **File:** `/public/newassets/sticker_bg_layer.png`
- **Position:** Between colored background and white content cards
- **Purpose:** Decorative overlay for visual depth

### PNG Export Settings
```javascript
canvas.toBuffer('image/png', {
  compressionLevel: 9,        // Maximum compression
  filters: Canvas.PNG_FILTER_NONE  // No filtering for quality
});
```

### QR Code Generation
- **Library:** `qrcode` (npm)
- **Output:** Data URL (base64 encoded PNG)
- **Settings:**
  - Width: 149px
  - Margin: 0
  - Error correction: Default (Medium)

---

## 📊 Grid Calculation Summary

```
Sheet Dimensions: 1749 × 2481 pixels

Top Section:
├─ Available: 1749 × 1581 pixels
├─ Grid: 4 columns × 2 rows
├─ Stickers: 8 total
└─ Centered with ~177px horizontal margin

Bottom-Left Section:
├─ Available: 849 × 900 pixels
├─ Grid: 2 columns × 1 row
├─ Stickers: 2 total
└─ Centered with ~89px horizontal margin

Reserved Area (Bottom-Right):
├─ Size: 900 × 900 pixels
└─ Content: Transparent (for physical background branding)

Total Capacity: 10 stickers per sheet
```

---

## 🧪 Testing Endpoints

### Development Test Page
- **URL:** `http://localhost:3000/[locale]/test-stickers-page`
- **Purpose:** Visual interface for testing sticker generation
- **Available:** Development only (blocked in production)

### API Endpoint
- **URL:** `/api/test-generate-stickers`
- **Methods:**
  - GET: Generate 10 default test stickers
  - POST: Generate custom count with body `{"count": 10|20|50}`
- **Available:** Development only (blocked in production)

---

## 📝 Notes

1. **Transparent Background:** Essential for Printful kiss-cut stickers - only sticker shapes are cut, not the full rectangle
2. **High DPI:** 300 DPI ensures print quality for physical products
3. **Rounded Corners:** Main sticker has 8% radius for kiss-cut appearance; white cards have 4% radius for polish
4. **Auto-Contrasting Text:** Automatically uses black text on light backgrounds (luminance > 0.5) and white text on dark backgrounds
5. **QR Scannability:** QR codes are placed on white cards for consistent scanning regardless of background color
6. **Background Overlay:** sticker_bg_layer.png adds decorative depth between background and content
7. **Pixel-Perfect Rendering:** Anti-aliasing disabled for crisp text and graphics without blur
8. **Centering:** Stickers are centered in their sections to maintain visual balance
9. **Gap Purpose:** 1cm gap provides cutting tolerance and ensures proper lighter fit
10. **Reserved Area:** Left transparent to allow physical background customization for events, brands, etc.
11. **Font Registration:** Fonts must be registered before canvas creation due to node-canvas requirements
12. **QR URL Format:** Points to index page with PIN query parameter to maintain app context
13. **Aspect Ratio:** 2:5 vertical ratio specifically designed for BIC lighter dimensions

---

## 🔗 Related Files

- **Generator:** `/app/api/generate-printful-stickers/route.ts`
- **Test Endpoint:** `/app/api/test-generate-stickers/route.ts`
- **Test Page:** `/app/[locale]/test-stickers-page/page.tsx`
- **Order Processing:** `/app/api/process-sticker-order/route.ts`
- **Font Assets:** `/public/fonts/Poppins-*.ttf`
- **Logo Asset:** `/public/LOGOLONG.png`

---

## 📅 Version History

- **v1.0** - Initial Printful-compatible generation
- **v1.1** - Added Poppins font registration
- **v1.2** - Updated QR codes to point to index page with PIN
- **v1.3** - Added comprehensive multi-language support (23 languages)
- **v1.4** - Added development testing utilities
- **v1.5** - Pixel-perfect rendering + rounded corners + background overlay layer
- **v1.6** - Auto-contrasting text colors + QR code on white card for better scannability

---

*Document generated: 2025*
*Implementation: LightMyFire Web Application*
*Technology: Node Canvas + Printful Kiss-Cut Stickers*
