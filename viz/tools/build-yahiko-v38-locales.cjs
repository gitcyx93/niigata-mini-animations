#!/usr/bin/env node
'use strict';

// Keep the existing command, but assemble the reviewed language variants from
// explicit source overrides. No automatic conversion of JavaScript or copy.
const { buildYahiko } = require('./build-yahiko-v38.cjs');

try {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: build-yahiko-v38-locales.cjs [--check]');
  for (const page of buildYahiko({ locales: ['en', 'tw'], check: args.includes('--check') })) {
    console.log(`${args.includes('--check') ? 'Verified' : 'Built'} ${page.file} (${page.bytes} bytes)`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
