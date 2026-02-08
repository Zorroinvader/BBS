#!/usr/bin/env node
/**
 * BBS Podcast Platform - Setup Script
 * Usage: node scripts/setup.js --dev | --prod | --only-db | --app-only | --db-only-ssh | --app-only-ssh
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

async function tryPortForward(port) {
  let lastExtIp = null;
  const methods = [
    ['UPnP (nat-upnp)', async () => {
      const natUpnp = require('nat-upnp');
      const client = natUpnp.createClient();
      return new Promise((resolve) => {
        const t = setTimeout(() => resolve(null), 6000);
        client.portMapping({ public: port, private: port, ttl: 3600 }, (err) => {
          if (err) { clearTimeout(t); resolve(null); return; }
          client.externalIp((e, ip) => {
            clearTimeout(t);
            if (!e && ip) lastExtIp = ip;
            resolve(!err);
          });
        });
      });
    }],
    ['UPnP (nat-port-mapper)', async () => {
      try {
        const { upnpNat } = await import('@achingbrain/nat-port-mapper');
        const client = upnpNat();
        for await (const gateway of client.findGateways({ signal: AbortSignal.timeout(6000) })) {
          await gateway.map(port, getLocalIP(), { protocol: 'tcp' });
          lastExtIp = await gateway.externalIp();
          await gateway.stop();
          return true;
        }
        return null;
      } catch (_) {
        return null;
      }
    }],
    ['NAT-PMP', async () => {
      try {
        const { pmpNat } = await import('@achingbrain/nat-port-mapper');
        const dg = require('default-gateway');
        const gw = await dg.v4();
        const gateway = pmpNat(gw.gateway);
        await gateway.map(port, getLocalIP(), { protocol: 'tcp' });
        lastExtIp = await gateway.externalIp();
        await gateway.stop();
        return true;
      } catch (_) {
        return null;
      }
    }],
  ];
  for (const [name, fn] of methods) {
    try {
      print('  Versuche ' + name + '...');
      const ok = await fn();
      if (ok) return lastExtIp || (await tryGetExternalIp()) || (await fetchExternalIp());
    } catch (_) {}
  }
  return null;
}

function tryGetExternalIp() {
  try {
    const natUpnp = require('nat-upnp');
    const client = natUpnp.createClient();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000);
      client.externalIp((err, ip) => {
        clearTimeout(timeout);
        resolve(err ? null : ip);
      });
    });
  } catch (e) {
    return Promise.resolve(null);
  }
}

async function fetchExternalIp() {
  return new Promise((resolve) => {
    const req = http.get('http://api.ipify.org', { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => resolve(data.trim() || null));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function isTailscaleInstalled() {
  try {
    execSync('tailscale version', { stdio: 'pipe' });
    return true;
  } catch (_) {
    return false;
  }
}

function getTailscaleIp() {
  try {
    const out = execSync('tailscale ip -4 -1', { stdio: 'pipe', encoding: 'utf8' });
    const ip = (out || '').trim();
    return ip && /^100\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
  } catch (_) {
    return null;
  }
}

function tryInstallTailscale() {
  if (os.platform() === 'win32') {
    try {
      print('Installiere Tailscale (kein Port-Forwarding nötig)...');
      execSync('winget install Tailscale.Tailscale --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
      return true;
    } catch (e) {
      print('Winget fehlgeschlagen. Manuell: https://tailscale.com/download/windows');
      return false;
    }
  }
  if (os.platform() === 'darwin') {
    try {
      print('Installiere Tailscale...');
      execSync('brew install --cask tailscale', { stdio: 'inherit' });
      return true;
    } catch (e) {
      print('Homebrew fehlgeschlagen. Manuell: https://tailscale.com/download/mac');
      return false;
    }
  }
  if (os.platform() === 'linux') {
    const cmds = [
      ['Offizielles Install-Skript (sudo)', 'curl -fsSL https://tailscale.com/install.sh | sudo sh'],
      ['apt (Debian/Ubuntu)', 'sudo apt-get update && sudo apt-get install -y tailscale'],
      ['dnf (Fedora/RHEL)', 'sudo dnf install -y tailscale'],
      ['zypper (openSUSE)', 'sudo zypper install -y tailscale'],
      ['pacman (Arch)', 'sudo pacman -S --noconfirm tailscale'],
    ];
    for (const [label, cmd] of cmds) {
      try {
        print('Installiere Tailscale: ' + label + '...');
        execSync(cmd, { stdio: 'inherit' });
        return true;
      } catch (e) {
        print('  ' + label + ' fehlgeschlagen.');
      }
    }
    print('');
    print('Automatische Installation fehlgeschlagen. Bitte manuell installieren:');
    print('  curl -fsSL https://tailscale.com/install.sh | sudo sh');
    print('  Oder: https://tailscale.com/download/linux');
    print('');
    return false;
  }
  return false;
}

function printTransferFiles(sshHost) {
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
  print('Enthält: SSH-Schlüssel, DB_PASSWORD, ssh_host (' + sshHost + '), ssh_user');
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
  const publicUrl = await ask(rl, 'PUBLIC_URL', 'https://podcast.bbs2-wob.de');
  const dbPassword = await ask(rl, 'DB_PASSWORD', '');
  const jwtSecret = await ask(rl, 'JWT_SECRET', '');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', '');

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

async function setupOnlyDbSsh(rl) {
  print('\n=== Nur PostgreSQL + SSH-Tunnel (DB-Host) ===\n');
  print('Richtet DB und SSH-Zugang ein, damit die App von überall verbinden kann.\n');

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
      print('Installieren: sudo apt install openssh-server');
    } else if (os.platform() === 'win32') {
      print('Windows: OpenSSH-Server als optionales Feature aktivieren.');
    }
    print('Fahre trotzdem fort – du kannst später SSH einrichten.\n');
  }

  const { createCredentialsBundle } = require('./ssh-credentials');
  const localIp = getLocalIP();

  print('Erstelle SSH-Schlüssel und Credentials...');
  let sshHost = localIp;

  print('Versuche Portweiterleitung (Port 22)...');
  let portForwardOk = false;
  try {
    const extIp = await tryPortForward(22);
    if (extIp) {
      sshHost = extIp;
      portForwardOk = true;
      print('Port 22 weitergeleitet. Öffentliche IP: ' + sshHost);
    } else {
      print('Alle Port-Forwarding-Methoden fehlgeschlagen.');
    }
  } catch (e) {
    print('Port-Forwarding fehlgeschlagen: ' + (e.message || e));
  }

  if (!portForwardOk) {
    print('\nPort-Forwarding fehlgeschlagen. Wechsle automatisch zu Tailscale (kein Port-Forwarding nötig)...\n');
    let tailscaleIp = getTailscaleIp();
    if (tailscaleIp) {
      sshHost = tailscaleIp;
      print('Tailscale bereits verbunden. SSH-Host: ' + sshHost);
    } else if (!isTailscaleInstalled()) {
      print('Installiere Tailscale...');
      tryInstallTailscale();
      const fallback = await fetchExternalIp();
      if (fallback) sshHost = fallback;
      if (isTailscaleInstalled()) {
        print('Tailscale wurde installiert. Starte es (Startmenü bzw. sudo tailscale up) und melde dich an.');
        print('Skript erneut ausführen für Tailscale-IP in den Credentials.');
      } else {
        print('Tailscale-Installation fehlgeschlagen oder abgebrochen.');
        print('Alternativ: Tailscale manuell installieren oder Port 22 am Router weiterleiten.');
      }
    } else {
      print('Tailscale ist installiert, aber nicht verbunden.');
      print('Starte Tailscale: ' + (os.platform() === 'win32' ? 'Tailscale aus Startmenü starten' : 'sudo tailscale up'));
      print('Dann Skript erneut ausführen. Verwende vorläufig öffentliche IP.');
      const fallback = await fetchExternalIp();
      if (fallback) sshHost = fallback;
    }
  }

  const bundle = createCredentialsBundle(dbPassword, sshHost, 5432);
  fs.writeFileSync(CREDS_PATH, JSON.stringify(bundle, null, 2), { mode: 0o600 });

  printTransferFiles(sshHost);

  print('Nächste Schritte:');
  print('1. Kopiere die Credentials-Datei (siehe oben) auf den App-Rechner');
  print('2. Auf dem App-Rechner: node scripts/setup.js --app-only-ssh');
  print('3. Gib den Pfad zur Datei an.');
  print('');
  print('Starte Live DB-Log... (Strg+C zum Beenden)\n');
  rl.close();
  const child = spawn(process.execPath, [path.join(__dirname, 'db-log-viewer.js')], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  child.on('close', (code) => process.exit(code ?? 0));
}

async function setupAppOnly(rl) {
  print('\n=== Nur App (verbindet zu Remote-DB) ===\n');
  const dbHost = await ask(rl, 'DB_HOST (IP des DB-Rechners)', '');
  const dbPort = await ask(rl, 'DB_PORT', '5432');
  const dbPassword = await ask(rl, 'DB_PASSWORD', '');
  const jwtSecret = await ask(rl, 'JWT_SECRET', '');
  const publicUrl = await ask(rl, 'PUBLIC_URL', 'http://localhost:3000');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', '');

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

  if (!bundle) {
    print('Manuelle Eingabe:\n');
    const sshHost = await ask(rl, 'SSH_HOST (IP oder Hostname des DB-Rechners)', '');
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

  const jwtSecret = await ask(rl, 'JWT_SECRET', '');
  const publicUrl = await ask(rl, 'PUBLIC_URL', 'http://localhost:3000');
  const corsOrigin = await ask(rl, 'CORS_ORIGIN (optional)', '');

  if (!jwtSecret) {
    print('\nFehler: JWT_SECRET ist erforderlich.\n');
    process.exit(1);
  }

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

  print('\nStarte SSH-Tunnel...');
  const tunnel = spawn('ssh', [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'BatchMode=yes',
    '-L', `${localPort}:localhost:${bundle.db_port || 5432}`,
    '-i', keyPath,
    '-N',
    `${bundle.ssh_user}@${bundle.ssh_host}`,
  ], { stdio: 'pipe', cwd: ROOT });

  tunnel.on('error', (err) => {
    print('SSH-Tunnel Fehler: ' + err.message);
    print('Prüfe: SSH_HOST erreichbar? Schlüssel korrekt?');
    process.exit(1);
  });

  let tunnelReady = false;
  tunnel.stderr.on('data', (ch) => {
    const s = ch.toString();
    if (s.includes('Permission denied') || s.includes('Connection refused')) {
      print('SSH-Verbindung fehlgeschlagen: ' + s.trim());
    }
  });

  await new Promise((r) => setTimeout(r, 2000));
  if (tunnel.killed || !tunnel.connected) {
    print('SSH-Tunnel konnte nicht gestartet werden.');
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
  const isAppOnly = args.includes('--app-only');
  const isDbOnlySsh = args.includes('--db-only-ssh');
  const isAppOnlySsh = args.includes('--app-only-ssh');

  const modes = [isDev, isProd, isOnlyDb, isAppOnly, isDbOnlySsh, isAppOnlySsh].filter(Boolean);
  if (modes.length === 0) {
    print('BBS Podcast Platform - Setup');
    print('');
    print('Verwendung:');
    print('  node scripts/setup.js --dev           Entwicklung (localhost, SQLite)');
    print('  node scripts/setup.js --prod          Produktion (App + DB)');
    print('  node scripts/setup.js --only-db       Nur PostgreSQL (DB-Host)');
    print('  node scripts/setup.js --app-only      Nur App (direkte DB-Verbindung)');
    print('  node scripts/setup.js --db-only-ssh   Nur DB + SSH-Credentials (für Remote-Zugang)');
    print('  node scripts/setup.js --app-only-ssh  Nur App (via SSH-Tunnel, funktioniert überall)');
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
