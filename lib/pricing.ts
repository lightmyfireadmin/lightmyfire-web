
/**
 * Sticker pack configurations.
 * Prices are in cents (EUR).
 */
export const STICKER_PACKS = {
  PACK_10: {
    size: 10,
    price: 1990, // €19.90
    currency: 'eur',
    description: '10 LightMyFire Stickers',
    pricePerSticker: 199, // €1.99 each
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
    pricePerSticker: 150, // €1.50 each
    discount: 25, // 25% savings vs 10 pack
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
    pricePerSticker: 140, // €1.40 each
    discount: 30, // 30% savings vs 10 pack
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
 * Retrieves configuration for a specific pack size.
 *
 * @param {PackSize} size - The size of the sticker pack.
 * @returns {object} The pack configuration object.
 */
export function getPackConfig(size: PackSize) {
  const configs = {
    10: STICKER_PACKS.PACK_10,
    20: STICKER_PACKS.PACK_20,
    50: STICKER_PACKS.PACK_50,
  };

  return configs[size];
}

export const STRIPE_FEE_PERCENTAGE = 0.022; // 2.2%
export const STRIPE_FEE_FIXED = 25; // 25 cents

/**
 * Calculates Stripe processing fees.
 *
 * @param {number} amountInCents - Transaction amount in cents.
 * @returns {number} The calculated fee in cents.
 */
export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = amountInCents * STRIPE_FEE_PERCENTAGE;
  const totalFee = percentageFee + STRIPE_FEE_FIXED;
  return Math.ceil(totalFee);
}

/**
 * Calculates net revenue after Stripe fees.
 *
 * @param {PackSize} packSize - The size of the sticker pack.
 * @returns {number} Net revenue in cents.
 */
export function calculateNetRevenue(packSize: PackSize): number {
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);
  return config.price - stripeFee;
}

/**
 * Cost structure estimates (in cents unless specified).
 */
export const COST_STRUCTURE = {
  // Direct Costs
  MANUFACTURING_PER_STICKER: 60, // €0.60 per sticker (high quality vinyl)

  // Shipping (Average)
  SHIPPING: {
    SMALL_PACKET: 350, // €3.50 (10-20 stickers)
    STANDARD: 550, // €5.50 (50 stickers)
  },

  // Fixed Monthly Costs (Estimated)
  INFRASTRUCTURE_MONTHLY: {
    VERCEL: 2000, // €20
    SUPABASE: 2500, // €25
    DOMAIN_CDN: 500, // €5
    RESEND: 1000, // €10
    TOTAL: 6000, // €60 total fixed costs
  },

  // Marketing (Estimated per month)
  MARKETING_MONTHLY: 10000, // €100
};

/**
 * Calculates detailed costs and margins for a sticker pack.
 *
 * @param {PackSize} packSize - The size of the sticker pack.
 * @param {number} [monthlyVolume=500] - Estimated monthly volume of stickers sold.
 * @returns {object} Detailed cost and margin breakdown.
 */
export function calculatePackCosts(
  packSize: PackSize,
  monthlyVolume = 500
) {
  // Manufacturing Cost
  const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * packSize;

  // Stripe Fee
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);

  // Shipping Cost
  const shipping =
    packSize <= 20
      ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
      : COST_STRUCTURE.SHIPPING.STANDARD;

  // Infrastructure Allocation (Per Pack)
  const infrastructureCostPerSticker =
    COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL / monthlyVolume;
  const infrastructure = Math.ceil(infrastructureCostPerSticker * packSize);

  // Marketing Allocation (Per Pack)
  const marketingCostPerSticker =
    COST_STRUCTURE.MARKETING_MONTHLY / monthlyVolume;
  const marketing = Math.ceil(marketingCostPerSticker * packSize);

  // Total Cost
  const totalCost =
    manufacturing + stripeFee + shipping + infrastructure + marketing;

  // Margins
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
 * Formats a price in cents to a localized currency string.
 *
 * @param {number} amountInCents - Amount in cents.
 * @param {string} [currency='eur'] - Currency code.
 * @returns {string} Formatted price string.
 */
