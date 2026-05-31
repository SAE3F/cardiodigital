import { ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function PreventPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-background">
      <div className="p-4 md:p-6 pb-4 flex items-center gap-4 border-b border-border">
        <Link href="/calculadoras" className="p-2 -ml-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">AHA PREVENT™</h1>
          <p className="text-xs text-muted-foreground">Riesgo CV Global</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Calculadora Externa</h2>
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          Por razones de seguridad, las plataformas oficiales como la AHA bloquean la visualización directa dentro de otras aplicaciones (X-Frame-Options). 
          <br /><br />
          Para usar el <strong>AHA PREVENT™</strong> oficial, debés abrirlo en una pestaña nueva.
        </p>
        
        <a 
          href="https://professional.heart.org/en/guidelines-and-statements/prevent-calculator" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <span>Abrir Calculadora AHA PREVENT</span>
          <ExternalLink size={20} />
        </a>
      </div>
    </div>
  )
}
