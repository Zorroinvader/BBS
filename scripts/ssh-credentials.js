#!/usr/bin/env node
/**
 * SSH credentials for podcast tunnel.
 * For remote (VPS): generates key pair, user adds public key to VPS.
 * For local: generates key pair, adds to local authorized_keys.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SSH_DIR = path.join(ROOT, '.ssh');
const KEY_PATH = path.join(SSH_DIR, 'podcast_tunnel');
const PUB_PATH = KEY_PATH + '.pub';

const AUTH_KEYS_ENTRY = 'restrict,permitopen="localhost:5432"';

const SSH_KEYGEN_PATHS = [
  '/usr/bin/ssh-keygen',
  '/usr/local/bin/ssh-keygen',
  '/opt/homebrew/bin/ssh-keygen',
  'ssh-keygen',
];

const PATH_WITH_SSH = os.platform() === 'win32'
  ? (process.env.PATH || '') + ';C:\\Windows\\System32\\OpenSSH;C:\\Program Files\\OpenSSH'
  : '/usr/bin:/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '');

function tryRunSshKeygen(binPath) {
  if (!fs.existsSync(binPath)) return false;
  for (const flag of ['-V', '-v']) {
    try {
      execSync(binPath, [flag], { stdio: 'pipe', encoding: 'utf8' });
      return true;
    } catch (_) {}
  }
  return true;
}

function getSshKeygenPath() {
  if (os.platform() !== 'win32') {
    try {
      const out = execSync('sh', ['-c', 'command -v ssh-keygen 2>/dev/null'], {
        encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PATH: PATH_WITH_SSH }
      }).trim().split('\n')[0]?.trim();
      if (out && out.startsWith('/') && fs.existsSync(out) && tryRunSshKeygen(out)) return out;
    } catch (_) {}

    for (const p of SSH_KEYGEN_PATHS) {
      if (p === 'ssh-keygen') continue;
      if (fs.existsSync(p) && tryRunSshKeygen(p)) return p;
    }

    try {
      execSync('ssh-keygen', ['-V'], { stdio: 'pipe', encoding: 'utf8', env: { ...process.env, PATH: PATH_WITH_SSH } });
      return 'ssh-keygen';
    } catch (_) {}
  } else {
    try {
      const out = execSync('where', ['ssh-keygen'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PATH: PATH_WITH_SSH } });
      const first = out.split(/[\r\n]+/)[0]?.trim();
      if (first && fs.existsSync(first) && tryRunSshKeygen(first)) return first;
    } catch (_) {}

    const winPaths = [
      path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'OpenSSH', 'ssh-keygen.exe'),
      'C:\\Windows\\System32\\OpenSSH\\ssh-keygen.exe',
      'C:\\Program Files\\OpenSSH\\ssh-keygen.exe',
    ];
    for (const wp of winPaths) {
      if (fs.existsSync(wp) && tryRunSshKeygen(wp)) return wp;
    }
  }
  return null;
}

function tryInstallOpenssh() {
  if (os.platform() !== 'linux' && os.platform() !== 'win32') return false;

  if (os.platform() === 'linux') {
    const installers = [
      { cmd: 'apt-get', args: ['install', '-y', 'openssh-client'] },
      { cmd: 'apt', args: ['install', '-y', 'openssh-client'] },
      { cmd: 'dnf', args: ['install', '-y', 'openssh-clients'] },
      { cmd: 'yum', args: ['install', '-y', 'openssh-clients'] },
      { cmd: 'pacman', args: ['-S', '--noconfirm', 'openssh'] },
      { cmd: 'zypper', args: ['install', '-y', 'openssh'] },
      { cmd: 'apk', args: ['add', '--no-cache', 'openssh-client'] },
    ];
    for (const { cmd, args } of installers) {
      try {
        const verArg = (cmd === 'pacman') ? ['--version'] : (args.includes('--noconfirm') ? ['-V'] : ['--version']);
        execSync(cmd, verArg, { stdio: 'pipe' });
        console.log('Installiere openssh-client mit ' + cmd + '... (ggf. sudo-Passwort eingeben)');
        execSync('sudo', [cmd, ...args], { stdio: 'inherit' });
        return true;
      } catch (_) {}
    }
  }

  if (os.platform() === 'win32') {
    try {
      execSync('winget', ['--version'], { stdio: 'pipe', encoding: 'utf8' });
      console.log('Installiere OpenSSH mit winget...');
      execSync('winget install Microsoft.OpenSSH.Beta --accept-package-agreements --accept-source-agreements', { stdio: 'inherit' });
      return true;
    } catch (_) {}
  }

  return false;
}

function ensureSshKeygen() {
  let cmd = getSshKeygenPath();
  if (cmd) return cmd;

  console.log('');
  console.log('ssh-keygen nicht gefunden. Versuche automatische Installation...');
  if (tryInstallOpenssh()) {
    cmd = getSshKeygenPath();
    if (cmd) {
      console.log('openssh-client installiert.');
      return cmd;
    }
  }

  console.error('');
  console.error('ssh-keygen ist nicht installiert. Manuelle Installation:');
  if (os.platform() === 'linux') {
    console.error('  Debian/Ubuntu:  sudo apt install openssh-client');
    console.error('  Fedora/RHEL:    sudo dnf install openssh-clients');
    console.error('  Arch:           sudo pacman -S openssh');
    console.error('  openSUSE:       sudo zypper install openssh');
  } else if (os.platform() === 'win32') {
    console.error('  winget install Microsoft.OpenSSH.Beta');
  }
  console.error('');
  throw new Error('ssh-keygen nicht gefunden');
}

function ensureSshDir() {
  if (!fs.existsSync(SSH_DIR)) {
    fs.mkdirSync(SSH_DIR, { mode: 0o700 });
  }
}

function getAuthorizedKeysPath() {
  const home = os.homedir();
  const sshDir = path.join(home, '.ssh');
  return path.join(sshDir, 'authorized_keys');
}

/** Normalize public key line: trim, ensure single line (no newlines in middle) */
function normalizePublicKeyLine(key) {
  if (!key || typeof key !== 'string') return '';
  return key.replace(/\s+/g, ' ').trim();
}

