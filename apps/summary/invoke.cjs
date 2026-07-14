#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../../.env');
const checkpointId = process.argv[2];

if (!checkpointId) {
  console.error('Usage: node apps/summary/invoke.cjs <checkpointId>');
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  console.error('Missing .env — copy .env.example to .env in the repo root.');
  process.exit(1);
}

for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const separator = trimmed.indexOf('=');
  if (separator === -1) continue;
  const key = trimmed.slice(0, separator).trim();
  let value = trimmed.slice(separator + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  process.env[key] ??= value;
}

require(path.join(__dirname, '../../dist/apps/summary/main.js'))
  .handler({ checkpointId }, {})
  .then((response) => {
    console.log(JSON.stringify(response, null, 2));
    process.exit(response?.statusCode === 200 ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
