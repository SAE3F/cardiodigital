import { getAlgorithmBySlug } from '@/lib/data/algoritmos'
import { AlgorithmEngine } from '@/components/algoritmos/AlgorithmEngine'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: {
    slug: string;
  }
}

export default function AlgoritmoPage({ params }: PageProps) {
  const config = getAlgorithmBySlug(params.slug)

  if (!config) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/algoritmos" 
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Algoritmos
        </Link>
      </div>

      <AlgorithmEngine config={config} />
    </div>
  )
}
