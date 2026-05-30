require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// USE THE ANON KEY!
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('guias').select('*').limit(1).maybeSingle();
  console.log('Error:', error);
  console.log('Data:', data ? data.slug : 'null');
}

check();
