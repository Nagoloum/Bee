-- Extensions PostgreSQL requises par Bee
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Fonction uuid_generate_v7 (time-sortable) — Postgres 16 ne l'inclut pas nativement
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID
AS $$
DECLARE
  unix_ts_ms BIGINT;
  uuid_bytes BYTEA;
BEGIN
  unix_ts_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

  uuid_bytes := SET_BYTE(gen_random_bytes(16), 0, ((unix_ts_ms >> 40) & 255)::INT);
  uuid_bytes := SET_BYTE(uuid_bytes, 1, ((unix_ts_ms >> 32) & 255)::INT);
  uuid_bytes := SET_BYTE(uuid_bytes, 2, ((unix_ts_ms >> 24) & 255)::INT);
  uuid_bytes := SET_BYTE(uuid_bytes, 3, ((unix_ts_ms >> 16) & 255)::INT);
  uuid_bytes := SET_BYTE(uuid_bytes, 4, ((unix_ts_ms >>  8) & 255)::INT);
  uuid_bytes := SET_BYTE(uuid_bytes, 5, ( unix_ts_ms        & 255)::INT);

  -- version 7
  uuid_bytes := SET_BYTE(uuid_bytes, 6, (GET_BYTE(uuid_bytes, 6) & 15)  | 112);
  -- variant RFC 4122
  uuid_bytes := SET_BYTE(uuid_bytes, 8, (GET_BYTE(uuid_bytes, 8) & 63)  | 128);

  RETURN ENCODE(uuid_bytes, 'hex')::UUID;
END
$$ LANGUAGE plpgsql VOLATILE;
