

export const STICKER_PACKS = {
  PACK_10: {
    size: 10,
    price: 1990,     currency: 'eur',
    description: '10 LightMyFire Stickers',
    pricePerSticker: 199,     discount: 0,
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
    price: 2990,     currency: 'eur',
    description: '20 LightMyFire Stickers',
    pricePerSticker: 150,     discount: 25,     badge: 'Popular',
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
    price: 6990,     currency: 'eur',
    description: '50 LightMyFire Stickers',
    pricePerSticker: 140,     discount: 30,     badge: 'Best Value',
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

export function getPackConfig(size: PackSize) {
  const configs = {
    10: STICKER_PACKS.PACK_10,
    20: STICKER_PACKS.PACK_20,
    50: STICKER_PACKS.PACK_50,
  };

  return configs[size];
}

export const STRIPE_FEE_PERCENTAGE = 0.022; export const STRIPE_FEE_FIXED = 25; 

export function calculateStripeFee(amountInCents: number): number {
  const percentageFee = amountInCents * STRIPE_FEE_PERCENTAGE;
  const totalFee = percentageFee + STRIPE_FEE_FIXED;
  return Math.ceil(totalFee);
}

export function calculateNetRevenue(packSize: PackSize): number {
  const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);
  return config.price - stripeFee;
}

export const COST_STRUCTURE = {
    MANUFACTURING_PER_STICKER: 60, 
    SHIPPING: {
    SMALL_PACKET: 350,     STANDARD: 550,   },

    INFRASTRUCTURE_MONTHLY: {
    VERCEL: 2000,     SUPABASE: 2500,     DOMAIN_CDN: 500,     RESEND: 1000,     TOTAL: 6000,   },

    MARKETING_MONTHLY: 10000, };

export function calculatePackCosts(
  packSize: PackSize,
  monthlyVolume: number = 500
) {
    const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * packSize;

    const config = getPackConfig(packSize);
  const stripeFee = calculateStripeFee(config.price);

    const shipping =
    packSize <= 20
      ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
      : COST_STRUCTURE.SHIPPING.STANDARD;

    const infrastructureCostPerSticker =
    COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL / monthlyVolume;
  const infrastructure = Math.ceil(infrastructureCostPerSticker * packSize);

    const marketingCostPerSticker =
    COST_STRUCTURE.MARKETING_MONTHLY / monthlyVolume;
  const marketing = Math.ceil(marketingCostPerSticker * packSize);

    const totalCost =
    manufacturing + stripeFee + shipping + infrastructure + marketing;

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

export function getAllPackConfigs() {
  return [
    STICKER_PACKS.PACK_50,     STICKER_PACKS.PACK_20,     STICKER_PACKS.PACK_10,   ];
}

export function calculateBreakEvenVolume() {
  const fixedCostsMonthly = COST_STRUCTURE.INFRASTRUCTURE_MONTHLY.TOTAL;

  const results = {
    pack_10: 0,
    pack_20: 0,
    pack_50: 0,
    totalRevenue: 0,
  };

    const packSizes: PackSize[] = [10, 20, 50];

  packSizes.forEach((size) => {
    const config = getPackConfig(size);
    const manufacturing = COST_STRUCTURE.MANUFACTURING_PER_STICKER * size;
    const stripeFee = calculateStripeFee(config.price);
    const shipping =
      size <= 20
        ? COST_STRUCTURE.SHIPPING.SMALL_PACKET
        : COST_STRUCTURE.SHIPPING.STANDARD;

        const variableCost = manufacturing + stripeFee + shipping;

        const contributionMargin = config.price - variableCost;

        const packsNeeded = Math.ceil(fixedCostsMonthly / contributionMargin);

    const key = `pack_${size}` as keyof typeof results;
    results[key] = packsNeeded;
  });

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

export const PREMIUM_PRICING = {
  PACK_10: {
    ...STICKER_PACKS.PACK_10,
    price: 2490,     pricePerSticker: 249,   },
  PACK_20: {
    ...STICKER_PACKS.PACK_20,
    price: 3990,     pricePerSticker: 200,   },
  PACK_50: {
    ...STICKER_PACKS.PACK_50,
    price: 8990,     pricePerSticker: 180,   },
};

export const DISCOUNT_CODES = {
  EARLY_ADOPTER: {
    code: 'EARLYBIRD',
    percentage: 20,     validUntil: new Date('2025-12-31'),
    description: 'Early adopter discount',
  },
  LAUNCH_SPECIAL: {
    code: 'LAUNCH2025',
    percentage: 15,     validUntil: new Date('2025-02-28'),
    description: 'Launch special',
  },
  FRIEND_REFERRAL: {
    code: 'FRIEND10',
    percentage: 10,     validUntil: null,     description: 'Friend referral discount',
  },
};

export function applyDiscount(
  price: number,
  discountCode: keyof typeof DISCOUNT_CODES
): { discountedPrice: number; savings: number; valid: boolean } {
  const discount = DISCOUNT_CODES[discountCode];

  if (!discount) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

    if (discount.validUntil && new Date() > discount.validUntil) {
    return { discountedPrice: price, savings: 0, valid: false };
  }

  const savings = Math.floor((price * discount.percentage) / 100);
  const discountedPrice = price - savings;

  return { discountedPrice, savings, valid: true };
}

export const REGIONAL_PRICING = {
  EU_WEST: 1.0,   EU_EAST: 0.75,   UK: 0.95,   US_CANADA: 1.1,   JAPAN: 1.05,   BRAZIL: 0.8, };

export function getRegionalPrice(
  basePrice: number,
  region: keyof typeof REGIONAL_PRICING
): number {
  const multiplier = REGIONAL_PRICING[region] || 1.0;
  return Math.ceil(basePrice * multiplier);
}

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

export type PackConfig = typeof STICKER_PACKS.PACK_10;
export type DiscountCode = keyof typeof DISCOUNT_CODES;
export type Region = keyof typeof REGIONAL_PRICING;
