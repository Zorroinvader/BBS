#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod | --only-db | --app-only | --db-only-ssh | --app-only-ssh
 * --db-only-ssh: Reverse-SSH via VPS (remote access)
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
const CREDS_PATH = path.join(ROOT, 'podcast-ssh-credentials.json');

function print(msg) {
  console.log(msg);
}

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
      execSync('winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
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
      process.exit(0);
    }
    print('\nInstallation fehlgeschlagen. Bitte Docker manuell installieren.');
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
    print('\nDocker startet zu langsam. Bitte starte Docker Desktop manuell.\n');
    process.exit(1);
  }
  print('\nDocker Desktop wurde nicht gefunden. Bitte starte Docker manuell.\n');
  process.exit(1);
}

function waitForApp(baseUrl, maxAttempts = 60) {
  const url = (baseUrl.replace(/\/$/, '') + '/api/health');
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
          if (attempts >= maxAttempts) reject(new Error('App oder DB-Verbindung nicht bereit'));
          else setTimeout(tryFetch, 2000);
        });
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) reject(new Error('App nicht erreichbar'));
        else setTimeout(tryFetch, 2000);
      });
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) reject(new Error('App antwortet nicht'));
        else setTimeout(tryFetch, 2000);
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

function printTransferFiles(sshHost, isVps = false) {
  const credsAbs = path.resolve(CREDS_PATH);
  const rootAbs = path.resolve(ROOT);
  const sshDir = path.join(ROOT, '.ssh');
  const sshKeyPath = path.join(sshDir, 'podcast_tunnel');

  print('');
  print('=== DATEIEN FÜR ÜBERTRAGUNG ===');
  print('');
  print('Projektverzeichnis:');
  print('  ' + rootAbs);
  print('');
  print('Diese Datei auf den App-Rechner kopieren (USB, SCP, E-Mail, etc.):');
  print('  ' + credsAbs);
  print('');
  const hostLabel = isVps ? 'ssh_host (VPS)' : 'ssh_host';
  print('Enthält: SSH-Schlüssel, DB_PASSWORD, ' + hostLabel + ' (' + sshHost + '), ssh_user');
  print('');
  print('SSH-Schlüssel (falls manuell benötigt):');
  print('  ' + (fs.existsSync(sshKeyPath) ? path.resolve(sshKeyPath) : '(wird in .ssh/ erzeugt)'));
  print('');
  print('=== ENDE ===');
  print('');
}

async function setupDev(rl) {
  print('\n=== Entwicklungs-Setup (localhost, SQLite) ===\n');
  const env = `# Entwicklungs-Setup
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=http://localhost:3000
JWT_SECRET=dev-secret-change-in-production
DB_PATH=./data/podcasts.db
`;
  fs.writeFileSync(ENV_PATH, env);
  print('Erstellt: .env\n');
  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Führe es manuell aus.\n');
  }
  print('Entwicklungs-Setup fertig.');
  print('\nStart: npm start');
  print('Oder mit Docker: docker compose up -d');
  printAppLink('http://localhost:3000', false);
}

async function setupProd(rl) {
  print('\n=== Produktions-Setup ===\n');
  const envContent = loadEnv();
  const publicUrl = await ask(rl, 'PUBLIC_URL', envContent.PUBLIC_URL || 'https://podcast.bbs2-wob.de');
  const dbPassword = await ask(rl, 'DB_PASSWORD', envContent.DB_PASSWORD || '');
  const jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', envContent.JWT_SECRET || '');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', envContent.CORS_ORIGIN || '');

  if (!dbPassword || !jwtSecret) {
    print('\nFehler: DB_PASSWORD und JWT_SECRET sind erforderlich.\n');
    process.exit(1);
  }

  const env = `# Produktions-Setup
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=${publicUrl}
JWT_SECRET=${jwtSecret}
DB_PASSWORD=${dbPassword}
${corsOrigin ? `CORS_ORIGIN=${corsOrigin}` : ''}
`;
  fs.writeFileSync(ENV_PATH, env);
  print('\nErstellt: .env\n');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {}
  print('Produktions-Setup fertig.');
  print('\nStart: docker compose -f docker-compose.prod.yml up -d');
  printAppLink(publicUrl, false);
}

