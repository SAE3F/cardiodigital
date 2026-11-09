import React, { useState, useMemo } from 'react';
import { useCardio } from '../context/CardioContext';
import type { Gender, ClinicalStatus, IsolationType } from '../types';
import { UserPlus, X, Check, ShieldAlert, AlertTriangle, Biohazard, RotateCcw } from 'lucide-react';
import { generateEcgSvgDataUrl } from '../mock/ecgSvgs';
import { DiagnosisSelector } from './DiagnosisSelector';
import { MedicationSelector } from './MedicationSelector';
import { AntecedentSelector } from './AntecedentSelector';

interface NewPatientModalProps {
  initialBedId?: string;
  onClose: () => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ initialBedId, onClose }) => {
  const { 
    config, 
    addPatient, 
    canAssignPatientToRoom, 
    isBedBlockedByIsolation,
    findHistoricalPatientsByDni 
  } = useCardio();

  // All inputs initialized completely blank as requested by user
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<Gender>('M');
  const [selectedBedId, setSelectedBedId] = useState<string>(() => {
    if (initialBedId) return initialBedId;
    const firstFree = config.beds.find(b => b.status === 'libre' && !isBedBlockedByIsolation(b.id).isBlocked);
    return firstFree ? firstFree.id : '';
  });

  // Historical records detection
  const previousAdmissions = useMemo(() => {
    const clean = (dni || '').replace(/\D/g, '');
    if (clean.length < 6) return [];
    return findHistoricalPatientsByDni(dni);
  }, [dni, findHistoricalPatientsByDni]);

  const latestAdmission = previousAdmissions[0];
  const isReadmission30DaysDetected = useMemo(() => {
    if (!latestAdmission?.dischargeDate) return false;
    const discharge = new Date(latestAdmission.dischargeDate);
    const now = new Date();
    const diffDays = Math.abs(now.getTime() - discharge.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }, [latestAdmission]);

  const handleCopyFromHistory = () => {
    if (!latestAdmission) return;
    if (!fullName) setFullName(latestAdmission.fullName);
    if (!age) setAge(String(latestAdmission.age));
    setSex(latestAdmission.sex);
    if (latestAdmission.antecedentsList && latestAdmission.antecedentsList.length > 0) {
      setSelectedAntecedents(latestAdmission.antecedentsList);
    }
  };

  // Epidemiological Isolation state
  const [isIsolated, setIsIsolated] = useState(false);
  const [isolationType, setIsolationType] = useState<IsolationType>('contacto');
  const [isolationReason, setIsolationReason] = useState('');
  
  // Multi-select diagnoses, medications & antecedents
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedAntecedents, setSelectedAntecedents] = useState<string[]>([]);
  const [antecedentsNotes, setAntecedentsNotes] = useState('');

  const [clinicalStatus, setClinicalStatus] = useState<ClinicalStatus>('estable');
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [pendingConduct, setPendingConduct] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check room & isolation compatibility for the selected bed
  const selectedBed = config.beds.find(b => b.id === selectedBedId);
  const selectedRoom = selectedBed ? config.rooms.find(r => r.id === selectedBed.roomId) : null;
  const isBedBlocked = selectedBedId ? isBedBlockedByIsolation(selectedBedId) : { isBlocked: false };
  const roomValidation = selectedRoom ? canAssignPatientToRoom(sex, selectedRoom.id, undefined, isIsolated) : { allowed: true };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Ingresá el nombre completo del paciente');
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0) {
      setErrorMsg('Ingresá una edad válida');
      return;
    }
    if (!selectedBedId) {
      setErrorMsg('Seleccioná una cama para internar al paciente');
      return;
    }
    if (isBedBlocked.isBlocked) {
      setErrorMsg(`Cama anulada: la sala está en aislamiento exclusivo por ${isBedBlocked.isolatedPatient?.fullName.split(',')[0]}`);
      return;
    }
    if (!roomValidation.allowed) {
      setErrorMsg(roomValidation.reason || 'Conflicto de género o aislamiento en la habitación seleccionada');
      return;
    }
    if (selectedDiagnoses.length === 0) {
      setErrorMsg('Seleccioná al menos un diagnóstico de internación');
      return;
    }

    const bed = config.beds.find(b => b.id === selectedBedId)!;
    const room = config.rooms.find(r => r.id === bed.roomId)!;
    const primaryDiagnosis = selectedDiagnoses.join(' • ');

    const antecedentsSummary = selectedAntecedents.length > 0
      ? (antecedentsNotes.trim() ? `${selectedAntecedents.join(', ')}. ${antecedentsNotes.trim()}` : selectedAntecedents.join(', '))
      : (antecedentsNotes.trim() || 'Sin antecedentes registrados');

    addPatient({
      fullName: fullName.trim(),
      dni: dni.trim() || 'S/DNI',
      age: Number(age),
      sex,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      readmissionCount: previousAdmissions.length,
      isReadmissionWithin30Days: isReadmission30DaysDetected,
      bedId: selectedBedId,
      sectorId: room.sectorId,
      roomId: room.id,
      diagnosis: primaryDiagnosis,
      diagnoses: selectedDiagnoses,
      antecedents: antecedentsSummary,
      antecedentsList: selectedAntecedents,
      clinicalStatus,
      isIsolated,
      isolationType: isIsolated ? isolationType : undefined,
      isolationReason: isIsolated ? isolationReason.trim() : undefined,
      supportDevices: selectedMedications.filter(m => m.includes('EV') || m.includes('Goteo') || m.includes('BIC')),
      medications: selectedMedications,
      keyLabs: {},
      evolutionNotes: evolutionNotes.trim() || 'Paciente ingresado a la unidad.',
      pendingConduct: pendingConduct.trim() || 'Completar evaluación cardiológica y laboratorios de rutina.',
      tasks: [
        { id: `t-${Date.now()}-1`, text: 'ECG de ingreso completo de 12 derivaciones', done: true, createdAt: '08:00' },
        { id: `t-${Date.now()}-2`, text: 'Laboratorio de ingreso completo con ionograma y enzimas', done: false, urgent: true, createdAt: '08:00' }
      ],
      ecgs: [
        {
          id: `ecg-ingreso-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: '08:00',
          title: 'ECG de Ingreso',
          type: 'ingreso',
          imageUrl: generateEcgSvgDataUrl('normal'),
          notes: 'Trazado basal registrado al ingreso del paciente.'
        }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full border border-slate-300 shadow-xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Ingresar Nuevo Paciente
              </h2>
              <p className="text-[11px] text-slate-500">
                Admisión hospitalaria, diagnósticos CIE/SAC y asignación de unidad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Row 1: Name, DNI, Age, Sex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nombre y Apellido *:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ej. Gómez, Alberto Ricardo"
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                DNI / Historia Clínica:
              </label>
              <input
                type="text"
                value={dni}
                onChange={e => setDni(e.target.value)}
                placeholder="Ej. 18.234.567"
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 font-mono"
              />
            </div>

            {/* Historical Patient Record Detected Alert Banner */}
            {previousAdmissions.length > 0 && (
              <div className="col-span-1 sm:col-span-2 p-3 rounded-md bg-blue-50 border border-blue-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="font-semibold text-blue-900">
                      Paciente Registrado en Base Histórica ({previousAdmissions.length} internación{previousAdmissions.length > 1 ? 'es previas' : ' previa'})
                    </span>
                    {latestAdmission?.dischargeDate && (
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Último egreso: {latestAdmission.dischargeDate} {latestAdmission.dischargeReason ? `(${latestAdmission.dischargeReason})` : ''}
                        {isReadmission30DaysDetected && (
                          <span className="ml-1.5 font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                            Reingreso Precoz (&lt; 30 días)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFromHistory}
                  className="px-2.5 py-1 rounded-md bg-blue-700 text-white font-medium text-xs hover:bg-blue-800 transition-colors shrink-0"
                >
                  Cargar Datos & FRCV
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Edad *:
              </label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Ej. 68"
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Género / Cohorte:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSex('M')}
                  className={`py-1.5 rounded-md border font-medium text-xs transition-colors ${
                    sex === 'M'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Masculino (M)
                </button>
                <button
                  type="button"
                  onClick={() => setSex('F')}
                  className={`py-1.5 rounded-md border font-medium text-xs transition-colors ${
                    sex === 'F'
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Femenino (F)
                </button>
              </div>
            </div>
          </div>

          {/* Bed selection with gender checking */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Cama para Internación:
            </label>
            <select
              value={selectedBedId}
              onChange={e => setSelectedBedId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 font-medium"
            >
              <option value="">-- Seleccionar cama libre --</option>
              {config.beds
                .filter(b => b.status === 'libre')
                .map(b => {
                  const r = config.rooms.find(room => room.id === b.roomId);
                  const s = config.sectors.find(sec => sec.id === b.sectorId);
                  const blocked = isBedBlockedByIsolation(b.id);
                  return (
                    <option key={b.id} value={b.id} disabled={blocked.isBlocked}>
                      [{s?.shortName}] {b.name} ({r?.name}) {blocked.isBlocked ? '[ANULADA POR AISLAMIENTO]' : ''}
                    </option>
                  );
                })}
            </select>

            {/* Validation alert */}
            {(!roomValidation.allowed || isBedBlocked.isBlocked) && (
              <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                  {isBedBlocked.isBlocked
                    ? `Cama anulada: la sala está en aislamiento exclusivo por ${isBedBlocked.isolatedPatient?.fullName.split(',')[0]}`
                    : roomValidation.reason}
                </span>
              </div>
            )}
          </div>

          {/* Epidemiological Isolation Toggle */}
          <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Biohazard className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">
                    Aislamiento Epidemiológico
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {isIsolated 
                      ? 'En sala compartida (Piso), las camas restantes se anularán automáticamente.' 
                      : 'Paciente sin precauciones especiales de aislamiento.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isIsolated}
                  onChange={(e) => setIsIsolated(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {isIsolated && (
              <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tipo de Aislamiento:
                  </label>
                  <select
                    value={isolationType}
                    onChange={(e) => setIsolationType(e.target.value as IsolationType)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-medium outline-none focus:border-blue-700"
                  >
                    <option value="contacto">Aislamiento de Contacto (KPC / SAMR / Clostridium)</option>
                    <option value="respiratorio">Aislamiento Respiratorio (TBC / Sarampión / COVID)</option>
                    <option value="gotitas">Aislamiento por Gotitas (Influenza / Meningococo)</option>
                    <option value="inverso">Aislamiento Protector / Inverso (Neutropenia severa)</option>
                    <option value="estricto">Aislamiento Estricto / Completo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Germen / Motivo Clínico:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. SAMR en hemocultivos, KPC urocultivo..."
                    value={isolationReason}
                    onChange={(e) => setIsolationReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Categorized Multi-Select Diagnoses */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Diagnósticos de Internación:
            </label>
            <DiagnosisSelector
              selectedDiagnoses={selectedDiagnoses}
              onChange={setSelectedDiagnoses}
            />
          </div>

          {/* Categorized Multi-Select Medications */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Plan Farmacológico Cardiológico:
            </label>
            <MedicationSelector
              selectedMedications={selectedMedications}
              onChange={setSelectedMedications}
            />
          </div>

          {/* Standardized Categorized Antecedents & Risk Factors */}
          <div>
            <AntecedentSelector
              selectedAntecedents={selectedAntecedents}
              onChange={setSelectedAntecedents}
              notes={antecedentsNotes}
              onNotesChange={setAntecedentsNotes}
            />
          </div>

          {/* Initial Evolution & Pending Conduct (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Evolución / Motivo de Ingreso:
              </label>
              <textarea
                rows={2}
                value={evolutionNotes}
                onChange={e => setEvolutionNotes(e.target.value)}
                placeholder="Evolución clínica inicial del paciente..."
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Conducta y Pendientes Iniciales:
              </label>
              <textarea
                rows={2}
                value={pendingConduct}
                onChange={e => setPendingConduct(e.target.value)}
                placeholder="Plan de acción, estudios urgentes o conductas..."
                className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 text-xs"
              />
            </div>
          </div>

          {/* Clinical Status */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Gravedad Clínica Inicial:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setClinicalStatus('estable')}
                className={`py-1.5 rounded-md border font-medium text-xs transition-colors ${
                  clinicalStatus === 'estable'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Estable
              </button>
              <button
                type="button"
                onClick={() => setClinicalStatus('vigilar')}
                className={`py-1.5 rounded-md border font-medium text-xs transition-colors ${
                  clinicalStatus === 'vigilar'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Vigilar
              </button>
              <button
                type="button"
                onClick={() => setClinicalStatus('critico')}
                className={`py-1.5 rounded-md border font-medium text-xs transition-colors ${
                  clinicalStatus === 'critico'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Crítico
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!roomValidation.allowed || isBedBlocked.isBlocked || !selectedBedId || selectedDiagnoses.length === 0}
              className="px-5 py-1.5 rounded-md text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Registrar Paciente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
