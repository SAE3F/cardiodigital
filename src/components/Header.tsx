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
  AlertTriangle,
  User,
  Compass,
  Stethoscope,
  Biohazard,
  ArrowRightLeft
} from 'lucide-react';
import type { ClinicalToolsTab } from './ClinicalToolsModal';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenNewPatientModal: () => void;
  onOpenEpidemiology?: () => void;
  onOpenClinicalTools?: (tab?: ClinicalToolsTab) => void;
  onOpenHistoricalRegistry?: () => void;
  onOpenToolsHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  onOpenNewPatientModal,
  onOpenToolsHub
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
        {/* Full-width Title & Subtitle on mobile, Left side on desktop */}
        <div className="flex flex-col w-full sm:w-auto">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg bg-blue-700 flex items-center justify-center text-white shadow-xs shrink-0">
                <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-lg font-bold tracking-tight text-slate-900 leading-none truncate">
                    CardioGuardia
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    Pase & Camas
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 font-medium truncate mt-0.5 w-full">
                  {config.hospitalName} • {config.serviceName}
                </p>
              </div>
            </div>

            {/* Quick buttons on mobile top bar right */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenToolsHub}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-2xs"
                title="Herramientas Clínicas"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-700 stroke-[2]" />
                <span>Herramientas</span>
              </button>
              <button
                onClick={onOpenNewPatientModal}
                className="p-2 rounded-md bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-xs"
                title="Ingresar Paciente"
              >
                <User className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Mobile full-width subtitle across entire screen */}
          <p className="sm:hidden text-[11px] text-slate-600 font-medium leading-snug mt-1.5 w-full">
            {config.hospitalName} • {config.serviceName}
          </p>
        </div>

        {/* View Switcher Tabs (Desktop & Tablet only) - Segmented Control */}
        <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveView('floor')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
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

        {/* Desktop Action icons */}
        <div className="hidden sm:flex items-center space-x-1.5 shrink-0">
          <button
            onClick={onOpenToolsHub}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors shadow-2xs"
            title="Herramientas Clínicas: Calculadoras, Guías, Evidencia, Farmacología"
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-700 stroke-[2]" />
            <span>Herramientas</span>
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
      <div className="bg-slate-50 border-t border-slate-200 px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 text-xs">
          {/* Sector Buttons - Fully visible on mobile without horizontal scroll */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setActiveSectorId('all')}
              className={`flex-auto sm:flex-initial text-center justify-center whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
                  className={`flex-auto sm:flex-initial text-center justify-center whitespace-nowrap px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
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