CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_path TEXT NOT NULL,
  artwork_path TEXT,
  duration_seconds INTEGER,
  publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  series TEXT,
  class_info TEXT,
  category TEXT,
  spotify_url TEXT,
  apple_url TEXT,
  youtube_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_episodes_publish ON episodes(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series);
CREATE INDEX IF NOT EXISTS idx_episodes_category ON episodes(category);
