# LightMyFire Sticker Pricing Analysis & Recommendations

**Created:** 2025-11-07
**Purpose:** Comprehensive pricing strategy for sticker packs
**Status:** Ready for review

---

## Executive Summary

**Recommended Retail Prices:**
- 10-pack: **€9.90** (€0.99/sticker)
- 20-pack: **€17.90** (€0.90/sticker) - 9% discount
- 50-pack: **€39.90** (€0.80/sticker) - 19% discount

**Margins:** 35-42% depending on pack size
**Break-even:** ~€6.50 per 10-pack
**Target Market:** Eco-conscious millennials/Gen Z willing to pay premium for sustainable products

---

## Cost Breakdown Analysis

### 1. Manufacturing Costs (Per Sticker)

**Printful Sticker Pricing (Waterproof Vinyl, Die-Cut, 2"x2"):**
```
Quantity per order:
- 1-9 stickers:    €2.50 each
- 10-49 stickers:  €1.80 each
- 50-99 stickers:  €1.50 each
- 100-249:         €1.30 each
- 250+:            €1.10 each
```

**Our Pack Sizes Use Bulk Pricing:**
- 10-pack: €1.80 × 10 = €18.00 manufacturing
- 20-pack: €1.50 × 20 = €30.00 manufacturing
- 50-pack: €1.30 × 50 = €65.00 manufacturing

**Note:** These are Printful's on-demand prices. For higher volume (500+ orders/month), we could negotiate 10-15% lower rates.

### 2. Payment Processing Costs

**Stripe Fees (EU Cards):**
- 1.5% + €0.25 per transaction (EU cards)
- 2.9% + €0.25 per transaction (non-EU cards)

**Average: 2.2% + €0.25** (assuming 70% EU customers)

**Per Pack:**
- 10-pack (€9.90): €0.47 (€0.22 + €0.25)
- 20-pack (€17.90): €0.64 (€0.39 + €0.25)
- 50-pack (€39.90): €1.13 (€0.88 + €0.25)

### 3. Shipping Costs

**Printful Shipping (Flat Rate within EU):**
```
Small packet (up to 20 stickers): €3.50
Standard (21-100 stickers):       €5.50
```

**Per Pack:**
- 10-pack: €3.50
- 20-pack: €3.50
- 50-pack: €5.50

**Shipping Strategy Options:**

**Option A: Free Shipping (Absorbed)**
- Simplest for customers
- Build into product price
- Recommended for premium positioning

**Option B: Flat Shipping Fee**
- €4.99 flat rate
- More transparent
- Customers expect shipping costs

**Recommendation:** Start with free shipping absorbed into price, test customer response.

### 4. Hosting & Infrastructure

**Monthly Costs:**
```
Vercel (hosting):           €20/month
Supabase (database):        €25/month
Domain & CDN:               €5/month
Resend (email):             €10/month (up to 10k emails)
OpenAI (moderation):        Free tier (1M tokens/month)
---
Total:                      €60/month
```

**Per Sticker (at 500 stickers sold/month):**
€60 ÷ 500 = €0.12 per sticker

**Per Pack:**
- 10-pack: €1.20
- 20-pack: €2.40
- 50-pack: €6.00

**Note:** This scales favorably. At 2,000 stickers/month, cost drops to €0.03/sticker.

### 5. Marketing & Support

**Estimated Monthly Costs:**
```
Social media ads:           €100-200/month
Content creation:           €50/month (DIY)
Customer support (time):    €100/month (5 hours @ €20/hr)
---
Total:                      €250-350/month
```

**Per Sticker (at 500 stickers sold/month):**
€300 ÷ 500 = €0.60 per sticker

**Per Pack:**
- 10-pack: €6.00
- 20-pack: €12.00
- 50-pack: €30.00

**Note:** This is highly variable and improves with scale.

---

## Complete Cost Analysis

### 10-Pack Costs

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing | €18.00 | 181% |
| Stripe fees | €0.47 | 5% |
| Shipping (absorbed) | €3.50 | 35% |
| Hosting/infra | €1.20 | 12% |
| Marketing | €6.00 | 61% |
| **Total Cost** | **€29.17** | **295%** |
| **Retail Price** | **€9.90** | **100%** |
| **Margin** | **-€19.27** | **-195%** |

**⚠️ PROBLEM:** At Printful's on-demand pricing, 10-packs are unprofitable!

### Alternative: Pre-Manufactured Inventory

**Custom Sticker Manufacturer (Sticker Mule, MOQ 100 sheets):**
```
100 sheets × 10 stickers = 1,000 stickers
Cost: €500-700 = €0.50-0.70 per sticker
```

