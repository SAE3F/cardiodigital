import React, { useState, useMemo } from 'react';
import { useCardio } from '../context/CardioContext';
import { Patient } from '../types';
import { 
  exportPatientsToCSV, 
  downloadCSV, 
  exportDatabaseToJSON, 
  downloadJSON 
} from '../services/clinicalDatabase';
import { 
  Database, 
  Search, 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  ChevronRight, 
  Pill, 
  Info
} from 'lucide-react';

interface HistoricalRegistryModalProps {
  onClose: () => void;
  onSelectPatientToView?: (patient: Patient) => void;
}

export const HistoricalRegistryModal: React.FC<HistoricalRegistryModalProps> = ({
  onClose,
  onSelectPatientToView
}) => {
  const { 
    getAllHistoricalPatients, 
    config, 
    importHistoricalPatients 
  } = useCardio();

  const allPatients = useMemo(() => {
    return getAllHistoricalPatients();
  }, [getAllHistoricalPatients]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'alta_medica' | 'traslado_externo' | 'obito'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'readmission' | 'iacs' | 'd2b'>('all');
  const [frcvFilter, setFrcvFilter] = useState<string>('all');
  
  // Selected Patient for detail drawer inside registry
  const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);

  // Compute Overall Database KPIs
  const stats = useMemo(() => {
    const total = allPatients.length;
    const active = allPatients.filter(p => !p.dischargeDate).length;
    const discharged = allPatients.filter(p => Boolean(p.dischargeDate)).length;
    
    // Average stay across database
    let totalStayDays = 0;
    allPatients.forEach(p => {
      const start = new Date(p.admissionDate || '2026-11-01');
      const end = p.dischargeDate ? new Date(p.dischargeDate) : new Date();
      const diff = Math.max(1, Math.round(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      totalStayDays += diff;
    });
    const avgStay = total > 0 ? (totalStayDays / total).toFixed(1) : '0';

    const readmissions30d = allPatients.filter(p => p.isReadmissionWithin30Days).length;
    const readmissionRate = total > 0 ? Math.round((readmissions30d / total) * 100) : 0;

    const iacsCount = allPatients.filter(p => p.hospitalInfection?.hasInfection).length;
    const d2bCount = allPatients.filter(p => p.doorToBalloon?.isApplicable).length;
    const d2bWithinTarget = allPatients.filter(p => p.doorToBalloon?.isApplicable && p.doorToBalloon.isWithinTarget).length;
    const d2bRate = d2bCount > 0 ? Math.round((d2bWithinTarget / d2bCount) * 100) : 0;

    return {
      total,
      active,
      discharged,
      avgStay,
      readmissions30d,
      readmissionRate,
      iacsCount,
      d2bCount,
      d2bRate
    };
  }, [allPatients]);

  // Unique FRCV options present in database
  const availableFrcvs = useMemo(() => {
    const set = new Set<string>();
    allPatients.forEach(p => {
      (p.antecedentsList || []).forEach(a => set.add(a));
    });
    return Array.from(set).sort();
  }, [allPatients]);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    return allPatients.filter(p => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.fullName || '').toLowerCase().includes(q);
        const matchDni = (p.dni || '').toLowerCase().includes(q);
        const matchDiag = (p.diagnosis || '').toLowerCase().includes(q) || (p.diagnoses || []).some(d => d.toLowerCase().includes(q));
        const matchMeds = (p.medications || []).some(m => m.toLowerCase().includes(q));
        if (!matchName && !matchDni && !matchDiag && !matchMeds) return false;
      }

      // 2. Status Filter
      if (statusFilter === 'active' && p.dischargeDate) return false;
      if (statusFilter !== 'all' && statusFilter !== 'active') {
        if (!p.dischargeDate || p.dischargeReason !== statusFilter) return false;
      }

      // 3. Sector Filter
      if (sectorFilter !== 'all' && p.sectorId !== sectorFilter) return false;

      // 4. Quality Filter
      if (qualityFilter === 'readmission' && !p.isReadmissionWithin30Days) return false;
      if (qualityFilter === 'iacs' && !p.hospitalInfection?.hasInfection) return false;
      if (qualityFilter === 'd2b' && !p.doorToBalloon?.isApplicable) return false;

      // 5. FRCV Filter
      if (frcvFilter !== 'all') {
        const hasFrcv = (p.antecedentsList || []).includes(frcvFilter);
        if (!hasFrcv) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!a.dischargeDate && b.dischargeDate) return -1;
      if (a.dischargeDate && !b.dischargeDate) return 1;
      return (b.admissionDate || '').localeCompare(a.admissionDate || '');
    });
  }, [allPatients, searchQuery, statusFilter, sectorFilter, qualityFilter, frcvFilter]);

  // Export Handlers
  const handleExportCSV = () => {
    const csvContent = exportPatientsToCSV(filteredPatients);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `CardioGuardia_BaseDatos_${dateStr}.csv`);
  };

  const handleExportJSON = () => {
    const jsonContent = exportDatabaseToJSON(allPatients, config);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadJSON(jsonContent, `CardioGuardia_Backup_${dateStr}.json`);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const importedList = Array.isArray(parsed) ? parsed : parsed.patients;

        if (Array.isArray(importedList) && importedList.length > 0) {
          importHistoricalPatients(importedList);
          alert(`Se importaron exitosamente ${importedList.length} registros a la base de datos.`);
        } else {
          alert('El archivo no contiene un formato de pacientes válido.');
        }
      } catch (err) {
        console.error('Error importando JSON:', err);
        alert('Error al procesar el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl border-0 sm:border sm:border-slate-300 w-full max-w-7xl h-[100dvh] sm:h-auto sm:max-h-[94vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* HEADER */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 shrink-0">
          <div className="flex items-start justify-between gap-2.5 w-full sm:w-auto sm:flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-md bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900 leading-snug">Base de Datos Histórica & Censo Asistencial</h2>
                  <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium shrink-0">
                    IndexedDB Persistente
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  Registro de admisiones, historial clínico, estancias hospitalarias y auditoría de calidad
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors shrink-0"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: Export CSV, JSON, Import */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/70">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white transition-colors"
              title="Descargar base completa en formato CSV para Microsoft Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
              title="Descargar copia de seguridad en formato JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            <button
              onClick={onClose}
              className="hidden sm:block p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors ml-1"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY (KPIs + Filters + Table) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
        {/* SUMMARY KPI CARDS */}
        <div className="px-4 sm:px-5 py-3 bg-white border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
          <div className="p-2.5 rounded-md bg-white border border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Total Registros</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.total}</span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200 border-l-4 border-l-blue-600">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Activos en Sala</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.active}</span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200 border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Egresos / Altas</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.discharged}</span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Estancia Media</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.avgStay} <span className="text-xs font-normal text-slate-500">días</span></span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200 border-l-4 border-l-rose-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Reingresos &lt; 30d</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.readmissionRate}% <span className="text-xs font-normal text-slate-500">({stats.readmissions30d})</span></span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Casos IACS</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.iacsCount}</span>
          </div>

          <div className="p-2.5 rounded-md bg-white border border-slate-200 border-l-4 border-l-amber-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Meta Puerta-Balón</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">{stats.d2bRate}% <span className="text-xs font-normal text-slate-500">(&lt;90m)</span></span>
          </div>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search bar */}
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por DNI, Nombre, Diagnóstico o Medicación..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Estado:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="py-1 px-2.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos en Sala</option>
              <option value="alta_medica">Altas Médicas</option>
              <option value="traslado_externo">Traslados Externos</option>
              <option value="obito">Óbitos</option>
            </select>
          </div>

          {/* Sector filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Sector:</span>
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="py-1 px-2.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs"
            >
              <option value="all">Todos los sectores</option>
              {config.sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Quality flags filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Calidad:</span>
            <select
              value={qualityFilter}
              onChange={e => setQualityFilter(e.target.value as any)}
              className="py-1 px-2.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs"
            >
              <option value="all">Todas las métricas</option>
              <option value="readmission">Reingreso &lt; 30 días</option>
              <option value="iacs">Infección Nosocomial (IACS)</option>
              <option value="d2b">Infarto / Puerta-Balón</option>
            </select>
          </div>

          {/* FRCV filter */}
          {availableFrcvs.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium text-[11px]">FRCV:</span>
              <select
                value={frcvFilter}
                onChange={e => setFrcvFilter(e.target.value)}
                className="py-1 px-2.5 rounded-md border border-slate-300 bg-white font-medium text-slate-800 text-xs max-w-[180px] truncate"
              >
                <option value="all">Todos los FRCV</option>
                {availableFrcvs.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear filters button */}
          {(searchQuery || statusFilter !== 'all' || sectorFilter !== 'all' || qualityFilter !== 'all' || frcvFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSectorFilter('all');
                setQualityFilter('all');
                setFrcvFilter('all');
              }}
              className="text-[11px] font-medium text-blue-700 hover:underline"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">DNI / Paciente</th>
                <th className="py-2.5 px-3">Estado / Sector</th>
                <th className="py-2.5 px-3">Ingreso / Egreso</th>
                <th className="py-2.5 px-3 text-center">Estancia</th>
                <th className="py-2.5 px-4">Diagnóstico</th>
                <th className="py-2.5 px-3">FRCV & Antecedentes</th>
                <th className="py-2.5 px-3">Indicadores Calidad</th>
                <th className="py-2.5 px-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(p => {
                const adm = new Date(p.admissionDate || '2026-11-01');
                const end = p.dischargeDate ? new Date(p.dischargeDate) : new Date();
                const stayDays = Math.max(1, Math.round(Math.abs(end.getTime() - adm.getTime()) / (1000 * 60 * 60 * 24)));

                const isActive = !p.dischargeDate;
                const sectorObj = config.sectors.find(s => s.id === p.sectorId);

                return (
                  <tr 
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setInspectedPatient(p)}
                  >
                    {/* Column 1: DNI & Full Name */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {p.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        DNI {p.dni} • {p.age}a ({p.sex === 'M' ? 'M' : 'F'})
                      </div>
                    </td>

                    {/* Column 2: Status & Sector */}
                    <td className="py-2.5 px-3">
                      {isActive ? (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Internado
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.dischargeReason === 'alta_medica' ? 'Alta Médica' : p.dischargeReason === 'obito' ? 'Óbito' : 'Derivación'}
                        </span>
                      )}
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {sectorObj?.shortName || p.sectorId || 'Sin sector'}
                      </div>
                    </td>

                    {/* Column 3: Dates */}
                    <td className="py-2.5 px-3 text-[11px] font-mono">
                      <div className="font-medium text-slate-800">
                        {p.admissionDate}
                      </div>
                      <div className="text-slate-500 mt-0.5 text-[10px]">
                        {p.dischargeDate ? `Egreso: ${p.dischargeDate}` : 'En curso'}
                      </div>
                    </td>

                    {/* Column 4: Stay (LOS) */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block font-mono font-semibold text-[11px] px-2 py-0.5 rounded-md border tabular-nums ${
                        stayDays > 7
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : stayDays >= 5
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {stayDays} d
                      </span>
                    </td>

                    {/* Column 5: Diagnosis */}
                    <td className="py-2.5 px-4 max-w-[240px]">
                      <div className="font-medium text-slate-800 truncate" title={p.diagnosis}>
                        {p.diagnosis}
                      </div>
                      {p.diagnoses && p.diagnoses.length > 1 && (
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          +{p.diagnoses.length - 1} asociados
                        </div>
                      )}
                    </td>

                    {/* Column 6: FRCV */}
                    <td className="py-2.5 px-3 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {(p.antecedentsList || []).slice(0, 2).map((a, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium truncate max-w-[140px] border border-slate-200">
                            {a.split('(')[0]}
                          </span>
                        ))}
                        {(p.antecedentsList || []).length > 2 && (
                          <span className="text-[10px] px-1 rounded bg-slate-200 text-slate-700 font-semibold">
                            +{(p.antecedentsList || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 7: Quality Indicators */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isReadmissionWithin30Days && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                            Reingreso &lt; 30d
                          </span>
                        )}
                        {p.hospitalInfection?.hasInfection && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            IACS
                          </span>
                        )}
                        {p.doorToBalloon?.isApplicable && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                            D2B {p.doorToBalloon.totalMinutes}m
                          </span>
                        )}
                        {!p.isReadmissionWithin30Days && !p.hospitalInfection?.hasInfection && !p.doorToBalloon?.isApplicable && (
                          <span className="text-[10px] text-slate-400 font-normal">Estándar</span>
                        )}
                      </div>
                    </td>

                    {/* Column 8: Action button */}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedPatient(p);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-xs">
                    No se encontraron pacientes que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>

        {/* PATIENT DETAIL INSPECTION DRAWER / MODAL */}
        {inspectedPatient && (
          <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl p-5 overflow-y-auto space-y-4 flex flex-col border-l border-slate-300">
              
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{inspectedPatient.fullName}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      inspectedPatient.dischargeDate ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {inspectedPatient.dischargeDate ? 'Egresado' : 'Internado'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    DNI: {inspectedPatient.dni} • {inspectedPatient.age} años ({inspectedPatient.sex === 'M' ? 'Masculino' : 'Femenino'})
                  </p>
                </div>
                <button
                  onClick={() => setInspectedPatient(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Admission & Stay Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Fecha de Ingreso:</span>
                  <span className="font-semibold text-slate-800 font-mono">{inspectedPatient.admissionDate} {inspectedPatient.admissionTime || ''}</span>
                </div>
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block text-[11px]">Fecha de Egreso:</span>
                  <span className="font-semibold text-slate-800 font-mono">{inspectedPatient.dischargeDate || 'En internación activa'}</span>
                </div>
              </div>

              {/* Diagnosis & Antecedents */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-medium text-slate-700 block mb-1">Diagnóstico Principal:</span>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 font-semibold text-slate-900">
                    {inspectedPatient.diagnosis}
                  </div>
                </div>

                {inspectedPatient.antecedentsList && inspectedPatient.antecedentsList.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-700 block mb-1">Factores de Riesgo (FRCV):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectedPatient.antecedentsList.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200 text-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quality & Safety Indicators */}
              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-semibold text-slate-800 block">Indicadores Clínicos de Calidad:</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Reingreso en &lt; 30 días:</span>
                    <span className="font-semibold">{inspectedPatient.isReadmissionWithin30Days ? 'SÍ (Reingreso Precoz)' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Reinternaciones en 12 meses:</span>
                    <span className="font-semibold font-mono">{inspectedPatient.readmissionCount || 0}</span>
                  </div>
                  {inspectedPatient.hospitalInfection?.hasInfection && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-200 text-rose-800">
                      <span>Infección Nosocomial (IACS):</span>
                      <span className="font-semibold">{inspectedPatient.hospitalInfection.type} ({inspectedPatient.hospitalInfection.germ || 'Germen en cultivo'})</span>
                    </div>
                  )}
                  {inspectedPatient.doorToBalloon?.isApplicable && (
                    <div className="flex items-center justify-between py-1 text-slate-800">
                      <span>Tiempo Puerta-Balón (D2B):</span>
                      <span className="font-semibold font-mono">{inspectedPatient.doorToBalloon.totalMinutes} min ({inspectedPatient.doorToBalloon.isWithinTarget ? 'Meta <= 90m Cumplida' : 'Excedida'})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medications */}
              {inspectedPatient.medications && inspectedPatient.medications.length > 0 && (
                <div className="text-xs space-y-1.5">
                  <span className="font-medium text-slate-700 block">Medicación y Dosificación:</span>
                  <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                    {inspectedPatient.medications.map((m, i) => (
                      <div key={i} className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & Epicrisis */}
              {inspectedPatient.evolutionNotes && (
                <div className="text-xs space-y-1">
                  <span className="font-medium text-slate-700 block">Notas de Evolución / Epicrisis:</span>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                    {inspectedPatient.evolutionNotes}
                  </div>
                </div>
              )}

              {/* Conduct */}
              {inspectedPatient.pendingConduct && (
                <div className="text-xs space-y-1">
                  <span className="font-medium text-slate-700 block">Conducta Planificada:</span>
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-slate-800">
                    {inspectedPatient.pendingConduct}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setInspectedPatient(null)}
                  className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="px-4 py-2.5 sm:px-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700" />
            <span>Mostrando {filteredPatients.length} de {allPatients.length} pacientes registrados en la base histórica.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium transition-colors"
          >
            Cerrar Base de Datos
          </button>
        </div>

      </div>
    </div>
  );
};
