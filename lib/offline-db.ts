import Dexie, { type Table } from 'dexie'

export interface GuiaLocal {
  id: string
  slug: string
  titulo: string
  subtitulo?: string
  categoria: string
  fuente: string
  anio_publicacion: number
  url_fuente?: string
  contenido_md: string
  resumen_rapido?: string
  palabras_clave?: string[]
  destacada: boolean
  updated_at: string
}

export interface AlgoritmoLocal {
  id: string
  guia_id: string
  titulo: string
  nodo_raiz: Record<string, unknown>
  orden: number
}

export interface FarmacoLocal {
  id: string
  nombre: string
  nombre_comercial?: string[]
  dosis: Record<string, unknown>
  clase?: string
}

export interface CalculadoraLocal {
  id: string
  slug: string
  nombre: string
  descripcion?: string
  categoria: string
  funcion_clave: string
  interpretacion?: Record<string, unknown>
}

export interface FavoritoLocal {
  id?: number // Auto-incrementado localmente
  item_slug: string
  tipo: 'guia' | 'calculadora' | 'algoritmo'
  titulo: string
  url: string
}

class CardioGuardiaDB extends Dexie {
  guias!: Table<GuiaLocal>
  algoritmos!: Table<AlgoritmoLocal>
  farmacos!: Table<FarmacoLocal>
  calculadoras!: Table<CalculadoraLocal>
  favoritos!: Table<FavoritoLocal>

  constructor() {
    super('cardioguardia_v1')
    
    this.version(1).stores({
      guias:        'id, slug, categoria, fuente, destacada',
      algoritmos:   'id, guia_id',
      farmacos:     'id, nombre, clase',
      calculadoras: 'id, slug, categoria',
    })

    this.version(2).stores({
      favoritos: '++id, item_slug, tipo'
    })
  }
}

export const db = new CardioGuardiaDB()
