import { NextRequest, NextResponse } from 'next/server';

// Simplified shipping zones based on typical Printful rates for sticker sheets
// These are approximate rates - actual rates should be fetched from Printful API
const SHIPPING_RATES = {
  // Europe
  FR: { standard: 299, express: 599 }, // €2.99 / €5.99
  DE: { standard: 299, express: 599 },
  ES: { standard: 349, express: 649 },
  IT: { standard: 349, express: 649 },
  PT: { standard: 349, express: 649 },
  NL: { standard: 299, express: 599 },
  BE: { standard: 299, express: 599 },
  AT: { standard: 349, express: 649 },
  DK: { standard: 349, express: 649 },
  SE: { standard: 349, express: 649 },
  FI: { standard: 399, express: 699 },
  PL: { standard: 349, express: 649 },
  CZ: { standard: 349, express: 649 },
  // UK
  GB: { standard: 399, express: 799 },
  // North America
  US: { standard: 499, express: 999 },
  CA: { standard: 549, express: 1099 },
  // Rest of World (default)
  DEFAULT: { standard: 599, express: 1199 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, packSize } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    // Get shipping rates for country
    const rates = SHIPPING_RATES[countryCode as keyof typeof SHIPPING_RATES] || SHIPPING_RATES.DEFAULT;

    // Adjust rates based on pack size (larger packs might have slightly higher shipping)
    const sizeMultiplier = packSize >= 50 ? 1.2 : packSize >= 20 ? 1.1 : 1.0;

    const adjustedRates = {
      standard: Math.round(rates.standard * sizeMultiplier),
      express: Math.round(rates.express * sizeMultiplier),
    };

    return NextResponse.json({
      success: true,
      rates: {
        standard: {
          name: 'Standard Shipping',
          rate: adjustedRates.standard,
          currency: 'EUR',
          estimatedDays: '7-14',
        },
        express: {
          name: 'Express Shipping',
          rate: adjustedRates.express,
          currency: 'EUR',
          estimatedDays: '3-5',
        },
      },
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
