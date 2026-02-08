#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod | --only-db | --app-only
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function print(msg) {
  console.log(msg);
}

function ask(rl, question, defaultValue = '') {
  const suffix = defaultValue ? ` [${defaultValue}]: ` : ': ';
  return new Promise((resolve) => {
    rl.question(question + suffix, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

async function setupDev(rl) {
  print('\n=== Entwicklungs-Setup (localhost, SQLite) ===\n');

  const env = `# Entwicklungs-Setup - automatisch generiert
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=http://localhost:3000
JWT_SECRET=dev-secret-change-in-production
DB_PATH=./data/podcasts.db
`;

  fs.writeFileSync(ENV_PATH, env);
  print('Erstellt: .env (localhost-Konfiguration)\n');

  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    print('npm install abgeschlossen.\n');
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Führe es manuell aus: npm install\n');
  }

  print('Entwicklungs-Setup fertig.');
  print('\nStart: npm start');
  print('Oder mit Docker: docker compose up -d\n');
}

async function setupProd(rl) {
  print('\n=== Produktions-Setup (öffentliche Domain, PostgreSQL) ===\n');
  print('Gib die folgenden Werte ein. Du kannst sie später in .env anpassen.\n');

  const publicUrl = await ask(rl, 'PUBLIC_URL (z.B. https://podcast.bbs2-wob.de)', 'https://podcast.bbs2-wob.de');
  const dbPassword = await ask(rl, 'DB_PASSWORD (PostgreSQL-Passwort)', '');
  const jwtSecret = await ask(rl, 'JWT_SECRET (langer Zufallsstring für Anmeldung)', '');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional, leer lassen)', '');

  if (!dbPassword || !jwtSecret) {
    print('\nFehler: DB_PASSWORD und JWT_SECRET sind erforderlich für Produktion.');
    print('Starte das Skript erneut und gib gültige Werte ein.\n');
    process.exit(1);
  }

  const env = `# Produktions-Setup - automatisch generiert
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=${publicUrl}
JWT_SECRET=${jwtSecret}
DB_PASSWORD=${dbPassword}
${corsOrigin ? `CORS_ORIGIN=${corsOrigin}` : ''}
`;

  fs.writeFileSync(ENV_PATH, env);
  print('\nErstellt: .env (Produktions-Konfiguration)\n');

  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    print('npm install abgeschlossen.\n');
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Führe es manuell aus: npm install\n');
  }

  print('Produktions-Setup fertig.');
  print('\nStart mit Docker: docker compose -f docker-compose.prod.yml up -d');
  print('Stopp: docker compose -f docker-compose.prod.yml down\n');
}

async function setupOnlyDb(rl) {
  print('\n=== Nur PostgreSQL (DB-Host, z.B. Haupt-PC) ===\n');

  let dbPassword = '';
  if (fs.existsSync(ENV_PATH)) {
    const content = fs.readFileSync(ENV_PATH, 'utf8');
    const m = content.match(/DB_PASSWORD=([^\r\n]+)/);
    if (m) dbPassword = m[1].trim();
  }
  dbPassword = await ask(rl, 'DB_PASSWORD (PostgreSQL-Passwort)', dbPassword || '');

  if (!dbPassword) {
    print('\nFehler: DB_PASSWORD ist erforderlich.\n');
    process.exit(1);
  }

  let env = '';
  if (fs.existsSync(ENV_PATH)) {
    env = fs.readFileSync(ENV_PATH, 'utf8');
    if (!env.includes('DB_PASSWORD=')) env += `\nDB_PASSWORD=${dbPassword}\n`;
    else env = env.replace(/DB_PASSWORD=[^\r\n]*/, `DB_PASSWORD=${dbPassword}`);
  } else {
    env = `# DB-only Setup\nDB_PASSWORD=${dbPassword}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);
  print('\nErstellt/aktualisiert: .env\n');

  const composePath = path.join(ROOT, 'docker-compose.db-only.yml');
  if (!fs.existsSync(composePath)) {
    print('Fehler: docker-compose.db-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Starte PostgreSQL...');
  execSync('docker compose -f docker-compose.db-only.yml up -d', { cwd: ROOT, stdio: 'inherit' });
  print('\nPostgreSQL läuft.\n');

  const ip = getLocalIP();
  print('Diese IP auf dem App-Host für DB_HOST verwenden: ' + ip);
  print('\nBeispiel auf dem anderen Gerät: node scripts/setup.js --app-only\n');
}

async function setupAppOnly(rl) {
  print('\n=== Nur App (verbindet zu Remote-DB, z.B. Laptop) ===\n');

  const dbHost = await ask(rl, 'DB_HOST (IP des DB-Rechners, z.B. 192.168.1.100)', '');
  const dbPassword = await ask(rl, 'DB_PASSWORD (muss mit DB-Host übereinstimmen)', '');
  const jwtSecret = await ask(rl, 'JWT_SECRET (langer Zufallsstring)', '');
  const publicUrl = await ask(rl, 'PUBLIC_URL', 'http://localhost:3000');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional, leer lassen)', '');

  if (!dbHost || !dbPassword || !jwtSecret) {
    print('\nFehler: DB_HOST, DB_PASSWORD und JWT_SECRET sind erforderlich.\n');
    process.exit(1);
  }

  const env = `# App-only Setup (Remote-DB)
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=${publicUrl}
JWT_SECRET=${jwtSecret}
DB_HOST=${dbHost}
DB_PASSWORD=${dbPassword}
DATABASE_URL=postgresql://podcast:${dbPassword}@${dbHost}:5432/podcasts
${corsOrigin ? `CORS_ORIGIN=${corsOrigin}` : ''}
`;

  fs.writeFileSync(ENV_PATH, env);
  print('\nErstellt: .env\n');

  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    print('npm install abgeschlossen.\n');
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Führe es manuell aus: npm install\n');
  }

  const composePath = path.join(ROOT, 'docker-compose.app-only.yml');
  if (!fs.existsSync(composePath)) {
    print('Fehler: docker-compose.app-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Baue und starte die App...');
  execSync('docker compose -f docker-compose.app-only.yml build', { cwd: ROOT, stdio: 'inherit' });
  execSync('docker compose -f docker-compose.app-only.yml up -d', { cwd: ROOT, stdio: 'inherit' });
  print('\nApp läuft und verbindet sich mit der Remote-DB.');
  print('\nStopp: docker compose -f docker-compose.app-only.yml down\n');
}

async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes('--dev');
  const isProd = args.includes('--prod');
  const isOnlyDb = args.includes('--only-db');
  const isAppOnly = args.includes('--app-only');

  const modes = [isDev, isProd, isOnlyDb, isAppOnly].filter(Boolean);
  if (modes.length === 0) {
    print('BBS Podcast Platform - Setup');
    print('');
    print('Verwendung:');
    print('  node scripts/setup.js --dev       Entwicklung (localhost, SQLite)');
    print('  node scripts/setup.js --prod      Produktion (vollständig, App + DB)');
    print('  node scripts/setup.js --only-db   Nur PostgreSQL (DB-Host, z.B. Haupt-PC)');
    print('  node scripts/setup.js --app-only  Nur App (verbindet zu Remote-DB, z.B. Laptop)');
    print('');
    process.exit(0);
  }

  if (modes.length > 1) {
    print('Fehler: Gib nur einen Modus an (--dev, --prod, --only-db oder --app-only).\n');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (isDev) {
      await setupDev(rl);
    } else if (isProd) {
      await setupProd(rl);
    } else if (isOnlyDb) {
      await setupOnlyDb(rl);
    } else {
      await setupAppOnly(rl);
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
