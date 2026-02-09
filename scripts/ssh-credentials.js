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

function ensureSshDir() {
  if (!fs.existsSync(SSH_DIR)) {
    fs.mkdirSync(SSH_DIR, { mode: 0o700 });
  }
}

function getAuthorizedKeysPath() {
  const home = os.homedir();
  return path.join(home, '.ssh', 'authorized_keys');
}

function generateKeyPair() {
  ensureSshDir();
  if (fs.existsSync(KEY_PATH)) {
    return { generated: false, keyPath: KEY_PATH };
  }
  execSync('ssh-keygen', [
    '-t', 'ed25519',
    '-f', KEY_PATH,
    '-N', '',
    '-C', 'podcast-tunnel',
  ], { stdio: 'pipe' });
  return { generated: true, keyPath: KEY_PATH };
}

function getPublicKey() {
  generateKeyPair();
  return fs.existsSync(PUB_PATH) ? fs.readFileSync(PUB_PATH, 'utf8').trim() : '';
}

function addToAuthorizedKeys(publicKey) {
  const authPath = getAuthorizedKeysPath();
  const authDir = path.dirname(authPath);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { mode: 0o700, recursive: true });
  }
  const entry = `${AUTH_KEYS_ENTRY} ${publicKey.trim()}`;
  const existing = fs.existsSync(authPath) ? fs.readFileSync(authPath, 'utf8') : '';
  if (existing.includes('podcast-tunnel')) {
    return;
  }
  const content = existing ? (existing.trimEnd() + '\n' + entry + '\n') : (entry + '\n');
  fs.writeFileSync(authPath, content, { mode: 0o600 });
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
  const publicKey = fs.readFileSync(PUB_PATH, 'utf8');
  addToAuthorizedKeys(publicKey);
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const sshUser = os.userInfo().username;
  return {
    ssh_host: dbHost,
    ssh_user: sshUser,
    ssh_private_key: privateKey,
    ssh_public_key: publicKey.trim(),
    db_password: dbPassword,
    db_port: dbPort,
  };
}

module.exports = {
  generateKeyPair,
  addToAuthorizedKeys,
  getPublicKey,
  createCredentialsBundle,
  createCredentialsBundleLocal,
  KEY_PATH,
  PUB_PATH,
  SSH_DIR,
};