export function formatPrice(
  amountInCents: number,
  currency = 'eur'
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
 * Returns all sticker pack configurations sorted by value.
 *
 * @returns {Array} Array of sticker pack configurations.
 */
export function getAllPackConfigs() {
  return [
    STICKER_PACKS.PACK_50, // Best Value first
    STICKER_PACKS.PACK_20, // Popular
    STICKER_PACKS.PACK_10, // Starter
  ];
}

/**
 * Calculates the break-even volume needed to cover fixed costs.
 *
 * @returns {object} Break-even analysis results.
 */
export function calculateBreakEvenVolume() {
  const fixedCostsMonthly = COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL;

  const results = {
    pack_10: 0,
    pack_20: 0,
    pack_50: 0,
    totalRevenue: 0,
  };

  // Calculate contribution margin for each pack
  const packSizes: PackSize[] = [10, 20, 50];

  packSizes.forEach((size) => {
    const config = getPackConfig(size);
    const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * size;
    const stripeFee = calculateStripeFee(config.price);
    const shipping =
      size <= 20
        ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
        : COST_STRUCTURE.SHIPPING.STANDARD;

    // Variable costs only (exclude fixed allocations)
    const variableCost = manufacturing + stripeFee + shipping;

    // Contribution Margin = Revenue - Variable Costs
    const contributionMargin = config.price - variableCost;

    // Break Even Units = Fixed Costs / Contribution Margin
    const packsNeeded = Math.ceil(fixedCostsMonthly / contributionMargin);

    const key = `pack_${size}` as keyof typeof results;
    results[key] = packsNeeded;
  });

  // Average scenario (assuming equal distribution)
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
 * Experimental: Premium pricing strategy.
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
 * Discount codes configuration.
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
    validUntil: null, // No expiration
    description: 'Friend referral discount',
  },
};

/**
 * Applies a discount code to a price.
 *
 * @param {number} price - The original price.
 * @param {DiscountCode} discountCode - The discount code key.
 * @returns {object} The discounted price, savings, and validity.
 */
export function applyDiscount(
  price: number,
  discountCode: keyof typeof DISCOUNT_CODES
): { discountedPrice: number; savings: number; valid: boolean } {
  const discount = DISCOUNT_CODES[discountCode];

  if (!discount) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

  // Check expiration
  if (discount.validUntil && new Date() > discount.validUntil) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

  const savings = Math.floor((price * discount.percentage) / 100);
  const discountedPrice = price - savings;

  return { discountedPrice, savings, valid: true };
}

/**
 * Regional pricing multipliers (Purchase Power Parity adjustments).
 */
export const REGIONAL_PRICING = {
  EU_WEST: 1.0, // Base
  EU_EAST: 0.75, // -25%
  UK: 0.95, // -5%
  US_CANADA: 1.1, // +10%
  JAPAN: 1.05, // +5%
  BRAZIL: 0.8, // -20%
};

/**
 * Calculates regional price based on multipliers.
 *
 * @param {number} basePrice - The base price.
 * @param {Region} region - The region key.
 * @returns {number} The regional price.
 */
export function getRegionalPrice(
  basePrice: number,
  region: keyof typeof REGIONAL_PRICING
): number {
  const multiplier = REGIONAL_PRICING[region] || 1.0;
  return Math.ceil(basePrice * multiplier);
}

/**
 * Generates pricing analytics based on sales volume.
 *
 * @param {Array} packsSold - Array of objects with size and quantity.
 * @param {number} [monthlyVolume=500] - Estimated monthly volume.
 * @returns {object} Analytics data including revenue, costs, and margins.
 */
export function getPricingAnalytics(
  packsSold: { size: PackSize; quantity: number }[],
  monthlyVolume = 500
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

export type PackConfig = typeof STICKER_PACKS.PACK_10;
export type DiscountCode = keyof typeof DISCOUNT_CODES;
export type Region = keyof typeof REGIONAL_PRICING;
