// lib/pricing.ts
// LightMyFire Sticker Pricing Configuration
// Based on comprehensive pricing analysis - see STICKER_PRICING_ANALYSIS.md

/**
 * Sticker pack configurations
 * Prices in cents (e.g., 1990 = €19.90)
 */
export const STICKER_PACKS = {
  PACK_10: {
    size: 10,
    price: 1990, // €19.90
    currency: 'eur',
    description: '10 LightMyFire Stickers',
    pricePerSticker: 199, // €1.99
    discount: 0,
    badge: 'Starter',
    features: [
      'Waterproof vinyl stickers',
      'Unique QR + PIN codes',
      'Free shipping',
      'Lifetime platform access',
    ],
  },
  PACK_20: {
    size: 20,
    price: 2990, // €29.90
    currency: 'eur',
    description: '20 LightMyFire Stickers',
    pricePerSticker: 150, // €1.50
    discount: 25, // 25% discount vs 10-pack
    badge: 'Popular',
    features: [
      'Waterproof vinyl stickers',
      'Unique QR + PIN codes',
      'Free shipping',
      'Lifetime platform access',
      'Save 25% vs 10-pack',
    ],
  },
  PACK_50: {
    size: 50,
    price: 6990, // €69.90
    currency: 'eur',
    description: '50 LightMyFire Stickers',
    pricePerSticker: 140, // €1.40
    discount: 30, // 30% discount vs 10-pack
    badge: 'Best Value',
    features: [
      'Waterproof vinyl stickers',
      'Unique QR + PIN codes',
      'Free shipping',
      'Lifetime platform access',
      'Save 30% vs 10-pack',
    ],
  },
} as const;

export type PackSize = 10 | 20 | 50;

/**
 * Get pack configuration by size
 */
export function getPackConfig(size: PackSize) {
  const configs = {
    10: STICKER_PACKS.PACK_10,
    20: STICKER_PACKS.PACK_20,
    50: STICKER_PACKS.PACK_50,
  };

  return configs[size];
}

/**
 * Stripe fee structure (EU)
 * 2.2% + €0.25 for EU cards (70% of customers)
 * 2.9% + €0.25 for non-EU cards (30% of customers)
 * Average: ~2.2% + €0.25
 */
export const STRIPE_FEE_PERCENTAGE = 0.022; // 2.2%
export const STRIPE_FEE_FIXED = 25; // €0.25 in cents

/**
 * Calculate Stripe processing fee for a given amount
 * @param amountInCents - Amount in cents
 * @returns Fee in cents
 */
export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = amountInCents * STRIPE_FEE_PERCENTAGE;
  const totalFee = percentageFee + STRIPE_FEE_FIXED;
  return Math.ceil(totalFee);
}

/**
 * Calculate net revenue after Stripe fees
 * @param packSize - Pack size (10, 20, or 50)
 * @returns Net revenue in cents
 */
export function calculateNetRevenue(packSize: PackSize): number {
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);
  return config.price - stripeFee;
}

/**
 * Cost breakdown for analytics and margin calculation
 * Based on pre-manufactured stickers at €0.60/sticker
 */
export const COST_STRUCTURE = {
  // Manufacturing cost per sticker (in cents)
  MANUFACTURING_PER_STICKER: 60, // €0.60

  // Shipping costs (free for customer, absorbed in price)
  SHIPPING: {
    SMALL_PACKET: 350, // €3.50 (up to 20 stickers)
    STANDARD: 550, // €5.50 (21-100 stickers)
  },

  // Infrastructure costs (monthly)
  INFRASTRUCTURE_MONTHLY: {
    VERCEL: 2000, // €20
    SUPABASE: 2500, // €25
    DOMAIN_CDN: 500, // €5
    RESEND: 1000, // €10
    TOTAL: 6000, // €60
  },

  // Marketing budget (monthly)
  MARKETING_MONTHLY: 10000, // €100 (launch phase)
};

/**
 * Calculate total cost for a pack
 * @param packSize - Pack size (10, 20, or 50)
 * @param monthlyVolume - Expected monthly volume (in stickers)
 * @returns Total cost breakdown
 */
export function calculatePackCosts(
  packSize: PackSize,
  monthlyVolume: number = 500
) {
  // Manufacturing cost
  const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * packSize;

  // Stripe fee
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);

  // Shipping cost
  const shipping =
    packSize <= 20
      ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
      : COST_STRUCTURE.SHIPPING.STANDARD;

  // Infrastructure cost per sticker
  const infrastructureCostPerSticker =
    COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL / monthlyVolume;
  const infrastructure = Math.ceil(infrastructureCostPerSticker * packSize);

  // Marketing cost per sticker
  const marketingCostPerSticker =
    COST_STRUCTURE.MARKETING_MONTHLY / monthlyVolume;
  const marketing = Math.ceil(marketingCostPerSticker * packSize);

  // Total costs
  const totalCost =
    manufacturing + stripeFee + shipping + infrastructure + marketing;

  // Revenue and margin
  const revenue = config.price;
  const margin = revenue - totalCost;
  const marginPercentage = (margin / revenue) * 100;

  return {
    revenue,
    costs: {
      manufacturing,
      stripeFee,
      shipping,
      infrastructure,
      marketing,
      total: totalCost,
    },
    margin,
    marginPercentage: Number(marginPercentage.toFixed(2)),
  };
}

/**
 * Format price for display
 * @param amountInCents - Amount in cents
 * @param currency - Currency code (default: 'eur')
 * @returns Formatted price string
 */
