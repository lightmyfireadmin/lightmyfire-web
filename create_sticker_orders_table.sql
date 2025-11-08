-- Create sticker_orders table for tracking sticker purchases
-- This table stores all sticker orders with shipping information and fulfillment status

CREATE TABLE IF NOT EXISTS public.sticker_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id TEXT NOT NULL UNIQUE,

  -- Order details
  quantity INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, failed, canceled

  -- Customer & shipping info
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,

  -- Sticker file storage
  sticker_file_url TEXT,
  sticker_file_size INTEGER,
  lighter_ids UUID[] NOT NULL,
  lighter_names TEXT[] NOT NULL,

  -- Email tracking
  fulfillment_email_sent BOOLEAN DEFAULT FALSE,
  customer_email_sent BOOLEAN DEFAULT FALSE,

  -- Shipping tracking
  tracking_number TEXT,
  tracking_url TEXT,
  carrier TEXT,

  -- Printful integration
  printful_order_id INTEGER,

  -- Order status flags
  on_hold BOOLEAN DEFAULT FALSE,
  hold_reason TEXT,
  failure_reason TEXT,
  cancellation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sticker_orders_user_id ON public.sticker_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_payment_intent ON public.sticker_orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON public.sticker_orders(status);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_created_at ON public.sticker_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.sticker_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.sticker_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert orders (from API)
CREATE POLICY "Service role can insert orders"
  ON public.sticker_orders
  FOR INSERT
  WITH CHECK (true);

-- Service role and admins can update orders
CREATE POLICY "Service role can update orders"
  ON public.sticker_orders
  FOR UPDATE
  USING (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.sticker_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sticker_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sticker_orders_updated_at
  BEFORE UPDATE ON public.sticker_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_sticker_orders_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.sticker_orders IS 'Stores all sticker orders with shipping and fulfillment tracking';
COMMENT ON COLUMN public.sticker_orders.payment_intent_id IS 'Stripe payment intent ID for this order';
COMMENT ON COLUMN public.sticker_orders.lighter_ids IS 'Array of lighter UUIDs associated with this order';
COMMENT ON COLUMN public.sticker_orders.amount_paid IS 'Total amount paid in cents (includes shipping)';
COMMENT ON COLUMN public.sticker_orders.sticker_file_url IS 'Signed URL to download the sticker file from storage';
