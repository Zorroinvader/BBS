#!/usr/bin/env node
/**
 * Reverse SSH tunnel for remote DB connection.
 * Runs on DB host: connects to VPS and forwards VPS:5432 -> localhost:5432 (PostgreSQL).
 * Usage: node scripts/reverse-ssh-tunnel.js [--creds PATH]
 * Or: node scripts/reverse-ssh-tunnel.js --host HOST --user USER --key PATH
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DEFAULT_CREDS = path.join(ROOT, 'podcast-ssh-credentials.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { creds: null, host: '', user: '', key: '', remotePort: 5432, localPort: 5432 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--creds' && args[i + 1]) out.creds = args[++i];
    else if (args[i] === '--host' && args[i + 1]) out.host = args[++i];
    else if (args[i] === '--user' && args[i + 1]) out.user = args[++i];
    else if (args[i] === '--key' && args[i + 1]) out.key = args[++i];
    else if (args[i] === '--remote-port' && args[i + 1]) out.remotePort = parseInt(args[++i], 10);
    else if (args[i] === '--local-port' && args[i + 1]) out.localPort = parseInt(args[++i], 10);
  }
  return out;
}

function loadCreds(credsPath) {
  if (!fs.existsSync(credsPath)) {
    console.error('Credentials file not found:', credsPath);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  const host = data.ssh_host || data.vps_host;
  const user = data.ssh_user || data.vps_user;
  const key = data.ssh_private_key;
  if (!host || !user || !key) {
    console.error('Credentials must contain ssh_host/vps_host, ssh_user/vps_user, ssh_private_key');
    process.exit(1);
  }
  const sshDir = path.join(ROOT, '.ssh');
  if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir, { mode: 0o700 });
  const keyPath = path.join(sshDir, 'podcast_tunnel');
  fs.writeFileSync(keyPath, key, { mode: 0o600 });
  return { host, user, keyPath };
}

function runTunnel(opts) {
  let host, user, keyPath;
  if (opts.creds || fs.existsSync(DEFAULT_CREDS)) {
    const p = opts.creds || DEFAULT_CREDS;
    const c = loadCreds(p);
    host = c.host;
    user = c.user;
    keyPath = c.keyPath;
  } else if (opts.host && opts.user && opts.key) {
    host = opts.host;
    user = opts.user;
    keyPath = opts.key;
    if (!fs.existsSync(keyPath)) {
      console.error('Key file not found:', keyPath);
      process.exit(1);
    }
  } else {
    console.error('Usage: node reverse-ssh-tunnel.js [--creds PATH]');
    console.error('   Or: node reverse-ssh-tunnel.js --host HOST --user USER --key PATH');
    process.exit(1);
  }

  const sshArgs = [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'BatchMode=yes',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-o', 'ExitOnForwardFailure=yes',
    '-R', `${opts.remotePort}:localhost:${opts.localPort}`,
    '-i', keyPath,
    '-N',
    `${user}@${host}`,
  ];

  let useAutossh = false;
  try {
    require('child_process').execSync('which autossh', { stdio: 'pipe' });
    useAutossh = true;
  } catch (_) {}

  const target = `${user}@${host}`;
  if (useAutossh) {
    const autosshArgs = ['-M', '0', '-N', '-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3', '-R', `${opts.remotePort}:localhost:${opts.localPort}`, '-i', keyPath, target];
    console.log('Starting reverse tunnel (autossh):', `${opts.remotePort}:localhost:${opts.localPort} -> ${target}`);
    const child = spawn('autossh', autosshArgs, { stdio: 'inherit' });
    child.on('error', (err) => {
      console.error('autossh error:', err.message);
      process.exit(1);
    });
    child.on('close', (code) => process.exit(code ?? 0));
  } else {
    console.log('Starting reverse tunnel (ssh):', `${opts.remotePort}:localhost:${opts.localPort} -> ${target}`);
    const child = spawn('ssh', sshArgs, { stdio: 'inherit' });
    child.on('error', (err) => {
      console.error('SSH error:', err.message);
      process.exit(1);
    });
    child.on('close', (code) => process.exit(code ?? 0));
  }

  process.on('SIGINT', () => {});
  process.on('SIGTERM', () => {});
}

const opts = parseArgs();
opts.remotePort = opts.remotePort || 5432;
opts.localPort = opts.localPort || 5432;

if (opts.host && opts.user && opts.key) {
  runTunnel(opts);
} else if (opts.creds || fs.existsSync(DEFAULT_CREDS)) {
  runTunnel({ ...opts, creds: opts.creds || DEFAULT_CREDS });
} else {
  console.error('No credentials. Use --creds PATH or --host/--user/--key');
  process.exit(1);
}