async function setupOnlyDb(rl) {
  print('\n=== Nur PostgreSQL (DB-Host) ===\n');
  let dbPassword = '';
  const envContent = loadEnv();
  dbPassword = envContent.DB_PASSWORD || '';
  dbPassword = await ask(rl, 'DB_PASSWORD', dbPassword || '');

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

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.db-only.yml'))) {
    print('Fehler: docker-compose.db-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Starte PostgreSQL...');
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  print('\nPostgreSQL läuft.\n');
  const ip = getLocalIP();
  print('DB_HOST für App-Rechner: ' + ip);
  print('\nBeispiel: node scripts/setup.js --app-only');
  print('\nLive DB-Log: node scripts/db-log-viewer.js');
  print('');
}

async function setupDbLocal(rl) {
  print('\n=== Nur PostgreSQL + SSH (DB-Host, gleiches Netzwerk, sichere Verbindung) ===\n');
  print('Richtet DB mit SSH-Authentifizierung ein. App verbindet per SSH-Tunnel.\n');

  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Fahre fort.\n');
  }

  let dbPassword = '';
  const envContent = loadEnv();
  dbPassword = envContent.DB_PASSWORD || '';
  dbPassword = await ask(rl, 'DB_PASSWORD', dbPassword || '');

  if (!dbPassword) {
    print('\nFehler: DB_PASSWORD ist erforderlich.\n');
    process.exit(1);
  }

  const detectedIp = getLocalIP();
  const dbHost = await ask(rl, 'DB_HOST (lokale IP oder Hostname für die App)', detectedIp);

  if (!dbHost) {
    print('\nFehler: DB_HOST ist erforderlich.\n');
    process.exit(1);
  }

  let env = '';
  if (fs.existsSync(ENV_PATH)) {
    env = fs.readFileSync(ENV_PATH, 'utf8');
    if (!env.includes('DB_PASSWORD=')) env += `\nDB_PASSWORD=${dbPassword}\n`;
    else env = env.replace(/DB_PASSWORD=[^\r\n]*/, `DB_PASSWORD=${dbPassword}`);
  } else {
    env = `# DB-local Setup\nDB_PASSWORD=${dbPassword}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.db-only.yml'))) {
    print('Fehler: docker-compose.db-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Starte PostgreSQL...');
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  print('PostgreSQL läuft.\n');

  print('Prüfe SSH-Server...');
  let sshOk = false;
  try {
    if (os.platform() === 'win32') {
      execSync('where sshd', { stdio: 'pipe' });
      sshOk = true;
    } else {
      execSync('which sshd', { stdio: 'pipe' });
      sshOk = true;
    }
  } catch (_) {}
  if (!sshOk) {
    print('\nHinweis: SSH-Server (sshd) nicht gefunden.');
    if (os.platform() === 'linux') {
      print('Installieren: sudo apt install openssh-server  (oder dnf/zypper/pacman)');
    } else if (os.platform() === 'win32') {
      print('Windows: OpenSSH-Server als optionales Feature aktivieren.');
    }
    print('Fahre trotzdem fort – die Credentials werden erstellt.\n');
  }

  const jwtSecret = await ask(rl, 'JWT_SECRET (optional hier; sonst auf App-Rechner eingeben)', envContent.JWT_SECRET || '');

  const { createCredentialsBundleLocal } = require('./ssh-credentials');
  print('Erstelle SSH-Schlüssel und Credentials...');
  const bundle = createCredentialsBundleLocal(dbPassword, dbHost, 5432);
  if (jwtSecret) bundle.jwt_secret = jwtSecret;
  fs.writeFileSync(CREDS_PATH, JSON.stringify(bundle, null, 2), { mode: 0o600 });

  printTransferFiles(dbHost, false);

  print('Nächste Schritte:');
  print('1. Kopiere podcast-ssh-credentials.json auf den App-Rechner');
  print('2. Auf dem App-Rechner: node scripts/setup.js --app-only-ssh');
  print('3. Gib den Pfad zur Credentials-Datei an.');
  print('');
  print('Starte Live DB-Log... (Strg+C zum Beenden)\n');
  rl.close();
  const child = spawn(process.execPath, [path.join(__dirname, 'db-log-viewer.js')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  child.on('close', (code) => process.exit(code ?? 0));
}

async function setupOnlyDbSsh(rl) {
  print('\n=== Nur PostgreSQL + Reverse-SSH (DB-Host, Remote-Zugang via VPS) ===\n');
  print('Richtet DB und Reverse-SSH-Tunnel ein. Benötigt einen VPS mit öffentlicher IP.\n');

  print('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Fahre fort.\n');
  }

  let dbPassword = '';
  const envContent = loadEnv();
  dbPassword = envContent.DB_PASSWORD || '';
  dbPassword = await ask(rl, 'DB_PASSWORD', dbPassword || '');

  if (!dbPassword) {
    print('\nFehler: DB_PASSWORD ist erforderlich.\n');
    process.exit(1);
  }

  const vpsHost = await ask(rl, 'VPS_HOST (Hostname oder IP des VPS)', '');
  const vpsUser = await ask(rl, 'VPS_USER (SSH-Benutzer auf dem VPS)', os.userInfo().username);

  if (!vpsHost || !vpsUser) {
    print('\nFehler: VPS_HOST und VPS_USER sind erforderlich.\n');
    process.exit(1);
  }

  let env = '';
  if (fs.existsSync(ENV_PATH)) {
    env = fs.readFileSync(ENV_PATH, 'utf8');
    if (!env.includes('DB_PASSWORD=')) env += `\nDB_PASSWORD=${dbPassword}\n`;
    else env = env.replace(/DB_PASSWORD=[^\r\n]*/, `DB_PASSWORD=${dbPassword}`);
  } else {
    env = `# DB-only SSH Setup\nDB_PASSWORD=${dbPassword}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.db-only.yml'))) {
    print('Fehler: docker-compose.db-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Starte PostgreSQL...');
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  print('PostgreSQL läuft.\n');

  const jwtSecret = await ask(rl, 'JWT_SECRET (optional hier; sonst auf App-Rechner eingeben)', envContent.JWT_SECRET || '');

  const { createCredentialsBundle, getPublicKey } = require('./ssh-credentials');
  print('Erstelle SSH-Schlüssel und Credentials...');
  const bundle = createCredentialsBundle(dbPassword, vpsHost, vpsUser, 5432);
  if (jwtSecret) bundle.jwt_secret = jwtSecret;
  fs.writeFileSync(CREDS_PATH, JSON.stringify(bundle, null, 2), { mode: 0o600 });

  printTransferFiles(vpsHost, true);
  printReverseSshInstructions(vpsHost, vpsUser, getPublicKey());

  print('Starte Live DB-Log... (Strg+C zum Beenden)\n');
  rl.close();
  const child = spawn(process.execPath, [path.join(__dirname, 'db-log-viewer.js')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  child.on('close', (code) => process.exit(code ?? 0));
}

function printReverseSshInstructions(vpsHost, vpsUser, publicKey) {
  const credsAbs = path.resolve(CREDS_PATH);
  const reverseCmd = `autossh -M 0 -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" -R 5432:localhost:5432 -i "${path.join(ROOT, '.ssh', 'podcast_tunnel')}" -N ${vpsUser}@${vpsHost}`;
  const sshCmd = `ssh -R 5432:localhost:5432 -o ServerAliveInterval=30 -i "${path.join(ROOT, '.ssh', 'podcast_tunnel')}" -N ${vpsUser}@${vpsHost}`;

  print('');
  print('=== NÄCHSTE SCHRITTE (manuell ausführen) ===');
  print('');
  print('1. Auf dem VPS: Füge den öffentlichen Schlüssel zu ~/.ssh/authorized_keys hinzu:');
  print('');
  print('   ' + publicKey);
  print('');
  print('2. Auf dem DB-Rechner: Starte den Reverse-SSH-Tunnel (läuft im Hintergrund):');
  print('');
  print('   Mit autossh (empfohlen, hält Verbindung automatisch):');
  print('   ' + reverseCmd);
  print('');
  print('   Oder mit ssh (falls autossh nicht installiert):');
  print('   ' + sshCmd);
  print('');
  print('   Oder: node scripts/reverse-ssh-tunnel.js');
  print('');
  print('3. Kopiere die Credentials-Datei auf den App-Rechner:');
  print('   ' + credsAbs);
  print('');
  print('4. Auf dem App-Rechner: node scripts/setup.js --app-only-ssh');
  print('   Gib den Pfad zur Credentials-Datei an.');
  print('');
  print('=== ENDE ===');
  print('');
}

async function setupAppOnly(rl) {
  print('\n=== Nur App (verbindet zu Remote-DB) ===\n');
  const envContent = loadEnv();
  const dbHost = await ask(rl, 'DB_HOST (IP des DB-Rechners)', envContent.DB_HOST || '');
  const dbPort = await ask(rl, 'DB_PORT', envContent.DB_PORT || '5432');
  const dbPassword = await ask(rl, 'DB_PASSWORD', envContent.DB_PASSWORD || '');
  const jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', envContent.JWT_SECRET || '');
  const publicUrl = await ask(rl, 'PUBLIC_URL', envContent.PUBLIC_URL || 'http://localhost:3000');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', envContent.CORS_ORIGIN || '');

  if (!dbHost || !dbPassword || !jwtSecret) {
    print('\nFehler: DB_HOST, DB_PASSWORD und JWT_SECRET sind erforderlich.\n');
    process.exit(1);
  }

  const port = dbPort || '5432';
  const env = `# App-only Setup
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=${publicUrl}
JWT_SECRET=${jwtSecret}
DB_HOST=${dbHost}
DB_PORT=${port}
DB_PASSWORD=${dbPassword}
DATABASE_URL=postgresql://podcast:${dbPassword}@${dbHost}:${port}/podcasts
${corsOrigin ? `CORS_ORIGIN=${corsOrigin}` : ''}
`;
  fs.writeFileSync(ENV_PATH, env);
  print('\nErstellt: .env\n');

  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {}

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.app-only.yml'))) {
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
    print('Prüfe: docker compose -f docker-compose.app-only.yml logs\n');
  }
  print('\nStopp: docker compose -f docker-compose.app-only.yml down');
  printAppLink(publicUrl, true);
}

async function setupAppOnlySsh(rl) {
  print('\n=== Nur App (via SSH-Tunnel zur Remote-DB) ===\n');
  print('Verbindet über SSH-Tunnel – funktioniert auch aus anderen Netzwerken.\n');

  let credsPath = await ask(rl, 'Pfad zu podcast-ssh-credentials.json (oder leer für manuelle Eingabe)', '');
  credsPath = credsPath.trim();

  let bundle = null;
  if (credsPath && fs.existsSync(credsPath)) {
    try {
      bundle = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    } catch (e) {
      print('Fehler beim Lesen der Datei.\n');
    }
  }

  if (bundle) {
    bundle.ssh_host = bundle.ssh_host || bundle.vps_host;
    bundle.ssh_user = bundle.ssh_user || bundle.vps_user;
  }

  if (!bundle) {
    print('Manuelle Eingabe:\n');
    const sshHost = await ask(rl, 'SSH_HOST (VPS bei Remote, DB-IP bei gleichem Netzwerk)', '');
    const sshUser = await ask(rl, 'SSH_USER', os.userInfo().username);
    let keyPath = await ask(rl, 'Pfad zum privaten SSH-Schlüssel', '');
    keyPath = keyPath.replace(/^["'\s]+|["'\s]+$/g, '').trim();
    const dbPassword = await ask(rl, 'DB_PASSWORD', '');
    if (!sshHost || !sshUser || !keyPath || !dbPassword) {
      print('\nFehler: Alle Angaben erforderlich.\n');
      process.exit(1);
    }
    let keyContent = null;
    if (fs.existsSync(keyPath)) {
      try {
        keyContent = fs.readFileSync(keyPath, 'utf8');
        if (!keyContent.includes('PRIVATE KEY')) keyContent = null;
      } catch (_) {}
    }
    bundle = {
      ssh_host: sshHost,
      ssh_user: sshUser,
      ssh_private_key: keyContent,
      db_password: dbPassword,
      db_port: 5432,
    };
    if (!bundle.ssh_private_key) {
      print('\nFehler: Schlüsseldatei nicht gefunden.');
      print('Prüfe den Pfad (ohne Anführungszeichen): ' + path.resolve(keyPath));
      print('Tipp: Nutze die podcast-ssh-credentials.json vom DB-Rechner – darin ist der Schlüssel bereits enthalten.\n');
      process.exit(1);
    }
  }

  const sshDir = path.join(ROOT, '.ssh');
  if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir, { mode: 0o700 });
  const keyPath = path.join(sshDir, 'podcast_tunnel');
  fs.writeFileSync(keyPath, bundle.ssh_private_key, { mode: 0o600 });
  if (os.platform() !== 'win32') {
    try { fs.chmodSync(keyPath, 0o600); } catch (_) {}
  }

  const envContent = loadEnv();
  let jwtSecret = bundle.jwt_secret || envContent.JWT_SECRET || '';
  if (!jwtSecret) {
    jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', '');
    if (!jwtSecret) {
      print('\nFehler: JWT_SECRET ist erforderlich.\n');
      process.exit(1);
    }
  } else {
    print('JWT_SECRET aus Credentials übernommen.');
  }
  const publicUrl = await ask(rl, 'PUBLIC_URL', envContent.PUBLIC_URL || 'http://localhost:3000');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', envContent.CORS_ORIGIN || '');

  const localPort = 5433;
  const env = `# App-only via SSH-Tunnel
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=${publicUrl}
JWT_SECRET=${jwtSecret}
DB_HOST=localhost
DB_PORT=${localPort}
DB_PASSWORD=${bundle.db_password}
DATABASE_URL=postgresql://podcast:${bundle.db_password}@localhost:${localPort}/podcasts
${corsOrigin ? `CORS_ORIGIN=${corsOrigin}` : ''}
`;
  fs.writeFileSync(ENV_PATH, env);

  print('\nStarte SSH-Tunnel zu ' + bundle.ssh_host + '...');
  const tunnel = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=10',
    '-L', `${localPort}:localhost:${bundle.db_port || 5432}`,
    '-i', keyPath,
    '-N',
    `${bundle.ssh_user}@${bundle.ssh_host}`,
  ], { stdio: ['ignore', 'pipe', 'pipe'], cwd: ROOT });

  let stderrBuf = '';
  tunnel.stderr.on('data', (ch) => {
    stderrBuf += ch.toString();
    process.stderr.write(ch);
  });

  tunnel.on('error', (err) => {
    print('SSH-Tunnel Fehler: ' + err.message);
    print('Prüfe: Ist ssh installiert? (OpenSSH)');
    process.exit(1);
  });

  let tunnelReady = false;
  tunnel.on('close', (code, signal) => {
    if (!tunnelReady) return;
    if (code !== 0) print('\nSSH-Tunnel wurde beendet (Code: ' + code + ').');
  });

  await new Promise((r) => setTimeout(r, 2500));
  if (tunnel.killed || !tunnel.connected || (tunnel.exitCode != null && tunnel.exitCode !== 0)) {
    print('');
    print('SSH-Tunnel konnte nicht gestartet werden.');
    if (stderrBuf.trim()) print('SSH-Ausgabe: ' + stderrBuf.trim().split('\n').join(' '));
    print('');
    print('Mögliche Ursachen:');
    print('  - Host ' + bundle.ssh_host + ' nicht erreichbar (Netzwerk, Firewall?)');
    print('  - Bei Remote: Läuft der Reverse-Tunnel auf dem DB-Rechner?');
    print('  - SSH-Schlüssel oder Benutzer falsch?');
    print('  - Test: ssh -i "' + keyPath + '" ' + bundle.ssh_user + '@' + bundle.ssh_host);
    process.exit(1);
  }
  tunnelReady = true;
  print('SSH-Tunnel läuft.\n');

  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {}

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.app-only.yml'))) {
    print('Fehler: docker-compose.app-only.yml fehlt.\n');
    process.exit(1);
  }

  print('Baue und starte die App...');
  ensureDockerReady();
  runDockerComposeWithRetry('docker-compose.app-only.yml', ['build', 'up -d']);

  print('\nWarte auf App und teste DB-Verbindung...');
  try {
    await waitForApp('http://localhost:3000');
    print('App läuft, DB-Verbindung OK.');
  } catch (e) {
    print('\nWarnung: ' + e.message);
  }

  print('\nStopp: Strg+C beendet App und SSH-Tunnel.');
  printAppLink(publicUrl, true);
  print('Konfiguration gespeichert in:');
  print('  .env: ' + path.resolve(ENV_PATH));
  print('  SSH-Schlüssel: ' + path.resolve(path.join(ROOT, '.ssh', 'podcast_tunnel')));

  process.on('SIGINT', () => {
    tunnel.kill('SIGINT');
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    tunnel.kill('SIGTERM');
    process.exit(0);
  });

  tunnel.on('close', (code) => {
    if (code !== 0 && tunnelReady) {
      print('\nSSH-Tunnel wurde beendet.');
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes('--dev');
  const isProd = args.includes('--prod');
  const isOnlyDb = args.includes('--only-db');
  const isDbLocal = args.includes('--db-local');
  const isAppOnly = args.includes('--app-only');
  const isDbOnlySsh = args.includes('--db-only-ssh');
  const isAppOnlySsh = args.includes('--app-only-ssh');

  const modes = [isDev, isProd, isOnlyDb, isDbLocal, isAppOnly, isDbOnlySsh, isAppOnlySsh].filter(Boolean);
  if (modes.length === 0) {
    print('BBS Podcast Platform - Setup');
    print('');
    print('Verwendung:');
    print('  node scripts/setup.js --dev           Entwicklung (localhost, SQLite)');
    print('  node scripts/setup.js --prod          Produktion (App + DB)');
    print('  node scripts/setup.js --only-db       Nur PostgreSQL (DB-Host, direkte Verbindung)');
    print('  node scripts/setup.js --db-local      Nur DB + SSH (gleiches Netzwerk, sichere Verbindung)');
    print('  node scripts/setup.js --app-only      Nur App (direkte DB-Verbindung)');
    print('  node scripts/setup.js --db-only-ssh   Nur DB + Reverse-SSH (Remote via VPS)');
    print('  node scripts/setup.js --app-only-ssh  Nur App (via SSH-Tunnel)');
    print('');
    process.exit(0);
  }

  if (modes.length > 1) {
    print('Fehler: Gib nur einen Modus an.\n');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    if (isDev) await setupDev(rl);
    else if (isProd) await setupProd(rl);
    else if (isOnlyDb) await setupOnlyDb(rl);
    else if (isDbLocal) await setupDbLocal(rl);
    else if (isAppOnly) await setupAppOnly(rl);
    else if (isDbOnlySsh) await setupOnlyDbSsh(rl);
    else await setupAppOnlySsh(rl);
  } finally {
    try { rl.close(); } catch (_) {}
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
