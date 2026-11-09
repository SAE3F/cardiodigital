import React from 'react';
import { useCardio } from '../context/CardioContext';
import { 
  HeartPulse, 
  Tv, 
  Smartphone, 
  LayoutGrid, 
  Lock, 
  Settings, 
  RefreshCw, 
  ArrowRightLeft,
  AlertTriangle,
  User,
  MapPin,
  Compass,
  Biohazard,
  BarChart3,
  Calculator,
  BookOpen,
  Database
} from 'lucide-react';
import type { ClinicalToolsTab } from './ClinicalToolsModal';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenNewPatientModal: () => void;
  onOpenEpidemiology: () => void;
  onOpenClinicalTools: (tab?: ClinicalToolsTab) => void;
  onOpenHistoricalRegistry: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  onOpenNewPatientModal,
  onOpenEpidemiology,
  onOpenClinicalTools,
  onOpenHistoricalRegistry
}) => {
  const {
    config,
    activeSectorId,
    setActiveSectorId,
    activeView,
    setActiveView,
    setIsLocked,
    getSectorStats,
    resetToDemoData
  } = useCardio();

  const stats = getSectorStats(activeSectorId);
  const occupancyPercentage = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs transition-colors">
      {/* Top Bar: Title, Hospital & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">CardioGuardia</h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Pase & Camas
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[260px] sm:max-w-md">
              {config.hospitalName} • {config.serviceName}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Desktop & Tablet) - Segmented Control */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveView('floor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeView === 'floor'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-700" />
            <span>Plano</span>
          </button>

          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeView === 'map'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tarjetas / Grilla</span>
            <span className="sm:hidden">Grilla</span>
          </button>

          <button
            onClick={() => setActiveView('rounds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeView === 'rounds'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Recorrida</span>
          </button>

          <button
            onClick={() => setActiveView('presentation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeView === 'presentation'
                ? 'bg-blue-700 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Pase TV</span>
          </button>
        </div>

        {/* Action icons: Calculators, Guidelines, Epidemiology, Database, New Patient, Settings */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onOpenClinicalTools('calculators')}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Calculadoras médicas indexadas (CHA2DS2-VASc, HAS-BLED, TIMI, GRACE...)"
          >
            <Calculator className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">Calculadoras</span>
          </button>

          <button
            onClick={() => onOpenClinicalTools('national_guidelines')}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Consensos Nacionales SAC / FAC y Evidencia Internacional en OpenEvidence"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">Guías SAC/FAC</span>
          </button>

          <button
            onClick={onOpenEpidemiology}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Análisis estadístico de FRCV, comorbilidades e infecciones"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden lg:inline">FRCV & Métricas</span>
          </button>

          <button
            onClick={onOpenHistoricalRegistry}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
            title="Base de datos histórica persistente y censo de internación"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Historial</span>
          </button>

          <button
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Ingresar Paciente</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button
            onClick={onOpenSettings}
            title="Configuración de Camas y Sectores"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLocked(true)}
            title="Bloquear pantalla con PIN"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm('¿Restablecer datos de prueba de cardiología (3 Guardia + 2 Hemo + 5 UCO + 16 Piso)?')) {
                resetToDemoData();
              }
            }}
            title="Restablecer datos de prueba"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub Bar: Sector Filtering & Realtime Clinical Bed Stats */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Sector Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveSectorId('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSectorId === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({config.beds.length} Camas)
            </button>
            {config.sectors.map(sector => {
              const sectorBeds = config.beds.filter(b => b.sectorId === sector.id);
              const occupied = sectorBeds.filter(b => b.status === 'ocupada').length;
              return (
                <button
                  key={sector.id}
                  onClick={() => setActiveSectorId(sector.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    activeSectorId === sector.id
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{sector.shortName}</span>
                  <span className="font-mono text-[11px] opacity-80 tabular-nums">
                    {occupied}/{sectorBeds.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Stats: Occupancy, Male/Female available, Transfers, Critical */}
          <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-600">
            {/* Occupancy */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Ocupación:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {stats.occupiedBeds}/{stats.totalBeds} ({occupancyPercentage}%)
              </span>
              <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    occupancyPercentage > 85 ? 'bg-rose-600' : occupancyPercentage > 60 ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
            </div>

            {/* Free beds gender breakdown */}
            <div className="hidden md:flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
              <span className="text-slate-400">Piso libres:</span>
              <span className="text-slate-800 font-mono font-medium tabular-nums">
                M: {stats.freeMaleBeds}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-800 font-mono font-medium tabular-nums">
                F: {stats.freeFemaleBeds}
              </span>
            </div>

            {/* Blocked by isolation tag */}
            {stats.blockedByIsolationBeds > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200" title="Camas anuladas automáticamente para aislamiento de pacientes">
                <Biohazard className="w-3 h-3 text-amber-700" />
                <span>{stats.blockedByIsolationBeds} anuladas x aislamiento</span>
              </span>
            )}

            {/* Critical alert tag */}
            {stats.criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{stats.criticalCount} críticos</span>
              </span>
            )}

            {/* Transfers pending tag */}
            {stats.transfersPendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                <ArrowRightLeft className="w-3 h-3 text-blue-600" />
                <span>{stats.transfersPendingCount} traslados</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
