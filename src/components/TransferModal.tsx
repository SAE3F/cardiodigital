import React, { useState } from 'react';
import { Patient } from '../types';
import { useCardio } from '../context/CardioContext';
import { ArrowRightLeft, X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';

interface TransferModalProps {
  patient: Patient;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ patient, onClose }) => {
  const { config, transferPatient, canAssignPatientToRoom } = useCardio();

  const [selectedTargetBedId, setSelectedTargetBedId] = useState<string>('');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(() => {
    // Suggest the other sector (e.g. if patient is in UCO, suggest Piso)
    return patient.sectorId === 'uco' ? 'piso' : 'uco';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentBed = config.beds.find(b => b.id === patient.bedId);
  const currentSector = config.sectors.find(s => s.id === patient.sectorId);

  // Available free beds in chosen target sector
  const availableBeds = config.beds.filter(
    b => b.sectorId === selectedSectorId && (b.status === 'libre' || b.id === patient.bedId)
  );

  const handleExecuteTransfer = () => {
    if (!selectedTargetBedId) {
      setErrorMessage('Selecciona una cama de destino');
      return;
    }

    const res = transferPatient(patient.id, selectedTargetBedId);
    if (!res.success) {
      setErrorMessage(res.error || 'Error al trasladar paciente');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-lg w-full border border-slate-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <ArrowRightLeft className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Gestionar Traslado / Cambio de Cama
              </h2>
              <p className="text-xs text-slate-500">
                Logística de camas con validación de asignación y género
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Patient Card summary */}
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold text-xs text-slate-900">
                {patient.fullName}
              </div>
              <div className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className={`font-medium ${patient.sex === 'M' ? 'text-blue-700' : 'text-rose-700'}`}>
                  {patient.sex === 'M' ? 'Masculino (M)' : 'Femenino (F)'}
                </span>
                <span>• {patient.age} años</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Ubicación actual:</span>
              <span className="font-medium text-slate-800">
                {currentSector?.shortName} • {currentBed?.name}
              </span>
            </div>
          </div>

          {/* Sector selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Sector Destino:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {config.sectors.map(sector => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => {
                    setSelectedSectorId(sector.id);
                    setSelectedTargetBedId('');
                    setErrorMessage(null);
                  }}
                  className={`p-2 rounded-md border text-xs font-medium transition-all ${
                    selectedSectorId === sector.id
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {sector.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bed selection with gender checking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Camas Disponibles en el Sector:
            </label>

            {availableBeds.length === 0 ? (
              <div className="p-3 text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
                No hay camas libres en este sector.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {availableBeds.map(bed => {
                  const room = config.rooms.find(r => r.id === bed.roomId);
                  const isCurrent = bed.id === patient.bedId;
                  const genderCheck = room
                    ? canAssignPatientToRoom(patient.sex, room.id, patient.id)
                    : { allowed: true };

                  const isAllowed = genderCheck.allowed;

                  return (
                    <div
                      key={bed.id}
                      onClick={() => {
                        if (isAllowed) {
                          setSelectedTargetBedId(bed.id);
                          setErrorMessage(null);
                        }
                      }}
                      className={`p-2.5 rounded-md border flex items-center justify-between text-xs transition-all ${
                        !isAllowed
                          ? 'opacity-60 bg-rose-50/50 border-rose-200 cursor-not-allowed'
                          : selectedTargetBedId === bed.id
                          ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${
                            selectedTargetBedId === bed.id
                              ? 'border-blue-700 bg-blue-700 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedTargetBedId === bed.id && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {bed.name} {isCurrent && '(Cama actual)'}
                          </div>
                          <div className="text-[11px] text-slate-500">{room?.name}</div>
                        </div>
                      </div>

                      {/* Status / Gender check label */}
                      <div>
                        {!isAllowed ? (
                          <span className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-sm flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 stroke-[1.75]" />
                            Conflicto: Habitación {genderCheck.roomGender === 'M' ? 'Varones' : 'Mujeres'}
                          </span>
                        ) : room?.isGenderRestricted ? (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            Compatible
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            Box Individual / Crítico
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 stroke-[1.75]" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExecuteTransfer}
            disabled={!selectedTargetBedId || selectedTargetBedId === patient.bedId}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2]" />
            <span>Confirmar Traslado</span>
          </button>
        </div>
      </div>
    </div>
  );
};