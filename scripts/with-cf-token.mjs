#!/usr/bin/env node
/** Run any shell command with CLOUDFLARE_API_TOKEN from cf-deploy.token. */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokenPath = resolve(root, 'cf-deploy.token');

if (existsSync(tokenPath)) {
  process.env.CLOUDFLARE_API_TOKEN = readFileSync(tokenPath, 'utf8').trim();
}

const cmd = process.argv.slice(2).join(' ');
if (!cmd.trim()) {
  console.error('Usage: node scripts/with-cf-token.mjs "<command>"');
  process.exit(1);
}

const result = spawnSync(cmd, {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
