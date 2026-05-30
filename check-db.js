require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const dummy = {
    titulo: 'Test',
    slug: 'test',
    categoria: 'Arritmias',
    fuente: 'SAC',
    anio_publicacion: 2026,
    contenido_md: 'test',
    activa: true
  };
  const { error: err2 } = await supabase.from('guias').insert(dummy);
  console.log('Insert error:', err2);
}

check();
