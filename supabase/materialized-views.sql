-- SQL untuk membuat materialized view dan function di Supabase
-- Jalankan di SQL Editor Supabase

-- 1. Materialized view untuk dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_analytics AS
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'PAID') as paid_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as orders_7d,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_30d,
  COALESCE(SUM(amount) FILTER (WHERE status = 'PAID' AND created_at >= CURRENT_DATE - INTERVAL '7 days'), 0) as revenue_7d,
  COALESCE(SUM(amount) FILTER (WHERE status = 'PAID' AND created_at >= CURRENT_DATE - INTERVAL '30 days'), 0) as revenue_30d,
  COALESCE(AVG(amount) FILTER (WHERE status = 'PAID'), 0) as avg_order_value,
  MAX(created_at) as last_updated
FROM orders;

-- 2. Function untuk refresh materialized view
CREATE OR REPLACE FUNCTION refresh_dashboard_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function untuk mendapatkan dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data()
RETURNS JSON AS $$
DECLARE
  result JSON;
  products_count INTEGER;
  users_count INTEGER;
  flash_sales_count INTEGER;
BEGIN
  -- Get cached analytics
  SELECT row_to_json(dashboard_analytics) INTO result FROM dashboard_analytics;
  
  -- Get other counts (these are usually smaller tables)
  SELECT COUNT(*) INTO products_count FROM products WHERE is_active = true AND archived_at IS NULL;
  SELECT COUNT(*) INTO users_count FROM auth.users;
  
  -- Try to get flash sales count (may not exist)
  BEGIN
    SELECT COUNT(*) INTO flash_sales_count FROM flash_sales WHERE is_active = true;
  EXCEPTION
    WHEN others THEN
      flash_sales_count := 0;
  END;
  
  -- Combine results
  result := json_build_object(
    'analytics', result,
    'products', products_count,
    'users', users_count,
    'flashSales', flash_sales_count
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function untuk daily revenue breakdown
CREATE OR REPLACE FUNCTION get_daily_revenue(days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(daily_data) INTO result
  FROM (
    SELECT 
      date_trunc('day', created_at)::date as date,
      COUNT(*) as orders,
      COALESCE(SUM(amount), 0) as revenue
    FROM orders 
    WHERE status = 'PAID' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY date_trunc('day', created_at)
    ORDER BY date
  ) daily_data;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_status ON orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_products_active_archived ON products(is_active, archived_at);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 6. Set up automatic refresh (run every 5 minutes)
-- Note: This would typically be set up as a pg_cron job or external scheduler
-- SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 'SELECT refresh_dashboard_analytics();');
