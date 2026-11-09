import React, { useState, useEffect } from 'react';
import { useCardio } from '../context/CardioContext';
import { ECGViewer } from './ECGViewer';
import { 
  Tv, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Activity, 
  Zap, 
  ArrowRightLeft, 
  Save, 
  Check, 
  Pill,
  ShieldAlert,
  Biohazard,
  Heart
} from 'lucide-react';

interface PresentationModeProps {
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ onClose }) => {
  const { patients, config, updatePatient } = useCardio();

  const sortedPatients = [...patients].sort((a, b) => {
    const sectorOrder: Record<string, number> = { guardia: 1, uco: 2, hemodinamia: 3, piso: 4 };
    const orderA = a.sectorId ? (sectorOrder[a.sectorId] || 9) : 99;
    const orderB = b.sectorId ? (sectorOrder[b.sectorId] || 9) : 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.bedId || '').localeCompare(b.bedId || '');
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentPatient = sortedPatients[currentIndex];

  const [conductText, setConductText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentPatient) {
      setConductText(currentPatient.pendingConduct || '');
      setIsSaved(false);
    }
  }, [currentIndex, currentPatient]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIndex(prev => (prev < sortedPatients.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sortedPatients.length, onClose]);

  if (!currentPatient || sortedPatients.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
        <Tv className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-slate-800">No hay pacientes internados para el pase</h2>
        <p className="text-slate-500 text-sm mb-6">Ingresa pacientes en las camas para ver el pase proyectable.</p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 shadow-md transition-colors"
        >
          Volver al Tablero
        </button>
      </div>
    );
  }

  const currentBed = config.beds.find(b => b.id === currentPatient.bedId);
  const currentSector = config.sectors.find(s => s.id === currentPatient.sectorId);

  const handleSaveConduct = () => {
    updatePatient(currentPatient.id, { pendingConduct: conductText });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const patientDiagnoses = currentPatient.diagnoses && currentPatient.diagnoses.length > 0
    ? currentPatient.diagnoses
    : [currentPatient.diagnosis];

  const patientMedications = currentPatient.medications && currentPatient.medications.length > 0
    ? currentPatient.medications
    : currentPatient.supportDevices;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 text-slate-900 flex flex-col overflow-hidden select-none">
      {/* Top Projector Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
            <h1 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
              Pase de Guardia Médico
            </h1>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {currentSector?.name}
          </span>
          <span className="font-mono text-xs text-slate-500 font-medium tabular-nums">
            Paciente {currentIndex + 1} de {sortedPatients.length}
          </span>
        </div>

        {/* Quick patient jumper */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 overflow-x-auto max-w-xl">
            {sortedPatients.map((p, idx) => {
              const bed = config.beds.find(b => b.id === p.bedId);
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-2.5 py-1 text-xs rounded font-mono font-medium transition-all ${
                    idx === currentIndex
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {bed?.name || `P${idx + 1}`}
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            title="Salir de Modo Proyector (Esc)"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Presentation Body */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-5">
        {/* LEFT COLUMN: Medical Summary, Diagnoses, Medications & Conduct (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shadow-2xs">
          <div className="space-y-4">
            {/* Patient Header Box */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {currentBed?.name}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      currentPatient.clinicalStatus === 'critico'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : currentPatient.clinicalStatus === 'vigilar'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {currentPatient.clinicalStatus.toUpperCase()}
                  </span>
                  {/* Length of Stay Badge */}
                  {(() => {
                    const admission = new Date(currentPatient.admissionDate);
                    const today = new Date();
                    const diffDays = Math.max(1, Math.ceil(Math.abs(today.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24)));
                    return (
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border tabular-nums ${
                        diffDays > 7
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : diffDays >= 5
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        Día {diffDays} {diffDays > 7 ? '• Prolongada' : ''}
                      </span>
                    );
                  })()}
                </div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {currentPatient.fullName}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5 font-medium">
                  <span className="font-mono font-bold text-slate-700">
                    {currentPatient.sex === 'M' ? 'Varón (M)' : 'Mujer (F)'}
                  </span>
                  <span className="font-mono tabular-nums">• {currentPatient.age} años</span>
                  <span className="font-mono tabular-nums">• DNI {currentPatient.dni}</span>
                  {currentPatient.isReadmissionWithin30Days && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200">
                      REINGRESO &lt; 30D
                    </span>
                  )}
                  {currentPatient.hospitalInfection?.hasInfection && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      IACS: {currentPatient.hospitalInfection.germ || 'Nosocomial'}
                    </span>
                  )}
                  {currentPatient.doorToBalloon?.totalMinutes !== undefined && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 tabular-nums">
                      D2B: {currentPatient.doorToBalloon.totalMinutes}m ({currentPatient.doorToBalloon.totalMinutes <= 90 ? 'Meta cumplida' : 'Excedido'})
                    </span>
                  )}
                </div>

                {/* Epidemiological Isolation Banner */}
                {currentPatient.isIsolated && (
                  <div className="mt-2 flex items-center gap-2 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    <Biohazard className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      AISLAMIENTO {currentPatient.isolationType ? currentPatient.isolationType.toUpperCase() : 'EPIDEMIOLÓGICO'}
                      {currentPatient.isolationReason ? `: ${currentPatient.isolationReason}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Planned Transfer Badge */}
              {currentPatient.plannedTransfer && (
                <div className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium text-right shadow-2xs">
                  <div className="text-[10px] text-slate-400 uppercase">Pase Programado</div>
                  <div className="font-semibold text-blue-700">
                    {currentPatient.plannedTransfer === 'baja_piso' && 'Baja a Piso'}
                    {currentPatient.plannedTransfer === 'pasa_uco' && 'Pasa a UCO'}
                    {currentPatient.plannedTransfer === 'alta' && 'Alta Médica'}
                    {currentPatient.plannedTransfer === 'hemodinamia' && 'Hemodinamia'}
                  </div>
                </div>
              )}
            </div>

            {/* Antecedentes y Factores de Riesgo Cardiovascular (FRCV) */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-600 uppercase flex items-center gap-1.5 mb-1.5">
                <Heart className="w-3.5 h-3.5 text-slate-600" />
                <span>Antecedentes y FRCV</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPatient.antecedentsList && currentPatient.antecedentsList.length > 0 ? (
                  currentPatient.antecedentsList.map((ant, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      {ant}
                    </span>
                  ))
                ) : currentPatient.antecedents ? (
                  <span className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 font-medium">
                    {currentPatient.antecedents}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin antecedentes registrados</span>
                )}
              </div>
            </div>

            {/* Diagnósticos de Internación */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase block mb-1.5">
                Diagnósticos Activos ({patientDiagnoses.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {patientDiagnoses.map((diag, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 leading-snug"
                  >
                    {diag}
                  </span>
                ))}
              </div>
            </div>

            {/* Plan Farmacológico */}
            {patientMedications.length > 0 && (
              <div>
                <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase block mb-1.5">
                  Plan Farmacológico ({patientMedications.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patientMedications.map((med, i) => {
                    const [name, dose] = med.includes(' • ') ? med.split(' • ') : [med, null];
                    return (
                      <span
                        key={i}
                        className="text-xs font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-800 border border-slate-200 flex items-center gap-1.5"
                      >
                        {med.includes('EV') || med.includes('Noradrenalina') || med.includes('BIC') ? (
                          <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                        ) : (
                          <Pill className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <span>{name}</span>
                        {dose && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded border border-slate-200 font-semibold tabular-nums">
                            {dose}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evolution summary */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase block mb-1.5">
                Evolución de Guardia
              </span>
              <div className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-md border border-slate-200 whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                {currentPatient.evolutionNotes}
              </div>
            </div>

            {/* Key Labs Grid */}
            <div>
              <span className="text-[11px] font-bold tracking-wider text-slate-700 uppercase block mb-1.5">
                Laboratorios Clave
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                {currentPatient.keyLabs.troponinas && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-sans">Troponina:</span>
                    <span className="font-bold text-rose-700">{currentPatient.keyLabs.troponinas}</span>
                  </div>
                )}
                {currentPatient.keyLabs.bnp && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-sans">BNP:</span>
                    <span className="font-bold text-blue-700">{currentPatient.keyLabs.bnp}</span>
                  </div>
                )}
                {currentPatient.keyLabs.k && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-sans">K+:</span>
                    <span className="font-bold text-slate-800">{currentPatient.keyLabs.k}</span>
                  </div>
                )}
                {currentPatient.keyLabs.creatinina && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-500 block font-sans">Creatinina:</span>
                    <span className="font-bold text-slate-800">{currentPatient.keyLabs.creatinina}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conducta del día editable */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-700" /> Conducta del Pase
              </span>
              <button
                onClick={handleSaveConduct}
                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-2xs"
              >
                <Save className="w-3 h-3" />
                <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={conductText}
              onChange={e => setConductText(e.target.value)}
              placeholder="Anotar conducta definida en el pase médico..."
              className="w-full text-xs p-2.5 rounded-md bg-white border border-slate-300 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 text-slate-900 outline-none leading-relaxed transition-colors"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Big High-Res ECG Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Electrocardiograma del Día & Registro Gráfico
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {currentPatient.ecgs.length} trazos registrados
            </span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <ECGViewer ecgs={currentPatient.ecgs} />
          </div>
        </div>
      </main>

      {/* Bottom Keyboard Navigation Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs shrink-0 shadow-2xs">
        <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[11px] font-medium">
          <span>
            Navegar: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">→</kbd> o{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">Espacio</kbd>
          </span>
          <span>
            Salir: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">Esc</kbd>
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-medium transition-colors border border-slate-200 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="font-mono text-slate-700 font-semibold tabular-nums">
            {currentIndex + 1} / {sortedPatients.length}
          </span>

          <button
            onClick={() => setCurrentIndex(prev => (prev < sortedPatients.length - 1 ? prev + 1 : prev))}
            disabled={currentIndex === sortedPatients.length - 1}
            className="flex items-center gap-1 px-4 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-medium shadow-xs transition-colors"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
