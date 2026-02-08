#!/usr/bin/env node
/**
 * SSH tunnel for remote DB connection.
 * Forwards local port to remote PostgreSQL.
 * Usage: node scripts/ssh-tunnel.js --host HOST --user USER --key PATH [--local-port 5433] [--remote-port 5432]
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { host: '', user: '', key: '', localPort: 5433, remotePort: 5432 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i + 1]) out.host = args[++i];
    else if (args[i] === '--user' && args[i + 1]) out.user = args[++i];
    else if (args[i] === '--key' && args[i + 1]) out.key = args[++i];
    else if (args[i] === '--local-port' && args[i + 1]) out.localPort = parseInt(args[++i], 10);
    else if (args[i] === '--remote-port' && args[i + 1]) out.remotePort = parseInt(args[++i], 10);
  }
  return out;
}

function runTunnel(opts) {
  const { host, user, key, localPort, remotePort } = opts;
  if (!host || !user || !key) {
    console.error('Usage: node ssh-tunnel.js --host HOST --user USER --key KEY_PATH [--local-port 5433] [--remote-port 5432]');
    process.exit(1);
  }
  if (!fs.existsSync(key)) {
    console.error('Key file not found:', key);
    process.exit(1);
  }

  const sshArgs = [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'BatchMode=yes',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-L', `${localPort}:localhost:${remotePort}`,
    '-i', key,
    '-N',
    `${user}@${host}`,
  ];

  const child = spawn('ssh', sshArgs, { stdio: 'inherit' });
  child.on('error', (err) => {
    console.error('SSH error:', err.message);
    process.exit(1);
  });
  child.on('close', (code) => {
    process.exit(code ?? 0);
  });

  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

const opts = parseArgs();
runTunnel(opts);
