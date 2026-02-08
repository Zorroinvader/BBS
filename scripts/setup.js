#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod | --only-db | --app-only
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function print(msg) {
  console.log(msg);
}

function isDockerReady() {
  try {
    execSync('docker info', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function isDockerDaemonError(err) {
  const raw = err.stderr ? (Buffer.isBuffer(err.stderr) ? err.stderr.toString() : String(err.stderr)) : (err.message || '');
  const msg = String(raw).toLowerCase();
  return (
    msg.includes('cannot connect') ||
    msg.includes('failed to connect') ||
    msg.includes('daemon running') ||
    msg.includes('docker_engine') ||
    msg.includes('npipe') ||
    msg.includes('pipe/docker') ||
    msg.includes('daemon')
  );
}

function tryStartDockerDesktop() {
  if (os.platform() !== 'win32') return false;
  const paths = [
    process.env['ProgramFiles'] + '\\Docker\\Docker\\Docker Desktop.exe',
    process.env['ProgramFiles(x86)'] + '\\Docker\\Docker\\Docker Desktop.exe',
  ].filter(Boolean);
  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        spawn(p, [], { detached: true, stdio: 'ignore' }).unref();
        return true;
      } catch (_) {}
    }
  }
  return false;
}

function tryInstallDocker() {
  try {
    if (os.platform() === 'win32') {
      print('Versuche Docker mit winget zu installieren...');
      execSync('winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements', {
        stdio: 'inherit',
      });
      return true;
    }
    if (os.platform() === 'darwin') {
      print('Installiere Docker mit Homebrew...');
      execSync('brew install --cask docker', { stdio: 'inherit' });
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

function ensureDockerReady() {
  if (isDockerReady()) return;

  print('\nDocker ist nicht bereit.');

  try {
    execSync('docker --version', { stdio: 'pipe' });
  } catch (_) {
    print('Docker scheint nicht installiert zu sein.');
    if (tryInstallDocker()) {
      print('\nDocker wurde installiert. Starte Docker Desktop und führe dieses Skript erneut aus.');
      print('Möglicherweise ist ein Neustart nötig.\n');
      process.exit(0);
    }
    print('\nInstallation fehlgeschlagen. Bitte Docker manuell installieren:');
    print('  Windows: https://docs.docker.com/desktop/install/windows-install/');
    print('  Oder: winget install Docker.DockerDesktop\n');
    process.exit(1);
  }

  print('Docker-Daemon läuft nicht. Starte Docker Desktop...');
  if (tryStartDockerDesktop()) {
    print('Warte auf Docker (bis zu 90 Sekunden)...');
    for (let i = 0; i < 30; i++) {
      if (isDockerReady()) {
        print('Docker ist bereit.\n');
        return;
      }
      const deadline = Date.now() + 3000;
      while (Date.now() < deadline) {}
    }
    print('\nDocker startet zu langsam. Bitte starte Docker Desktop manuell und führe das Skript erneut aus.\n');
    process.exit(1);
  }

  print('\nDocker Desktop wurde nicht gefunden. Bitte starte Docker manuell und führe das Skript erneut aus.\n');
  process.exit(1);
}

function waitForApp(baseUrl, maxAttempts = 60) {
  const url = baseUrl.replace(/\/$/, '') + '/api/health';
  const parsed = new URL(url);
  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;
  const checkHost = parsed.hostname === '0.0.0.0' ? 'localhost' : parsed.hostname;
  const checkUrl = `${parsed.protocol}//${checkHost}:${parsed.port || (isHttps ? 443 : 80)}/api/health`;

  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tryFetch = () => {
      attempts++;
      const req = client.get(checkUrl, { timeout: 5000 }, (res) => {
        let data = '';
        res.on('data', (ch) => (data += ch));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(data);
              if (json.db === 'connected' || json.status === 'ok') {
                resolve(true);
                return;
              }
            } catch (_) {}
          }
          if (attempts >= maxAttempts) {
            reject(new Error('App oder DB-Verbindung nicht bereit'));
            return;
          }
          setTimeout(tryFetch, 2000);
        });
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error('App nicht erreichbar unter ' + checkUrl));
          return;
        }
        setTimeout(tryFetch, 2000);
      });
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error('App antwortet nicht'));
          return;
        }
        setTimeout(tryFetch, 2000);
      });
    };
    tryFetch();
  });
}

function runDockerComposeWithRetry(composeFile, commands) {
  const run = () => {
    for (const cmd of commands) {
      execSync(`docker compose -f ${composeFile} ${cmd}`, { cwd: ROOT, stdio: 'inherit' });
    }
  };
  try {
    run();
  } catch (e) {
    if (isDockerDaemonError(e)) {
      ensureDockerReady();
      run();
    } else {
      throw e;
    }
  }
}

function ask(rl, question, defaultValue = '') {
  const suffix = defaultValue ? ` [${defaultValue}]: ` : ': ';
  return new Promise((resolve) => {
    rl.question(question + suffix, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function printAppLink(url, isRunning = false) {
  const u = url.replace(/\/$/, '');
  print('');
  print(isRunning ? '=== App gestartet ===' : '=== App-URL ===');
  print('');
  print('  ' + u);
  print('');
  print('  Admin: ' + u + '/admin/');
  print('');
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
  print('Oder mit Docker: docker compose up -d');
  printAppLink('http://localhost:3000', false);
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
  print('Stopp: docker compose -f docker-compose.prod.yml down');
  printAppLink(publicUrl, false);
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
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  print('\nPostgreSQL läuft.\n');

  const ip = getLocalIP();
  print('Diese IP auf dem App-Host für DB_HOST verwenden: ' + ip);
  print('\nBeispiel auf dem anderen Gerät: node scripts/setup.js --app-only');
  print('\nLive DB-Log (neue Podcasts) anzeigen: node scripts/db-log-viewer.js');
  print('');
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
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.app-only.yml', ['build', 'up -d']);

  print('\nWarte auf App und teste DB-Verbindung (bis zu 2 Min.)...');
  try {
    await waitForApp('http://localhost:3000');
    print('App läuft, DB-Verbindung OK.');
  } catch (e) {
    print('\nWarnung: ' + e.message);
    print('Prüfe: docker compose -f docker-compose.app-only.yml logs');
    print('Stelle sicher, dass der DB-Host erreichbar ist und Port 5432 offen ist.\n');
  }

  print('\nApp verbindet sich mit der Remote-DB.');
  print('Stopp: docker compose -f docker-compose.app-only.yml down');
  printAppLink(publicUrl, true);
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