export function formatPrice(
  amountInCents: number,
  currency: string = 'eur'
): string {
  const amount = amountInCents / 100;

  if (currency.toLowerCase() === 'eur') {
    return `€${amount.toFixed(2)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get all pack configurations in order (for display)
 */
export function getAllPackConfigs() {
  return [
    STICKER_PACKS.PACK_50, // Best value first (anchoring)
    STICKER_PACKS.PACK_20, // Popular second
    STICKER_PACKS.PACK_10, // Starter last
  ];
}

/**
 * Calculate break-even volume
 * How many packs need to be sold per month to cover fixed costs
 */
export function calculateBreakEvenVolume() {
  const fixedCostsMonthly = COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL;

  const results = {
    pack_10: 0,
    pack_20: 0,
    pack_50: 0,
    totalRevenue: 0,
  };

  // For each pack size, calculate how many to break even
  const packSizes: PackSize[] = [10, 20, 50];

  packSizes.forEach((size) => {
    const config = getPackConfig(size);
    const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * size;
    const stripeFee = calculateStripeFee(config.price);
    const shipping =
      size <= 20
        ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
        : COST_STRUCTURE.SHIPPING.STANDARD;

    // Variable cost per pack
    const variableCost = manufacturing + stripeFee + shipping;

    // Contribution margin per pack
    const contributionMargin = config.price - variableCost;

    // Packs needed to cover fixed costs
    const packsNeeded = Math.ceil(fixedCostsMonthly / contributionMargin);

    const key = `pack_${size}` as keyof typeof results;
    results[key] = packsNeeded;
  });

  // Calculate weighted average (assuming equal distribution)
  const avgPacks = Math.ceil(
    (results.pack_10 + results.pack_20 + results.pack_50) / 3
  );
  const avgRevenue =
    (STICKER_PACKS.PACK_10.price * results.pack_10 +
      STICKER_PACKS.PACK_20.price * results.pack_20 +
      STICKER_PACKS.PACK_50.price * results.pack_50) /
    3;

  results.totalRevenue = avgRevenue;

  return {
    ...results,
    averagePacksPerMonth: avgPacks,
    averageRevenueNeeded: Math.ceil(avgRevenue),
  };
}

/**
 * Premium pricing tier (optional, for future use)
 * 20-25% higher prices for premium positioning
 */
export const PREMIUM_PRICING = {
  PACK_10: {
    ...STICKER_PACKS.PACK_10,
    price: 2490, // €24.90
    pricePerSticker: 249, // €2.49
  },
  PACK_20: {
    ...STICKER_PACKS.PACK_20,
    price: 3990, // €39.90
    pricePerSticker: 200, // €2.00
  },
  PACK_50: {
    ...STICKER_PACKS.PACK_50,
    price: 8990, // €89.90
    pricePerSticker: 180, // €1.80
  },
};

/**
 * Discount codes configuration (for future use)
 */
export const DISCOUNT_CODES = {
  EARLY_ADOPTER: {
    code: 'EARLYBIRD',
    percentage: 20, // 20% off
    validUntil: new Date('2025-12-31'),
    description: 'Early adopter discount',
  },
  LAUNCH_SPECIAL: {
    code: 'LAUNCH2025',
    percentage: 15, // 15% off
    validUntil: new Date('2025-02-28'),
    description: 'Launch special',
  },
  FRIEND_REFERRAL: {
    code: 'FRIEND10',
    percentage: 10, // 10% off
    validUntil: null, // No expiry
    description: 'Friend referral discount',
  },
};

/**
 * Apply discount code to price
 */
export function applyDiscount(
  price: number,
  discountCode: keyof typeof DISCOUNT_CODES
): { discountedPrice: number; savings: number; valid: boolean } {
  const discount = DISCOUNT_CODES[discountCode];

  if (!discount) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

  // Check if discount is still valid
  if (discount.validUntil && new Date() > discount.validUntil) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

  const savings = Math.floor((price * discount.percentage) / 100);
  const discountedPrice = price - savings;

  return { discountedPrice, savings, valid: true };
}

/**
 * Regional pricing adjustments (for future international expansion)
 * Based on purchasing power parity
 */
export const REGIONAL_PRICING = {
  EU_WEST: 1.0, // France, Germany, Netherlands (base)
  EU_EAST: 0.75, // Poland, Romania
  UK: 0.95, // United Kingdom
  US_CANADA: 1.1, // United States, Canada
  JAPAN: 1.05, // Japan
  BRAZIL: 0.8, // Brazil
};

/**
 * Get regional price adjustment
 */
export function getRegionalPrice(
  basePrice: number,
  region: keyof typeof REGIONAL_PRICING
): number {
  const multiplier = REGIONAL_PRICING[region] || 1.0;
  return Math.ceil(basePrice * multiplier);
}

/**
 * Pricing analytics helper
 * Calculate key metrics for dashboard
 */
export function getPricingAnalytics(
  packsSold: { size: PackSize; quantity: number }[],
  monthlyVolume: number = 500
) {
  let totalRevenue = 0;
  let totalCosts = 0;
  let totalMargin = 0;

  packsSold.forEach(({ size, quantity }) => {
    const config = getPackConfig(size);
    const costs = calculatePackCosts(size, monthlyVolume);

    const revenue = config.price * quantity;
    const cost = costs.costs.total * quantity;
    const margin = revenue - cost;

    totalRevenue += revenue;
    totalCosts += cost;
    totalMargin += margin;
  });

  const overallMarginPercentage =
    totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCosts,
    totalMargin,
    marginPercentage: Number(overallMarginPercentage.toFixed(2)),
    formattedRevenue: formatPrice(totalRevenue),
    formattedMargin: formatPrice(totalMargin),
  };
}

// Export types
export type PackConfig = typeof STICKER_PACKS.PACK_10;
export type DiscountCode = keyof typeof DISCOUNT_CODES;
export type Region = keyof typeof REGIONAL_PRICING;
