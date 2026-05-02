-- ═══════════════════════════════════════════════════════════════════
-- Triggers métier
-- ═══════════════════════════════════════════════════════════════════

-- ─── updated_at automatique ───────────────────
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attacher le trigger à toutes les tables ayant updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I;
       CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();',
      t, t
    );
  END LOOP;
END$$;

-- ─── tsvector auto sur products ───────────────
CREATE OR REPLACE FUNCTION trg_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_tsv ON products;
CREATE TRIGGER products_tsv BEFORE INSERT OR UPDATE
  OF name, description, tags ON products
  FOR EACH ROW EXECUTE FUNCTION trg_products_search_vector();

CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (search_vector);

-- ─── tsvector auto sur shops ──────────────────
CREATE OR REPLACE FUNCTION trg_shops_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shops_tsv ON shops;
CREATE TRIGGER shops_tsv BEFORE INSERT OR UPDATE
  OF name, tagline, description ON shops
  FOR EACH ROW EXECUTE FUNCTION trg_shops_search_vector();

CREATE INDEX IF NOT EXISTS idx_shops_search ON shops USING GIN (search_vector);

-- ─── Dénormalisation rating_avg / rating_count ─
CREATE OR REPLACE FUNCTION trg_refresh_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  pid UUID := COALESCE(NEW.target_id, OLD.target_id);
BEGIN
  IF COALESCE(NEW.target_type, OLD.target_type) = 'PRODUCT' THEN
    UPDATE products
    SET rating_avg = COALESCE(
          (SELECT AVG(rating) FROM reviews
           WHERE target_type='PRODUCT' AND target_id=pid AND is_hidden=false), 0),
        rating_count = (SELECT COUNT(*) FROM reviews
                        WHERE target_type='PRODUCT' AND target_id=pid AND is_hidden=false)
    WHERE id = pid;
  END IF;
  RETURN NULL;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_refresh_product_rating ON reviews;
CREATE TRIGGER reviews_refresh_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_refresh_product_rating();

-- ─── Soft-delete helper ──────────────────────
-- Exposé via API: UPDATE users SET deleted_at = NOW() WHERE id = ?
-- Rien à faire au niveau trigger, mais utile d'exposer cette vue:
CREATE OR REPLACE VIEW active_users AS
  SELECT * FROM users WHERE deleted_at IS NULL;
