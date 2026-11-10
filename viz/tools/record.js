#!/usr/bin/env node
'use strict';

// Compatibility with the original <page> <output> [seconds] [fps] command.
const {main} = require('./record-animation.cjs');
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node viz/tools/record.js <page.html> <output.mp4> [seconds] [fps] [--force]\nUses the shared deterministic recorder. Existing exports require --force.');
} else {
  const [source, output, ...rest] = args;
  const forwarded = [source, output].filter(Boolean);
  for (const flag of ['--seconds', '--fps']) {
    if (rest[0] && !rest[0].startsWith('-')) forwarded.push(flag, rest.shift());
  }
  main([...forwarded, '--silent', ...rest]).catch(error => {console.error(error.message); process.exitCode = 1;});
}
