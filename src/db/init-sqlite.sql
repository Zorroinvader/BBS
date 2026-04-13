CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  audio_path TEXT NOT NULL,
  artwork_path TEXT,
  duration_seconds INTEGER,
  publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  series TEXT,
  class_info TEXT,
  category TEXT,
  spotify_url TEXT,
  apple_url TEXT,
  youtube_url TEXT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_episodes_publish ON episodes(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series);

CREATE TABLE IF NOT EXISTS listen_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  episode_id INTEGER NOT NULL,
  listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'web',
  FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

CREATE INDEX IF NOT EXISTS idx_listen_events_episode ON listen_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_listen_events_date ON listen_events(listened_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at DESC);
