import React, { useState } from 'react';
import { useCardio } from '../context/CardioContext';
import { BedCard } from './BedCard';
import { GripHorizontal, CheckCircle2, XCircle, Biohazard } from 'lucide-react';

interface BedMatrixProps {
  onSelectPatient: (patientId: string) => void;
  onInitiateTransfer: (patientId: string) => void;
  onOpenNewPatientInBed: (bedId: string) => void;
  onScanEcg: (patientId: string) => void;
  onOpenSettings: () => void;
}

export const BedMatrix: React.FC<BedMatrixProps> = ({
  onSelectPatient,
  onInitiateTransfer,
  onOpenNewPatientInBed,
  onScanEcg,
  onOpenSettings,
}) => {
  const { 
    config, 
    patients, 
    activeSectorId, 
    getRoomGender, 
    getRoomIsolationStatus,
    isBedBlockedByIsolation,
    transferPatient, 
    canAssignPatientToRoom 
  } = useCardio();

  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null);
  const [dragOverBedId, setDragOverBedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const draggedPatient = draggedPatientId ? patients.find(p => p.id === draggedPatientId) : null;

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

  const filteredSectors = config.sectors.filter(
    s => activeSectorId === 'all' || s.id === activeSectorId
  );

  return (
    <div className="space-y-6 pb-16 relative">
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

      {filteredSectors.map(sector => {
        const sectorRooms = config.rooms.filter(r => r.sectorId === sector.id);
        const sectorBeds = config.beds.filter(b => b.sectorId === sector.id);
        const occupiedCount = sectorBeds.filter(b => b.status === 'ocupada').length;

        return (
          <section
            key={sector.id}
            className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            {/* Sector Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-7 rounded-xs ${
                    sector.type === 'critical'
                      ? 'bg-rose-600'
                      : sector.type === 'ward'
                      ? 'bg-blue-700'
                      : 'bg-amber-500'
                  }`}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {sector.name}
                    </h2>
                    <span className="font-mono text-[11px] sm:text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                      {occupiedCount}/{sectorBeds.length} Camas
                    </span>
                    <span className="hidden sm:flex text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200 items-center gap-1">
                      <GripHorizontal className="w-3 h-3 text-slate-500" /> Drag & Drop Habilitado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {sector.defaultGenderRestricted
                      ? 'Sector con restricción de género en habitaciones compartidas (Varones / Mujeres)'
                      : 'Boxes individuales o sector de cuidados críticos (sin restricción de cohorte)'}
                  </p>
                </div>
              </div>

              <div className="font-mono text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 tabular-nums">
                {sectorRooms.length} Salas / Boxes
              </div>
            </div>

            {/* Rooms and Beds Grid */}
            <div className="space-y-5">
              {sectorRooms.map(room => {
                const roomBeds = config.beds.filter(b => b.roomId === room.id);
                const roomGender = room.isGenderRestricted
                  ? getRoomGender(room.id)
                  : { gender: 'free' as const, label: 'Individual / Sin restricción' };
                const roomIsolation = getRoomIsolationStatus(room.id);

                return (
                  <div
                    key={room.id}
                    className="bg-slate-50/60 rounded-md p-3.5 border border-slate-200"
                  >
                    {/* Room Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-base sm:text-sm">
                          {room.name}
                        </span>
                        <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                          ({roomBeds.length} {roomBeds.length === 1 ? 'cama' : 'camas'})
                        </span>
                      </div>

                      {/* Room Isolation & Gender Badges */}
                      <div className="flex items-center gap-1.5">
                        {roomIsolation.isIsolated && (
                          <span className="px-2 py-0.2 rounded font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Biohazard className="w-3 h-3 text-amber-700" /> Sala Aislada
                          </span>
                        )}
                        {room.isGenderRestricted && (
                          <span
                            className={`font-mono text-[10px] font-medium px-2 py-0.2 rounded border flex items-center gap-1 ${
                              roomGender.gender === 'M'
                                ? 'bg-white text-slate-800 border-slate-300'
                                : roomGender.gender === 'F'
                                ? 'bg-white text-slate-800 border-slate-300'
                                : 'bg-white text-slate-500 border-slate-200'
                            }`}
                          >
                            {roomGender.gender === 'M' && 'Varones (M)'}
                            {roomGender.gender === 'F' && 'Mujeres (F)'}
                            {roomGender.gender === 'free' && 'Libre (Asigna primer paciente)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Beds Grid for this room */}
                    <div
                      className={`grid gap-3.5 ${
                        roomBeds.length === 1
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                          : roomBeds.length === 2
                          ? 'grid-cols-1 md:grid-cols-2'
                          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      }`}
                    >
                      {roomBeds.map(bed => {
                        let canDropHere = true;
                        if (draggedPatient && draggedPatient.bedId !== bed.id) {
                          const isolationBlock = isBedBlockedByIsolation(bed.id);
                          if (bed.status === 'ocupada' || isolationBlock.isBlocked) {
                            canDropHere = false;
                          } else {
                            const roomCheck = canAssignPatientToRoom(
                              draggedPatient.sex, 
                              room.id, 
                              draggedPatient.id, 
                              draggedPatient.isIsolated
                            );
                            if (!roomCheck.allowed) canDropHere = false;
                          }
                        }

                        return (
                          <BedCard
                            key={bed.id}
                            bed={bed}
                            room={room}
                            sector={sector}
                            onSelectPatient={onSelectPatient}
                            onInitiateTransfer={onInitiateTransfer}
                            onOpenNewPatientInBed={onOpenNewPatientInBed}
                            onScanEcg={onScanEcg}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            isDragTarget={dragOverBedId === bed.id}
                            isDraggingThis={draggedPatientId === bed.patientId}
                            canDropHere={canDropHere}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {sectorRooms.length === 0 && (
                <div className="text-center py-8 bg-white rounded-md border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500 mb-3">No hay habitaciones configuradas en este sector.</p>
                  <button
                    onClick={onOpenSettings}
                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white shadow-2xs"
                  >
                    Agregar Habitaciones
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