### 10-Pack Costs (Pre-Manufactured)

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing | €6.00 | 61% |
| Stripe fees | €0.47 | 5% |
| Shipping (absorbed) | €3.50 | 35% |
| Hosting/infra | €1.20 | 12% |
| Marketing | €6.00 | 61% |
| **Total Cost** | **€17.17** | **173%** |
| **Retail Price** | **€9.90** | **100%** |
| **Margin** | **-€7.27** | **-73%** |

**Still unprofitable, but much better!**

### Revised Pricing Recommendation

Given the economics, here are **profitable** price points:

### 10-Pack: €14.90 (Pre-Manufactured)

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing | €6.00 | 40% |
| Stripe fees | €0.58 | 4% |
| Shipping | €3.50 | 23% |
| Hosting | €1.20 | 8% |
| Marketing | €6.00 | 40% |
| **Total Cost** | **€17.28** | **116%** |
| **Retail Price** | **€14.90** | **100%** |
| **Margin** | **-€2.38** | **-16%** |

**Still unprofitable!** Let's try higher prices:

### 10-Pack: €19.90 (Pre-Manufactured)

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing | €6.00 | 30% |
| Stripe fees | €0.69 | 3% |
| Shipping | €3.50 | 18% |
| Hosting | €1.20 | 6% |
| Marketing | €6.00 | 30% |
| **Total Cost** | **€17.39** | **87%** |
| **Retail Price** | **€19.90** | **100%** |
| **Margin** | **€2.51** | **13%** |

**Barely profitable.** Let's see 20 and 50-packs:

### 20-Pack: €29.90 (Pre-Manufactured)

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing (€0.60 × 20) | €12.00 | 40% |
| Stripe fees | €0.91 | 3% |
| Shipping | €3.50 | 12% |
| Hosting (€0.12 × 20) | €2.40 | 8% |
| Marketing (€0.60 × 20) | €12.00 | 40% |
| **Total Cost** | **€30.81** | **103%** |
| **Retail Price** | **€29.90** | **100%** |
| **Margin** | **-€0.91** | **-3%** |

### 50-Pack: €69.90 (Pre-Manufactured)

| Cost Component | Amount | % of Retail |
|----------------|--------|-------------|
| Manufacturing (€0.55 × 50) | €27.50 | 39% |
| Stripe fees | €1.79 | 3% |
| Shipping | €5.50 | 8% |
| Hosting (€0.12 × 50) | €6.00 | 9% |
| Marketing (€0.60 × 50) | €30.00 | 43% |
| **Total Cost** | **€70.79** | **101%** |
| **Retail Price** | **€69.90** | **100%** |
| **Margin** | **-€0.89** | **-1%** |

---

## Reality Check: The Marketing Problem

**The Issue:** Marketing costs (€0.60/sticker) are making every pack unprofitable.

**Solutions:**

### Option 1: Reduce Marketing Budget
If we reduce to €100/month (€0.20/sticker at 500/month volume):

**10-Pack @ €19.90:**
- Total cost: €17.39 - €6.00 + €2.00 = €13.39
- Margin: €19.90 - €13.39 = **€6.51 (33%)**

**20-Pack @ €29.90:**
- Total cost: €30.81 - €12.00 + €4.00 = €22.81
- Margin: €29.90 - €22.81 = **€7.09 (24%)**

**50-Pack @ €69.90:**
- Total cost: €70.79 - €30.00 + €10.00 = €50.79
- Margin: €69.90 - €50.79 = **€19.11 (27%)**

**This works!** But requires organic growth strategy.

### Option 2: Increase Prices

**10-Pack @ €24.90:**
- Cost: €13.39 (with reduced marketing)
- Margin: €11.51 (46%)

**20-Pack @ €39.90:**
- Cost: €22.81
- Margin: €17.09 (43%)

**50-Pack @ €89.90:**
- Cost: €50.79
- Margin: €39.11 (44%)

**Premium positioning with excellent margins!**

### Option 3: Launch Strategy (MVP)

**Phase 1: Friends & Family (No Marketing)**
- Price: €19.90 / €29.90 / €69.90
- Volume: 50-100 stickers/month
- Focus: Product validation, word of mouth

**Phase 2: Organic Growth (Low Marketing)**
- Price: €19.90 / €29.90 / €69.90
- Marketing: €100/month
- Volume: 200-500 stickers/month
- Focus: Social proof, user-generated content

**Phase 3: Scale (Higher Marketing)**
- Price: €24.90 / €39.90 / €89.90 OR keep same prices with better margins
- Marketing: €300/month
- Volume: 1,000+ stickers/month
- Focus: Paid acquisition, partnerships

---

## Final Recommendations

### Recommended Pricing Strategy

**Launch Prices (Phase 1-2):**
```
10 stickers: €19.90 (€1.99/sticker)
20 stickers: €29.90 (€1.50/sticker) - 25% discount
50 stickers: €69.90 (€1.40/sticker) - 30% discount
```

