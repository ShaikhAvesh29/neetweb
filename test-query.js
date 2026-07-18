const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://rsmkyutyppipcfrjnsjt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbWt5dXR5cHBpcGNmcmpuc2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTk2MTUsImV4cCI6MjA5OTI5NTYxNX0.YTAcTG9FVKkxlGM7EPl5GecAg7KyAGTJRVqlD7hT5NY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from("batches")
    .select("*, bookings(*, profiles(*))");
  console.log('error:', error);
  console.log('data:', data ? data.length : null);
}
test();
