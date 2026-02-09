#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod | --db-only | --app-only | --app-only-ssh | ...
 * --db-only:      DB only (no SSH, direct connection)
 * --app-only:     App only (no SSH, direct DB connection)
 * --app-only-ssh: App only via SSH tunnel (optional, for remote/same-network secure access)
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const os = require('os');
const path = require('path');
const readline = require('readline');
const { execSync, spawn } = require('child_process');
let readSecret; // lazy load for optional dependency
try {
  readSecret = require('read').read;
} catch (_) {}

// ═══════════════════════════════════════════════════════════════════════════════
// Terminal Visualizer - ANSI colors & effects
// ═══════════════════════════════════════════════════════════════════════════════
const supportsColor = process.stdout.isTTY && process.env.TERM !== 'dumb';
const c = {
  reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
  cyan: '\x1b[36m', blue: '\x1b[34m', green: '\x1b[32m', yellow: '\x1b[33m',
  magenta: '\x1b[35m', red: '\x1b[31m', white: '\x1b[37m',
  bgCyan: '\x1b[46m', bgBlue: '\x1b[44m', bgGreen: '\x1b[42m',
};
function col(txt, ...codes) {
  if (!supportsColor) return txt;
  return codes.reduce((s, code) => c[code] || '' + s, '') + String(txt) + c.reset;
}

const BARS = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█'];
const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function progressBar(percent, width = 32, label = '') {
  const filled = Math.floor((percent / 100) * width);
  const sub = Math.floor(((percent / 100) * width - filled) * (BARS.length - 1));
  const bar = BARS[BARS.length - 1].repeat(filled) + (filled < width ? BARS[sub] || '' : '');
  const empty = '░'.repeat(width - bar.length);
  return `  ${col('▐', 'bright')}${col(bar, 'cyan')}${empty}${col('▌', 'bright')} ${col(Math.round(percent) + '%', 'bright', 'cyan')}  ${label}`;
}

function animateProgressBar(durationMs, label, updateInterval = 80) {
  return new Promise((resolve) => {
    const start = Date.now();
    let lastLine = '';
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      const line = progressBar(pct, 28, label);
      process.stdout.write('\r' + ' '.repeat(lastLine.length) + '\r' + line);
      lastLine = line;
      if (pct >= 100) {
        clearInterval(iv);
        process.stdout.write('\r' + ' '.repeat(lastLine.length) + '\r');
        resolve();
      }
    }, updateInterval);
  });
}

function spinnerFrame(i) {
  return SPINNER[i % SPINNER.length];
}

async function runWithSpinner(promise, label) {
  let i = 0;
  const iv = setInterval(() => {
    process.stdout.write(`\r  ${col(spinnerFrame(i++), 'cyan')} ${label}`);
  }, 80);
  try {
    await promise;
    clearInterval(iv);
    process.stdout.write(`\r  ${col('✓', 'green')} ${label}${' '.repeat(20)}\n`);
    return true;
  } catch (e) {
    clearInterval(iv);
    process.stdout.write(`\r  ${col('✗', 'red')} ${label}\n`);
    throw e;
  }
}

function banner() {
  const w = 50;
  const title = '▸ BBS Podcast Platform · Setup Wizard';
  const pad = ' '.repeat(Math.max(0, w - 2 - title.length));
  const line = '─'.repeat(w);
  console.log('');
  console.log(col('  ╭' + line + '╮', 'cyan'));
  console.log(col('  │ ', 'cyan') + col(title, 'bright', 'white') + col(pad + ' │', 'cyan'));
  console.log(col('  ╰' + line + '╯', 'cyan'));
  console.log('');
}

function section(title, icon = '◆') {
  const line = col('─'.repeat(56), 'dim');
  console.log('');
  console.log(col(`  ${icon} `, 'cyan') + col(title, 'bright', 'white'));
  console.log('  ' + line);
}

let _stepCounter = 0;
function stepReset() {
  _stepCounter = 0;
}
function step(msg) {
  _stepCounter++;
  console.log(col(`  [${_stepCounter}] `, 'cyan') + msg);
}

