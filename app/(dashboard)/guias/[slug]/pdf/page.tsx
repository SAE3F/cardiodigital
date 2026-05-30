import { getSupabaseServerClient } from '@/supabase/server'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function GuiaPdfViewer({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await getSupabaseServerClient()
  
  const { data } = await supabase
    .from('guias')
    .select('*')
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()
    
  const guia = data as any

  if (!guia) {
    return (
      <div className="p-8 text-white">
        <h2>Debug Info</h2>
        <p>Params Slug: {slug}</p>
        <p>Supabase returned no data. Check RLS or slug mismatch.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-950">
      {/* Header del visor */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={`/guias/${slug}`} 
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
        <iframe 
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(guia.url_fuente)}&embedded=true`}
          className="absolute inset-0 w-full h-full border-none"
          title="Visor de PDF"
        />
      </div>
    </div>
  )
}