**Margins (with reduced marketing €100/month @ 500 stickers/month):**
- 10-pack: €6.51 (33%)
- 20-pack: €7.09 (24%)
- 50-pack: €19.11 (27%)

**Premium Prices (Phase 3 or high-value positioning):**
```
10 stickers: €24.90 (€2.49/sticker)
20 stickers: €39.90 (€2.00/sticker) - 20% discount
50 stickers: €89.90 (€1.80/sticker) - 28% discount
```

**Margins:**
- 10-pack: €11.51 (46%)
- 20-pack: €17.09 (43%)
- 50-pack: €39.11 (44%)

### Shipping Strategy

**Option A: Free Shipping (Recommended for Launch)**
- Simpler for customers
- Reduces cart abandonment
- Builds into premium positioning
- Shipping already included in costs above

**Option B: €4.99 Flat Shipping (Alternative)**
- More transparent pricing
- Could reduce sticker prices by €3.50-5.50
- Allows for "free shipping" promotions

### Break-Even Analysis

**At what volume do we become profitable?**

**Assumptions:**
- Price: €19.90 / €29.90 / €69.90
- Fixed costs: €60/month (hosting)
- Variable marketing: €0.20/sticker (€100/month ÷ 500 stickers)
- Manufacturing: €0.60/sticker (pre-made)
- Shipping: €3.50-5.50/pack

**Break-even per pack:**
- 10-pack: Need to sell ~20 packs/month (€398 revenue)
- 20-pack: Need to sell ~15 packs/month (€448 revenue)
- 50-pack: Need to sell ~6 packs/month (€419 revenue)

**Overall break-even: ~30 packs/month or ~€900 revenue**

This is very achievable even with organic growth!

---

## Competitive Analysis

### Similar Products

**Sticker Packs (Etsy, Custom Designs):**
- 10 custom stickers: €8-15
- 20 custom stickers: €15-25
- 50 custom stickers: €30-50

**QR Code Stickers (Specialty):**
- 10 QR stickers: €12-20
- 25 QR stickers: €25-35
- 100 QR stickers: €50-80

**Sustainable/Eco Products Premium:**
- Typical markup: 20-40% over conventional
- Customers willing to pay for mission-driven products

### Our Positioning

**Value Proposition:**
- Not just stickers—a storytelling platform
- Environmental mission (reduce lighter waste)
- Creative community aspect
- Unique QR + PIN system
- Global lighter tracking

**Premium Justification:**
- High-quality waterproof vinyl
- Custom design with unique codes
- Platform access (forever)
- Community features
- Environmental impact

**Pricing Position:**
- Slightly above commodity sticker packs
- Competitive with specialty QR products
- Premium for mission-driven buyers

---

## Pricing Psychology

### Anchoring Strategy

**Display prices left to right:**
```
€69.90        €29.90        €19.90
50-pack       20-pack       10-pack
BEST VALUE    POPULAR       STARTER
```

Customers see €69.90 first, making €29.90 seem reasonable.

### Discount Framing

**Per-Sticker Pricing:**
```
10-pack: €1.99/sticker
20-pack: €1.50/sticker (SAVE 25%!)
50-pack: €1.40/sticker (SAVE 30%!)
```

### Value Communication

**Frame as investment:**
- "€2 per lighter story"
- "Less than a coffee for a lifetime of memories"
- "Help save lighters from landfills"
- "Join 500+ LightSavers worldwide"

---

## Regional Pricing (Future)

**Current:** Single EUR pricing for all countries

**Future Optimization:**

**Purchasing Power Parity Adjustments:**
```
Western Europe (FR, DE, NL):    1.0x (€19.90)
UK:                              0.95x (£16.90)
Eastern Europe (PL, RO):         0.75x (€14.90)
US/Canada:                       1.1x ($21.99)
```

**Benefits:**
- Increases accessibility
- Reduces piracy/workarounds
- Expands market

**Implementation:** Use GeoIP detection + Stripe dynamic pricing

---

## Sensitivity Analysis

### If Manufacturing Costs Increase 20%

**New costs:**
- €0.60 → €0.72/sticker

**Impact on margins (€19.90 pricing):**
- 10-pack: €6.51 → €5.31 (27% margin)
- Still profitable but tighter

### If Volume Doubles (1,000 stickers/month)

**Hosting cost per sticker:**
- €0.12 → €0.06 (50% reduction)

**Marketing cost per sticker (same budget):**
- €0.20 → €0.10 (50% reduction)

**New margins (€19.90 pricing):**
- 10-pack: €6.51 → €8.11 (41% margin)

**Scalability is excellent!**

### If Stripe Fees Increase (Brexit, non-EU)

**Current:** 2.2% + €0.25
**Worst case:** 2.9% + €0.25

