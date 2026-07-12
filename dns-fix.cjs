// This file is preloaded via --require before Next.js starts.
// It overrides the system DNS (which blocks *.supabase.co) with Google's public DNS.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
console.log('[dns-fix] Node.js will now use 8.8.8.8 and 1.1.1.1 for all DNS resolution.');
