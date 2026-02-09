const config = require('../config');

function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function createAdapter() {
  if (config.databaseUrl) {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: config.databaseUrl });
    const initSql = require('fs').readFileSync(require('path').join(__dirname, 'init-postgres.sql'), 'utf8');
    for (const stmt of initSql.split(';').map(s => s.trim()).filter(Boolean)) {
      await pool.query(stmt);
    }
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS series TEXT');
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS class_info TEXT');
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS category TEXT');
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS spotify_url TEXT');
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS apple_url TEXT');
    await pool.query('ALTER TABLE episodes ADD COLUMN IF NOT EXISTS youtube_url TEXT');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_episodes_category ON episodes(category)');

    return {
      query: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const r = await pool.query(pgSql, params);
        return { rows: r.rows };
      },
      queryOne: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const r = await pool.query(pgSql, params);
        return r.rows[0] || null;
      },
      run: async (sql, params = []) => {
        const pgSql = toPgPlaceholders(sql);
        const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
        if (isInsert) {
          const withReturn = pgSql + (pgSql.includes('RETURNING') ? '' : ' RETURNING id');
          const r = await pool.query(withReturn, params);
          return { lastId: r.rows[0]?.id ?? null, changes: r.rowCount };
        }
        const r = await pool.query(pgSql, params);
        return { lastId: null, changes: r.rowCount };
      },
      exec: async (sql) => {
        await pool.query(sql);
      },
      close: () => pool.end(),
    };
  }

  const path = require('path');
  const fs = require('fs');
  const Database = require('better-sqlite3');
  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const db = new Database(config.dbPath);
  const initSql = require('fs').readFileSync(require('path').join(__dirname, 'init-sqlite.sql'), 'utf8');
  db.exec(initSql);
  // Migration: add series, class_info, category + external URLs if missing (existing DBs)
  const cols = db.prepare('PRAGMA table_info(episodes)').all().map((r) => r.name);
  if (!cols.includes('series')) db.prepare('ALTER TABLE episodes ADD COLUMN series TEXT').run();
  if (!cols.includes('class_info')) db.prepare('ALTER TABLE episodes ADD COLUMN class_info TEXT').run();
  if (!cols.includes('category')) db.prepare('ALTER TABLE episodes ADD COLUMN category TEXT').run();
  if (!cols.includes('spotify_url')) db.prepare('ALTER TABLE episodes ADD COLUMN spotify_url TEXT').run();
  if (!cols.includes('apple_url')) db.prepare('ALTER TABLE episodes ADD COLUMN apple_url TEXT').run();
  if (!cols.includes('youtube_url')) db.prepare('ALTER TABLE episodes ADD COLUMN youtube_url TEXT').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series)').run();
  db.prepare('CREATE INDEX IF NOT EXISTS idx_episodes_category ON episodes(category)').run();

  return {
    query: (sql, params = []) => Promise.resolve({ rows: db.prepare(sql).all(...params) }),
    queryOne: (sql, params = []) => Promise.resolve(db.prepare(sql).get(...params) ?? null),
    run: (sql, params = []) => {
      const r = db.prepare(sql).run(...params);
      return Promise.resolve({ lastId: r.lastInsertRowid, changes: r.changes });
    },
    exec: (sql) => Promise.resolve(db.exec(sql)),
    close: () => {},
  };
}

let dbPromise = null;
function getDb() {
  if (!dbPromise) dbPromise = createAdapter();
  return dbPromise;
}

module.exports = { getDb, toPgPlaceholders };