function success(msg) {
  console.log(col('  ✓ ', 'green') + col(msg, 'green'));
}

function warn(msg) {
  console.log(col('  ⚠ ', 'yellow') + col(msg, 'yellow'));
}

function error(msg) {
  console.log(col('  ✗ ', 'red') + col(msg, 'red'));
}

function checkPortReachable(host, port, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const t = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeoutMs);
    socket.connect(port, host, () => {
      clearTimeout(t);
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      clearTimeout(t);
      resolve(false);
    });
  });
}

const ROOT = path.resolve(path.join(__dirname, '..'));
const ENV_PATH = path.join(ROOT, '.env');
const CREDS_PATH = path.join(ROOT, 'podcast-ssh-credentials.json');

/** Detect Docker / Dev Container environment (Docker Desktop, Docker-in-Docker, Dev Containers) */
function isDockerEnv() {
  return (
    fs.existsSync('/.dockerenv') ||
    !!process.env.DOCKER ||
    !!process.env.DEVCONTAINER ||
    (process.env.RUNNING_IN_CONTAINER === 'true')
  );
}

/** SSH key path for --app-only-ssh: always in project root, absolute path (works on any machine/cwd) */
function getAppSshKeyPath() {
  return path.resolve(ROOT, 'podcast_tunnel');
}

function getAppSshPubKeyPath() {
  return path.resolve(ROOT, 'podcast_tunnel.pub');
}

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
      console.log(col('  ⏳ ', 'yellow') + col('Versuche Docker mit winget zu installieren...', 'yellow'));
      execSync('winget install Docker.DockerDesktop --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
      return true;
    }
    if (os.platform() === 'darwin') {
      console.log(col('  ⏳ ', 'yellow') + col('Installiere Docker mit Homebrew...', 'yellow'));
      execSync('brew install --cask docker', { stdio: 'inherit' });
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

async function ensureDockerReady() {
  if (isDockerReady()) return;
  console.log('');
  error('Docker ist nicht bereit.');
  const inContainer = isDockerEnv();
  if (inContainer) {
    console.log('');
    warn('Läuft in Docker/Dev Container. Stelle sicher, dass der Docker-Socket gemountet ist.');
    warn('Beispiel: -v /var/run/docker.sock:/var/run/docker.sock');
  }
  try {
    execSync('docker --version', { stdio: 'pipe' });
  } catch (_) {
    error('Docker scheint nicht installiert zu sein.');
    if (!inContainer && tryInstallDocker()) {
      console.log('');
      success('Docker wurde installiert. Starte Docker Desktop und führe dieses Skript erneut aus.');
      process.exit(0);
    }
    console.log('');
    error('Installation fehlgeschlagen. Bitte Docker manuell installieren oder Docker Desktop starten.');
    process.exit(1);
  }
  if (inContainer) {
    error('Docker-Daemon in Container nicht erreichbar. Starte das Setup auf dem Host mit Docker Desktop.');
    process.exit(1);
  }
  step(col('Docker-Daemon läuft nicht. Starte Docker Desktop...', 'yellow'));
  if (tryStartDockerDesktop()) {
    const maxWait = 90;
    const start = Date.now();
    for (let i = 0; i < 30; i++) {
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.min(95, (elapsed / maxWait) * 100);
      process.stdout.write('\r' + progressBar(pct, 32, col('Warte auf Docker...', 'dim')) + '    ');
      if (isDockerReady()) {
        process.stdout.write('\r' + progressBar(100, 32, col('Docker bereit!', 'green')) + '\n');
        success('Docker ist bereit.');
        console.log('');
        return;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    console.log('');
    error('Docker startet zu langsam. Bitte starte Docker Desktop manuell.');
    process.exit(1);
  }
  console.log('');
  error('Docker Desktop wurde nicht gefunden. Bitte starte Docker manuell.');
  process.exit(1);
}

function waitForApp(baseUrl, maxAttempts = 60) {
  const url = (baseUrl.replace(/\/$/, '') + '/api/health');
  const parsed = new URL(url);
  const isHttps = parsed.protocol === 'https:';
  const client = isHttps ? https : http;
  const checkHost = parsed.hostname === '0.0.0.0' ? 'localhost' : parsed.hostname;
  const checkUrl = `${parsed.protocol}//${checkHost}:${parsed.port || (isHttps ? 443 : 80)}/api/health`;
  const interval = 2000;
  const maxDuration = maxAttempts * interval;
  const start = Date.now();

  return new Promise((resolve, reject) => {
    let attempts = 0;
    let lastPct = 0;
    const progressIv = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(95, (elapsed / maxDuration) * 100);
      if (pct > lastPct) {
        lastPct = pct;
        process.stdout.write('\r' + progressBar(pct, 32, col('Warte auf App & DB...', 'dim')) + '    ');
      }
    }, 250);
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
                clearInterval(progressIv);
                process.stdout.write('\r' + progressBar(100, 32, col('App bereit!', 'green')) + '\n');
                resolve(true);
                return;
              }
            } catch (_) {}
          }
          if (attempts >= maxAttempts) {
            clearInterval(progressIv);
            reject(new Error('App oder DB-Verbindung nicht bereit'));
          } else setTimeout(tryFetch, interval);
        });
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          clearInterval(progressIv);
          reject(new Error('App nicht erreichbar'));
        } else setTimeout(tryFetch, interval);
      });
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          clearInterval(progressIv);
          reject(new Error('App antwortet nicht'));
        } else setTimeout(tryFetch, interval);
      });
    };
    tryFetch();
  });
}

