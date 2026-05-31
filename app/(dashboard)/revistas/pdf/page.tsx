'use client'

import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

export default function GenericPdfViewer({ searchParams }: { searchParams: Promise<{ url: string, title: string }> }) {
  const router = useRouter()
  const { url, title } = use(searchParams)

  if (!url) {
    return (
      <div className="p-8 text-white">
        <h2>Error</h2>
        <p>No URL provided.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      {/* Header del visor */}
      <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="max-w-md md:max-w-xl lg:max-w-3xl overflow-hidden">
            <h1 className="text-sm md:text-base font-semibold text-foreground truncate">
              {title || 'Documento PDF'}
            </h1>
          </div>
        </div>

        <a 
          href={url.replace('/view/', '/download/')} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ml-4 shrink-0"
        >
          <span className="hidden sm:inline">Descargar PDF</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Visor PDF Nivel Nativo */}
      <div className="flex-1 w-full bg-card relative">
        <iframe 
          src={url}
          className="absolute inset-0 w-full h-full border-none"
          title="Visor de PDF"
        />
      </div>
    </div>
  )
}
