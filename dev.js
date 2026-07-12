// Bootstrap script: patches DNS in main process AND all worker threads
const dns  = require('dns');
const path = require('path');

// 1. Fix DNS in the main process
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('[dns-fix] Main process: DNS set to 8.8.8.8 / 1.1.1.1');

// 2. Use forward slashes — Node.js on Windows accepts them without quoting,
//    so this works even when the path contains spaces.
const dnsFixPath = path.join(__dirname, 'dns-fix.cjs').replace(/\\/g, '/');
process.env.NODE_OPTIONS = `--require ${dnsFixPath}`;
console.log('[dns-fix] NODE_OPTIONS set — all workers will inherit DNS fix');

// 3. Hand off to Next.js using webpack (not Turbopack) — Turbopack isolates workers
process.argv.push('--webpack');
require('./node_modules/next/dist/bin/next');
