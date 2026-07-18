const https = require('https');
const fs = require('fs');

const url = 'https://rsmkyutyppipcfrjnsjt.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('openapi2.json', data);
    try {
      const spec = JSON.parse(data);
      console.log('Available RPCs:');
      for (const path in spec.paths) {
        if (path.startsWith('/rpc/')) {
          const rpcName = path.replace('/rpc/', '');
          const params = spec.paths[path].post.parameters?.map(p => p.name).join(', ') || 'no params';
          console.log(`- ${rpcName}(${params})`);
        }
      }
    } catch (e) {
      console.error('Error parsing JSON', e.message);
    }
  });
}).on('error', err => console.error('Error fetching', err));
