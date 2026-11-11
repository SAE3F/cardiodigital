import React from 'react';
import type { Bed, Room, Sector } from '../types';
import { useCardio } from '../context/CardioContext';
import { 
  Activity, 
  ArrowRightLeft, 
  CheckSquare, 
  PlusCircle, 
  Zap,
  GripHorizontal,
  Biohazard
} from 'lucide-react';

interface BedCardProps {
  bed: Bed;
  room: Room;
  sector: Sector;
  onSelectPatient: (patientId: string) => void;
  onInitiateTransfer: (patientId: string) => void;
  onOpenNewPatientInBed: (bedId: string) => void;
  onScanEcg: (patientId: string) => void;
  onDragStart?: (e: React.DragEvent, patientId: string) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, bedId: string) => void;
  onDragLeave?: (e: React.DragEvent, bedId: string) => void;
  onDrop?: (e: React.DragEvent, bedId: string) => void;
  isDragTarget?: boolean;
  isDraggingThis?: boolean;
  canDropHere?: boolean;
}

export const BedCard: React.FC<BedCardProps> = ({
  bed,
  room,
  sector,
  onSelectPatient,
  onInitiateTransfer,
  onOpenNewPatientInBed,
  onScanEcg,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragTarget,
  isDraggingThis,
  canDropHere = true,
}) => {
  const { getPatientByBedId, getRoomGender, isBedBlockedByIsolation } = useCardio();
  const patient = getPatientByBedId(bed.id);
  const isolationBlock = isBedBlockedByIsolation(bed.id);

  // Determine room gender constraint if empty
  const roomGender = room.isGenderRestricted ? getRoomGender(room.id) : { gender: 'free', label: 'Mixta / Libre' };

  if (!patient) {
    if (isolationBlock.isBlocked) {
      return (
        <div
          className={`border border-amber-300 border-l-4 border-l-amber-500 rounded-lg p-3 sm:p-3.5 flex flex-col justify-between min-h-[140px] sm:min-h-[190px] transition-all bg-amber-50/50 ${
            isDragTarget ? 'ring-2 ring-rose-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
              {bed.name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
              <Biohazard className="w-3 h-3 text-amber-700" /> Cama Anulada
            </span>
          </div>

          <div className="my-auto text-center py-2">
            <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 border border-amber-200">
              <Biohazard className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-xs font-bold text-amber-950">
              Aislamiento Exclusivo
            </div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Habitación bloqueada por {isolationBlock.isolatedPatient?.fullName.split(',')[0]}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-right font-medium">
            {sector.shortName} • {room.name}
          </div>
        </div>
      );
    }

    return (
      <div
        onDragOver={(e) => onDragOver?.(e, bed.id)}
        onDragLeave={(e) => onDragLeave?.(e, bed.id)}
        onDrop={(e) => onDrop?.(e, bed.id)}
        className={`group border rounded-lg p-3 sm:p-3.5 flex flex-col justify-between min-h-[135px] sm:min-h-[190px] transition-all bg-white ${
          isDragTarget
            ? canDropHere
              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
              : 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
            : 'border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {bed.name}
          </span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Libre
          </span>
        </div>

        <div className="my-auto text-center py-2">
          {room.isGenderRestricted && roomGender.gender !== 'free' ? (
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mb-2 font-medium">
              <span>Habilitada:</span>
              <span className="font-bold text-slate-900">
                {roomGender.gender === 'M' ? 'Varones (M)' : 'Mujeres (F)'}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mb-2">Disponible para asignación</div>
          )}

          <button
            onClick={() => onOpenNewPatientInBed(bed.id)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition-all shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ingresar Paciente</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 text-right">
          {sector.shortName} • {room.name}
        </div>
      </div>
    );
  }

  // Calculate days of stay
  const admission = new Date(patient.admissionDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - admission.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Status styling - Clinical Enterprise (Left border stripe + subtle pill)
  const statusStyles = {
    critico: {
      borderL: 'border-l-4 border-l-rose-600',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Crítico'
    },
    vigilar: {
      borderL: 'border-l-4 border-l-amber-500',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Vigilar'
    },
    estable: {
      borderL: 'border-l-4 border-l-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Estable'
    }
  }[patient.clinicalStatus];

  const pendingTasks = patient.tasks.filter(t => !t.done);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, patient.id)}
      onDragEnd={onDragEnd}
      className={`relative bg-white rounded-lg p-3 sm:p-3.5 shadow-2xs hover:shadow-xs border border-slate-200 ${statusStyles.borderL} flex flex-col justify-between min-h-0 sm:min-h-[220px] transition-all cursor-grab active:cursor-grabbing group ${
        isDraggingThis ? 'opacity-40 scale-95 border-dashed border-blue-400' : ''
      }`}
    >
      {/* Top Header: Bed name, Sex badge, Clinical Status */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <GripHorizontal className="hidden sm:block w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100" />
            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
              {bed.name}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {patient.sex} • {patient.age}a
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusStyles.badge}`}>
              {statusStyles.label}
            </span>
          </div>
        </div>

        {/* Patient Name & Days */}
        <div className="cursor-pointer" onClick={() => onSelectPatient(patient.id)}>
          <div className="flex items-baseline justify-between gap-1">
            <h3 className="font-bold text-base sm:text-sm text-slate-900 hover:text-blue-700 transition-colors line-clamp-1">
              {patient.fullName}
            </h3>
            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 tabular-nums ${
              diffDays > 7
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : diffDays >= 5
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-600 bg-slate-100 border border-slate-200'
            }`}>
              Día {diffDays} {diffDays > 7 ? '• Prolongada' : ''}
            </span>
          </div>

          {/* Quick Quality & Risk Indicators (Reingreso, IACS, D2B) */}
          <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px] tabular-nums">
            {patient.isReadmissionWithin30Days && (
              <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                REINGRESO &lt;30D
              </span>
            )}
            {patient.hospitalInfection?.hasInfection && (
              <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                IACS: {patient.hospitalInfection.germ || 'Nosocomial'}
              </span>
            )}
            {patient.doorToBalloon?.totalMinutes !== undefined && (
              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                D2B: {patient.doorToBalloon.totalMinutes}m
              </span>
            )}
          </div>

          {/* Epidemiological Isolation Badge */}
          {patient.isIsolated && (
            <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
              <Biohazard className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">
                AISLAMIENTO {patient.isolationType ? patient.isolationType.toUpperCase() : 'EPIDEMIOLÓGICO'}
                {patient.isolationReason ? ` (${patient.isolationReason.split('(')[0].trim()})` : ''}
              </span>
            </div>
          )}

          {/* Diagnosis */}
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {patient.diagnosis}
          </p>
        </div>

        {/* Device Badges (Vasoactivos, Marcapasos, Balón, etc.) */}
        {patient.supportDevices.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {patient.supportDevices.slice(0, 2).map((dev, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200"
              >
                <Zap className="w-2.5 h-2.5 text-slate-500" />
                {dev.split('(')[0]}
              </span>
            ))}
            {patient.supportDevices.length > 2 && (
              <span className="text-[10px] text-slate-400 self-center font-mono">
                +{patient.supportDevices.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Planned Transfer Pill */}
        {patient.plannedTransfer && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-slate-50 text-slate-800 border border-slate-200">
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="truncate">
              {patient.plannedTransfer === 'baja_piso' && 'Pase a Piso programado'}
              {patient.plannedTransfer === 'pasa_uco' && 'Pase a UCO indicado'}
              {patient.plannedTransfer === 'alta' && 'Alta médica programada'}
              {patient.plannedTransfer === 'hemodinamia' && 'Traslado a Hemodinamia'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Indicators & Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Pending Tasks badge */}
          <button
            onClick={() => onSelectPatient(patient.id)}
            title="Tareas de recorrida pendientes"
            className={`flex items-center gap-1 text-[11px] font-mono tabular-nums font-medium px-1.5 py-0.5 rounded border ${
              pendingTasks.length > 0
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-slate-400 border-transparent'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>{pendingTasks.length}</span>
          </button>

          {/* ECG count / direct scan */}
          <button
            onClick={() => onScanEcg(patient.id)}
            title="Ver o tomar foto del Electro"
            className="flex items-center gap-1 text-[11px] font-mono tabular-nums font-medium px-1.5 py-0.5 rounded text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200"
          >
            <Activity className="w-3 h-3 text-rose-600" />
            <span>{patient.ecgs.length} ECG</span>
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onInitiateTransfer(patient.id)}
            title="Trasladar o cambiar de cama"
            className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectPatient(patient.id)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-medium text-[11px] transition-colors shadow-2xs"
          >
            Ver Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
