'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, Moon, Sun, Type, MonitorSmartphone, Eclipse, Heart, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { db, type FavoritoLocal } from '@/lib/offline-db'
import Link from 'next/link'

export default function PerfilPage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { fontSize, setFontSize } = useSettings()
  const router = useRouter()
  const [favoritos, setFavoritos] = useState<FavoritoLocal[]>([])
  
  // Para evitar hydration mismatch con next-themes
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    const loadFavoritos = async () => {
      const favs = await db.favoritos.toArray()
      setFavoritos(favs)
    }
    loadFavoritos()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.user_metadata?.full_name || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">{user?.email || 'No conectado'}</p>
        </div>
      </div>

      {!user && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl">
          <p className="text-yellow-600 mb-3 font-medium">No has iniciado sesión</p>
          <p className="text-sm text-yellow-600/80 mb-4">Iniciá sesión para sincronizar tus favoritos en todos tus dispositivos.</p>
          <Button onClick={() => router.push('/login')} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            Iniciar Sesión
          </Button>
        </div>
      )}

      {/* Favoritos */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Mis Favoritos
        </h2>
        {favoritos.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Aún no agregaste guías, algoritmos ni calculadoras a favoritos.</p>
        ) : (
          <div className="grid gap-3">
            {favoritos.map((fav) => (
              <Link key={fav.id} href={fav.url} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-red-500/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{fav.titulo}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{fav.tipo}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5 text-red-500" />
            Tema Visual
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className={`flex-col h-auto py-4 border-2 ${theme === 'light' ? 'border-red-500 bg-red-500/10' : 'border-border'}`}
              onClick={() => setTheme('light')}
            >
              <Sun className="w-6 h-6 mb-2" />
              Claro
            </Button>
            <Button
              variant="outline"
              className={`flex-col h-auto py-4 border-2 ${theme === 'dark' ? 'border-red-500 bg-red-500/10' : 'border-border'}`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="w-6 h-6 mb-2" />
              Oscuro (Gris)
            </Button>
            <Button
              variant="outline"
              className={`flex-col h-auto py-4 border-2 ${theme === 'oled' ? 'border-red-500 bg-red-500/10' : 'border-border'}`}
              onClick={() => setTheme('oled')}
            >
              <Eclipse className="w-6 h-6 mb-2" />
              OLED (Negro)
            </Button>
            <Button
              variant="outline"
              className={`flex-col h-auto py-4 border-2 ${theme === 'dim' ? 'border-red-500 bg-red-500/10' : 'border-border'}`}
              onClick={() => setTheme('dim')}
            >
              <Moon className="w-6 h-6 mb-2 text-blue-400" />
              Dim (Azul)
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-red-500" />
            Tamaño de Letra
          </h2>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className={`flex-1 border-2 ${fontSize === 'small' ? 'border-red-500 bg-red-500/10' : 'border-border'} text-sm`}
              onClick={() => setFontSize('small')}
            >
              A-
            </Button>
            <Button
              variant="outline"
              className={`flex-1 border-2 ${fontSize === 'normal' ? 'border-red-500 bg-red-500/10' : 'border-border'} text-base`}
              onClick={() => setFontSize('normal')}
            >
              A
            </Button>
            <Button
              variant="outline"
              className={`flex-1 border-2 ${fontSize === 'large' ? 'border-red-500 bg-red-500/10' : 'border-border'} text-lg font-bold`}
              onClick={() => setFontSize('large')}
            >
              A+
            </Button>
          </div>
        </div>
      </div>

      {user && (
        <div className="pt-8 border-t border-border">
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  )
}
