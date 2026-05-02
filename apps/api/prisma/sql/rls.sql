-- ═══════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════
-- L'API NestJS set les GUC suivants en début de chaque requête:
--   SET LOCAL app.current_user_id = '<uuid>';
--   SET LOCAL app.current_user_role = 'CLIENT' | 'VENDOR' | 'DELIVERY' | 'ADMIN';
-- Cela permet aux policies d'agir.

-- Helper : extraire le user_id courant
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.current_user_role', TRUE), '');
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT current_user_role() = 'ADMIN';
$$ LANGUAGE SQL STABLE;

-- ─── users ──────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_select ON users FOR SELECT
  USING (id = current_user_id() OR is_admin());

CREATE POLICY users_self_update ON users FOR UPDATE
  USING (id = current_user_id() OR is_admin());

CREATE POLICY users_admin_all ON users FOR ALL
  USING (is_admin());

-- ─── wallets ────────────────────────────────
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallets_owner ON wallets FOR SELECT
  USING (user_id = current_user_id() OR is_admin());

CREATE POLICY wallets_admin_write ON wallets FOR ALL
  USING (is_admin());

-- ─── orders (client voit ses commandes, vendeur ses ventes) ──
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_client_select ON orders FOR SELECT
  USING (client_id = current_user_id() OR is_admin());

CREATE POLICY orders_vendor_select ON orders FOR SELECT
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM order_items oi
      JOIN shops s ON s.id = oi.shop_id
      WHERE oi.order_id = orders.id AND s.vendor_id = current_user_id()
    )
  );

-- ─── kyc_verifications (ultra sensible) ──────
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY kyc_owner ON kyc_verifications FOR SELECT
  USING (user_id = current_user_id() OR is_admin());

CREATE POLICY kyc_admin_all ON kyc_verifications FOR ALL
  USING (is_admin());

-- ─── shops ───────────────────────────────────
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY shops_public_read ON shops FOR SELECT
  USING (status = 'ACTIVE' OR vendor_id = current_user_id() OR is_admin());

CREATE POLICY shops_vendor_write ON shops FOR UPDATE
  USING (vendor_id = current_user_id() OR is_admin());

-- Note: Les admin ont un rôle Prisma séparé qui BYPASSE RLS via SUPERUSER-like.
-- En prod on utilise un rôle `bee_api` avec BYPASSRLS=false mais qui définit les GUC.
