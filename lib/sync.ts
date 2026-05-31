import { getSupabaseBrowserClient } from '@/supabase/client'
import { db } from './offline-db'

const SYNC_KEY = 'cardiodigital_last_sync'
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 horas

export async function shouldSync(): Promise<boolean> {
  const last = localStorage.getItem(SYNC_KEY)
  if (!last) return true
  return Date.now() - parseInt(last) > SYNC_INTERVAL_MS
}

export async function syncAllData(): Promise<void> {
  const supabase = getSupabaseBrowserClient()

  try {
    // Sincronizar guías
    const { data: guias } = await supabase
      .from('guias')
      .select('id,slug,titulo,subtitulo,categoria,fuente,anio_publicacion,url_fuente,contenido_md,resumen_rapido,palabras_clave,destacada,updated_at')
      .eq('activa', true)

    if (guias) await db.guias.bulkPut(guias)

    // Sincronizar algoritmos
    const { data: algoritmos } = await supabase
      .from('algoritmos')
      .select('id,guia_id,titulo,nodo_raiz,orden')

    if (algoritmos) await db.algoritmos.bulkPut(algoritmos)

    // Sincronizar fármacos
    const { data: farmacos } = await supabase
      .from('dosis_farmacos')
      .select('id,nombre,nombre_comercial,dosis,clase')
      .eq('activa', true)

    if (farmacos) await db.farmacos.bulkPut(farmacos)

    // Sincronizar calculadoras
    const { data: calculadoras } = await supabase
      .from('calculadoras')
      .select('id,slug,nombre,descripcion,categoria,funcion_clave,interpretacion')
      .eq('activa', true)

    if (calculadoras) await db.calculadoras.bulkPut(calculadoras)

    localStorage.setItem(SYNC_KEY, Date.now().toString())
    localStorage.removeItem('cardiodigital_sync_error')
    console.log('[Cardiodigital] Sync completado')
  } catch (error: unknown) {
    console.warn('[Cardiodigital] Sync falló (probablemente offline o sin backend):', error)
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    localStorage.setItem('cardiodigital_sync_error', msg)
    throw error // Re-throw to let the caller handle it if needed
  }
}

export function initSync(): void {
  if (typeof window === 'undefined') return

  const run = async () => {
    if (navigator.onLine && await shouldSync()) {
      await syncAllData()
    }
  }

  run()
  window.addEventListener('online', run)
}
