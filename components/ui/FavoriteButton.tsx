'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from './button'
import { db } from '@/lib/offline-db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  itemSlug: string
  tipo: 'guia' | 'calculadora' | 'algoritmo'
  titulo: string
  url: string
  className?: string
}

export function FavoriteButton({ itemSlug, tipo, titulo, url, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const existing = await db.favoritos.where('item_slug').equals(itemSlug).first()
        setIsFavorite(!!existing)
      } catch (err) {
        console.error('Error al chequear favoritos:', err)
      } finally {
        setLoading(false)
      }
    }
    checkFavorite()
  }, [itemSlug])

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await db.favoritos.where('item_slug').equals(itemSlug).delete()
        setIsFavorite(false)
        toast.info('Eliminado de favoritos')
      } else {
        await db.favoritos.add({
          item_slug: itemSlug,
          tipo,
          titulo,
          url
        })
        setIsFavorite(true)
        toast.success('Agregado a favoritos')
      }
    } catch (err) {
      console.error('Error al actualizar favorito:', err)
      toast.error('Ocurrió un error al guardar.')
    }
  }

  if (loading) return <Button variant="ghost" size="icon" disabled className={className}><Heart className="w-5 h-5 text-muted" /></Button>

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleFavorite}
      className={cn("hover:bg-red-500/10 hover:text-red-500 transition-colors", className)}
      title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <Heart className={cn("w-6 h-6", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
    </Button>
  )
}
