import React, { useState, useMemo } from 'react';
import { useCardio } from '../context/CardioContext';
import { Patient } from '../types';
import { 
  X, 
  BarChart3, 
  Activity, 
  Heart, 
  Biohazard, 
  Clock, 
  RotateCcw, 
  Zap, 
  AlertCircle, 
  Layers, 
  Database 
} from 'lucide-react';

interface EpidemiologyModalProps {
  onClose: () => void;
}

type AnalyticsTab = 'frcv' | 'stay' | 'readmissions' | 'infections' | 'reperfusion';

export const EpidemiologyModal: React.FC<EpidemiologyModalProps> = ({ onClose }) => {
  const { patients, getAllHistoricalPatients, config } = useCardio();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('frcv');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [cohortMode, setCohortMode] = useState<'active' | 'historical'>('active');

  const allHistoricalPatients = useMemo<Patient[]>(() => {
    return getAllHistoricalPatients();
  }, [getAllHistoricalPatients]);

  const baseCohort: Patient[] = cohortMode === 'active' ? patients : allHistoricalPatients;

  // Filter patients by sector if requested
  const filteredPatients: Patient[] = sectorFilter === 'all'
    ? baseCohort
    : baseCohort.filter((p: Patient) => p.sectorId === sectorFilter);

  const totalPatients = filteredPatients.length;

  // Helper to calculate days of stay from admissionDate
  const getDaysOfStay = (admissionDate: string, endDateStr?: string): number => {
    const start = new Date(admissionDate);
    const end = endDateStr ? new Date(endDateStr) : new Date();
    const diffMs = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  // Helper to check if a patient has a specific antecedent / FRCV
  const patientMatchesAntecedent = (patient: Patient, key: string, name: string): boolean => {
    if (patient.antecedentsList && patient.antecedentsList.some(a => a.toLowerCase().includes(name.toLowerCase()) || a.toLowerCase().includes(key.toLowerCase()))) {
      return true;
    }
    if (patient.antecedents) {
      const text = patient.antecedents.toLowerCase();
      const searchTerms = [
        key.toLowerCase(),
        name.toLowerCase(),
        ...(key === 'hta' ? ['hipertens', 'hta', 'presion alta'] : []),
        ...(key === 'dbt2' || key === 'dbt1' ? ['diabet', 'dbt', 'dbt2', 'dbt1'] : []),
        ...(key === 'dlp' ? ['dislipem', 'colesterol', 'dlp'] : []),
        ...(key === 'tbq-activo' || key === 'tbq-previo' ? ['tabaqu', 'fumador', 'cigarrillo', 'tbq'] : []),
        ...(key === 'obesidad' ? ['obes', 'sobrepeso'] : []),
        ...(key === 'sedentarismo' ? ['sedentar'] : []),
        ...(key === 'iam-previo' ? ['infarto', 'iam', 'necrosis'] : []),
        ...(key === 'atc-previa' ? ['angioplastia', 'stent', 'atc'] : []),
        ...(key === 'crm-previa' ? ['by-pass', 'bypass', 'crm', 'cirugia coronaria'] : []),
        ...(key === 'fa-paroxistica' || key === 'fa-permanente' ? ['fibrilacion', 'fa', 'arritmia auricular'] : []),
        ...(key === 'icfer' || key === 'icfep' ? ['insuficiencia cardiaca', 'ic ', 'icfer', 'icfep', 'falla de bomba'] : []),
        ...(key === 'marcapasos-def' || key === 'cdi-implantable' ? ['marcapasos', 'cdi', 'resincronizador'] : []),
        ...(key === 'erc-no-dialisis' || key === 'erc-dialisis' ? ['renal', 'creatinina', 'dialisis', 'erc'] : [])
      ];
      return searchTerms.some(term => text.includes(term));
    }
    return false;
  };

  // 1. FRCV Metrics
  const frcvMetrics = [
    { key: 'hta', label: 'Hipertensión Arterial (HTA)', color: 'bg-blue-700' },
    { key: 'dbt2', label: 'Diabetes Mellitus (DBT)', color: 'bg-blue-700' },
    { key: 'dlp', label: 'Dislipemia / Hipercolesterolemia', color: 'bg-blue-700' },
    { key: 'tbq-activo', label: 'Tabaquismo (Activo o Ex-TBQ)', color: 'bg-blue-700' },
    { key: 'obesidad', label: 'Obesidad (IMC ≥ 30)', color: 'bg-blue-700' },
    { key: 'sedentarismo', label: 'Sedentarismo', color: 'bg-blue-700' }
  ].map(item => {
    const count = filteredPatients.filter(p => patientMatchesAntecedent(p, item.key, item.label)).length;
    const percentage = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;
    return { ...item, count, percentage };
  });

  const historyMetrics = [
    { key: 'iam-previo', label: 'Infarto Previo (IAM)', color: 'bg-slate-700' },
    { key: 'atc-previa', label: 'Angioplastia con Stent previa', color: 'bg-slate-700' },
    { key: 'crm-previa', label: 'Cirugía de By-pass (CRM)', color: 'bg-slate-700' },
    { key: 'icfer', label: 'Insuficiencia Cardíaca Crónica', color: 'bg-slate-700' },
    { key: 'fa-permanente', label: 'Fibrilación Auricular / Flutter', color: 'bg-slate-700' },
    { key: 'marcapasos-def', label: 'Portador de Marcapasos / CDI', color: 'bg-slate-700' },
    { key: 'erc-no-dialisis', label: 'Enfermedad Renal Crónica (ERC)', color: 'bg-slate-700' }
  ].map(item => {
    const count = filteredPatients.filter(p => patientMatchesAntecedent(p, item.key, item.label)).length;
    const percentage = totalPatients > 0 ? Math.round((count / totalPatients) * 100) : 0;
    return { ...item, count, percentage };
  });

  // 2. Length of Stay (LOS) Metrics
  const stayDaysList = filteredPatients.map(p => getDaysOfStay(p.admissionDate));
  const totalDays = stayDaysList.reduce((acc, d) => acc + d, 0);
  const avgStayDays = totalPatients > 0 ? (totalDays / totalPatients).toFixed(1) : '0';

  // Stay distribution
  const shortStayCount = stayDaysList.filter(d => d <= 3).length;
  const normalStayCount = stayDaysList.filter(d => d >= 4 && d <= 7).length;
  const prolongedStayCount = stayDaysList.filter(d => d >= 8 && d <= 14).length;
  const criticalStayCount = stayDaysList.filter(d => d > 14).length;

  // Sector breakdown of average stay
  const sectorStayAverages = config.sectors.map(sec => {
    const secPatients = patients.filter(p => p.sectorId === sec.id);
    const secDays = secPatients.map(p => getDaysOfStay(p.admissionDate)).reduce((a, b) => a + b, 0);
    const avg = secPatients.length > 0 ? (secDays / secPatients.length).toFixed(1) : '0';
    return { sector: sec, avg, count: secPatients.length };
  });

  // Longest staying patients
  const sortedByStay = [...filteredPatients].sort((a, b) => getDaysOfStay(b.admissionDate) - getDaysOfStay(a.admissionDate));

  // 3. Readmission Metrics
  const readmittedPatients = filteredPatients.filter(p => (p.readmissionCount || 0) > 0);
  const readmission30DaysPatients = filteredPatients.filter(p => p.isReadmissionWithin30Days);
  const readmission30DaysRate = totalPatients > 0 ? Math.round((readmission30DaysPatients.length / totalPatients) * 100) : 0;
  const globalReadmissionRate = totalPatients > 0 ? Math.round((readmittedPatients.length / totalPatients) * 100) : 0;

  // Heart Failure Readmission Rate
  const hfPatients = filteredPatients.filter(p => 
    p.diagnosis.toLowerCase().includes('insuficiencia card') || 
    p.diagnosis.toLowerCase().includes('ic ') ||
    (p.diagnoses && p.diagnoses.some(d => d.toLowerCase().includes('insuficiencia')))
  );
  const hfReadmitted = hfPatients.filter(p => (p.readmissionCount || 0) > 0 || p.isReadmissionWithin30Days);
  const hfReadmissionRate = hfPatients.length > 0 ? Math.round((hfReadmitted.length / hfPatients.length) * 100) : 0;

  // Patients with high readmission frequency
  const frequentFlyers = [...filteredPatients]
    .filter(p => (p.readmissionCount || 0) >= 1 || p.isReadmissionWithin30Days)
    .sort((a, b) => (b.readmissionCount || 0) - (a.readmissionCount || 0));

  // 4. Hospital Infections (IACS) Metrics
  const infectionPatients = filteredPatients.filter(p => p.hospitalInfection && p.hospitalInfection.hasInfection);
  const infectionRate = totalPatients > 0 ? ((infectionPatients.length / totalPatients) * 100).toFixed(1) : '0';
  const postProcedureInfections = infectionPatients.filter(p => p.hospitalInfection?.postProcedure);

  // Group infections by type
  const infectionTypesCount: Record<string, number> = {};
  infectionPatients.forEach(p => {
    const type = p.hospitalInfection?.type || 'otra';
    infectionTypesCount[type] = (infectionTypesCount[type] || 0) + 1;
  });

  const infectionTypeLabels: Record<string, string> = {
    herida_quirurgica: 'Herida Quirúrgica (Esternotomía / CRM)',
    sitio_marcapasos: 'Bolsillo de Marcapasos / CDI',
    bacteriemia_cateter: 'Bacteriemia asociada a Catéter (BAC)',
    puncion_vascular: 'Sitio de Punción Vascular (Femoral / Radial)',
    neumonia_ventilador: 'Neumonía asociada a Ventilación (NAV)',
    infeccion_urinaria: 'Infección Urinaria por Sonda (ITU-SV)',
    clostridium: 'Clostridioides difficile',
    otra: 'Otras Infecciones Hospitalarias'
  };

  // 5. Door-to-Balloon Reperfusion Metrics
  const reperfusionCases = filteredPatients.filter(p => p.doorToBalloon && p.doorToBalloon.isApplicable);
  const withinTargetCases = reperfusionCases.filter(p => p.doorToBalloon?.isWithinTarget);
  const adherenceRate = reperfusionCases.length > 0 ? Math.round((withinTargetCases.length / reperfusionCases.length) * 100) : 0;

  let totalD2BMinutes = 0;
  let countD2BValid = 0;
  reperfusionCases.forEach(p => {
    if (p.doorToBalloon?.totalMinutes !== undefined) {
      totalD2BMinutes += p.doorToBalloon.totalMinutes;
      countD2BValid++;
    }
  });
  const avgD2BTime = countD2BValid > 0 ? Math.round(totalD2BMinutes / countD2BValid) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full border border-slate-300 shadow-xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  Centro de Inteligencia Clínica & Calidad Asistencial
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  Auditoría Hospitalaria
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Permanencia, reinternaciones, infecciones nosocomiales (IACS), FRCV y protocolo puerta-balón
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-white shrink-0 text-xs font-medium overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('frcv')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'frcv'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Factores de Riesgo (FRCV)</span>
          </button>

          <button
            onClick={() => setActiveTab('stay')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'stay'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempo de Permanencia (Estancia)</span>
            {prolongedStayCount + criticalStayCount > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-rose-50 text-rose-800 border border-rose-200">
                {prolongedStayCount + criticalStayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('readmissions')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'readmissions'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reinternaciones & Frecuencia</span>
            {readmission30DaysPatients.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-rose-50 text-rose-800 border border-rose-200">
                {readmission30DaysPatients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('infections')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'infections'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Biohazard className="w-3.5 h-3.5" />
            <span>Infecciones (IACS)</span>
            {infectionPatients.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                {infectionPatients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reperfusion')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'reperfusion'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hemodinamia & Puerta-Balón</span>
            {reperfusionCases.length > 0 && (
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                {adherenceRate}%
              </span>
            )}
          </button>
        </div>

        {/* Subheader: Cohort Switcher & Sector Filters */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cohort Toggle */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-md text-xs font-medium">
              <button
                onClick={() => setCohortMode('active')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  cohortMode === 'active'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sala Activa ({patients.length})
              </button>
              <button
                onClick={() => setCohortMode('historical')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  cohortMode === 'historical'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>Base Histórica ({allHistoricalPatients.length})</span>
              </button>
            </div>

            {/* Sector filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setSectorFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  sectorFilter === 'all'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Todos ({baseCohort.length})
              </button>
              {config.sectors.map(s => {
                const countInSector = baseCohort.filter(p => p.sectorId === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSectorFilter(s.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      sectorFilter === s.id
                        ? 'bg-blue-700 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {s.shortName} ({countInSector})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {totalPatients} pacientes analizados
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">

          {/* TAB 1: FACTORES DE RIESGO CARDIOVASCULAR (FRCV) */}
          {activeTab === 'frcv' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-blue-700" />
                    <span>Prevalencia de Factores de Riesgo Cardiovascular (FRCV)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">% sobre pacientes de la cohorte</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {frcvMetrics.map(item => (
                    <div
                      key={item.key}
                      className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-slate-800">
                        <span>{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[11px] font-mono">
                            {item.count} / {totalPatients}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-mono font-semibold text-[11px] tabular-nums">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 rounded h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded transition-all duration-300 ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-700" />
                    <span>Cardiopatía Previa, Procedimientos y Dispositivos</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Eventos conocidos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {historyMetrics.map(item => (
                    <div
                      key={item.key}
                      className="p-3 rounded-md bg-white border border-slate-200 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-xs font-medium text-slate-800">
                          {item.label}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-900 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 shrink-0 tabular-nums">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{item.count} pac.</span>
                        <div className="w-20 bg-slate-100 rounded h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIEMPO DE PERMANENCIA (ESTANCIA) */}
          {activeTab === 'stay' && (
            <div className="space-y-5">
              {/* KPIs Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-blue-700 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{avgStayDays}</div>
                  <div className="text-xs font-semibold text-slate-800">Estancia Media</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Días promedio globales</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-emerald-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{shortStayCount}</div>
                  <div className="text-xs font-semibold text-slate-800">Corta Estancia (≤ 3d)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{totalPatients > 0 ? Math.round((shortStayCount / totalPatients) * 100) : 0}% de internados</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-amber-500 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{prolongedStayCount}</div>
                  <div className="text-xs font-semibold text-slate-800">Prolongada (8-14d)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Alerta de auditoría</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-rose-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{criticalStayCount}</div>
                  <div className="text-xs font-semibold text-slate-800">Crítica (&gt; 14d)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Riesgo nosocomial</div>
                </div>
              </div>

              {/* Sector Breakdown */}
              <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-2.5">
                <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>Estancia Media Comparativa por Sector Asistencial</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  {sectorStayAverages.map(item => (
                    <div key={item.sector.id} className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex flex-col justify-between">
                      <span className="font-medium text-slate-700 text-xs">{item.sector.name}</span>
                      <div className="mt-1 flex items-baseline justify-between font-mono">
                        <span className="text-base font-bold text-slate-900 tabular-nums">{item.avg} días</span>
                        <span className="text-[11px] text-slate-500">{item.count} camas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patients with Longest Stay */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                  <span>Pacientes con Mayor Tiempo de Permanencia (Ranking de Estancia)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Ordenado de mayor a menor</span>
                </h4>

                <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Paciente</th>
                        <th className="py-2 px-3">Cama / Sector</th>
                        <th className="py-2 px-3">Ingreso</th>
                        <th className="py-2 px-3">Diagnóstico</th>
                        <th className="py-2 px-3 text-right">Estadía</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedByStay.map(patient => {
                        const days = getDaysOfStay(patient.admissionDate);
                        const bed = config.beds.find(b => b.id === patient.bedId);
                        const sec = config.sectors.find(s => s.id === patient.sectorId);
                        return (
                          <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-900">{patient.fullName}</td>
                            <td className="py-2 px-3 text-slate-600">{bed?.name} ({sec?.shortName})</td>
                            <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{patient.admissionDate}</td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{patient.diagnosis}</td>
                            <td className="py-2 px-3 text-right">
                              <span className={`px-2 py-0.5 rounded font-mono font-medium text-xs border tabular-nums ${
                                days > 14
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : days > 7
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {days} días
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REINTERNACIONES & FRECUENCIA */}
          {activeTab === 'readmissions' && (
            <div className="space-y-5">
              {/* KPIs Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-rose-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{readmission30DaysRate}%</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Tasa de Reingreso &lt; 30 Días</div>
                  <div className="text-[10px] text-slate-500">{readmission30DaysPatients.length} pacientes con reingreso precoz</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-purple-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{hfReadmissionRate}%</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Reingresos en Insuficiencia Cardíaca</div>
                  <div className="text-[10px] text-slate-500">{hfReadmitted.length} de {hfPatients.length} pacientes con IC</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-blue-700 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{globalReadmissionRate}%</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Reinternación Anual Acumulada</div>
                  <div className="text-[10px] text-slate-500">{readmittedPatients.length} con ≥ 1 ingreso previo</div>
                </div>
              </div>

              {/* Clinical Explanatory Callout */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-slate-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold text-slate-900">Auditoría Pronóstica: Reinternaciones Frecuentes</p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    En patologías como la Insuficiencia Cardíaca y los Síndromes Coronarios Agudos, cada hospitalización sucesiva se asocia con un deterioro miocárdico progresivo y mayor morbimortalidad a 1 año. La identificación precoz permite priorizar la titulación completa de los 4 Pilares (GDMT) y el seguimiento ambulatorio estructurado.
                  </p>
                </div>
              </div>

              {/* Frequent Flyers Table */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                  <span>Pacientes con Múltiples Reinternaciones Registradas</span>
                  <span className="text-[11px] text-slate-500 font-normal">Casos de alta reincidencia</span>
                </h4>

                {frequentFlyers.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-md border border-slate-200">
                    No hay pacientes con reinternaciones frecuentes en el sector seleccionado.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {frequentFlyers.map(patient => (
                      <div key={patient.id} className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-slate-900 text-xs block">{patient.fullName}</span>
                            <span className="text-[11px] text-slate-500">{patient.diagnosis}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono font-semibold shrink-0 border border-slate-200">
                            {patient.readmissionCount || 1} previos
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
                          {patient.isReadmissionWithin30Days && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[10px]">
                              Reingreso &lt; 30 días
                            </span>
                          )}
                          <span className="text-slate-500 font-mono text-[10px]">
                            Ingreso: {patient.admissionDate}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INFECCIONES INTRAHOSPITALARIAS (IACS) */}
          {activeTab === 'infections' && (
            <div className="space-y-5">
              {/* KPIs Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-rose-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{infectionRate}%</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Tasa de IACS en Sala</div>
                  <div className="text-[10px] text-slate-500">{infectionPatients.length} casos confirmados en {totalPatients} pacientes</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-amber-500 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{postProcedureInfections.length}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Post-Procedimiento</div>
                  <div className="text-[10px] text-slate-500">Relacionadas a cirugía o cateterismo</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-blue-700 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                    {filteredPatients.filter(p => p.isIsolated).length}
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Aislamientos Epidemiológicos</div>
                  <div className="text-[10px] text-slate-500">Control de gérmenes multirresistentes</div>
                </div>
              </div>

              {/* Breakdown by Infection Site */}
              <div className="p-3.5 rounded-md bg-white border border-slate-200 space-y-2.5">
                <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                  <Biohazard className="w-4 h-4 text-rose-600" />
                  <span>Distribución por Foco Infeccioso Nosocomial</span>
                </h4>

                {Object.keys(infectionTypesCount).length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No se registran infecciones intrahospitalarias activas en este sector.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(infectionTypesCount).map(([typeKey, count]) => (
                      <div key={typeKey} className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                        <span className="font-medium text-slate-700 text-xs">
                          {infectionTypeLabels[typeKey] || typeKey}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-mono font-semibold text-xs border border-rose-200">
                          {count} {count === 1 ? 'caso' : 'casos'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Infection Cases List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-800">Listado de Pacientes con IACS en Seguimiento</h4>
                {infectionPatients.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-md border border-slate-200 text-xs">
                    Sin infecciones intrahospitalarias activas en el sector seleccionado.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {infectionPatients.map(patient => {
                      const bed = config.beds.find(b => b.id === patient.bedId);
                      return (
                        <div key={patient.id} className="p-3 rounded-md bg-white border border-slate-200 space-y-1.5">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-semibold text-slate-900 text-xs block">{patient.fullName}</span>
                              <span className="text-[11px] text-slate-500">Cama: {bed?.name}</span>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[10px]">
                              {patient.hospitalInfection?.germ || 'Germen no tipificado'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                            <strong>Foco:</strong> {infectionTypeLabels[patient.hospitalInfection?.type || ''] || patient.hospitalInfection?.type}
                            {patient.hospitalInfection?.postProcedure && ' • Posterior a procedimiento invasivo'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: HEMODINAMIA & PUERTA-BALÓN */}
          {activeTab === 'reperfusion' && (
            <div className="space-y-5">
              {/* KPIs Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-emerald-600 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{adherenceRate}%</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Adherencia Meta &lt; 90 min</div>
                  <div className="text-[10px] text-slate-500">{withinTargetCases.length} de {reperfusionCases.length} casos dentro del objetivo</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-blue-700 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{avgD2BTime} min</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Tiempo Puerta-Balón Promedio</div>
                  <div className="text-[10px] text-slate-500">Desde ingreso a guardia hasta balón</div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 border-l-4 border-l-slate-700 text-center">
                  <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">{reperfusionCases.length}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5">Casos Código Infarto</div>
                  <div className="text-[10px] text-slate-500">Angioplastia primaria auditada</div>
                </div>
              </div>

              {/* Door to Balloon Registry */}
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-slate-800 flex items-center justify-between">
                  <span>Registro de Cronología Puerta-Balón en Pacientes Coronarios</span>
                  <span className="text-[11px] text-slate-500 font-normal">Objetivo internacional: &lt; 90 min (AHA/ACC/SAC)</span>
                </h4>

                {reperfusionCases.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-md border border-slate-200 text-xs">
                    No se registran casos de reperfusión o angioplastia primaria en este sector actualmente.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2 px-3">Paciente</th>
                          <th className="py-2 px-3">Hora Puerta</th>
                          <th className="py-2 px-3">Hora ECG</th>
                          <th className="py-2 px-3">Hora Balón</th>
                          <th className="py-2 px-3 text-right">Tiempo D2B</th>
                          <th className="py-2 px-3 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {reperfusionCases.map(patient => {
                          const d2b = patient.doorToBalloon!;
                          return (
                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 font-semibold text-slate-900 font-sans">{patient.fullName}</td>
                              <td className="py-2 px-3 text-slate-600">{d2b.doorTime || '--:--'}</td>
                              <td className="py-2 px-3 text-slate-600">{d2b.ecgTime || '--:--'}</td>
                              <td className="py-2 px-3 text-slate-600">{d2b.balloonTime || '--:--'}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">{d2b.totalMinutes} min</td>
                              <td className="py-2 px-3 text-right font-sans">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                  (d2b.totalMinutes || 0) <= 90
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                  {(d2b.totalMinutes || 0) <= 90 ? 'Meta Lograda' : 'Excedido'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500">
            Métricas de auditoría médica alineadas con estándares SAC, FAC, ACC y AHA.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
