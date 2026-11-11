import React, { useState } from 'react';
import type { 
  Patient, 
  ClinicalStatus, 
  PlannedTransfer, 
  IsolationType,
  HospitalInfectionRecord,
  HospitalInfectionType,
  DoorToBalloonRecord
} from '../types';
import { useCardio } from '../context/CardioContext';
import { ECGViewer } from './ECGViewer';
import { DiagnosisSelector } from './DiagnosisSelector';
import { MedicationSelector } from './MedicationSelector';
import { AntecedentSelector } from './AntecedentSelector';
import { 
  X, 
  Activity, 
  FileText, 
  FlaskConical, 
  CheckSquare, 
  Camera, 
  ArrowRightLeft, 
  UserCheck, 
  Trash2, 
  Plus, 
  Zap,
  Save,
  Pill,
  Sparkles,
  Biohazard,
  Heart,
  Clock,
  Timer,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Award,
  Calculator,
  Globe
} from 'lucide-react';
import type { ClinicalToolsTab } from './ClinicalToolsModal';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onScanEcg: (patientId: string) => void;
  onInitiateTransfer: (patientId: string) => void;
  onOpenClinicalTools?: (patientId: string, tab?: ClinicalToolsTab) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onScanEcg,
  onInitiateTransfer,
  onOpenClinicalTools,
}) => {
  const { updatePatient, dischargePatient, addTask, toggleTask, deleteTask, config } = useCardio();

  const [activeTab, setActiveTab] = useState<'clinical' | 'ecg' | 'labs' | 'tasks' | 'quality'>('clinical');
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis);
  const [diagnoses, setDiagnoses] = useState<string[]>(patient.diagnoses || [patient.diagnosis]);
  const [medications, setMedications] = useState<string[]>(patient.medications || patient.supportDevices || []);
  const [antecedentsList, setAntecedentsList] = useState<string[]>(patient.antecedentsList || []);
  const [antecedentsNotes, setAntecedentsNotes] = useState(patient.antecedents || '');
  const [evolutionNotes, setEvolutionNotes] = useState(patient.evolutionNotes);
  const [pendingConduct, setPendingConduct] = useState(patient.pendingConduct);
  const [clinicalStatus, setClinicalStatus] = useState<ClinicalStatus>(patient.clinicalStatus);
  const [plannedTransfer, setPlannedTransfer] = useState<PlannedTransfer>(patient.plannedTransfer || null);

  // Quality, LOS, Readmission, Infection & Door-to-Balloon states
  const [admissionDate, setAdmissionDate] = useState(patient.admissionDate);
  const [admissionTime, setAdmissionTime] = useState(patient.admissionTime || '08:00');
  const [readmissionCount, setReadmissionCount] = useState<number>(patient.readmissionCount || 0);
  const [isReadmissionWithin30Days, setIsReadmissionWithin30Days] = useState<boolean>(patient.isReadmissionWithin30Days || false);
  const [hospitalInfection, setHospitalInfection] = useState<HospitalInfectionRecord>(
    patient.hospitalInfection || { hasInfection: false }
  );
  const [doorToBalloon, setDoorToBalloon] = useState<DoorToBalloonRecord>(
    patient.doorToBalloon || { isApplicable: false }
  );

  // Dynamic Length of Stay Calculation
  const startDay = new Date(admissionDate);
  const today = new Date();
  const diffMs = Math.abs(today.getTime() - startDay.getTime());
  const currentStayDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Epidemiological Isolation state
  const [isIsolated, setIsIsolated] = useState<boolean>(patient.isIsolated || false);
  const [isolationType, setIsolationType] = useState<IsolationType>(patient.isolationType || 'contacto');
  const [isolationReason, setIsolationReason] = useState<string>(patient.isolationReason || '');

  // Task state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskUrgent, setNewTaskUrgent] = useState(false);

  // Lab states
  const [labs, setLabs] = useState(patient.keyLabs);

  const currentBed = config.beds.find(b => b.id === patient.bedId);
  const currentSector = config.sectors.find(s => s.id === patient.sectorId);

  const handleSaveClinical = () => {
    const summaryDiagnosis = diagnoses.length > 0 ? diagnoses.join(' • ') : diagnosis;
    const antecedentsSummary = antecedentsList.length > 0
      ? (antecedentsNotes.trim() ? `${antecedentsList.join(', ')}. ${antecedentsNotes.trim()}` : antecedentsList.join(', '))
      : (antecedentsNotes.trim() || 'Sin antecedentes registrados');

    updatePatient(patient.id, {
      diagnosis: summaryDiagnosis,
      diagnoses,
      medications,
      supportDevices: medications.filter(m => m.includes('EV') || m.includes('Noradrenalina') || m.includes('Goteo') || m.includes('BIC')),
      antecedents: antecedentsSummary,
      antecedentsList,
      evolutionNotes,
      pendingConduct,
      clinicalStatus,
      plannedTransfer,
      admissionDate,
      admissionTime,
      readmissionCount,
      isReadmissionWithin30Days,
      hospitalInfection,
      doorToBalloon,
      isIsolated,
      isolationType: isIsolated ? isolationType : undefined,
      isolationReason: isIsolated ? isolationReason : undefined,
      keyLabs: labs
    });
    setDiagnosis(summaryDiagnosis);
    setIsEditing(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addTask(patient.id, newTaskText.trim(), newTaskUrgent);
    setNewTaskText('');
    setNewTaskUrgent(false);
  };

  const handleDischarge = () => {
    if (confirm(`¿Dar el alta médica a ${patient.fullName} y liberar la cama ${currentBed?.name}?`)) {
      dischargePatient(patient.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/50 backdrop-blur-2xs">
      <div className="bg-white rounded-none sm:rounded-lg max-w-4xl w-full border-0 sm:border sm:border-slate-300 shadow-xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <span
              className={`w-2 h-8 rounded-xs shrink-0 ${
                clinicalStatus === 'critico'
                  ? 'bg-rose-600'
                  : clinicalStatus === 'vigilar'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {patient.fullName}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                  {patient.sex} • {patient.age}a
                </span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">DNI {patient.dni}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Ubicación: <strong className="text-slate-800 font-medium">{currentSector?.name}</strong> •{' '}
                <strong className="text-blue-700 font-mono">{currentBed?.name}</strong> • Ingreso:{' '}
                <span className="font-mono tabular-nums">{patient.admissionDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Status Selector */}
            <select
              value={clinicalStatus}
              onChange={e => {
                const s = e.target.value as ClinicalStatus;
                setClinicalStatus(s);
                updatePatient(patient.id, { clinicalStatus: s });
              }}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border outline-none ${
                clinicalStatus === 'critico'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : clinicalStatus === 'vigilar'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <option value="estable">Estable</option>
              <option value="vigilar">Vigilar</option>
              <option value="critico">Crítico</option>
            </select>

            {onOpenClinicalTools && (
              <>
                <button
                  onClick={() => onOpenClinicalTools(patient.id, 'calculators')}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Calcular scores clínicos (CHA2DS2-VASc, HAS-BLED, TIMI, Wells, GRACE...)"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Scores</span>
                </button>

                <button
                  onClick={() => onOpenClinicalTools(patient.id, 'openevidence')}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                  title="Buscar evidencia internacional con IA en OpenEvidence"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">OpenEvidence</span>
                </button>
              </>
            )}

            <button
              onClick={() => onInitiateTransfer(patient.id)}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Trasladar</span>
            </button>

            <button
              onClick={handleDischarge}
              title="Alta Médica"
              className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Alta</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Wrapped cleanly on mobile (zero horizontal scroll) */}
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-0 border-b border-slate-200 px-3 py-2 sm:px-5 sm:py-0 bg-slate-50/70 shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('clinical')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'clinical'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold shadow-2xs sm:shadow-none'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-500 sm:hover:text-slate-800 sm:hover:bg-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Pase Clínico & Fármacos</span>
          </button>

          <button
            onClick={() => setActiveTab('ecg')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ecg'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold shadow-2xs sm:shadow-none'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-500 sm:hover:text-slate-800 sm:hover:bg-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>Electros ({patient.ecgs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'labs'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold shadow-2xs sm:shadow-none'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-500 sm:hover:text-slate-800 sm:hover:bg-transparent'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 shrink-0" />
            <span>Laboratorios</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'tasks'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold shadow-2xs sm:shadow-none'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-500 sm:hover:text-slate-800 sm:hover:bg-transparent'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span>Pendientes ({patient.tasks.filter(t => !t.done).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'quality'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold shadow-2xs sm:shadow-none'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-500 sm:hover:text-slate-800 sm:hover:bg-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Estancia & Calidad</span>
            {(hospitalInfection.hasInfection || isReadmissionWithin30Days) && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1 min-h-0">
          {/* TAB 1: CLINICAL */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Resumen Clínico, Diagnósticos & Tratamiento Farmacológico
                </span>
                <button
                  onClick={() => {
                    if (isEditing) handleSaveClinical();
                    else setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Editar Ficha y Fármacos'}</span>
                </button>
              </div>

              {/* Multi-Select Diagnoses */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diagnósticos Activos de Internación:
                </label>
                {isEditing ? (
                  <DiagnosisSelector
                    selectedDiagnoses={diagnoses}
                    onChange={setDiagnoses}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-md border border-slate-200">
                    {diagnoses.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-Select Medications & Dosages */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Esquema Farmacológico Cardiológico:
                </label>
                {isEditing ? (
                  <MedicationSelector
                    selectedMedications={medications}
                    onChange={setMedications}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-md border border-slate-200">
                    {medications.map((m, i) => {
                      const [name, dose] = m.includes(' • ') ? m.split(' • ') : [m, null];
                      return (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white text-slate-800 font-medium border border-slate-200 shadow-2xs flex items-center gap-1.5 text-xs"
                        >
                          {m.includes('EV') || m.includes('Noradrenalina') || m.includes('BIC') ? (
                            <Zap className="w-3 h-3 text-amber-600 shrink-0" />
                          ) : (
                            <Pill className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          <span>{name}</span>
                          {dose && (
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200 tabular-nums">
                              {dose}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {medications.length === 0 && (
                      <span className="text-slate-400 text-xs">Sin fármacos asignados.</span>
                    )}
                  </div>
                )}
              </div>

              {/* Categorized Antecedents and Risk Factors */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-700" />
                  <span>Antecedentes Cardiovasculares y Factores de Riesgo:</span>
                </label>
                {isEditing ? (
                  <AntecedentSelector
                    selectedAntecedents={antecedentsList}
                    onChange={setAntecedentsList}
                    notes={antecedentsNotes}
                    onNotesChange={setAntecedentsNotes}
                  />
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-1.5">
                    <div className="flex flex-wrap gap-1.5">
                      {patient.antecedentsList && patient.antecedentsList.length > 0 ? (
                        patient.antecedentsList.map((ant, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-white text-slate-800 font-medium text-xs border border-slate-200 shadow-2xs"
                          >
                            {ant}
                          </span>
                        ))
                      ) : patient.antecedents ? (
                        <span className="text-xs font-medium text-slate-800">
                          {patient.antecedents}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Sin antecedentes registrados.</span>
                      )}
                    </div>
                    {patient.antecedentsList && patient.antecedentsList.length > 0 && patient.antecedents && !patient.antecedents.includes(patient.antecedentsList[0]) && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                        {patient.antecedents}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Evolution Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evolución últimas 24 hs (Dinámica clínica, balance, dolor):
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={evolutionNotes}
                    onChange={e => setEvolutionNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                    {patient.evolutionNotes}
                  </div>
                )}
              </div>

              {/* Pending Conduct & Plan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Conducta Acordada en el Pase / Plan del Día:
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={pendingConduct}
                    onChange={e => setPendingConduct(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  />
                ) : (
                  <div className="p-3 bg-blue-50/50 rounded-md border border-blue-200 text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {patient.pendingConduct}
                  </div>
                )}
              </div>

              {/* Planned Transfer status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Plan de Movimiento / Destino de Cama:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: null, label: 'Sin movimiento' },
                    { id: 'baja_piso', label: 'Baja a Piso' },
                    { id: 'pasa_uco', label: 'Pasa a UCO' },
                    { id: 'alta', label: 'Alta Médica' },
                    { id: 'hemodinamia', label: 'Hemodinamia' },
                  ].map(option => (
                    <button
                      key={String(option.id)}
                      type="button"
                      onClick={() => {
                        const val = option.id as PlannedTransfer;
                        setPlannedTransfer(val);
                        updatePatient(patient.id, { plannedTransfer: val });
                      }}
                      className={`p-2 rounded-md border font-medium text-xs text-center transition-all ${
                        plannedTransfer === option.id
                          ? 'bg-blue-700 text-white border-blue-700 shadow-2xs font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Epidemiological Isolation Section */}
              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      <Biohazard className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                        Aislamiento Epidemiológico
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        {isIsolated 
                          ? 'Paciente en aislamiento. En salas compartidas de internación (Piso), las demás camas se anulan automáticamente.' 
                          : 'El paciente no requiere aislamiento de cama.'}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isIsolated}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setIsIsolated(val);
                        updatePatient(patient.id, { 
                          isIsolated: val,
                          isolationType: val ? isolationType : undefined,
                          isolationReason: val ? isolationReason : undefined
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {isIsolated && (
                  <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Tipo de Aislamiento:
                      </label>
                      <select
                        value={isolationType}
                        onChange={(e) => {
                          const val = e.target.value as IsolationType;
                          setIsolationType(val);
                          updatePatient(patient.id, { isolationType: val });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-md border border-amber-300 bg-white text-slate-900 font-medium outline-none focus:border-amber-600"
                      >
                        <option value="contacto">Aislamiento de Contacto (KPC / SAMR / Clostridium)</option>
                        <option value="respiratorio">Aislamiento Respiratorio (TBC / Sarampión / COVID)</option>
                        <option value="gotitas">Aislamiento por Gotitas (Influenza / Meningococo)</option>
                        <option value="inverso">Aislamiento Protector / Inverso (Neutropenia severa)</option>
                        <option value="estricto">Aislamiento Estricto / Completo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Germen / Motivo Clínico:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: SAMR en hemocultivos, KPC urocultivo..."
                        value={isolationReason}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIsolationReason(val);
                          updatePatient(patient.id, { isolationReason: val });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-md border border-amber-300 bg-white text-slate-900 outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ECGS */}
          {activeTab === 'ecg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Historial de Trazos Electrocardiográficos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registro de electros en alta resolución y control comparativo
                  </p>
                </div>
                <button
                  onClick={() => onScanEcg(patient.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-2xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Adjuntar / Tomar Foto ECG</span>
                </button>
              </div>

              <ECGViewer ecgs={patient.ecgs} />
            </div>
          )}

          {/* TAB 3: LABS */}
          {activeTab === 'labs' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Parámetros y Biomarcadores Clave
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Valores analíticos y cinética de enzimas cardíacas
                  </p>
                </div>
                <button
                  onClick={() => {
                    updatePatient(patient.id, { keyLabs: labs });
                    alert('Laboratorios actualizados correctamente.');
                  }}
                  className="px-3 py-1.5 rounded-md bg-blue-700 text-white font-medium hover:bg-blue-800 shadow-2xs transition-colors"
                >
                  Guardar Laboratorios
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Troponinas (ng/L):
                  </span>
                  <input
                    type="text"
                    value={labs.troponinas || ''}
                    onChange={e => setLabs({ ...labs, troponinas: e.target.value })}
                    placeholder="Ej. 14.500 -> 8.200"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    BNP / NT-proBNP (pg/mL):
                  </span>
                  <input
                    type="text"
                    value={labs.bnp || ''}
                    onChange={e => setLabs({ ...labs, bnp: e.target.value })}
                    placeholder="Ej. 1.250 pg/mL"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Potasio - K+ (mEq/L):
                  </span>
                  <input
                    type="text"
                    value={labs.k || ''}
                    onChange={e => setLabs({ ...labs, k: e.target.value })}
                    placeholder="Ej. 4.2"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Sodio - Na+ (mEq/L):
                  </span>
                  <input
                    type="text"
                    value={labs.na || ''}
                    onChange={e => setLabs({ ...labs, na: e.target.value })}
                    placeholder="Ej. 138"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Creatinina (mg/dL):
                  </span>
                  <input
                    type="text"
                    value={labs.creatinina || ''}
                    onChange={e => setLabs({ ...labs, creatinina: e.target.value })}
                    placeholder="Ej. 1.10"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Hemoglobina (g/dL):
                  </span>
                  <input
                    type="text"
                    value={labs.hb || ''}
                    onChange={e => setLabs({ ...labs, hb: e.target.value })}
                    placeholder="Ej. 12.8"
                    className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-900 font-mono tabular-nums outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Otros datos de laboratorio (Gases arteriales, Lactato, Coagulograma):
                </span>
                <input
                  type="text"
                  value={labs.otros || ''}
                  onChange={e => setLabs({ ...labs, otros: e.target.value })}
                  placeholder="Lactato 1.4, KPTT 60s, RIN 2.2..."
                  className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
                />
              </div>
            </div>
          )}

          {/* TAB 4: TASKS / SCUTWORK */}
          {activeTab === 'tasks' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">
                  Pendientes de Recorrida e Indicaciones
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Cosas para hacer, estudios por pedir o cambios de fármacos anotados al pie de cama.
                </p>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  placeholder="Ej. Suspender heparina 18hs, pedir Eco doppler, controlar K+..."
                  className="flex-1 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
                />
                <label className="flex items-center gap-1.5 px-3 rounded-md border border-slate-300 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTaskUrgent}
                    onChange={e => setNewTaskUrgent(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-[11px] font-semibold text-rose-700">
                    Urgente
                  </span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </form>

              {/* Task List */}
              <div className="space-y-2">
                {patient.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-md border flex items-center justify-between gap-3 transition-colors ${
                      task.done
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : task.urgent
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(patient.id, task.id)}
                        className="w-4 h-4 text-blue-700 rounded cursor-pointer"
                      />
                      <span
                        className={`font-medium ${
                          task.done
                            ? 'line-through text-slate-400'
                            : task.urgent
                            ? 'font-semibold text-rose-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.dueTime && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {task.dueTime} hs
                        </span>
                      )}
                      <button
                        onClick={() => deleteTask(patient.id, task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {patient.tasks.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No hay tareas pendientes para este paciente.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GESTIÓN CLÍNICA, ESTANCIA & CALIDAD ASISTENCIAL */}
          {activeTab === 'quality' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-700" />
                    <span>Auditoría de Calidad Asistencial, Estancia & Infecciones</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Control de tiempos de permanencia, readmisiones, IACS y protocolo de reperfusión
                  </p>
                </div>
                <button
                  onClick={() => {
                    updatePatient(patient.id, {
                      admissionDate,
                      admissionTime,
                      readmissionCount,
                      isReadmissionWithin30Days,
                      hospitalInfection,
                      doorToBalloon
                    });
                    alert('Datos de gestión y calidad guardados correctamente.');
                  }}
                  className="px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-medium transition-colors flex items-center gap-1.5 text-xs shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Parámetros</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* CARD 1: TIEMPO DE PERMANENCIA (ESTANCIA) */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Clock className="w-4 h-4 text-blue-700" />
                      <span>Tiempo de Permanencia Hospitalaria</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border tabular-nums ${
                      currentStayDays > 7
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : currentStayDays >= 5
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      Día {currentStayDays} de internación
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Fecha de Ingreso:
                      </label>
                      <input
                        type="date"
                        value={admissionDate}
                        onChange={e => setAdmissionDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs outline-none focus:border-blue-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Hora de Ingreso:
                      </label>
                      <input
                        type="time"
                        value={admissionTime}
                        onChange={e => setAdmissionTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs outline-none focus:border-blue-700"
                      />
                    </div>
                  </div>

                  {/* Clinical Alert on Length of Stay */}
                  <div className={`p-2.5 rounded-md border text-[11px] flex items-start gap-2 ${
                    currentStayDays > 7
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : currentStayDays >= 5
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      {currentStayDays > 7 ? (
                        <span><strong>Estancia Prolongada (&gt; 7 días):</strong> Mayor riesgo de complicaciones nosocomiales, trombosis y desacondicionamiento. Se sugiere evaluar plan de desescalada o alta asistida.</span>
                      ) : currentStayDays >= 5 ? (
                        <span><strong>Estancia Intermedia (5-7 días):</strong> Planificar rotación a vía oral y criterios de transición de sector.</span>
                      ) : (
                        <span><strong>Estancia Aguda Habitual:</strong> Paciente cursando período de ventana agudo habitual de tratamiento.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 2: REINTERNACIONES & FRECUENCIA */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <RotateCcw className="w-4 h-4 text-blue-700" />
                      <span>Reinternaciones & Frecuencia Anual</span>
                    </span>
                    {isReadmissionWithin30Days && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-semibold">
                        Reingreso &lt; 30 días
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                      Internaciones cardiológicas previas en los últimos 12 meses:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReadmissionCount(num)}
                          className={`flex-1 py-1 rounded-md font-medium text-xs border transition-colors tabular-nums ${
                            readmissionCount === num
                              ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {num === 4 ? '4+' : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Readmission within 30 days toggle */}
                  <label className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isReadmissionWithin30Days}
                      onChange={e => setIsReadmissionWithin30Days(e.target.checked)}
                      className="w-4 h-4 text-blue-700 rounded focus:ring-blue-700"
                    />
                    <div className="text-[11px]">
                      <span className="font-semibold text-slate-800 block">
                        Reingreso precoz (menos de 30 días de la última alta)
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        Factor pronóstico determinante de morbimortalidad en Insuficiencia Cardíaca
                      </span>
                    </div>
                  </label>
                </div>

                {/* CARD 3: INFECCIONES ASOCIADAS AL CUIDADO DE LA SALUD (IACS) */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Biohazard className="w-4 h-4 text-rose-600" />
                      <span>Infecciones Intrahospitalarias (IACS)</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hospitalInfection.hasInfection}
                        onChange={e => setHospitalInfection(prev => ({ ...prev, hasInfection: e.target.checked }))}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                      />
                      <span className="text-xs font-semibold text-rose-700">
                        {hospitalInfection.hasInfection ? 'IACS Confirmada' : 'Sin infección'}
                      </span>
                    </label>
                  </div>

                  {hospitalInfection.hasInfection && (
                    <div className="space-y-2.5 pt-1 border-t border-slate-200">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Tipo de Infección Nosocomial:
                        </label>
                        <select
                          value={hospitalInfection.type || 'herida_quirurgica'}
                          onChange={e => setHospitalInfection(prev => ({ ...prev, type: e.target.value as HospitalInfectionType }))}
                          className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-medium outline-none focus:border-blue-700"
                        >
                          <option value="herida_quirurgica">Infección de Herida Quirúrgica (Esternotomía / CRM)</option>
                          <option value="sitio_marcapasos">Infección de Bolsillo de Marcapasos / CDI</option>
                          <option value="bacteriemia_cateter">Bacteriemia asociada a Catéter Venoso (BAC)</option>
                          <option value="puncion_vascular">Infección en Sitio de Punción Femoral o Radial</option>
                          <option value="neumonia_ventilador">Neumonía asociada a Ventilación Mecánica (NAV)</option>
                          <option value="infeccion_urinaria">Infección Urinaria por Sonda Vesical (ITU-SV)</option>
                          <option value="clostridium">Infección por Clostridioides difficile</option>
                          <option value="otra">Otra infección hospitalaria</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">
                            Germen Aislado:
                          </label>
                          <input
                            type="text"
                            value={hospitalInfection.germ || ''}
                            onChange={e => setHospitalInfection(prev => ({ ...prev, germ: e.target.value }))}
                            placeholder="Ej. SAMR, KPC (+), Pseudomonas..."
                            className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs outline-none focus:border-blue-700"
                          />
                        </div>
                        <div className="flex items-center pt-4">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hospitalInfection.postProcedure || false}
                              onChange={e => setHospitalInfection(prev => ({ ...prev, postProcedure: e.target.checked }))}
                              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                            />
                            <span className="text-[11px] font-medium text-slate-700">
                              Post-procedimiento invasivo
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 4: CÓDIGO INFARTO & TIEMPO PUERTA-BALÓN */}
                <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span>Código Infarto & Tiempo Puerta-Balón</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={doorToBalloon.isApplicable}
                        onChange={e => setDoorToBalloon(prev => ({ ...prev, isApplicable: e.target.checked }))}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-amber-700">
                        {doorToBalloon.isApplicable ? 'Protocolo Activo' : 'No Aplica'}
                      </span>
                    </label>
                  </div>

                  {doorToBalloon.isApplicable && (
                    <div className="space-y-2.5 pt-1 border-t border-slate-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Hora Dolor:
                          </label>
                          <input
                            type="time"
                            value={doorToBalloon.painOnsetTime || ''}
                            onChange={e => setDoorToBalloon(prev => ({ ...prev, painOnsetTime: e.target.value }))}
                            className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-blue-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Hora Puerta:
                          </label>
                          <input
                            type="time"
                            value={doorToBalloon.doorTime || ''}
                            onChange={e => {
                              const doorTime = e.target.value;
                              let totalMinutes = doorToBalloon.totalMinutes;
                              if (doorTime && doorToBalloon.balloonTime) {
                                const [dh, dm] = doorTime.split(':').map(Number);
                                const [bh, bm] = doorToBalloon.balloonTime.split(':').map(Number);
                                totalMinutes = (bh * 60 + bm) - (dh * 60 + dm);
                              }
                              setDoorToBalloon(prev => ({
                                ...prev,
                                doorTime,
                                totalMinutes,
                                isWithinTarget: totalMinutes ? totalMinutes <= 90 : true
                              }));
                            }}
                            className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-blue-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Hora ECG:
                          </label>
                          <input
                            type="time"
                            value={doorToBalloon.ecgTime || ''}
                            onChange={e => setDoorToBalloon(prev => ({ ...prev, ecgTime: e.target.value }))}
                            className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-blue-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Hora Balón:
                          </label>
                          <input
                            type="time"
                            value={doorToBalloon.balloonTime || ''}
                            onChange={e => {
                              const balloonTime = e.target.value;
                              let totalMinutes = doorToBalloon.totalMinutes;
                              if (doorToBalloon.doorTime && balloonTime) {
                                const [dh, dm] = doorToBalloon.doorTime.split(':').map(Number);
                                const [bh, bm] = balloonTime.split(':').map(Number);
                                totalMinutes = (bh * 60 + bm) - (dh * 60 + dm);
                              }
                              setDoorToBalloon(prev => ({
                                ...prev,
                                balloonTime,
                                totalMinutes,
                                isWithinTarget: totalMinutes ? totalMinutes <= 90 : true
                              }));
                            }}
                            className="w-full px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:border-blue-700 outline-none"
                          />
                        </div>
                      </div>

                      {/* Result Badge */}
                      {doorToBalloon.totalMinutes !== undefined && (
                        <div className={`p-2 rounded-md text-center font-medium text-xs border tabular-nums ${
                          doorToBalloon.totalMinutes <= 90
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          Tiempo Puerta-Balón: {doorToBalloon.totalMinutes} min • {doorToBalloon.totalMinutes <= 90 ? 'Meta Cumplida (<= 90 min)' : 'Tiempo Excedido (> 90 min)'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
