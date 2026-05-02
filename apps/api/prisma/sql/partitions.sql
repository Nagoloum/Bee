-- ═══════════════════════════════════════════════════════════════════
-- Partitionnement mensuel des tables à fort volume
-- À exécuter APRÈS prisma migrate (convertit les tables en partitionnées)
-- ═══════════════════════════════════════════════════════════════════
-- NOTE: Prisma ne gère pas nativement PARTITION BY. La stratégie est de:
-- 1. Laisser Prisma créer les tables normales
-- 2. Renommer les tables et créer des versions PARTITIONED BY RANGE
-- 3. Copier les données
-- Pour la PREMIÈRE migration (DB vide), on peut directement recréer.
--
-- Ici on montre le pattern pour notifications. Même approche pour:
--   orders, order_items, order_status_events, wallet_transactions,
--   delivery_tracking_events, audit_logs, messages, story_views,
--   auction_bids, points_transactions
-- ═══════════════════════════════════════════════════════════════════

-- Exemple pour notifications (à adapter pour chaque table)
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id           UUID NOT NULL DEFAULT uuid_generate_v7(),
  user_id      UUID NOT NULL,
  type         TEXT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  body         TEXT,
  data         JSONB,
  icon_url     TEXT,
  read_at      TIMESTAMPTZ,
  action_taken BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_notifications_user_created
  ON notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread
  ON notifications (user_id) WHERE read_at IS NULL;

-- Partitions initiales (6 mois courants + 6 mois à venir)
DO $$
DECLARE
  m DATE;
BEGIN
  FOR m IN
    SELECT generate_series(
      date_trunc('month', NOW() - INTERVAL '6 months'),
      date_trunc('month', NOW() + INTERVAL '6 months'),
      INTERVAL '1 month'
    )::DATE
  LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS notifications_%s
       PARTITION OF notifications
       FOR VALUES FROM (%L) TO (%L);',
      to_char(m, 'YYYY_MM'),
      m,
      m + INTERVAL '1 month'
    );
  END LOOP;
END$$;

-- Fonction d'auto-création de partitions (appelée par pg_cron)
CREATE OR REPLACE FUNCTION create_next_month_partitions()
RETURNS VOID AS $$
DECLARE
  tbl TEXT;
  next_m DATE := date_trunc('month', NOW() + INTERVAL '2 months')::DATE;
  m_suffix TEXT := to_char(next_m, 'YYYY_MM');
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'notifications', 'audit_logs', 'wallet_transactions',
    'order_status_events', 'delivery_tracking_events',
    'messages', 'story_views', 'auction_bids', 'points_transactions'
  ]
  LOOP
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L);',
      tbl || '_' || m_suffix,
      tbl,
      next_m,
      next_m + INTERVAL '1 month'
    );
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- Planification mensuelle avec pg_cron (si extension installée)
-- SELECT cron.schedule('create-partitions', '0 0 25 * *', 'SELECT create_next_month_partitions();');
