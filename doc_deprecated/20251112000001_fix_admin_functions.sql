-- =====================================================
-- Fix Admin Functions
-- Created: 2025-11-12
-- Purpose: Fix ambiguous column and add missing orders function
-- =====================================================

-- =====================================================
-- FIX 1: admin_get_moderators - Fix ambiguous role column
-- =====================================================
CREATE OR REPLACE FUNCTION admin_get_moderators()
RETURNS TABLE (
  user_id TEXT,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin (FIX: added p. prefix to avoid ambiguity)
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all users with admin or moderator roles
  RETURN QUERY
  SELECT
    p.id::TEXT as user_id,
    COALESCE(u.email, '')::TEXT as email,
    p.username::TEXT,
    p.role::TEXT,
    p.created_at
  FROM profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.role IN ('admin', 'moderator')
  ORDER BY
    CASE p.role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2
      ELSE 3
    END,
    p.created_at ASC;
END;
$$;

-- =====================================================
-- FIX 2: admin_get_all_orders - Create missing function
-- =====================================================
CREATE OR REPLACE FUNCTION admin_get_all_orders()
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  user_email TEXT,
  lighter_id TEXT,
  pack_size INT,
  amount_cents INT,
  currency TEXT,
  payment_status TEXT,
  status TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_email TEXT,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  notes TEXT,
  refund_status TEXT,
  refund_amount_cents INT,
  refunded_at TEXT,
  shipped_at TEXT,
  tracking_number TEXT,
  created_at TEXT,
  updated_at TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return all orders with user email joined
  RETURN QUERY
  SELECT
    o.id::TEXT,
    o.user_id::TEXT,
    COALESCE(u.email, '')::TEXT as user_email,
    COALESCE(o.lighter_id, '')::TEXT,
    o.pack_size,
    o.amount_cents,
    o.currency::TEXT,
    o.payment_status::TEXT,
    o.status::TEXT,
    o.stripe_payment_intent_id::TEXT,
    o.stripe_customer_email::TEXT,
    COALESCE(o.shipping_name, '')::TEXT,
    COALESCE(o.shipping_email, '')::TEXT,
    COALESCE(o.shipping_address, '')::TEXT,
    COALESCE(o.shipping_city, '')::TEXT,
    COALESCE(o.shipping_postal_code, '')::TEXT,
    COALESCE(o.shipping_country, '')::TEXT,
    COALESCE(o.notes, '')::TEXT,
    COALESCE(o.refund_status, '')::TEXT,
    COALESCE(o.refund_amount_cents, 0),
    COALESCE(o.refunded_at::TEXT, ''),
    COALESCE(o.shipped_at::TEXT, ''),
    COALESCE(o.tracking_number, '')::TEXT,
    o.created_at::TEXT,
    COALESCE(o.updated_at::TEXT, '')
  FROM orders o
  LEFT JOIN auth.users u ON u.id = o.user_id::UUID
  ORDER BY o.created_at DESC;
END;
$$;

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION admin_get_moderators() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_all_orders() TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON FUNCTION admin_get_moderators() IS 'Returns all users with admin or moderator roles. Fixed ambiguous role column reference.';
COMMENT ON FUNCTION admin_get_all_orders() IS 'Returns all orders with user email. Requires admin privileges.';
