require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, count, error } = await supabase.from('guias').select('*', { count: 'exact', head: true }).eq('fuente', 'SAC');
  if (error) console.error(error);
  console.log(`Total SAC guias in Supabase: ${count}`);
}

run();
