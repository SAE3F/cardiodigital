'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db, type GuiaLocal } from '@/lib/offline-db'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ChevronDown, FileText, Wrench, GitCommit, Calculator } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { ALGORITMOS } from '@/lib/data/algoritmos'
import { calculators } from '@/lib/data/calculators'
import { guiasPremium } from '@/lib/data/guias-premium'

const parseMarkdownToSections = (md: string) => {
  const regex = /^##\s+(.*)$/gm;
  const sections = [];
  
  let match;
  let lastIndex = 0;
  let lastTitle = 'General';

  const firstMatch = regex.exec(md);
  if (firstMatch) {
    const preamble = md.substring(0, firstMatch.index).trim();
    if (preamble) {
      sections.push({ title: 'Resumen / Introducción', content: preamble });
    }
    lastTitle = firstMatch[1];
    lastIndex = regex.lastIndex;

    while ((match = regex.exec(md)) !== null) {
      const content = md.substring(lastIndex, match.index).trim();
      sections.push({ title: lastTitle, content });
      lastTitle = match[1];
      lastIndex = regex.lastIndex;
    }
    const finalContent = md.substring(lastIndex).trim();
    sections.push({ title: lastTitle, content: finalContent });
  } else {
    sections.push({ title: 'Contenido Completo', content: md });
  }

  return sections;
}

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
        const override = guiasPremium.find(p => p.titulo?.toLowerCase() === g.titulo.toLowerCase())
        setGuia(override ? { ...g, ...override } as GuiaLocal : g)
      }
      setCargando(false)
    }
    loadGuia()
  }, [slug])

  const sections = useMemo(() => {
    if (!guia?.contenido_md) return []
    return parseMarkdownToSections(guia.contenido_md)
  }, [guia])

  const tools = useMemo(() => {
    if (!guia) return []
    const matchTool = (toolCategory: string, guidelines?: string[]) => {
      // 1. Match explícito por slug o título (Guías Premium/Específicas)
      if (guidelines && (guidelines.includes(slug) || guidelines.some(rg => guia.titulo.toLowerCase().includes(rg.replace(/-/g, ' '))))) {
        return true;
      }
      
      const catTool = toolCategory?.toLowerCase() || '';
      const catGuia = guia.categoria?.toLowerCase() || '';
      const title = guia.titulo.toLowerCase();

      // 2. Match directo por categoría
      if (catTool && catGuia && (catTool.includes(catGuia) || catGuia.includes(catTool))) {
        return true;
      }

      // 3. Heurística Inteligente por Temas Cardiológicos (Matchea si el título de la guía habla del tema de la herramienta)
      const isIsquemia = (s: string) => s.includes('isquémica') || s.includes('coronario') || s.includes('infarto') || s.includes('iam');
      const isArritmia = (s: string) => s.includes('arritmia') || s.includes('fibrilación') || s.includes('auricular');
      const isIC = (s: string) => s.includes('insuficiencia cardíaca') || s.includes('ic');

      if (isIsquemia(catTool) && isIsquemia(title)) return true;
      if (isArritmia(catTool) && isArritmia(title)) return true;
      if (isIC(catTool) && isIC(title)) return true;

      return false;
    }

    const algos = ALGORITMOS.filter(a => matchTool(a.category, a.relatedGuidelines)).map(a => ({
      id: a.slug,
      title: a.name,
      type: 'Algoritmo',
      href: `/algoritmos/${a.slug}`,
      icon: GitCommit
    }))
    
    const calcs = calculators.filter(c => matchTool(c.category, c.relatedGuidelines)).map(c => ({
      id: c.slug,
      title: c.name,
      type: 'Calculadora',
      href: `/calculadoras/${c.slug}`,
      icon: Calculator
    }))
    
    return [...algos, ...calcs]
  }, [slug, guia])

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
      {/* Header Sticky */}
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
          <div className="p-4 rounded-xl bg-slate-900 border-l-4 border-l-red-500 mb-6">
            <p className="text-sm text-slate-300 italic">{guia.resumen_rapido}</p>
          </div>
        )}

        {/* Botón PDF (A pedido del usuario, arriba y visible) */}
        {guia.url_fuente && (
          <div className="mb-8">
            <button 
              onClick={() => router.push(`/guias/${guia.slug}/pdf`)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all shadow-md shadow-slate-900/20 border border-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              Ver PDF Completo Nativamente
            </button>
          </div>
        )}

        {/* Tabs System */}
        <Tabs defaultValue="content" className="w-full mt-4">
          <TabsList className="w-full grid grid-cols-2 bg-slate-900/50 mb-6 h-12">
            <TabsTrigger value="content" className="text-sm font-semibold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <FileText size={16} /> Contenido
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-sm font-semibold gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Wrench size={16} /> Herramientas ({tools.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            {sections.map((section, idx) => (
              <details key={idx} className="group bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer text-slate-200 hover:bg-slate-800/50 transition-colors">
                  {section.title}
                  <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="p-4 pt-0 text-slate-300 border-t border-slate-800/50 bg-slate-900/20">
                  <div className="prose prose-invert prose-slate prose-a:text-red-400 max-w-none prose-sm sm:prose-base pt-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </details>
            ))}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            {tools.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                <Wrench className="mx-auto mb-3 opacity-20" size={48} />
                <p className="text-slate-400">No hay herramientas específicas enlazadas a esta guía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {tools.map(tool => (
                  <Link
                    href={tool.href}
                    key={tool.id}
                    className="flex items-center p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-red-500/50 hover:bg-slate-800 transition-all group"
                  >
                    <div className="bg-slate-950 p-3 rounded-lg mr-4">
                      <tool.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        {tool.type}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-100 group-hover:text-red-400 transition-colors">
                        {tool.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
