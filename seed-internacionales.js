require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const rawData = fs.readFileSync('guias-internacionales.json', 'utf8');
  const guiasInternacionales = JSON.parse(rawData);

  let insertCount = 0;
  
  for (const item of guiasInternacionales) {
    const slug = item.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const guiaObj = {
      ...item,
      slug,
      activa: true,
      contenido_md: `## ${item.titulo}\n\nEste consenso fue agregado desde la base curada internacional.\n\n[Ver PDF oficial](${item.url_fuente})`
    };

    const { data: existente } = await supabase.from('guias').select('id').eq('slug', slug).maybeSingle();
    
    if (!existente) {
      const { error } = await supabase.from('guias').insert(guiaObj);
      if (!error) {
        insertCount++;
        console.log(`+ Insertada: ${item.titulo}`);
      } else {
        console.error(`Error insertando ${item.titulo}:`, error);
      }
    } else {
      const { error } = await supabase.from('guias').update(guiaObj).eq('slug', slug);
      if (!error) {
        insertCount++;
        console.log(`~ Actualizada: ${item.titulo}`);
      } else {
        console.error(`Error actualizando ${item.titulo}:`, error);
      }
    }
  }

  console.log(`Completado. Procesadas: ${insertCount}/${guiasInternacionales.length}`);
}

run().catch(console.error);