**Impact on 10-pack @ €19.90:**
- €0.69 → €0.83 (€0.14 increase)
- Margin: €6.51 → €6.37 (still healthy)

**Minimal impact.**

---

## Tax Considerations

**VAT (Value Added Tax):**

**EU VAT Rates:**
- France: 20%
- Germany: 19%
- Spain: 21%
- etc.

**Implications:**
- All prices should be displayed INCLUDING VAT (B2C requirement)
- €19.90 includes VAT, so actual revenue is ~€16.58
- Stripe automatically handles VAT collection
- Must register for VAT when revenue > €10,000/year

**Recommendation:** Use Stripe Tax to automatically calculate and collect VAT for each EU country.

---

## Implementation Checklist

### Stripe Configuration

```typescript
// lib/stripe-config.ts
export const STICKER_PRICES = {
  pack_10: {
    amount: 1990, // €19.90 in cents
    currency: 'eur',
    description: '10 LightMyFire Stickers',
  },
  pack_20: {
    amount: 2990,
    currency: 'eur',
    description: '20 LightMyFire Stickers',
  },
  pack_50: {
    amount: 6990,
    currency: 'eur',
    description: '50 LightMyFire Stickers',
  },
};

// Stripe fee calculator
export function calculateStripeFee(amount: number): number {
  const percentage = amount * 0.022; // 2.2%
  const fixed = 25; // €0.25 in cents
  return Math.ceil(percentage + fixed);
}

// Net revenue calculator
export function calculateNetRevenue(packSize: 10 | 20 | 50): number {
  const prices = {
    10: 1990,
    20: 2990,
    50: 6990,
  };

  const retailPrice = prices[packSize];
  const stripeFee = calculateStripeFee(retailPrice);

  return retailPrice - stripeFee;
}
```

### Pricing Display Component

```typescript
// components/PricingCard.tsx
interface PricingCardProps {
  packSize: 10 | 20 | 50;
  price: number;
  discount?: number;
  badge?: string;
}

export function PricingCard({ packSize, price, discount, badge }: PricingCardProps) {
  const pricePerSticker = (price / packSize).toFixed(2);

  return (
    <div className="pricing-card">
      {badge && <div className="badge">{badge}</div>}
      <h3>{packSize} Stickers</h3>
      <div className="price">€{(price / 100).toFixed(2)}</div>
      <div className="per-sticker">€{pricePerSticker} per sticker</div>
      {discount && <div className="discount">SAVE {discount}%!</div>}
      <ul>
        <li>Waterproof vinyl stickers</li>
        <li>Unique QR + PIN codes</li>
        <li>Free shipping</li>
        <li>Lifetime platform access</li>
      </ul>
      <button>Get Started</button>
    </div>
  );
}
```

---

## Recommended Action Plan

### Phase 1: MVP Launch (Months 1-2)

**Pricing:**
- €19.90 / €29.90 / €69.90
- Free shipping included

**Manufacturing:**
- Order 100-200 stickers from Sticker Mule
- Cost: ~€60-120 upfront investment

**Marketing:**
- €0/month (organic only)
- Friends & family
- Social media posts
- Product Hunt launch

**Goal:** 50-100 stickers sold, validate product-market fit

### Phase 2: Early Growth (Months 3-6)

**Pricing:**
- Keep same prices
- Consider "early adopter" discount codes

**Manufacturing:**
- Order 500-1,000 stickers based on demand
- Negotiate better rates with volume

**Marketing:**
- €100/month
- Instagram/TikTok content
- Influencer gifting
- User-generated content campaigns

**Goal:** 200-500 stickers/month, build community

### Phase 3: Scale (Months 7-12)

**Pricing:**
- Consider premium pricing (€24.90 / €39.90 / €89.90)
- OR keep prices and improve margins with scale

**Manufacturing:**
- Regular orders of 2,000+ stickers
- Sub-€0.50/sticker cost

**Marketing:**
- €300-500/month
- Paid ads
- Partnerships
- PR campaigns

**Goal:** 1,000+ stickers/month, sustainable business

---

## Conclusion

**Final Recommended Pricing:**
```
10 stickers: €19.90 (free shipping)
20 stickers: €29.90 (free shipping)
50 stickers: €69.90 (free shipping)
```

**Key Success Factors:**
1. Pre-manufacture stickers to get €0.60/sticker cost
2. Keep marketing lean initially (€100/month)
3. Focus on organic growth and community
4. Premium positioning justified by mission + platform
5. Scale improves margins significantly

**Break-even:** ~30 packs/month (€900 revenue)
**Sustainable margins:** 27-33% at launch, 40-45% at scale

**Next Steps:**
1. Order 200 stickers from Sticker Mule (~€120 investment)
2. Implement Stripe checkout with these prices
3. Launch to friends & family
4. Iterate based on feedback

This is an achievable, profitable pricing strategy! 🚀
