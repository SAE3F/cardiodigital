'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/offline-db'
import { syncAllData } from '@/lib/sync'
import { Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ guias: 0, farmacos: 0 })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
    const last = localStorage.getItem('cardioguardia_last_sync')
    if (last) setLastSync(new Date(parseInt(last)).toLocaleString())
  }, [])

  const loadStats = async () => {
    try {
      const guiasCount = await db.guias.count()
      const farmacosCount = await db.farmacos.count()
      setStats({ guias: guiasCount, farmacos: farmacosCount })
    } catch (e) {
      console.error('Error loading stats from IndexedDB', e)
    }
  }

  const handleForceSync = async () => {
    setIsSyncing(true)
    setSyncStatus('idle')
    try {
      // Opcional: limpiar la base local antes de forzar (db.guias.clear())
      // Pero syncAllData ya hace un upsert
      await syncAllData()
      setSyncStatus('success')
      setLastSync(new Date().toLocaleString())
      await loadStats()
    } catch (error) {
      console.error(error)
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-500" />
          Administración y Sincronización
        </h1>
        <p className="text-slate-400 mt-2">
          Panel de control del almacenamiento local (IndexedDB)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta de Estadísticas */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Base de Datos Local</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-300">Guías y Consensos</span>
              <span className="text-xl font-mono font-bold text-blue-400">{stats.guias}</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <span className="text-slate-300">Fármacos</span>
              <span className="text-xl font-mono font-bold text-emerald-400">{stats.farmacos}</span>
            </div>
            
            <div className="pt-4 border-t border-slate-700/50 text-sm text-slate-400">
              Última sincronización: <br/>
              <span className="text-slate-300 font-medium">{lastSync || 'Nunca'}</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Acciones */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">Mantenimiento</h2>
            <p className="text-sm text-slate-400 mb-6">
              Forzar la resincronización descargará nuevamente los datos desde el servidor central a este dispositivo. Utilizar si notás inconsistencias.
            </p>
          </div>

          <div className="space-y-4">
            {syncStatus === 'success' && (
              <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-sm p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sincronización exitosa
              </div>
            )}
            
            {syncStatus === 'error' && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Error de red al sincronizar
              </div>
            )}

            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Forzar Sincronización Total'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
