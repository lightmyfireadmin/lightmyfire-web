-- Migration script to add missing columns to sticker_orders table
-- This adds all columns needed for the My Orders functionality

-- Add lighter_names array (for display)
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS lighter_names TEXT[];

-- Add status column (pending, processing, shipped, delivered, failed, canceled)
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add paid_at timestamp
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add tracking information columns
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Add Printful integration
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS printful_order_id INTEGER;

-- Add order status flags
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS on_hold BOOLEAN DEFAULT FALSE;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS hold_reason TEXT;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add delivery timestamps
ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

ALTER TABLE public.sticker_orders
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Update existing rows to have default status if they don't have one
UPDATE public.sticker_orders
SET status = 'pending'
WHERE status IS NULL;

-- Create index on status for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON public.sticker_orders(status);

-- Add comment
COMMENT ON COLUMN public.sticker_orders.status IS 'Order status: pending, processing, shipped, delivered, failed, canceled';
COMMENT ON COLUMN public.sticker_orders.lighter_names IS 'Array of lighter names associated with this order for display';
COMMENT ON COLUMN public.sticker_orders.paid_at IS 'Timestamp when payment was completed';

-- Verify the table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'sticker_orders'
ORDER BY ordinal_position;
