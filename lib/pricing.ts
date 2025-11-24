/**
 * Sticker pack configurations.
 * Defines the pricing, quantity, and features for each available sticker pack.
 * Prices are stored in cents (EUR) to avoid floating-point precision issues.
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

/**
 * Type representing valid sticker pack sizes.
 */
export type PackSize = 10 | 20 | 50;

/**
 * Retrieves the configuration object for a specific sticker pack size.
 *
 * @param {PackSize} size - The number of stickers in the pack (10, 20, or 50).
 * @returns {PackConfig} The configuration object for the requested pack size.
 */
export function getPackConfig(size: PackSize) {
  const configs = {
    10: STICKER_PACKS.PACK_10,
    20: STICKER_PACKS.PACK_20,
    50: STICKER_PACKS.PACK_50,
  };

  return configs[size];
}

/** Percentage fee charged by Stripe (2.2%). */
export const STRIPE_FEE_PERCENTAGE = 0.022;
/** Fixed fee charged by Stripe per transaction (25 cents). */
export const STRIPE_FEE_FIXED = 25;

/**
 * Calculates the processing fees charged by Stripe for a given transaction amount.
 *
 * @param {number} amountInCents - The total transaction amount in cents.
 * @returns {number} The calculated Stripe fee in cents (rounded up).
 */
export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = amountInCents * STRIPE_FEE_PERCENTAGE;
  const totalFee = percentageFee + STRIPE_FEE_FIXED;
  return Math.ceil(totalFee);
}

/**
 * Calculates the net revenue from a sticker pack sale after deducting Stripe fees.
 *
 * @param {PackSize} packSize - The size of the sticker pack sold.
 * @returns {number} The net revenue in cents.
 */
export function calculateNetRevenue(packSize: PackSize): number {
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);
  return config.price - stripeFee;
}

/**
 * Estimated cost structure for business operations (in cents unless otherwise noted).
 * Used for margin analysis and financial projections.
 */
export const COST_STRUCTURE = {
  // Direct Costs
  /** Cost to manufacture a single high-quality vinyl sticker. */
  MANUFACTURING_PER_STICKER: 60, // €0.60

  // Shipping (Average)
  SHIPPING: {
    /** Average shipping cost for small packets (10-20 stickers). */
    SMALL_PACKET: 350, // €3.50
    /** Average shipping cost for standard packets (50 stickers). */
    STANDARD: 550, // €5.50
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
 * Calculates detailed costs and profit margins for a specific sticker pack.
 *
 * This function takes into account direct manufacturing costs, shipping, transaction fees,
 * and allocates a portion of fixed monthly infrastructure and marketing costs based on volume.
 *
 * @param {PackSize} packSize - The size of the sticker pack.
 * @param {number} [monthlyVolume=500] - Estimated total monthly volume of stickers sold (used for cost allocation).
 * @returns {object} An object containing breakdown of costs, total cost, revenue, margin, and margin percentage.
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
 * Formats a monetary amount in cents into a localized currency string.
 *
 * @param {number} amountInCents - The amount to format, in cents.
 * @param {string} [currency='eur'] - The ISO currency code (default: 'eur').
 * @returns {string} The formatted price string (e.g., "€19.90").
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
 * Retrieves all available sticker pack configurations, sorted by perceived value.
 * The order is: Best Value (50), Popular (20), Starter (10).
 *
 * @returns {Array<PackConfig>} An array of pack configuration objects.
 */
export function getAllPackConfigs() {
  return [
    STICKER_PACKS.PACK_50, // Best Value first
    STICKER_PACKS.PACK_20, // Popular
    STICKER_PACKS.PACK_10, // Starter
  ];
}

/**
 * Calculates the break-even sales volume required to cover fixed monthly costs.
 *
 * This analysis considers the contribution margin of each pack size to determine
 * how many units need to be sold to offset the fixed infrastructure costs.
 *
 * @returns {object} An object containing the number of packs needed for each size to break even individually,
 *                   as well as an average scenario.
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
 * Experimental pricing configuration for premium positioning.
 * Contains adjusted prices for testing market elasticity.
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
 * Configuration for active discount codes.
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
 * Applies a discount code to a base price if valid.
 *
 * @param {number} price - The original price in cents.
 * @param {DiscountCode} discountCode - The identifier key for the discount code.
 * @returns {{ discountedPrice: number; savings: number; valid: boolean }} An object containing the new price, amount saved, and validity status.
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
 * Regional pricing multipliers used to adjust prices based on Purchasing Power Parity (PPP).
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
 * Calculates the adjusted price for a specific region.
 *
 * @param {number} basePrice - The base price in cents.
 * @param {Region} region - The target region key.
 * @returns {number} The adjusted regional price in cents.
 */
export function getRegionalPrice(
  basePrice: number,
  region: keyof typeof REGIONAL_PRICING
): number {
  const multiplier = REGIONAL_PRICING[region] || 1.0;
  return Math.ceil(basePrice * multiplier);
}

/**
 * Generates consolidated pricing analytics for a batch of sales.
 * useful for reporting and monitoring business performance.
 *
 * @param {Array<{ size: PackSize; quantity: number }>} packsSold - List of packs sold with their quantities.
 * @param {number} [monthlyVolume=500] - Estimated monthly volume context for cost calculations.
 * @returns {object} An object containing aggregated revenue, costs, margins, and formatted strings.
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

/** Type definition for a sticker pack configuration object. */
export type PackConfig = typeof STICKER_PACKS.PACK_10;
/** Type alias for valid discount code keys. */
export type DiscountCode = keyof typeof DISCOUNT_CODES;
/** Type alias for supported pricing regions. */
export type Region = keyof typeof REGIONAL_PRICING;
