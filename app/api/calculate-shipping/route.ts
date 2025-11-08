import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { VALID_PACK_SIZES } from '@/lib/constants';
import { printful, LIGHTMYFIRE_PRINTFUL_CONFIG } from '@/lib/printful';

// Fallback shipping rates if Printful API fails
// These are approximate rates based on typical Printful pricing
const FALLBACK_SHIPPING_RATES = {
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
    // SECURITY: Rate limit shipping calculations to prevent abuse
    // Use IP-based rate limiting (30 requests per minute)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimitResult = rateLimit(request, 'shipping', ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { countryCode, packSize, address, city, postalCode } = body;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    // Validate pack size if provided
    if (packSize !== undefined && !VALID_PACK_SIZES.includes(packSize)) {
      return NextResponse.json(
        { error: 'Invalid pack size. Must be 10, 20, or 50.' },
        { status: 400 }
      );
    }

    // Calculate number of sticker sheets needed
    const quantity = Math.ceil((packSize || 10) / 10); // 10 stickers per sheet

    // Try to fetch real shipping rates from Printful API
    let printfulRates = null;
    let usedFallback = false;

    if (process.env.PRINTFUL_API_KEY) {
      try {
        // Build shipping request
        const shippingRequest = {
          recipient: {
            address1: address || '123 Main St', // Printful requires address, use placeholder if not provided
            city: city || 'Paris',
            country_code: countryCode,
            zip: postalCode || '75001',
          },
          items: [
            {
              variant_id: LIGHTMYFIRE_PRINTFUL_CONFIG.STICKER_SHEET_VARIANT_ID,
              quantity: quantity,
            },
          ],
          currency: 'EUR',
          locale: 'en_US',
        };

        console.log('Fetching Printful shipping rates:', shippingRequest);
        printfulRates = await printful.calculateShipping(shippingRequest);
        console.log('Printful rates received:', printfulRates);
      } catch (error) {
        console.error('Failed to fetch Printful shipping rates:', error);
        usedFallback = true;
      }
    } else {
      console.warn('PRINTFUL_API_KEY not configured, using fallback rates');
      usedFallback = true;
    }

    // Use Printful rates if available, otherwise use fallback
    let standardRate, expressRate, standardDays, expressDays;

    if (printfulRates && Array.isArray(printfulRates)) {
      // Parse Printful response - it returns an array of shipping options
      // Find standard and express options
      const standardOption = printfulRates.find((rate: any) =>
        rate.name?.toLowerCase().includes('standard') ||
        rate.id?.toLowerCase().includes('standard')
      );
      const expressOption = printfulRates.find((rate: any) =>
        rate.name?.toLowerCase().includes('express') ||
        rate.id?.toLowerCase().includes('express') ||
        rate.minDeliveryDays <= 5
      );

      if (standardOption) {
        standardRate = Math.round(parseFloat(standardOption.rate) * 100); // Convert to cents
        standardDays = `${standardOption.minDeliveryDays}-${standardOption.maxDeliveryDays}`;
      }

      if (expressOption) {
        expressRate = Math.round(parseFloat(expressOption.rate) * 100); // Convert to cents
        expressDays = `${expressOption.minDeliveryDays}-${expressOption.maxDeliveryDays}`;
      }

      // If we didn't find standard/express, use first two options
      if (!standardRate && printfulRates.length > 0) {
        const slowest = printfulRates.reduce((prev: any, curr: any) =>
          curr.maxDeliveryDays > prev.maxDeliveryDays ? curr : prev
        );
        standardRate = Math.round(parseFloat(slowest.rate) * 100);
        standardDays = `${slowest.minDeliveryDays}-${slowest.maxDeliveryDays}`;
      }

      if (!expressRate && printfulRates.length > 1) {
        const fastest = printfulRates.reduce((prev: any, curr: any) =>
          curr.minDeliveryDays < prev.minDeliveryDays ? curr : prev
        );
        expressRate = Math.round(parseFloat(fastest.rate) * 100);
        expressDays = `${fastest.minDeliveryDays}-${fastest.maxDeliveryDays}`;
      }
    }

    // Fallback to static rates if Printful didn't work
    if (!standardRate || !expressRate) {
      usedFallback = true;
      const fallbackRates = FALLBACK_SHIPPING_RATES[countryCode as keyof typeof FALLBACK_SHIPPING_RATES] ||
                           FALLBACK_SHIPPING_RATES.DEFAULT;

      // Adjust rates based on pack size
      const sizeMultiplier = packSize >= 50 ? 1.2 : packSize >= 20 ? 1.1 : 1.0;

      standardRate = standardRate || Math.round(fallbackRates.standard * sizeMultiplier);
      expressRate = expressRate || Math.round(fallbackRates.express * sizeMultiplier);
      standardDays = standardDays || '7-14';
      expressDays = expressDays || '3-5';
    }

    return NextResponse.json({
      success: true,
      rates: {
        standard: {
          name: 'Standard Shipping',
          rate: standardRate,
          currency: 'EUR',
          estimatedDays: standardDays,
        },
        express: {
          name: 'Express Shipping',
          rate: expressRate,
          currency: 'EUR',
          estimatedDays: expressDays,
        },
      },
      usedFallback, // Indicate if fallback rates were used
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
