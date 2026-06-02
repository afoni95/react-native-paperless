#!/usr/bin/env node
/**
 * Generates android/key.properties from environment variables.
 * In CI: variables come from GitHub Secrets (already set in the environment).
 * Locally:  copy .env.example to .env, fill in values, then run this script.
 */

const fs = require('fs');
const path = require('path');

// Load .env file locally (ignored in CI where secrets are injected directly)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !(key in process.env)) {
      process.env[key] = rest.join('=');
    }
  }
}

const required = [
  'ANDROID_KEYSTORE_PATH',
  'ANDROID_KEYSTORE_PASSWORD',
  'ANDROID_KEY_ALIAS',
  'ANDROID_KEY_PASSWORD',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const keyProperties = `storeFile=${process.env.ANDROID_KEYSTORE_PATH}
storePassword=${process.env.ANDROID_KEYSTORE_PASSWORD}
keyAlias=${process.env.ANDROID_KEY_ALIAS}
keyPassword=${process.env.ANDROID_KEY_PASSWORD}
`;

const outPath = path.resolve(__dirname, '../android/key.properties');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, keyProperties, 'utf8');
console.log(`Written: ${outPath}`);
