require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearTable() {
  console.log('Limpiando la tabla de guías...');
  // Para borrar todo, necesitamos una condición que sea verdadera para todos los registros
  const { error } = await supabase.from('guias').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error('Error limpiando:', error);
  } else {
    console.log('Tabla limpiada exitosamente. Lista para el nuevo scraping con categorías.');
  }
}

clearTable();
