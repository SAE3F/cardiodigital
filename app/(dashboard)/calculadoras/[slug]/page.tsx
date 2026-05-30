import { getCalculatorBySlug, getAllCalculators } from "@/lib/data/calculators"
import { CalculatorEngine } from "@/components/calculadoras/CalculatorEngine"
import { notFound } from "next/navigation"

// Genera rutas estáticas en tiempo de build para que la app sea 100% offline y super rápida
export function generateStaticParams() {
  const calculators = getAllCalculators();
  return calculators.map((c) => ({
    slug: c.slug,
  }))
}

export default async function CalculatorDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <CalculatorEngine slug={resolvedParams.slug} />
    </div>
  )
}
