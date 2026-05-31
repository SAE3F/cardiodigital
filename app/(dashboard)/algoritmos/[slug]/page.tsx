import { getAlgorithmBySlug } from '@/lib/data/algoritmos'
import { AlgorithmEngine } from '@/components/algoritmos/AlgorithmEngine'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string;
  }>
}

export default async function AlgoritmoPage({ params }: PageProps) {
  const resolvedParams = await params;
  const config = getAlgorithmBySlug(resolvedParams.slug)

  if (!config) {
    notFound()
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/algoritmos" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Algoritmos
        </Link>
      </div>

      <AlgorithmEngine config={config} />
    </div>
  )
}
