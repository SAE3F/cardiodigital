import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { getSupabaseServerClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Disable redirect to login for local development if auth is not strictly required for offline usage
  // if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border">
        <Sidebar />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav mobile — crítico para uso con una mano en guardia */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background">
        <BottomNav />
      </nav>
    </div>
  )
}
