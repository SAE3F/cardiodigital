import React, { useState } from 'react';
import { useCardio } from '../context/CardioContext';
import { Settings, X, Plus, Key, Check, Building2, BedDouble } from 'lucide-react';

interface HospitalSettingsModalProps {
  onClose: () => void;
}

export const HospitalSettingsModal: React.FC<HospitalSettingsModalProps> = ({ onClose }) => {
  const { config, updateHospitalConfig, addRoom, pin, setSecurityPin } = useCardio();

  const [hospitalName, setHospitalName] = useState(config.hospitalName);
  const [serviceName, setServiceName] = useState(config.serviceName);

  // New Room Form
  const [newRoomSectorId, setNewRoomSectorId] = useState(config.sectors[0]?.id || 'piso');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [newRoomGenderRestricted, setNewRoomGenderRestricted] = useState(true);

  // Security PIN
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);

  const handleSaveHospitalDetails = () => {
    updateHospitalConfig({
      ...config,
      hospitalName,
      serviceName
    });
    alert('Datos del hospital actualizados.');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    addRoom(newRoomSectorId, newRoomName.trim(), Number(newRoomCapacity), newRoomGenderRestricted);
    setNewRoomName('');
    alert(`Habitación agregada con ${newRoomCapacity} camas.`);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('El PIN debe tener al menos 4 dígitos');
      return;
    }
    setSecurityPin(newPin);
    setPinSuccessMsg(true);
    setTimeout(() => setPinSuccessMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-300 shadow-xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-slate-200 text-slate-700">
              <Settings className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Configuración del Hospital & Camas
              </h2>
              <p className="text-xs text-slate-500">
                Personalizá sectores, salas y seguridad para tu residencia
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Section 1: Institution Details */}
          <div className="bg-slate-50/60 p-4 rounded-md border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-700 stroke-[1.75]" />
              Institución y Servicio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Hospital / Sanatorio:
                </label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Servicio:
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                />
              </div>
            </div>

            <button
              onClick={handleSaveHospitalDetails}
              className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium transition-colors shadow-xs"
            >
              Guardar Nombres
            </button>
          </div>

          {/* Section 2: Add New Room and Beds */}
          <div className="bg-slate-50/60 p-4 rounded-md border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BedDouble className="w-4 h-4 text-blue-700 stroke-[1.75]" />
              Agregar Habitación / Camas a un Sector
            </h3>

            <form onSubmit={handleAddRoom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sector:
                  </label>
                  <select
                    value={newRoomSectorId}
                    onChange={e => setNewRoomSectorId(e.target.value)}
                    className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                  >
                    {config.sectors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre de la Habitación / Box:
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={e => setNewRoomName(e.target.value)}
                    placeholder="Ej. Habitación 205 o Box 7"
                    className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cantidad de Camas:
                  </label>
                  <select
                    value={newRoomCapacity}
                    onChange={e => setNewRoomCapacity(Number(e.target.value))}
                    className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                  >
                    <option value={1}>1 Cama (Individual / Box)</option>
                    <option value={2}>2 Camas (Doble)</option>
                    <option value={3}>3 Camas (Triple)</option>
                    <option value={4}>4 Camas (Cuádruple)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newRoomGenderRestricted}
                    onChange={e => setNewRoomGenderRestricted(e.target.checked)}
                    className="rounded text-blue-700"
                  />
                  <span>
                    Exigir restricción de género (no mezclar varones y mujeres en esta habitación)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2]" />
                <span>Crear Habitación y Camas</span>
              </button>
            </form>
          </div>

          {/* Section 3: Security & PIN Code */}
          <div className="bg-slate-50/60 p-4 rounded-md border border-slate-200 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600 stroke-[1.75]" />
              Seguridad: PIN de Desbloqueo Rápido
            </h3>
            <p className="text-slate-500">
              PIN numérico para bloquear la pantalla en la sala de médicos o computadoras compartidas del hospital.
            </p>

            <form onSubmit={handleUpdatePin} className="flex items-center gap-3 max-w-sm">
              <input
                type="text"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="Nuevo PIN (ej. 4567)"
                className="p-2 rounded-md border border-slate-300 bg-white text-slate-800 font-mono tabular-nums text-center tracking-widest text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors shadow-xs shrink-0"
              >
                Actualizar PIN
              </button>
            </form>
            {pinSuccessMsg && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4 stroke-[2]" /> ¡PIN actualizado con éxito!
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};