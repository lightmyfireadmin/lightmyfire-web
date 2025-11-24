-- =====================================================
-- Admin Stats Function
-- Purpose: Provide overview statistics for the admin panel
-- =====================================================

CREATE OR REPLACE FUNCTION admin_get_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_lighters BIGINT,
  active_lighters BIGINT,
  total_orders BIGINT,
  total_revenue_cents BIGINT,
  pending_orders BIGINT,
  total_stickers_generated BIGINT
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

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM profiles) as total_users,
    (SELECT count(*) FROM lighters) as total_lighters,
    (SELECT count(*) FROM lighters WHERE is_retired = false) as active_lighters,
    (SELECT count(*) FROM orders) as total_orders,
    (SELECT COALESCE(SUM(amount_cents), 0) FROM orders WHERE status = 'paid') as total_revenue_cents,
    (SELECT count(*) FROM orders WHERE status = 'paid' AND shipped_at IS NULL) as pending_orders,
    (SELECT count(*) FROM sticker_orders) as total_stickers_generated;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_stats() TO authenticated;

COMMENT ON FUNCTION admin_get_stats() IS 'Returns high-level statistics for the admin dashboard.';
