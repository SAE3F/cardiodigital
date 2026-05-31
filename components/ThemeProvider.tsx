'use client'

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Se usa extract properties the safe way for React 19
export function ThemeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
