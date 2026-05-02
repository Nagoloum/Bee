-- ═══════════════════════════════════════════════════════════════════
-- Vues matérialisées pour dashboards (rafraîchies chaque heure)
-- ═══════════════════════════════════════════════════════════════════

-- 1) Revenus vendeur par jour
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_shop_daily_revenue AS
SELECT
  shop_id,
  DATE(created_at)           AS day,
  SUM(subtotal_xaf)          AS gross_xaf,
  SUM(commission_xaf)        AS commission_xaf,
  SUM(subtotal_xaf - commission_xaf) AS net_xaf,
  COUNT(DISTINCT order_id)   AS orders,
  SUM(quantity)              AS items_sold
FROM order_items
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY shop_id, DATE(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_shop_daily_rev
  ON mv_shop_daily_revenue (shop_id, day);

-- 2) Popularité produit 30 derniers jours
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_product_popularity AS
SELECT
  p.id                 AS product_id,
  p.shop_id,
  p.name,
  p.base_price_xaf,
  COALESCE(SUM(oi.quantity), 0)       AS sold_30d,
  COALESCE(AVG(r.rating), 0)::numeric(3,2) AS rating,
  p.view_count
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
LEFT JOIN order_items oi
  ON oi.variant_id = v.id
  AND oi.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN reviews r
  ON r.target_id = p.id AND r.target_type = 'PRODUCT' AND r.is_hidden = FALSE
WHERE p.status = 'ACTIVE' AND p.deleted_at IS NULL
GROUP BY p.id, p.shop_id, p.name, p.base_price_xaf, p.view_count;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_product_pop
  ON mv_product_popularity (product_id);
CREATE INDEX IF NOT EXISTS idx_mv_product_sold
  ON mv_product_popularity (sold_30d DESC);

-- 3) KPI plateforme
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_kpi AS
SELECT
  DATE(o.created_at)                    AS day,
  COUNT(*)                              AS orders,
  SUM(o.total_xaf)                      AS gmv_xaf,
  SUM(oi.commission_xaf)                AS revenue_xaf,
  COUNT(DISTINCT o.client_id)           AS unique_buyers,
  COUNT(DISTINCT oi.shop_id)            AS active_sellers
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status NOT IN ('CANCELLED','REFUNDED')
  AND o.created_at > NOW() - INTERVAL '1 year'
GROUP BY DATE(o.created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_platform_kpi
  ON mv_platform_kpi (day);

-- 4) Top vendeurs
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_vendors AS
SELECT
  s.id AS shop_id,
  s.slug,
  s.name,
  s.logo_url,
  s.rating_avg,
  SUM(oi.subtotal_xaf) FILTER (WHERE oi.created_at > NOW() - INTERVAL '30 days') AS revenue_30d,
  COUNT(DISTINCT oi.order_id) FILTER (WHERE oi.created_at > NOW() - INTERVAL '30 days') AS orders_30d
FROM shops s
LEFT JOIN order_items oi ON oi.shop_id = s.id
WHERE s.status = 'ACTIVE' AND s.deleted_at IS NULL
GROUP BY s.id
ORDER BY revenue_30d DESC NULLS LAST;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_vendors
  ON mv_top_vendors (shop_id);

-- ─── Refresh ──────────────────────────────────
-- Appelé par un job horaire (pg_cron ou BullMQ côté app):
--   SELECT refresh_materialized_views();
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_shop_daily_revenue;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_popularity;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_kpi;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_vendors;
END;
$$ LANGUAGE plpgsql;
