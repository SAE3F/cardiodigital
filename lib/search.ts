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
      // @ts-expect-error: Mock type fallback
      const { data, error } = await supabase.rpc('buscar', { query: query.trim() })
      if (!error && data && (data as unknown[]).length > 0) {
        return data as unknown as ResultadoBusqueda[]
      }
    } catch {
      // Fallthrough a búsqueda local
    }
  }

  // Fallback: búsqueda local en IndexedDB
  return buscarLocal(query)
}

const SINONIMOS: Record<string, string[]> = {
  'fa': ['fibrilacion auricular', 'atrial fibrillation'],
  'sca': ['sindrome coronario agudo', 'acute coronary'],
  'ic': ['insuficiencia cardiaca', 'heart failure'],
  'tep': ['tromboembolismo pulmonar', 'pulmonary embolism'],
  'iam': ['infarto agudo de miocardio', 'myocardial infarction'],
  'hta': ['hipertension arterial', 'hypertension'],
}

function normalizar(texto: string): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .replace(/[^a-z0-9\s]/g, '')
}

async function buscarLocal(query: string): Promise<ResultadoBusqueda[]> {
  const qNorm = normalizar(query);
  const terminos = qNorm.split(' ').filter(t => t.length > 1);
  
  // Agregar sinónimos a los términos de búsqueda
  const terminosExtendidos = [...terminos];
  terminos.forEach(t => {
    if (SINONIMOS[t]) {
      terminosExtendidos.push(...SINONIMOS[t].map(normalizar));
    }
  });

  const resultados: ResultadoBusqueda[] = []

  const guias = await db.guias.toArray()
  guias.forEach(g => {
    const texto = normalizar(`${g.titulo} ${g.subtitulo ?? ''} ${g.palabras_clave?.join(' ') ?? ''}`);
    const matches = terminosExtendidos.filter(t => texto.includes(t)).length
    if (matches > 0) {
      resultados.push({
        id: g.id, nombre: g.titulo,
        descripcion: g.resumen_rapido,
        tipo: 'guia', categoria: g.categoria,
        ranking: matches / terminosExtendidos.length,
      })
    }
  })

  const farmacos = await db.farmacos.toArray()
  farmacos.forEach(f => {
    const texto = normalizar(`${f.nombre} ${f.nombre_comercial?.join(' ') ?? ''} ${f.clase ?? ''}`);
    const matches = terminosExtendidos.filter(t => texto.includes(t)).length
    if (matches > 0) {
      resultados.push({
        id: f.id, nombre: f.nombre,
        descripcion: f.clase,
        tipo: 'farmaco',
        ranking: matches / terminosExtendidos.length,
      })
    }
  })

  // Calculadoras custom
  const calculadorasCustom = [
    { id: 'goteo', nombre: 'Goteo de Inotrópicos', desc: 'Dopamina, dobutamina, noradrenalina' },
    { id: 'prevent', nombre: 'AHA PREVENT', desc: 'Riesgo CV Global' },
    { id: 'score2', nombre: 'SCORE2', desc: 'Riesgo CV Europeo' },
    { id: 'laboratorio', nombre: 'Valores Normales de Laboratorio', desc: 'Biomarcadores, Ionograma, Gases, etc.' },
    { id: 'anticoagulantes', nombre: 'Switch Anticoagulantes', desc: 'Conversión entre DOACs, VKA y Parenterales' }
  ]

  calculadorasCustom.forEach(c => {
    const texto = normalizar(`${c.nombre} ${c.desc}`);
    const matches = terminosExtendidos.filter(t => texto.includes(t)).length
    if (matches > 0) {
      resultados.push({
        id: c.id, nombre: c.nombre,
        descripcion: c.desc,
        tipo: 'calculadora',
        ranking: matches / terminosExtendidos.length,
      })
    }
  })

  return resultados.sort((a, b) => (b.ranking ?? 0) - (a.ranking ?? 0)).slice(0, 20)
}
