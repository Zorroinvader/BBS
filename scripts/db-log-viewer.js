#!/usr/bin/env node
/**
 * DB-Log Viewer – für den DB-Rechner
 * Zeigt direkt aus der Datenbank, wenn ein neuer Podcast eingetragen wird.
 * Keine Authentifizierung nötig – verbindet sich nur mit lokalem PostgreSQL.
 *
 * Verwendung:
 *   node scripts/db-log-viewer.js
 * (Liest DB_PASSWORD aus .env im Projektverzeichnis)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const out = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim();
  }
  return out;
}

const env = loadEnv();
const dbPassword = env.DB_PASSWORD || process.env.DB_PASSWORD;

if (!dbPassword) {
  console.error('Fehler: DB_PASSWORD fehlt. Setze es in .env oder als Umgebungsvariable.');
  process.exit(1);
}

const { Client } = require('pg');

const TRIGGER_STATEMENTS = [
  `CREATE OR REPLACE FUNCTION notify_episode_insert()
   RETURNS TRIGGER AS $$
   BEGIN
     PERFORM pg_notify('episode_inserted', json_build_object('id', NEW.id, 'title', NEW.title, 'audio_path', NEW.audio_path, 'ts', NOW())::text);
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,
  'DROP TRIGGER IF EXISTS tr_episode_insert ON episodes',
  `CREATE TRIGGER tr_episode_insert AFTER INSERT ON episodes
   FOR EACH ROW EXECUTE PROCEDURE notify_episode_insert()`,
];

function formatTime(ts) {
  if (!ts) return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const d = new Date(ts);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function main() {
  const client = new Client({
    connectionString: `postgresql://podcast:${dbPassword}@localhost:5432/podcasts`,
  });

  try {
    await client.connect();
  } catch (e) {
    console.error('Fehler: Kann nicht mit PostgreSQL verbinden.', e.message);
    console.error('Stelle sicher, dass PostgreSQL läuft (docker compose -f docker-compose.db-only.yml up -d)');
    process.exit(1);
  }

  for (const sql of TRIGGER_STATEMENTS) {
    try {
      await client.query(sql);
    } catch (e) {
      if (!e.message.includes('already exists')) console.error('Warnung:', e.message);
    }
  }

  await client.query('LISTEN episode_inserted');

  client.on('notification', (msg) => {
    if (msg.channel !== 'episode_inserted') return;
    try {
      const d = JSON.parse(msg.payload || '{}');
      const title = d.title || '(ohne Titel)';
      const ts = formatTime(d.ts);
      console.log(`\x1b[32m[${ts}]\x1b[0m \x1b[1mNeuer Podcast\x1b[0m – ${title} (ID: ${d.id})`);
    } catch (_) {
      console.log('[DB]', msg.payload);
    }
  });

  console.log('DB-Log: Warte auf neue Podcasts in der Datenbank... (Strg+C zum Beenden)\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
