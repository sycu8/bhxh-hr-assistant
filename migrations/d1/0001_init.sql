-- Edge config / feature flags (D1). Đọc qua binding APP_CONFIG_D1.
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO app_config (key, value) VALUES
  ('maintenance_banner_vi', ''),
  ('search_degraded', '0');
