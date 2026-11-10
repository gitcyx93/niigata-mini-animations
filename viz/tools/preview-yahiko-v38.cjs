#!/usr/bin/env node
'use strict';
// Keep /yahiko, /en and /tw links working through the shared preview server.
try { require('./serve.cjs').main(); }
catch (error) { console.error(error.message); process.exitCode=1; }