/** Check if this exact key (by key data) is already in authorized_keys content */
function authorizedKeysContainsKey(existingContent, publicKey) {
  const normalized = normalizePublicKeyLine(publicKey);
  if (!normalized) return false;
  const keyData = normalized.split(/\s+/)[1];
  if (!keyData) return false;
  const lines = existingContent.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/\s+/);
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === keyData) return true;
    }
  }
  return false;
}

function generateKeyPair() {
  const sshKeygen = ensureSshKeygen();
  ensureSshDir();
  if (fs.existsSync(KEY_PATH)) {
    return { generated: false, keyPath: KEY_PATH };
  }

  function runSshKeygen(type, bits = null) {
    const bitsArg = bits && type === 'rsa' ? `-b ${bits} ` : '';
    const cmd = `"${sshKeygen}" -t ${type} ${bitsArg}-f "${KEY_PATH}" -N "" -C podcast-tunnel`;
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: true });
  }

  try {
    runSshKeygen('ed25519');
  } catch (err) {
    const stderr = (err.stderr || err.message || '').toString();
    const isEd25519Unsupported = /unknown key type|invalid key type|ed25519/i.test(stderr);
    if (isEd25519Unsupported) {
      try {
        runSshKeygen('rsa', 4096);
      } catch (rsaErr) {
        console.error('ssh-keygen (RSA) fehlgeschlagen:', (rsaErr.stderr || rsaErr.message).toString().trim());
        throw rsaErr;
      }
    } else {
      console.error('ssh-keygen fehlgeschlagen:', stderr.trim() || err.message);
      throw err;
    }
  }
  return { generated: true, keyPath: KEY_PATH };
}

function getPublicKey() {
  generateKeyPair();
  return fs.existsSync(PUB_PATH) ? fs.readFileSync(PUB_PATH, 'utf8').trim() : '';
}

function addToAuthorizedKeys(publicKey) {
  const normalized = normalizePublicKeyLine(publicKey);
  if (!normalized) return;

  const authPath = getAuthorizedKeysPath();
  const authDir = path.dirname(authPath);

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { mode: 0o700, recursive: true });
  }

  const entry = `${AUTH_KEYS_ENTRY} ${normalized}`;
  const existing = fs.existsSync(authPath) ? fs.readFileSync(authPath, 'utf8') : '';

  if (authorizedKeysContainsKey(existing, normalized)) {
    return;
  }

  const content = existing ? (existing.trimEnd() + '\n' + entry + '\n') : (entry + '\n');
  fs.writeFileSync(authPath, content, { mode: 0o600 });

  try {
    fs.chmodSync(authDir, 0o700);
    fs.chmodSync(authPath, 0o600);
  } catch (_) {}
}

/** For remote (VPS reverse SSH): no local authorized_keys, user adds key to VPS */
function createCredentialsBundle(dbPassword, vpsHost, vpsUser, dbPort = 5432) {
  generateKeyPair();
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const publicKey = fs.existsSync(PUB_PATH) ? fs.readFileSync(PUB_PATH, 'utf8').trim() : '';
  return {
    vps_host: vpsHost,
    vps_user: vpsUser,
    ssh_host: vpsHost,
    ssh_user: vpsUser,
    ssh_private_key: privateKey,
    ssh_public_key: publicKey,
    db_password: dbPassword,
    db_port: dbPort,
  };
}

/** For local (same network): adds key to DB's authorized_keys, App connects via SSH tunnel */
function createCredentialsBundleLocal(dbPassword, dbHost, dbPort = 5432) {
  generateKeyPair();
  const publicKeyRaw = fs.readFileSync(PUB_PATH, 'utf8');
  const publicKey = normalizePublicKeyLine(publicKeyRaw);
  addToAuthorizedKeys(publicKey);
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const sshUser = os.userInfo().username;
  return {
    ssh_host: dbHost,
    ssh_user: sshUser,
    ssh_private_key: privateKey,
    ssh_public_key: publicKey,
    db_password: dbPassword,
    db_port: dbPort,
  };
}

module.exports = {
  generateKeyPair,
  addToAuthorizedKeys,
  getPublicKey,
  getAuthorizedKeysPath,
  createCredentialsBundle,
  createCredentialsBundleLocal,
  KEY_PATH,
  PUB_PATH,
  SSH_DIR,
};