async function runDockerComposeWithRetry(composeFile, commands) {
  const run = () => {
    for (const cmd of commands) {
      execSync(`docker compose -f ${composeFile} ${cmd}`, { cwd: ROOT, stdio: 'inherit' });
    }
  };
  try {
    run();
  } catch (e) {
    if (isDockerDaemonError(e)) {
      await ensureDockerReady();
      run();
    } else {
      throw e;
    }
  }
}

function ask(rl, question, defaultValue = '', options = {}) {
  const { secret = false } = options;
  if (secret && readSecret && process.stdin.isTTY) {
    const prompt = col(question, 'cyan') + ': ';
    return new Promise((resolve, reject) => {
      readSecret({
        prompt,
        silent: true,
        default: defaultValue || undefined,
      })
        .then((v) => resolve(String(v || '').trim() || defaultValue))
        .catch((e) => (e.message === 'canceled' ? process.exit(130) : reject(e)));
    });
  }
  const suffix = defaultValue ? ` ${col('[', 'dim')}${defaultValue}${col(']', 'dim')}: ` : ': ';
  if (secret && !readSecret) {
    warn('Hinweis: Passwort wird sichtbar eingegeben (read-Paket fehlt oder kein TTY).');
  }
  return new Promise((resolve) => {
    rl.question(col(question, 'cyan') + suffix, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function printAppLink(url, isRunning = false) {
  const u = url.replace(/\/$/, '');
  const adminUrl = u + '/admin/';
  const w = Math.max(40, u.length + 4, adminUrl.length + 10);
  const pad = (s, len) => s + ' '.repeat(Math.max(0, len - s.length));
  console.log('');
  console.log(col('  ┌' + '─'.repeat(w - 2) + '┐', 'green'));
  console.log(col('  │ ', 'green') + col(pad(isRunning ? '✓ App läuft' : '► App-URL', w - 4), 'bright', 'green') + col(' │', 'green'));
  console.log(col('  ├' + '─'.repeat(w - 2) + '┤', 'green'));
  console.log(col('  │ ', 'green') + col(pad(u, w - 4), 'bright', 'cyan') + col(' │', 'green'));
  console.log(col('  │ ', 'green') + col(pad('Admin: ' + adminUrl, w - 4), 'dim') + col(' │', 'green'));
  console.log(col('  └' + '─'.repeat(w - 2) + '┘', 'green'));
  console.log('');
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

function printTransferFiles(sshHost, isVps = false, sshUser = null) {
  const credsAbs = path.resolve(CREDS_PATH);
  const rootAbs = path.resolve(ROOT);
  const sshDir = path.join(ROOT, '.ssh');
  const sshKeyPath = path.join(sshDir, 'podcast_tunnel');
  const user = sshUser || os.userInfo().username;
  const credsPathForScp = credsAbs.replace(/\\/g, '/');

  print('');
  print('=== DATEIEN FÜR ÜBERTRAGUNG ===');
  print('');
  print('Diese Datei auf den App-Rechner kopieren:');
  print('  ' + credsAbs);
  print('');
  print('SCP-Befehl (vom App-Rechner aus, gleiches Netzwerk):');
  print('  scp ' + user + '@' + sshHost + ':' + credsPathForScp + ' .');
  print('');
  print('Windows (PowerShell, mit OpenSSH):');
  print('  scp ' + user + '@' + sshHost + ':' + credsPathForScp + ' .');
  print('');
  const hostLabel = isVps ? 'ssh_host (VPS)' : 'ssh_host';
  print('Enthält: SSH-Schlüssel, DB_PASSWORD, ' + hostLabel + ' (' + sshHost + '), ssh_user');
  print('');
  print('=== ENDE ===');
  print('');
}

async function setupDev(rl) {
  section('Entwicklungs-Setup (localhost, SQLite)', '◇');
  stepReset();
  step('Erstelle .env...');
  const env = `# Entwicklungs-Setup
PORT=3000
HOST=0.0.0.0
PUBLIC_URL=http://localhost:3000
JWT_SECRET=dev-secret-change-in-production
DB_PATH=./data/podcasts.db
`;
  fs.writeFileSync(ENV_PATH, env);
  success('.env erstellt');
  step('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    success('Abhängigkeiten installiert');
  } catch (e) {
    warn('npm install fehlgeschlagen – führe es manuell aus.');
  }
  console.log('');
  success('Entwicklungs-Setup abgeschlossen!');
  console.log('');
  console.log(col('  Start:', 'dim') + ' npm start');
  console.log(col('  Oder:', 'dim') + ' docker compose up -d');
  printAppLink('http://localhost:3000', false);
}

async function setupProd(rl) {
  section('Produktions-Setup', '◇');
  stepReset();
  step('Konfiguration abfragen...');
  const envContent = loadEnv();
  const publicUrl = await ask(rl, 'PUBLIC_URL', envContent.PUBLIC_URL || 'https://podcast.bbs2-wob.de');
  const dbPassword = await ask(rl, 'DB_PASSWORD', envContent.DB_PASSWORD || '', { secret: true });
  const jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', envContent.JWT_SECRET || '', { secret: true });
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
  step('.env erstellen...');
  fs.writeFileSync(ENV_PATH, env);
  success('.env erstellt');
  step('Abhängigkeiten installieren...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    success('Abhängigkeiten installiert');
  } catch (e) {
    warn('npm install fehlgeschlagen – ggf. manuell ausführen.');
  }
  console.log('');
  success('Produktions-Setup abgeschlossen!');
  console.log(col('  Start:', 'dim') + ' docker compose -f docker-compose.prod.yml up -d');
  printAppLink(publicUrl, false);
}

async function setupOnlyDb(rl) {
  section('Nur PostgreSQL (DB-Host)', '◇');
  stepReset();
  let dbPassword = '';
  const envContent = loadEnv();
  dbPassword = envContent.DB_PASSWORD || '';
  dbPassword = await ask(rl, 'DB_PASSWORD', dbPassword || '', { secret: true });

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

  step('Starte PostgreSQL...');
  await ensureDockerReady();
  await runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  success('PostgreSQL läuft');
  const ip = getLocalIP();
  console.log('');
  console.log(col('  DB_HOST für App-Rechner: ', 'dim') + col(ip, 'bright', 'cyan'));
  console.log(col('  Beispiel: ', 'dim') + col('node scripts/setup.js --app-only', 'cyan'));
  console.log(col('  Live DB-Log: ', 'dim') + col('node scripts/db-log-viewer.js', 'cyan'));
  console.log('');
}

async function setupDbLocal(rl) {
  section('Nur PostgreSQL + SSH (DB-Host, gleiches Netzwerk)', '◇');
  stepReset();
  console.log(col('  Richtet DB mit SSH-Authentifizierung ein. App verbindet per SSH-Tunnel.\n', 'dim'));

  step('Installiere Abhängigkeiten...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    print('Hinweis: npm install fehlgeschlagen. Fahre fort.\n');
  }

  let dbPassword = '';
  const envContent = loadEnv();
  dbPassword = envContent.DB_PASSWORD || '';
  dbPassword = await ask(rl, 'DB_PASSWORD', dbPassword || '', { secret: true });

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

  step('Starte PostgreSQL...');
  await ensureDockerReady();
  await runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  success('PostgreSQL läuft');

  step('Prüfe SSH-Server...');
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

  const jwtSecret = await ask(rl, 'JWT_SECRET (optional hier; sonst auf App-Rechner eingeben)', envContent.JWT_SECRET || '', { secret: true });

  const { createCredentialsBundleLocal, getAuthorizedKeysPath } = require('./ssh-credentials');
  print('Erstelle SSH-Schlüssel und Credentials...');
  const bundle = createCredentialsBundleLocal(dbPassword, dbHost, 5432);
  if (jwtSecret) bundle.jwt_secret = jwtSecret;
  fs.writeFileSync(CREDS_PATH, JSON.stringify(bundle, null, 2), { mode: 0o600 });

  const authKeysPath = getAuthorizedKeysPath();
  print('  Öffentlicher Schlüssel wurde in ' + authKeysPath + ' eingetragen.');

  print('\nPrüfe SSH-Erreichbarkeit (Port 22)...');
  const sshReachable = await checkPortReachable('127.0.0.1', 22);
  if (sshReachable) {
    print('  SSH-Server erreichbar. App kann per ssh_host=' + dbHost + ' verbinden.');
  } else {
    print('');
    print('  WARNUNG: SSH-Server (Port 22) nicht erreichbar!');
    print('  Die App wird keine Verbindung herstellen können.');
    print('  Prüfe auf dem DB-Rechner:');
    print('    - Linux: sudo systemctl status sshd  bzw.  sudo systemctl start sshd');
    print('    - Windows: OpenSSH-Server-Dienst starten');
    print('    - Firewall: Port 22 muss erlaubt sein');
    print('');
  }

  printTransferFiles(dbHost, false, bundle.ssh_user);

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
  section('Nur PostgreSQL + Reverse-SSH (Remote-Zugang via VPS)', '◇');
  stepReset();
  console.log(col('  Richtet DB und Reverse-SSH-Tunnel ein. Benötigt einen VPS mit öffentlicher IP.\n', 'dim'));

  step('Installiere Abhängigkeiten...');
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

  step('Starte PostgreSQL...');
  await ensureDockerReady();
  await runDockerComposeWithRetry('docker-compose.db-only.yml', ['up -d']);
  success('PostgreSQL läuft');

  const jwtSecret = await ask(rl, 'JWT_SECRET (optional hier; sonst auf App-Rechner eingeben)', envContent.JWT_SECRET || '', { secret: true });

  const { createCredentialsBundle, getPublicKey } = require('./ssh-credentials');
  print('Erstelle SSH-Schlüssel und Credentials...');
  const bundle = createCredentialsBundle(dbPassword, vpsHost, vpsUser, 5432);
  if (jwtSecret) bundle.jwt_secret = jwtSecret;
  fs.writeFileSync(CREDS_PATH, JSON.stringify(bundle, null, 2), { mode: 0o600 });

  print('Prüfe VPS-Erreichbarkeit (Port 22)...');
  const vpsReachable = await checkPortReachable(vpsHost, 22);
  if (vpsReachable) {
    print('  VPS ' + vpsHost + ' erreichbar.');
  } else {
    print('  Hinweis: VPS ' + vpsHost + ' nicht erreichbar (Port 22). Netzwerk/Firewall prüfen.');
  }

  printTransferFiles(vpsHost, true, vpsUser);
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
  section('Nur App (verbindet zu Remote-DB)', '◇');
  stepReset();
  step('Konfiguration abfragen...');
  const envContent = loadEnv();
  // Direct connection always uses PostgreSQL default 5432 (5433 is for SSH tunnel)
  const defaultPort = (envContent.DB_PORT === '5433') ? '5432' : (envContent.DB_PORT || '5432');
  const dbHost = await ask(rl, 'DB_HOST (IP des DB-Rechners)', envContent.DB_HOST || '');
  const dbPort = await ask(rl, 'DB_PORT (5432 für direkte Verbindung)', defaultPort);
  const dbPassword = await ask(rl, 'DB_PASSWORD', envContent.DB_PASSWORD || '', { secret: true });
  const jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', envContent.JWT_SECRET || '', { secret: true });
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
  step('.env erstellen...');
  fs.writeFileSync(ENV_PATH, env);
  success('.env erstellt');

  step('Abhängigkeiten installieren...');
  try {
    execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
    success('Abhängigkeiten installiert');
  } catch (e) {}

  if (!fs.existsSync(path.join(ROOT, 'docker-compose.app-only.yml'))) {
    print('Fehler: docker-compose.app-only.yml fehlt.\n');
    process.exit(1);
  }

  step('Docker prüfen und App starten...');
  await ensureDockerReady();
  await runDockerComposeWithRetry('docker-compose.app-only.yml', ['build', 'up -d']);

  print('\nWarte auf App und teste DB-Verbindung (bis zu 2 Min.)...');
  try {
    await waitForApp('http://localhost:3000');
    success('App läuft, DB-Verbindung OK.');
  } catch (e) {
    console.log('');
    warn(e.message);
    console.log(col('  Prüfe: ', 'dim') + 'docker compose -f docker-compose.app-only.yml logs');
  }
  console.log('');
  console.log(col('  Stopp: ', 'dim') + 'docker compose -f docker-compose.app-only.yml down');
  printAppLink(publicUrl, true);
}

async function setupAppOnlySsh(rl) {
  section('Nur App (via SSH-Tunnel zur Remote-DB)', '◇');
  stepReset();
  console.log(col('  Verbindet über SSH-Tunnel – funktioniert auch aus anderen Netzwerken.\n', 'dim'));

  step('Credentials laden oder manuell eingeben...');
  const defaultCredsPath = path.join(ROOT, 'podcast-ssh-credentials.json');
  let credsPath = await ask(rl, 'Pfad zu podcast-ssh-credentials.json (oder Enter für ./podcast-ssh-credentials.json)', defaultCredsPath);
  credsPath = (credsPath || defaultCredsPath).trim();

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
    const dbPassword = await ask(rl, 'DB_PASSWORD', '', { secret: true });
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

  let privateKey = bundle.ssh_private_key;
  if (!privateKey || !privateKey.includes('-----BEGIN') || !privateKey.includes('-----END')) {
    print('');
    print('Fehler: Ungültiger SSH-Privat Schlüssel in den Credentials.');
    print('Die podcast-ssh-credentials.json muss ssh_private_key mit einem gültigen PEM-Schlüssel enthalten.');
    print('Erstelle die Credentials neu auf dem DB-Rechner: node scripts/setup.js --db-local');
    print('');
    process.exit(1);
  }
  if (typeof privateKey === 'string' && privateKey.includes('\\n') && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (!privateKey.endsWith('\n')) privateKey += '\n';

  const keyPathAbs = getAppSshKeyPath();
  fs.writeFileSync(keyPathAbs, privateKey, { mode: 0o600 });
  if (os.platform() !== 'win32') {
    try { fs.chmodSync(keyPathAbs, 0o600); } catch (_) {}
  }
  print('SSH-Schlüssel aus Credentials in ' + keyPathAbs + ' geschrieben (Projektroot, unabhängig vom Arbeitsverzeichnis).');

  let pubKeyForDb = (bundle.ssh_public_key || '').replace(/\s+/g, ' ').trim();
  if (!pubKeyForDb) {
    const pubPath = getAppSshPubKeyPath();
    if (fs.existsSync(pubPath)) pubKeyForDb = fs.readFileSync(pubPath, 'utf8').replace(/\s+/g, ' ').trim();
  }
  if (pubKeyForDb) {
    print('');
    print('Wichtig: Auf dem DB-Rechner (' + bundle.ssh_host + ') muss genau dieser öffentliche Schlüssel');
    print('(aus derselben Credentials-Datei) in ~/.ssh/authorized_keys stehen (Benutzer: ' + bundle.ssh_user + ').');
    print('Falls noch nicht geschehen, auf dem DB-Rechner ausführen:');
    print('');
    print('  echo "' + pubKeyForDb + '" >> ~/.ssh/authorized_keys');
    print('');
  }

  const envContent = loadEnv();
  let jwtSecret = bundle.jwt_secret || envContent.JWT_SECRET || '';
  if (!jwtSecret) {
    jwtSecret = await ask(rl, 'JWT_SECRET (mind. 32 Zeichen, für Admin-Login)', '', { secret: true });
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

  print('\nPrüfe Erreichbarkeit von ' + bundle.ssh_host + ' (Port 22)...');
  const hostReachable = await checkPortReachable(bundle.ssh_host, 22);
  if (!hostReachable) {
    print('');
    print('Host ' + bundle.ssh_host + ' auf Port 22 nicht erreichbar.');
    print('Mögliche Ursachen:');
    print('  - Gleiches Netzwerk: SSH-Server auf dem DB-Rechner läuft nicht');
    print('    → DB-Rechner: sudo systemctl start sshd  (Linux)');
    print('  - Remote: Reverse-Tunnel auf dem DB-Rechner nicht gestartet');
    print('    → DB-Rechner: node scripts/reverse-ssh-tunnel.js');
    print('  - Firewall blockiert Port 22');
    print('');
    process.exit(1);
  }
  print('  Host erreichbar.');

  print('\nTeste SSH-Verbindung mit Schlüssel aus Projektroot...');
  let sshTestStderr = '';
  try {
    execSync('ssh', [
      '-o', 'StrictHostKeyChecking=accept-new',
      '-o', 'BatchMode=yes',
      '-o', 'ConnectTimeout=10',
      '-i', keyPathAbs,
      `${bundle.ssh_user}@${bundle.ssh_host}`,
      'echo', 'OK',
    ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], cwd: ROOT });
  } catch (e) {
    sshTestStderr = ((e.stderr || e.stdout || e.message) || '').toString().trim();
  }
  if (sshTestStderr) {
    print('');
    print('SSH-Test fehlgeschlagen. Ausgabe:');
    print(sshTestStderr.trim());
    print('');
    print('Der öffentliche Schlüssel aus deiner Credentials-Datei muss auf dem DB-Rechner in');
    print('  ~/.ssh/authorized_keys  (Benutzer: ' + bundle.ssh_user + ')');
    print('stehen. Auf dem DB-Rechner (' + bundle.ssh_host + ') ausführen:');
    print('');
    if (pubKeyForDb) {
      print('  echo "' + pubKeyForDb + '" >> ~/.ssh/authorized_keys');
      print('');
      print('Prüfe auf dem DB-Rechner: chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys');
      print('Dann erneut: node scripts/setup.js --app-only-ssh  (gleiche Credentials-Datei).');
    } else {
      print('  (Kein öffentlicher Schlüssel in Credentials – auf dem DB-Rechner: node scripts/setup.js --db-local)');
      print('');
      print('Dann die neue podcast-ssh-credentials.json kopieren und --app-only-ssh erneut ausführen.');
    }
    print('');
    print('Test: ssh -i "' + keyPathAbs + '" ' + bundle.ssh_user + '@' + bundle.ssh_host);
    process.exit(1);
  }
  print('  SSH-Verbindung OK.');

  print('\nStarte SSH-Tunnel zu ' + bundle.ssh_host + '...');
  const tunnel = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=10',
    '-L', `${localPort}:localhost:${bundle.db_port || 5432}`,
    '-i', keyPathAbs,
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
    if (tunnelReady && code !== 0) print('\nSSH-Tunnel wurde beendet (Code: ' + code + ').');
  });

  await new Promise((r) => setTimeout(r, 5000));
  if (tunnel.killed || !tunnel.connected || (tunnel.exitCode != null && tunnel.exitCode !== 0)) {
    print('');
    print('SSH-Tunnel konnte nicht gestartet werden.');
    if (stderrBuf.trim()) print('SSH-Ausgabe: ' + stderrBuf.trim());
    print('');
    print('Der öffentliche Schlüssel aus deiner Credentials-Datei muss auf dem DB-Rechner in');
    print('  ~/.ssh/authorized_keys  (Benutzer: ' + bundle.ssh_user + ')');
    print('stehen. Auf dem DB-Rechner (' + bundle.ssh_host + ') ausführen:');
    print('');
    if (pubKeyForDb) {
      print('  echo "' + pubKeyForDb + '" >> ~/.ssh/authorized_keys');
      print('');
      print('Dann erneut: node scripts/setup.js --app-only-ssh  (gleiche Credentials-Datei angeben).');
    } else {
      print('  (Kein öffentlicher Schlüssel in Credentials – auf dem DB-Rechner: node scripts/setup.js --db-local)');
      print('');
      print('Dann die neue podcast-ssh-credentials.json auf diesen Rechner kopieren und --app-only-ssh erneut ausführen.');
    }
    print('');
    print('Weitere Hinweise:');
    print('  - Schlüssel: Genau dieser Schlüssel (siehe oben) muss auf dem DB-Rechner stehen.');
    print('  - Benutzer: Stimmt ' + bundle.ssh_user + ' mit dem Linux-User auf dem DB-Rechner?');
    print('  - Test: ssh -i "' + keyPathAbs + '" ' + bundle.ssh_user + '@' + bundle.ssh_host);
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
  await ensureDockerReady();
  await runDockerComposeWithRetry('docker-compose.app-only.yml', ['build', 'up -d']);

  print('\nWarte auf App und teste DB-Verbindung...');
  try {
    await waitForApp('http://localhost:3000');
    success('App läuft, DB-Verbindung OK.');
  } catch (e) {
    console.log('');
    warn(e.message);
  }

  print('\nStopp: Strg+C beendet App und SSH-Tunnel.');
  printAppLink(publicUrl, true);
  print('Konfiguration gespeichert in:');
  print('  .env: ' + path.resolve(ENV_PATH));
  print('  SSH-Schlüssel: ' + getAppSshKeyPath());

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
  const isOnlyDb = args.includes('--only-db') || args.includes('--db-only');
  const isDbLocal = args.includes('--db-local');
  const isAppOnly = args.includes('--app-only') && !args.includes('--app-only-ssh');
  const isDbOnlySsh = args.includes('--db-only-ssh');
  const isAppOnlySsh = args.includes('--app-only-ssh');

  const modes = [isDev, isProd, isOnlyDb, isDbLocal, isAppOnly, isDbOnlySsh, isAppOnlySsh].filter(Boolean);
  if (modes.length === 0) {
    banner();
    console.log(col('  Verwendung:', 'bright') + col(' (SSH optional)', 'dim'));
    console.log('');
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--dev', 'cyan') + col('           Entwicklung (localhost, SQLite)', ''));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--prod', 'cyan') + col('          Produktion (App + DB)', ''));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--db-only', 'cyan') + col('       Nur DB (ohne SSH, direkte Verbindung)', ''));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--app-only', 'cyan') + col('      Nur App (ohne SSH, direkte DB-Verbindung)', ''));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--app-only-ssh', 'cyan') + col('  Nur App (via SSH-Tunnel, optional)', ''));
    console.log('');
    console.log(col('  DB + SSH:', 'bright') + col(' (optional, für sichere Verbindung)', 'dim'));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--db-local', 'cyan') + col('      DB + SSH (gleiches Netzwerk)', ''));
    console.log(col('  ', '') + col('node scripts/setup.js ', 'dim') + col('--db-only-ssh', 'cyan') + col('   DB + Reverse-SSH (Remote via VPS)', ''));
    console.log('');
    process.exit(0);
  }

  if (modes.length > 1) {
    error('Gib nur einen Modus an.');
    process.exit(1);
  }

  banner();

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
