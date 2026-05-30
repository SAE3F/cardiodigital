import { createClient } from '@supabase/supabase-js'

// Mapeo de revistas a sociedades
const FUENTES: Record<string, string> = {
  'Eur Heart J': 'ESC',
  'Circulation': 'AHA',
  'J Am Coll Cardiol': 'ACC'
}

// Clasificador simple de títulos a categorías SAC
function clasificarCategoria(titulo: string): string {
  const t = titulo.toLowerCase()
  if (t.includes('atrial fibrillation') || t.includes('arrhythmia') || t.includes('electrophysiology')) {
    return 'Arritmias y Fibrilación Auricular'
  }
  if (t.includes('heart failure') || t.includes('myocardial') || t.includes('cardiomyopathy')) {
    return 'Insuficiencia Cardíaca'
  }
  if (t.includes('coronary') || t.includes('ischemia') || t.includes('infarction') || t.includes('acute coronary')) {
    return 'Cardiopatía Isquémica'
  }
  if (t.includes('hypertension') || t.includes('blood pressure') || t.includes('dyslipidemia') || t.includes('lipid') || t.includes('prevention')) {
    return 'Prevención'
  }
  if (t.includes('valve') || t.includes('valvular')) {
    return 'Valvulopatías'
  }
  if (t.includes('pulmonary embolism') || t.includes('aortic') || t.includes('pericardial')) {
    return 'Cardiología Clínica'
  }
  return 'Cardiología Clínica' // Fallback
}

function generarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 100) // limitar largo
}

export async function scrapeInternationalPubMed() {
  console.log('Iniciando extracción automática internacional (PubMed API)...')
  let nuevas = 0

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Buscar PMIDs
    const query = '("European heart journal"[Journal] OR "Circulation"[Journal] OR "Journal of the American College of Cardiology"[Journal]) AND ("Practice Guideline"[Publication Type] OR "Guideline"[Title]) AND ("2023"[Date - Publication] : "3000"[Date - Publication])'
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=30&term=${encodeURIComponent(query)}`
    
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()
    const ids = searchData.esearchresult?.idlist || []

    if (ids.length === 0) return 0

    // 2. Traer Metadata de los PMIDs
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`
    const summaryRes = await fetch(summaryUrl)
    const summaryData = await summaryRes.json()

    for (const id of ids) {
      const article = summaryData.result[id]
      if (!article) continue

      const titleClean = article.title.replace(/\.$/, '') // Remover punto final
      const journal = article.source
      const year = parseInt(article.pubdate.split(' ')[0]) || new Date().getFullYear()
      
      const doiObj = article.articleids.find((a: any) => a.idtype === 'doi')
      const doi = doiObj ? doiObj.value : null

      if (!doi) continue // Sin link no nos sirve

      const urlFuente = `https://doi.org/${doi}`
      const fuente = FUENTES[journal] || 'INT'
      const categoria = clasificarCategoria(titleClean)
      const slug = generarSlug(titleClean)

      // Evitar artículos que son correcciones o respuestas breves (glance)
      if (titleClean.toLowerCase().includes('correction') || titleClean.toLowerCase().includes('at-a-glance')) continue

      const guiaObj = {
        slug,
        titulo: titleClean,
        categoria,
        fuente,
        anio_publicacion: year,
        url_fuente: urlFuente,
        resumen_rapido: `Consenso automatizado de ${fuente} (${year}).`,
        contenido_md: `## ${titleClean}\n\nEste consenso fue extraído automáticamente de PubMed.\n\n[Leer publicación oficial](${urlFuente})`,
        activa: true
      }

      // 3. Upsert en BD
      const { data: existente } = await supabase.from('guias').select('id').eq('slug', slug).maybeSingle()
      
      if (!existente) {
        const { error } = await supabase.from('guias').insert(guiaObj)
        if (!error) nuevas++
      } else {
        await supabase.from('guias').update(guiaObj).eq('slug', slug)
      }
    }

    console.log(`Extracción internacional finalizada. Nuevas guías insertadas: ${nuevas}`)
    return nuevas
  } catch (error) {
    console.error('Error en scraper internacional:', error)
    return 0
  }
}
