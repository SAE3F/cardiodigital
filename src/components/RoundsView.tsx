import React, { useState } from 'react';
import { useCardio } from '../context/CardioContext';
import { 
  Camera, 
  CheckSquare, 
  Plus, 
  ChevronRight, 
  AlertTriangle, 
  Zap, 
  User, 
  Clock,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { Patient } from '../types';

interface RoundsViewProps {
  onSelectPatient: (patientId: string) => void;
  onScanEcg: (patientId: string) => void;
  onInitiateTransfer: (patientId: string) => void;
}

export const RoundsView: React.FC<RoundsViewProps> = ({
  onSelectPatient,
  onScanEcg,
  onInitiateTransfer
}) => {
  const { config, patients, activeSectorId, setActiveSectorId, addTask, toggleTask } = useCardio();
  const [quickTaskPatientId, setQuickTaskPatientId] = useState<string | null>(null);
  const [quickTaskText, setQuickTaskText] = useState('');

  const activeSector = config.sectors.find(s => s.id === activeSectorId);

  const filteredPatients = patients
    .filter(p => activeSectorId === 'all' || p.sectorId === activeSectorId)
    .sort((a, b) => {
      const idxA = config.beds.findIndex(bed => bed.id === a.bedId);
      const idxB = config.beds.findIndex(bed => bed.id === b.bedId);
      return (idxA === -1 ? 9999 : idxA) - (idxB === -1 ? 9999 : idxB);
    });

  const handleAddQuickTask = (patientId: string) => {
    if (!quickTaskText.trim()) return;
    addTask(patientId, quickTaskText.trim(), false);
    setQuickTaskText('');
    setQuickTaskPatientId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3.5 sm:space-y-4 pb-20 px-1 sm:px-0">
      {/* Top Header Banner */}
      <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto sm:flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Modo Recorrida Médica</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {activeSector ? activeSector.name : 'Todas las salas'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control de pendientes, registro rápido a pie de cama y fotos de ECG
            </p>
          </div>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md tabular-nums shrink-0">
            {filteredPatients.length} {filteredPatients.length === 1 ? 'Paciente' : 'Pacientes'}
          </span>
        </div>
      </div>

      {/* Empty State if active sector has 0 patients */}
      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center space-y-2.5 shadow-2xs">
          <p className="text-sm font-semibold text-slate-800">
            No hay pacientes internados en {activeSector ? activeSector.name : 'este sector'}
          </p>
          <p className="text-xs text-slate-500">
            Seleccioná otra sala arriba o volvé a ver todos los sectores.
          </p>
          {activeSectorId !== 'all' && (
            <button
              onClick={() => setActiveSectorId('all')}
              className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition-colors"
            >
              Ver todas las salas ({patients.length})
            </button>
          )}
        </div>
      )}

      {/* Patient Cards in Order of Beds */}
      <div className="space-y-3.5 sm:space-y-4">
        {filteredPatients.map(patient => {
          const bed = config.beds.find(b => b.id === patient.bedId);
          const room = config.rooms.find(r => r.id === patient.roomId);
          const sector = config.sectors.find(s => s.id === patient.sectorId);
          const pendingTasks = patient.tasks.filter(t => !t.done);

          return (
            <div
              key={patient.id}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all"
            >
              {/* Card Header: Bed, Sector, Gender, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                    {bed?.name}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {sector?.shortName} • {room?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                    {patient.sex} • {patient.age}a
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      patient.clinicalStatus === 'critico'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : patient.clinicalStatus === 'vigilar'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {patient.clinicalStatus}
                  </span>
                </div>
              </div>

              {/* Patient Basic Info */}
              <div className="py-2.5 cursor-pointer" onClick={() => onSelectPatient(patient.id)}>
                <h3 className="font-bold text-sm text-slate-900 hover:text-blue-700 transition-colors">
                  {patient.fullName}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {patient.diagnosis}
                </p>

                {/* Transfer pill if any */}
                {patient.plannedTransfer && (
                  <div className="mt-2 text-xs font-medium text-slate-800 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                    <span>
                      {patient.plannedTransfer === 'baja_piso' && 'Pase a Piso programado'}
                      {patient.plannedTransfer === 'pasa_uco' && 'Pase a UCO indicado'}
                      {patient.plannedTransfer === 'alta' && 'Alta médica programada'}
                      {patient.plannedTransfer === 'hemodinamia' && 'Traslado a Hemodinamia'}
                    </span>
                  </div>
                )}
              </div>

              {/* Tasks Checklist */}
              <div className="bg-slate-50/70 p-3 rounded-md border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                    Pendientes ({pendingTasks.length})
                  </span>
                  <button
                    onClick={() => setQuickTaskPatientId(quickTaskPatientId === patient.id ? null : patient.id)}
                    className="text-blue-700 font-medium hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <Plus className="w-3 h-3" /> Anotar pendiente
                  </button>
                </div>

                {/* Quick Task Input form */}
                {quickTaskPatientId === patient.id && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      autoFocus
                      value={quickTaskText}
                      onChange={e => setQuickTaskText(e.target.value)}
                      placeholder="Ej. Duplicar diuréticos, pedir eco..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddQuickTask(patient.id);
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 outline-none focus:ring-1 focus:ring-blue-700"
                    />
                    <button
                      onClick={() => handleAddQuickTask(patient.id)}
                      className="px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-2xs"
                    >
                      Guardar
                    </button>
                  </div>
                )}

                {/* Tasks List */}
                <div className="space-y-1.5 pt-1">
                  {patient.tasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(patient.id, task.id)}
                      className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-100 transition-colors text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        readOnly
                        className="w-3.5 h-3.5 text-blue-700 rounded border-slate-300"
                      />
                      <span
                        className={`font-medium ${
                          task.done
                            ? 'line-through text-slate-400'
                            : task.urgent
                            ? 'font-bold text-rose-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                  {patient.tasks.length === 0 && (
                    <div className="text-[11px] text-slate-400 py-0.5">Sin tareas anotadas</div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 text-xs font-medium">
                <button
                  onClick={() => onScanEcg(patient.id)}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Foto ECG</span>
                </button>

                <button
                  onClick={() => onInitiateTransfer(patient.id)}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-2xs"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Trasladar</span>
                </button>

                <button
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
                >
                  <span>Ficha</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
