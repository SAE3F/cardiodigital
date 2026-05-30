'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db, type GuiaLocal } from '@/lib/offline-db'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function GuiaDetallePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [guia, setGuia] = useState<GuiaLocal | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const loadGuia = async () => {
      const g = await db.guias.where('slug').equals(slug).first()
      if (g) {
        setGuia(g)
      }
      setCargando(false)
    }
    loadGuia()
  }, [slug])

  if (cargando) return <div className="p-6 text-center text-slate-400">Cargando guía...</div>

  if (!guia) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Guía no encontrada</h1>
        <p className="text-slate-400 mb-6">Es posible que no esté sincronizada o haya sido eliminada.</p>
        <button onClick={() => router.back()} className="text-red-400">← Volver</button>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Header Sticky para fácil acceso en móviles */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold truncate text-slate-100">{guia.titulo}</h1>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent">
              {guia.fuente} {guia.anio_publicacion}
            </Badge>
            <Badge variant="outline" className="text-slate-400 border-slate-700">
              {guia.categoria}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight">{guia.titulo}</h1>
          {guia.subtitulo && <h2 className="text-lg text-slate-400 mt-2">{guia.subtitulo}</h2>}
        </div>

        {guia.resumen_rapido && (
          <div className="p-4 rounded-xl bg-slate-900 border-l-4 border-l-red-500 mb-8">
            <p className="text-sm text-slate-300 italic">{guia.resumen_rapido}</p>
          </div>
        )}

        <div className="prose prose-invert prose-slate prose-a:text-red-400 prose-headings:text-slate-200 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {guia.contenido_md}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
