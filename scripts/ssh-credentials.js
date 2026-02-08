#!/usr/bin/env node
/**
 * SSH credentials for podcast tunnel.
 * Generates key pair and adds to authorized_keys with restrict,permitopen.
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
  execSync(
    `ssh-keygen -t ed25519 -f "${KEY_PATH}" -N "" -C "podcast-tunnel"`,
    { stdio: 'pipe' }
  );
  return { generated: true, keyPath: KEY_PATH };
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

function createCredentialsBundle(dbPassword, sshHost, dbPort = 5432) {
  const { keyPath } = generateKeyPair();
  const publicKey = fs.readFileSync(PUB_PATH, 'utf8');
  addToAuthorizedKeys(publicKey);
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const sshUser = os.userInfo().username;
  return {
    ssh_host: sshHost,
    ssh_user: sshUser,
    ssh_private_key: privateKey,
    db_password: dbPassword,
    db_port: dbPort,
  };
}

module.exports = {
  generateKeyPair,
  addToAuthorizedKeys,
  createCredentialsBundle,
  KEY_PATH,
  PUB_PATH,
  SSH_DIR,
};
