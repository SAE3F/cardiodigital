require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('guias').select('*').in('fuente', ['ESC', 'AHA', 'ACC']).order('anio_publicacion', { ascending: false });
  if (error) {
    console.error(error);
    return;
  }
  
  console.log(`Found ${data.length} international guidelines.`);
  const years = {};
  data.forEach(g => {
    years[g.anio_publicacion] = (years[g.anio_publicacion] || 0) + 1;
  });
  console.log('Years distribution:', years);
  
  console.log('\nSample guidelines:');
  data.slice(0, 5).forEach(g => console.log(`[${g.anio_publicacion}] ${g.titulo} (${g.fuente}) -> ${g.url_fuente}`));
}

check();
