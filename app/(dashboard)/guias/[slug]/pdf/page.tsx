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
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      {/* Header del visor */}
      <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href={`/guias/${slug}`} 
            className="p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="max-w-md md:max-w-xl lg:max-w-3xl overflow-hidden">
            <h1 className="text-sm md:text-base font-semibold text-foreground truncate">
              {guia.titulo}
            </h1>
            <p className="text-xs text-muted-foreground capitalize">{guia.categoria}</p>
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
      <div className="flex-1 w-full bg-card relative">
        {guia.url_fuente.toLowerCase().includes('.pdf') ? (
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(guia.url_fuente)}&embedded=true`}
            className="absolute inset-0 w-full h-full border-none"
            title="Visor de PDF"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="bg-accent/50 border border-border rounded-2xl p-8 max-w-md w-full">
              <ExternalLink size={48} className="mx-auto mb-4 text-foreground0" />
              <h2 className="text-xl font-bold text-foreground mb-2">Publicación Externa</h2>
              <p className="text-muted-foreground mb-8 text-sm">
                Esta guía se encuentra alojada en una revista internacional. No es posible mostrar el PDF directamente aquí por protecciones del sitio web oficial.
              </p>
              
              <div className="flex flex-col gap-3">
                <a 
                  href={guia.url_fuente}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                >
                  Abrir fuente oficial
                </a>
                
                {guia.url_fuente.includes('doi.org/') && (
                  <a 
                    href={`https://annas-archive.pk/search?q=${guia.url_fuente.split('doi.org/')[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-3 bg-accent hover:bg-secondary text-muted-foreground rounded-xl font-medium transition-colors border border-border flex items-center justify-center gap-2"
                  >
                    Desbloquear PDF (Anna's Archive) <span className="text-xs text-foreground0">Alternativa</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
