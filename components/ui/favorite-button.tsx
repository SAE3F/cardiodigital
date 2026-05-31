'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { db, type FavoritoLocal } from '@/lib/offline-db'

interface FavoriteButtonProps {
  itemSlug: string
  tipo: 'guia' | 'calculadora' | 'algoritmo'
  titulo: string
  url: string
  className?: string
}

export function FavoriteButton({ itemSlug, tipo, titulo, url, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const checkFavorite = async () => {
      const fav = await db.favoritos.where({ item_slug: itemSlug }).first()
      setIsFavorite(!!fav)
    }
    checkFavorite()
  }, [itemSlug])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const fav = await db.favoritos.where({ item_slug: itemSlug }).first()
    
    if (fav && fav.id) {
      await db.favoritos.delete(fav.id)
      setIsFavorite(false)
    } else {
      await db.favoritos.add({
        item_slug: itemSlug,
        tipo,
        titulo,
        url
      })
      setIsFavorite(true)
    }
  }

  return (
    <button 
      onClick={toggleFavorite}
      className={`p-2 rounded-full hover:bg-accent transition-colors ${className}`}
      aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      <Heart 
        size={20} 
        className={isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-foreground"} 
      />
    </button>
  )
}
