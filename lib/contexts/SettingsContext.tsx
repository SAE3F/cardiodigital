'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type FontSize = 'small' | 'normal' | 'large'

interface SettingsContextType {
  fontSize: FontSize
  setFontSize: (size: FontSize) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('normal')

  useEffect(() => {
    // Cargar preferencia guardada
    const saved = localStorage.getItem('cardioguardia_fontsize') as FontSize
    if (saved && ['small', 'normal', 'large'].includes(saved)) {
      setFontSize(saved)
    }
  }, [])

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size)
    localStorage.setItem('cardioguardia_fontsize', size)
    
    // Aplicar al root HTML para escalar todos los REM
    const html = document.documentElement
    if (size === 'small') html.style.fontSize = '14px'
    else if (size === 'large') html.style.fontSize = '18px'
    else html.style.fontSize = '16px' // normal
  }

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
