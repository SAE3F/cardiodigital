'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { HeartPulse, Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Círculos decorativos de fondo acordes al tema */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 bg-background rounded-2xl flex items-center justify-center shadow-inner border border-border mb-4 overflow-hidden">
            <Image src="/logo.png" alt="Cardiodigital Logo" fill className="object-cover" />
            {/* Si no hay logo, fallback visual:
            <HeartPulse className="w-10 h-10 text-red-500" />
            */}
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenido Doc</h1>
          <p className="text-muted-foreground text-sm mt-1">Ingresa a Cardiodigital</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Médico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="dr.perez@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="#" className="text-xs text-red-500 hover:text-red-400">¿Olvidaste tu clave?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold mt-6" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-red-500 hover:text-red-400 font-semibold">
            Regístrate acá
          </Link>
        </div>
      </div>
    </div>
  )
}
