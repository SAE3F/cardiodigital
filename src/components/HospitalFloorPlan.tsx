import React, { useState } from 'react';
import { useCardio } from '../context/CardioContext';
import { 
  Activity, 
  Zap, 
  ArrowRightLeft, 
  Plus, 
  Radio, 
  GripHorizontal, 
  CheckCircle2, 
  XCircle,
  Siren,
  Microscope,
  Stethoscope,
  Biohazard,
  ShieldAlert,
  Ban
} from 'lucide-react';
import type { Bed, Room, Patient } from '../types';

interface HospitalFloorPlanProps {
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatientInBed: (bedId: string) => void;
  onInitiateTransfer: (patientId: string) => void;
  onScanEcg: (patientId: string) => void;
}

export const HospitalFloorPlan: React.FC<HospitalFloorPlanProps> = ({
  onSelectPatient,
  onOpenNewPatientInBed,
  onInitiateTransfer,
  onScanEcg,
}) => {
  const { 
    config, 
    patients, 
    getPatientByBedId, 
    getRoomGender, 
    getRoomIsolationStatus,
    isBedBlockedByIsolation,
    transferPatient, 
    canAssignPatientToRoom 
  } = useCardio();
  const [hoveredPatient, setHoveredPatient] = useState<Patient | null>(null);

  // Drag and drop states
  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null);
  const [dragOverBedId, setDragOverBedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const draggedPatient = draggedPatientId ? patients.find(p => p.id === draggedPatientId) : null;

  // Sectors & Rooms
  const guardiaRooms = config.rooms.filter(r => r.sectorId === 'guardia');
  const hemoRooms = config.rooms.filter(r => r.sectorId === 'hemodinamia');
  const ucoRooms = config.rooms.filter(r => r.sectorId === 'uco');
  const pisoRooms = config.rooms.filter(r => r.sectorId === 'piso');

  const guardiaBeds = config.beds.filter(b => b.sectorId === 'guardia');
  const hemoBeds = config.beds.filter(b => b.sectorId === 'hemodinamia');
  const ucoBeds = config.beds.filter(b => b.sectorId === 'uco');
  const pisoBeds = config.beds.filter(b => b.sectorId === 'piso');

  const handleDragStart = (e: React.DragEvent, patientId: string) => {
    e.dataTransfer.setData('text/plain', patientId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPatientId(patientId);
  };

  const handleDragEnd = () => {
    setDraggedPatientId(null);
    setDragOverBedId(null);
  };

  const handleDragOver = (e: React.DragEvent, bedId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverBedId !== bedId) {
      setDragOverBedId(bedId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, bedId: string) => {
    e.preventDefault();
    if (dragOverBedId === bedId) {
      setDragOverBedId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetBedId: string) => {
    e.preventDefault();
    const patientId = e.dataTransfer.getData('text/plain') || draggedPatientId;
    setDragOverBedId(null);
    setDraggedPatientId(null);

    if (!patientId) return;
    const patient = patients.find(p => p.id === patientId);
    if (!patient || patient.bedId === targetBedId) return;

    const targetBed = config.beds.find(b => b.id === targetBedId);
    if (!targetBed) return;

    const res = transferPatient(patientId, targetBedId);
    if (res.success) {
      showToast(`${patient.fullName.split(',')[0]} trasladado a ${targetBed.name} con éxito`, 'success');
    } else {
      showToast(res.error || 'No se puede trasladar a esta cama', 'error');
    }
  };

  const renderBedUnit = (bed: Bed, room: Room) => {
    const patient = getPatientByBedId(bed.id);
    const roomGender = room.isGenderRestricted ? getRoomGender(room.id) : { gender: 'free' as const, label: 'Libre' };
    const isolationBlock = isBedBlockedByIsolation(bed.id);

    const isDraggingThis = draggedPatientId === patient?.id;
    const isDragTarget = dragOverBedId === bed.id;

    // Check compatibility if someone is being dragged
    let canDropHere = true;

    if (draggedPatient && draggedPatient.bedId !== bed.id) {
      if (bed.status === 'ocupada' || isolationBlock.isBlocked) {
        canDropHere = false;
      } else {
        const roomCheck = canAssignPatientToRoom(
          draggedPatient.sex, 
          room.id, 
          draggedPatient.id, 
          draggedPatient.isIsolated
        );
        if (!roomCheck.allowed) {
          canDropHere = false;
        }
      }
    }

    if (!patient) {
      // Bed Blocked by Room Isolation
      if (isolationBlock.isBlocked) {
        return (
          <div
            key={bed.id}
            onClick={() => showToast(`Cama ${bed.name} anulada: la sala está en aislamiento exclusivo por ${isolationBlock.isolatedPatient?.fullName.split(',')[0]} (${isolationBlock.isolatedPatient?.isolationReason || 'Aislamiento epidemiológico'}).`, 'error')}
            onDragOver={(e) => { e.preventDefault(); if (dragOverBedId !== bed.id) setDragOverBedId(bed.id); }}
            onDragLeave={() => setDragOverBedId(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverBedId(null);
              showToast(`No se puede asignar: cama anulada por aislamiento en la habitación.`, 'error');
            }}
            className={`group relative flex flex-col items-center justify-center p-3 rounded-md border border-amber-300 border-l-4 border-l-amber-500 transition-all cursor-not-allowed min-h-[160px] bg-amber-50/40 ${
              isDragTarget ? 'ring-2 ring-rose-500' : ''
            }`}
          >
            <div className="p-1.5 rounded bg-amber-100 text-amber-800 mb-2 flex items-center justify-center border border-amber-200">
              <Biohazard className="w-4 h-4 text-amber-700" />
            </div>

            <span className="font-mono text-xs font-bold text-amber-950">
              {bed.name}
            </span>

            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded mt-1 border border-amber-200">
              Anulada x Aislamiento
            </span>

            <span className="text-[10px] text-amber-800 text-center mt-1.5 px-1 font-medium line-clamp-2">
              Bloqueada por {isolationBlock.isolatedPatient?.fullName.split(',')[0]}
            </span>
          </div>
        );
      }

      // Empty Bed (Roomy & Legible)
      return (
        <div
          key={bed.id}
          onClick={() => onOpenNewPatientInBed(bed.id)}
          onDragOver={(e) => handleDragOver(e, bed.id)}
          onDragLeave={(e) => handleDragLeave(e, bed.id)}
          onDrop={(e) => handleDrop(e, bed.id)}
          className={`group relative flex flex-col items-center justify-center p-3 rounded-md border transition-all cursor-pointer min-h-[160px] bg-white ${
            isDragTarget
              ? canDropHere
                ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                : 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
              : draggedPatientId
              ? canDropHere
                ? 'border-blue-400 border-dashed bg-blue-50/30'
                : 'border-slate-300 border-dashed opacity-40 cursor-not-allowed'
              : 'border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'
          }`}
        >
          {/* Bed icon / shape */}
          <div className="w-12 h-6 border border-slate-300 rounded bg-slate-100 mb-2 flex items-center justify-center relative overflow-hidden">
            <div className="w-3.5 h-2 bg-slate-300 rounded-xs absolute left-1 top-1" />
            <span className="text-[9px] font-mono font-semibold text-slate-500 tracking-wider">LIBRE</span>
          </div>

          <span className="font-mono text-xs font-bold text-slate-800">
            {bed.name}
          </span>

          {draggedPatientId ? (
            <span className={`text-[11px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
              canDropHere ? 'text-emerald-800 bg-emerald-100 border border-emerald-200' : 'text-rose-800 bg-rose-100 border border-rose-200'
            }`}>
              {canDropHere ? 'Soltar para mover' : 'Incompatible'}
            </span>
          ) : room.isGenderRestricted && roomGender.gender !== 'free' ? (
            <span className="font-mono text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {roomGender.gender === 'M' ? 'Varones (M)' : 'Mujeres (F)'}
            </span>
          ) : (
            <span className="text-[11px] text-blue-700 font-medium mt-1 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              + Internar
            </span>
          )}
        </div>
      );
    }

    // Occupied Bed - Clinical Enterprise Stripe
    const statusStyles = {
      critico: {
        borderL: 'border-l-4 border-l-rose-600',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-600',
      },
      vigilar: {
        borderL: 'border-l-4 border-l-amber-500',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      },
      estable: {
        borderL: 'border-l-4 border-l-emerald-600',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
      },
    }[patient.clinicalStatus];

    return (
      <div
        key={bed.id}
        draggable
        onDragStart={(e) => handleDragStart(e, patient.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectPatient(patient.id)}
        onMouseEnter={() => setHoveredPatient(patient)}
        onMouseLeave={() => setHoveredPatient(null)}
        className={`group relative flex flex-col justify-between p-3 rounded-md border border-slate-200 ${statusStyles.borderL} shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing bg-white min-h-[160px] ${
          isDraggingThis ? 'opacity-40 scale-95 border-dashed border-blue-400' : ''
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1.5">
              <GripHorizontal className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
              <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                {bed.name}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                {patient.sex} • {patient.age}a
              </span>
              <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
            </div>
          </div>

          {/* Patient Full Name */}
          <div className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-700">
            {patient.fullName}
          </div>

          {/* Epidemiological Isolation Badge */}
          {patient.isIsolated && (
            <div className="mt-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
              <Biohazard className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">
                AISLAMIENTO {patient.isolationType ? patient.isolationType.toUpperCase() : 'EPIDEMIOLÓGICO'}
              </span>
            </div>
          )}

          {/* Diagnosis */}
          <p 
            title={patient.diagnosis}
            className="mt-1 text-[11px] font-medium text-slate-600 line-clamp-3 leading-snug break-words"
          >
            {patient.diagnosis}
          </p>
        </div>

        {/* Bottom Bar: Support / Transfers / Days */}
        <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100 text-[10px]">
          {patient.plannedTransfer ? (
            <span className="text-blue-700 font-semibold flex items-center gap-1 truncate bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
              <ArrowRightLeft className="w-2.5 h-2.5 shrink-0" />
              {patient.plannedTransfer === 'baja_piso' && 'A Piso'}
              {patient.plannedTransfer === 'pasa_uco' && 'A UCO'}
              {patient.plannedTransfer === 'alta' && 'Alta'}
              {patient.plannedTransfer === 'hemodinamia' && 'Cateterismo'}
            </span>
          ) : patient.supportDevices.length > 0 ? (
            <span className="text-slate-700 font-medium flex items-center gap-1 truncate bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
              <Zap className="w-2.5 h-2.5 text-slate-500" />
              {patient.supportDevices[0].split('(')[0].trim()}
            </span>
          ) : (
            <span className="text-slate-400 font-mono">
              {patient.ecgs.length} ECG
            </span>
          )}

          <span className="font-mono text-slate-500 font-medium tabular-nums shrink-0">
            Día {Math.ceil(Math.abs(new Date().getTime() - new Date(patient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) || 1}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-20 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-md shadow-lg border flex items-center gap-2 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-800 text-white border-rose-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 shrink-0 text-rose-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Map Toolbar & Sector Filter */}
      <div className="bg-white p-3.5 sm:p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-700 text-white rounded-md shadow-2xs">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Plano Arquitectónico & Censo de Camas
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <GripHorizontal className="w-3 h-3 text-slate-500" /> Drag & Drop Habilitado
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Guardia ({guardiaBeds.length}) • Hemodinamia ({hemoBeds.length}) • UCO ({ucoBeds.length}) • Piso ({pisoBeds.length})
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Crítico</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Vigilar</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Estable</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200">
            <span className="w-2 h-2 rounded-xs border border-dashed border-slate-400 bg-slate-100" />
            <span>Libre</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILA DE INGRESO & TRÁNSITO: SHOCK ROOM (GUARDIA) & HEMODINAMIA  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* SHOCK ROOM (GUARDIA) */}
        <div className="md:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                <Siren className="w-3.5 h-3.5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Shock Room / Guardia de Emergencias ({guardiaBeds.length} Camas)
                </h3>
                <span className="text-[11px] text-slate-500 font-normal">
                  Ingreso agudo y estabilización inicial previa a UCO o Piso
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 tabular-nums">
              {guardiaBeds.filter(b => b.status === 'ocupada').length} / {guardiaBeds.length} Ocupadas
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guardiaBeds.map(bed => {
              const room = guardiaRooms.find(r => r.id === bed.roomId) || guardiaRooms[0];
              return renderBedUnit(bed, room);
            })}
          </div>
        </div>

        {/* RECUPERACIÓN HEMODINAMIA */}
        <div className="md:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-200 text-slate-800 border border-slate-300">
                <Microscope className="w-3.5 h-3.5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Recuperación Hemodinamia (2 Camas)
                </h3>
                <span className="text-[11px] text-slate-500 font-normal">
                  Post-cateterismo, angioplastia primaria y TAVI
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 tabular-nums">
              {hemoBeds.filter(b => b.status === 'ocupada').length} / 2 Camas
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hemoBeds.map(bed => {
              const room = hemoRooms.find(r => r.id === bed.roomId) || hemoRooms[0];
              return renderBedUnit(bed, room);
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CUERPO PRINCIPAL DEL PISO: UCO & PISO                           */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* ALA OESTE: UNIDAD CORONARIA - UCO */}
        <div className="xl:col-span-6 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {/* UCO Header Banner */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Unidad Coronaria (UCO)
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 tabular-nums">
              {ucoBeds.filter(b => b.status === 'ocupada').length} / {ucoBeds.length} Ocupadas
            </span>
          </div>

          <div className="p-4 space-y-3.5">
            {/* Central Monitoring Console Strip */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Activity className="w-3.5 h-3.5 text-blue-700" />
                <span>Monitoreo Central & Telemetría UCO ({ucoBeds.length} Canales Activos)</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Activo</span>
            </div>

            {/* UCO Bed Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ucoBeds.map(bed => {
                const room = ucoRooms.find(r => r.id === bed.roomId) || ucoRooms[0];
                return renderBedUnit(bed, room);
              })}
            </div>
          </div>
        </div>

        {/* ALA ESTE: INTERNACIÓN GENERAL (PISO) */}
        <div className="xl:col-span-6 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          {/* Piso Header Banner */}
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Internación Cardiología (Piso 3°)
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 tabular-nums">
              {pisoBeds.filter(b => b.status === 'ocupada').length} / 16 Camas
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Corridor Note */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
              <span>Cuidados Intermedios & Sala General</span>
              <span className="text-[11px] text-slate-600">
                4 Habitaciones de 4 Camas (Cohorte por sexo)
              </span>
            </div>

            {/* 4 Patient Rooms */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3.5">
              {pisoRooms.map(room => {
                const roomBeds = pisoBeds.filter(b => b.roomId === room.id);
                const roomGender = getRoomGender(room.id);
                const roomIsolation = getRoomIsolationStatus(room.id);
                const occupiedBeds = roomBeds.filter(b => b.status === 'ocupada').length;

                return (
                  <div
                    key={room.id}
                    className="bg-slate-50/60 rounded-md p-3 border border-slate-200 flex flex-col justify-between"
                  >
                    {/* Room Door Header */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>{room.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 font-normal tabular-nums">
                          ({occupiedBeds}/4)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Room Isolation Status Badge */}
                        {roomIsolation.isIsolated && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Biohazard className="w-3 h-3 text-amber-700" />
                            SALA AISLADA
                          </span>
                        )}

                        {/* Room Gender Cohort Badge */}
                        <span
                          className={`font-mono text-[10px] font-medium px-1.5 py-0.2 rounded border ${
                            roomGender.gender === 'M'
                              ? 'bg-white text-slate-800 border-slate-300'
                              : roomGender.gender === 'F'
                              ? 'bg-white text-slate-800 border-slate-300'
                              : 'bg-white text-slate-500 border-slate-200'
                          }`}
                        >
                          {roomGender.gender === 'M' && 'Varones (M)'}
                          {roomGender.gender === 'F' && 'Mujeres (F)'}
                          {roomGender.gender === 'free' && 'Libre'}
                        </span>
                      </div>
                    </div>

                    {/* 4 Beds inside this room */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {roomBeds.map(bed => renderBedUnit(bed, room))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Hover Card (Patient Quick Look) */}
      {hoveredPatient && !draggedPatientId && (
        <div className="fixed bottom-6 left-6 z-40 bg-slate-900 text-white p-3.5 rounded-lg shadow-xl border border-slate-700 max-w-sm pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-mono font-bold text-slate-200">
              Cama {hoveredPatient.bedId}
            </span>
            <span
              className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wider ${
                hoveredPatient.clinicalStatus === 'critico'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : hoveredPatient.clinicalStatus === 'vigilar'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {hoveredPatient.clinicalStatus}
            </span>
          </div>
          <div className="font-bold text-xs text-white">{hoveredPatient.fullName}</div>
          <div className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {hoveredPatient.diagnosis}
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800 tabular-nums">
            <span>Día {Math.ceil(Math.abs(new Date().getTime() - new Date(hoveredPatient.admissionDate).getTime()) / (1000 * 60 * 60 * 24)) || 1}</span>
            <span>{hoveredPatient.tasks.filter(t => !t.done).length} pendientes</span>
          </div>
        </div>
      )}
    </div>
  );
};
