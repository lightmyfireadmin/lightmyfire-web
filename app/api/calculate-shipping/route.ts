import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { VALID_PACK_SIZES } from '@/lib/constants';
import { printful, LIGHTMYFIRE_PRINTFUL_CONFIG } from '@/lib/printful';
import { logger } from '@/lib/logger';
import { withCache, generateCacheKey, CacheTTL } from '@/lib/cache';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/api-response';

interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  currency: string;
}

const FALLBACK_SHIPPING_RATES = {
    FR: { standard: 299, express: 599 },   DE: { standard: 299, express: 599 },
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
    GB: { standard: 399, express: 799 },
    US: { standard: 499, express: 999 },
  CA: { standard: 549, express: 1099 },
    DEFAULT: { standard: 599, express: 1199 },
};

export async function POST(request: NextRequest) {
  try {
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const rateLimitResult = rateLimit(request, 'shipping', ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many requests. Please try again later.',
          { resetTime: rateLimitResult.resetTime }
        ),
        { status: 429 }
      );
    }

    const body = await request.json();
    const { countryCode, packSize, address, city, postalCode } = body;

    if (!countryCode) {
      return NextResponse.json(
        createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Country code is required'),
        { status: 400 }
      );
    }

        if (packSize !== undefined && !VALID_PACK_SIZES.includes(packSize)) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid pack size. Must be 10, 20, or 50.',
          { validSizes: VALID_PACK_SIZES }
        ),
        { status: 400 }
      );
    }

        const quantity = Math.ceil((packSize || 10) / 10);
        let printfulRates = null;
    let usedFallback = false;

    if (process.env.PRINTFUL_API_KEY) {
      try {
        // Generate cache key based on country and pack size
        const cacheKey = generateCacheKey('shipping', countryCode, packSize || 10);

        logger.info('Fetching Printful shipping rates', {
          countryCode,
          packSize,
          quantity,
          variantId: LIGHTMYFIRE_PRINTFUL_CONFIG.STICKER_SHEET_VARIANT_ID,
          cacheKey
        });

        // Fetch shipping rates with caching (5 minute TTL)
        printfulRates = await withCache(
          cacheKey,
          async () => {
            const shippingRequest = {
              recipient: {
                address1: address || '123 Main St',                 city: city || 'Paris',
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

            return printful.calculateShipping(shippingRequest);
          },
          CacheTTL.MEDIUM // 5 minutes cache
        );

        logger.info('Printful rates received', {
          countryCode,
          ratesCount: printfulRates?.length || 0,
          usedFallback: false,
          cached: false // Will be true if served from cache
        });
      } catch (error) {
        logger.error('Failed to fetch Printful shipping rates', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          apiKeyPresent: Boolean(process.env.PRINTFUL_API_KEY),
          variantId: LIGHTMYFIRE_PRINTFUL_CONFIG.STICKER_SHEET_VARIANT_ID,
        });
        usedFallback = true;
      }
    } else {
      logger.warn('PRINTFUL_API_KEY not configured, using fallback rates');
      usedFallback = true;
    }

        let standardRate, expressRate, standardDays, expressDays;

    if (printfulRates && Array.isArray(printfulRates)) {
                  const standardOption = (printfulRates as PrintfulShippingRate[]).find((rate) =>
        rate.name?.toLowerCase().includes('standard') ||
        rate.id?.toLowerCase().includes('standard')
      );
      const expressOption = (printfulRates as PrintfulShippingRate[]).find((rate) =>
        rate.name?.toLowerCase().includes('express') ||
        rate.id?.toLowerCase().includes('express') ||
        rate.minDeliveryDays <= 5
      );

      if (standardOption) {
        standardRate = Math.round(parseFloat(standardOption.rate) * 100);         standardDays = `${standardOption.minDeliveryDays}-${standardOption.maxDeliveryDays}`;
      }

      if (expressOption) {
        expressRate = Math.round(parseFloat(expressOption.rate) * 100);         expressDays = `${expressOption.minDeliveryDays}-${expressOption.maxDeliveryDays}`;
      }

            if (!standardRate && printfulRates.length > 0) {
        const slowest = (printfulRates as PrintfulShippingRate[]).reduce((prev, curr) =>
          curr.maxDeliveryDays > prev.maxDeliveryDays ? curr : prev
        );
        standardRate = Math.round(parseFloat(slowest.rate) * 100);
        standardDays = `${slowest.minDeliveryDays}-${slowest.maxDeliveryDays}`;
      }

      if (!expressRate && printfulRates.length > 1) {
        const fastest = (printfulRates as PrintfulShippingRate[]).reduce((prev, curr) =>
          curr.minDeliveryDays < prev.minDeliveryDays ? curr : prev
        );
        expressRate = Math.round(parseFloat(fastest.rate) * 100);
        expressDays = `${fastest.minDeliveryDays}-${fastest.maxDeliveryDays}`;
      }
    }

        if (!standardRate || !expressRate) {
      usedFallback = true;
      const fallbackRates = FALLBACK_SHIPPING_RATES[countryCode as keyof typeof FALLBACK_SHIPPING_RATES] ||
                           FALLBACK_SHIPPING_RATES.DEFAULT;

            const sizeMultiplier = packSize >= 50 ? 1.2 : packSize >= 20 ? 1.1 : 1.0;

      standardRate = standardRate || Math.round(fallbackRates.standard * sizeMultiplier);
      expressRate = expressRate || Math.round(fallbackRates.express * sizeMultiplier);
      standardDays = standardDays || '7-14';
      expressDays = expressDays || '3-5';
    }

    return NextResponse.json(
      createSuccessResponse(
        {
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
          usedFallback,
        },
        'Shipping rates calculated successfully'
      )
    );
  } catch (error) {
    logger.error('Shipping calculation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      createErrorResponse(ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to calculate shipping'),
      { status: 500 }
    );
  }
}
