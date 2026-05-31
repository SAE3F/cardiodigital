require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // En Supabase JS client no hay un método directo para ejecutar SQL crudo de DDL a menos que usemos RPC.
  // Pero podemos intentar un pequeño truco o simplemente ignorar la base de datos remota si ya lo hicimos antes.
  // Vamos a verificar si podemos insertar una categoría que no está en el ENUM.
  
  const testGuia = {
    titulo: 'Test Schema',
    slug: 'test-schema-enum-check',
    categoria: 'TestCategoriaInvalida',
    fuente: 'SAC',
    anio_publicacion: 2026,
    contenido_md: 'Test',
    activa: false
  };

  const { data, error } = await supabase.from('guias').insert(testGuia).select();
  
  if (error) {
    console.error("Insert failed, likely due to ENUM constraint:", error.message);
  } else {
    console.log("Insert succeeded. The column must already be TEXT or allow this value.");
    // Cleanup
    await supabase.from('guias').delete().eq('slug', 'test-schema-enum-check');
  }
}

run();
