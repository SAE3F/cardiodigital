import { getSupabaseServerClient } from '@/supabase/server'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GuiaPdfViewer({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServerClient()
  
  const { data: guia } = await supabase
    .from('guias')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!guia) {
    notFound()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-950">
      {/* Header del visor */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={`/guias/${params.slug}`} 
            className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="max-w-md md:max-w-xl lg:max-w-3xl overflow-hidden">
            <h1 className="text-sm md:text-base font-semibold text-slate-100 truncate">
              {guia.titulo}
            </h1>
            <p className="text-xs text-slate-400 capitalize">{guia.categoria}</p>
          </div>
        </div>

        <a 
          href={guia.url_fuente} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ml-4 shrink-0"
        >
          <span className="hidden sm:inline">Abrir en navegador</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Visor PDF Nivel Nativo */}
      <div className="flex-1 w-full bg-slate-900 relative">
        <object 
          data={guia.url_fuente} 
          type="application/pdf" 
          className="absolute inset-0 w-full h-full"
        >
          {/* Fallback si el dispositivo no soporta visor nativo de PDF (ej: algunos móviles) */}
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400">
            <p className="mb-4">Tu navegador o dispositivo no soporta la previsualización directa de PDFs.</p>
            <a 
              href={guia.url_fuente} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-medium"
            >
              Descargar o abrir PDF externamente
            </a>
          </div>
        </object>
      </div>
    </div>
  )
}
