import { getSupabaseBrowserClient } from '@/supabase/client'
import { db } from './offline-db'

export interface ResultadoBusqueda {
  id: string
  nombre: string
  descripcion?: string
  tipo: 'guia' | 'farmaco' | 'calculadora'
  categoria?: string
  ranking?: number
}

export async function buscar(query: string): Promise<ResultadoBusqueda[]> {
  if (!query || query.trim().length < 2) return []

  // Intentar FTS en Supabase primero
  if (navigator.onLine) {
    try {
      const supabase = getSupabaseBrowserClient()
      // @ts-ignore: Mock type fallback
      const { data, error } = await supabase.rpc('buscar', { query: query.trim() })
      const resultData = data as any[]
      if (!error && resultData && resultData.length > 0) {
        return resultData as ResultadoBusqueda[]
      }
    } catch {
      // Fallthrough a búsqueda local
    }
  }

  // Fallback: búsqueda local en IndexedDB
  return buscarLocal(query)
}

async function buscarLocal(query: string): Promise<ResultadoBusqueda[]> {
  const terminos = query.toLowerCase().split(' ').filter(t => t.length > 1)
  const resultados: ResultadoBusqueda[] = []

  const guias = await db.guias.toArray()
  guias.forEach(g => {
    const texto = `${g.titulo} ${g.subtitulo ?? ''} ${g.palabras_clave?.join(' ') ?? ''}`.toLowerCase()
    const matches = terminos.filter(t => texto.includes(t)).length
    if (matches > 0) {
      resultados.push({
        id: g.id, nombre: g.titulo,
        descripcion: g.resumen_rapido,
        tipo: 'guia', categoria: g.categoria,
        ranking: matches / terminos.length,
      })
    }
  })

  const farmacos = await db.farmacos.toArray()
  farmacos.forEach(f => {
    const texto = `${f.nombre} ${f.nombre_comercial?.join(' ') ?? ''} ${f.clase ?? ''}`.toLowerCase()
    const matches = terminos.filter(t => texto.includes(t)).length
    if (matches > 0) {
      resultados.push({
        id: f.id, nombre: f.nombre,
        descripcion: f.clase,
        tipo: 'farmaco',
        ranking: matches / terminos.length,
      })
    }
  })

  return resultados.sort((a, b) => (b.ranking ?? 0) - (a.ranking ?? 0)).slice(0, 20)
}
