#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod
 */

const fs = require('fs');
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

async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes('--dev');
  const isProd = args.includes('--prod');

  if (!isDev && !isProd) {
    print('BBS Podcast Platform - Setup');
    print('');
    print('Verwendung:');
    print('  node scripts/setup.js --dev   Entwicklung (localhost, SQLite)');
    print('  node scripts/setup.js --prod  Produktion (öffentliche Domain, PostgreSQL)');
    print('');
    process.exit(0);
  }

  if (isDev && isProd) {
    print('Fehler: Gib entweder --dev oder --prod an, nicht beides.\n');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (isDev) {
      await setupDev(rl);
    } else {
      await setupProd(rl);
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
