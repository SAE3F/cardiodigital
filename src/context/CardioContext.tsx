import React, { createContext, useContext, useState, useEffect } from 'react';
import type { HospitalConfig, Patient, PatientTask, ECGRecord, Gender, Bed, Room, IsolationType } from '../types';
import { initialHospitalConfig, initialPatients, initialDischargedPatients } from '../mock/initialData';
import { savePatientToDB, saveMultiplePatientsToDB } from '../services/clinicalDatabase';

export type ActiveViewType = 'floor' | 'map' | 'rounds' | 'presentation';

interface CardioContextType {
  config: HospitalConfig;
  patients: Patient[];
  isLocked: boolean;
  pin: string;
  selectedPatientId: string | null;
  activeSectorId: string | 'all';
  activeView: ActiveViewType;
  
  // Navigation & selection
  setSelectedPatientId: (id: string | null) => void;
  setActiveSectorId: (sectorId: string | 'all') => void;
  setActiveView: (view: ActiveViewType) => void;
  setIsLocked: (locked: boolean) => void;
  verifyPin: (inputPin: string) => boolean;
  setSecurityPin: (newPin: string) => void;

  // Patient Actions & Historical Database
  dischargedPatients: Patient[];
  getAllHistoricalPatients: () => Patient[];
  findHistoricalPatientsByDni: (dni: string) => Patient[];
  importHistoricalPatients: (importedPatients: Patient[]) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByBedId: (bedId: string) => Patient | undefined;
  addPatient: (patientData: Omit<Patient, 'id'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  dischargePatient: (id: string, reason?: 'alta_medica' | 'traslado_externo' | 'obito' | 'alta_voluntaria') => void;

  // Bed, Room & Isolation Validation
  getRoomGender: (roomId: string, excludePatientId?: string) => { gender: Gender | 'free'; label: string };
  getRoomIsolationStatus: (roomId: string, excludePatientId?: string) => { 
    isIsolated: boolean; 
    isolatedPatient?: Patient; 
    isolationType?: IsolationType; 
    reason?: string 
  };
  isBedBlockedByIsolation: (bedId: string) => { 
    isBlocked: boolean; 
    isolatedPatient?: Patient; 
    room?: Room 
  };
  canAssignPatientToRoom: (
    patientSex: Gender,
    roomId: string,
    excludePatientId?: string,
    patientIsIsolated?: boolean
  ) => { allowed: boolean; reason?: string; roomGender?: Gender | 'free' };
  transferPatient: (patientId: string, targetBedId: string) => { success: boolean; error?: string };

  // Tasks & Scutwork
  addTask: (patientId: string, text: string, urgent?: boolean, dueTime?: string) => void;
  toggleTask: (patientId: string, taskId: string) => void;
  deleteTask: (patientId: string, taskId: string) => void;

  // ECG Management
  addEcg: (patientId: string, ecg: Omit<ECGRecord, 'id'>) => void;
  deleteEcg: (patientId: string, ecgId: string) => void;

  // Hospital Configuration
  updateHospitalConfig: (newConfig: HospitalConfig) => void;
  addRoom: (sectorId: string, name: string, capacity: number, isGenderRestricted: boolean) => void;
  resetToDemoData: () => void;

  // Stats
  getSectorStats: (sectorId: string) => {
    totalBeds: number;
    occupiedBeds: number;
    blockedByIsolationBeds: number;
    freeBeds: number;
    maleOccupiedBeds: number;
    femaleOccupiedBeds: number;
    freeMaleBeds: number;
    freeFemaleBeds: number;
    criticalCount: number;
    transfersPendingCount: number;
  };
}

const CardioContext = createContext<CardioContextType | null>(null);

// v8 storage key with categorized FRCV & antecedentsList + drug dosages
const STORAGE_KEY_CONFIG = 'cardioguardia_config_v8';
const STORAGE_KEY_PATIENTS = 'cardioguardia_patients_v8';
const STORAGE_KEY_DISCHARGED = 'cardioguardia_discharged_v8';
const STORAGE_KEY_PIN = 'cardioguardia_pin_v8';

export const CardioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<HospitalConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : initialHospitalConfig;
    } catch {
      return initialHospitalConfig;
    }
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
      return saved ? JSON.parse(saved) : initialPatients;
    } catch {
      return initialPatients;
    }
  });

  const [dischargedPatients, setDischargedPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISCHARGED);
      return saved ? JSON.parse(saved) : initialDischargedPatients;
    } catch {
      return initialDischargedPatients;
    }
  });

  const [pin, setPin] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_PIN) || '1234';
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeSectorId, setActiveSectorId] = useState<string | 'all'>('all');
  const [activeView, setActiveView] = useState<ActiveViewType>('map'); // Default to Bed Matrix (Grilla)!

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DISCHARGED, JSON.stringify(dischargedPatients));
  }, [dischargedPatients]);

  // Sync to IndexedDB permanent clinical database
  useEffect(() => {
    const map = new Map<string, Patient>();
    dischargedPatients.forEach(p => map.set(p.id, p));
    patients.forEach(p => map.set(p.id, p));
    saveMultiplePatientsToDB(Array.from(map.values())).catch(console.error);
  }, [patients, dischargedPatients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PIN, pin);
  }, [pin]);

  const verifyPin = (inputPin: string) => {
    return inputPin === pin;
  };

  const setSecurityPin = (newPin: string) => {
    setPin(newPin);
  };

  const getAllHistoricalPatients = (): Patient[] => {
    const map = new Map<string, Patient>();
    dischargedPatients.forEach(p => map.set(p.id, p));
    patients.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  };

  const findHistoricalPatientsByDni = (dni: string): Patient[] => {
    const clean = (dni || '').replace(/\D/g, '');
    if (!clean) return [];
    return getAllHistoricalPatients().filter(p => (p.dni || '').replace(/\D/g, '') === clean);
  };

  const importHistoricalPatients = (imported: Patient[]) => {
    if (!Array.isArray(imported) || imported.length === 0) return;
    const newDischarged: Patient[] = [...dischargedPatients];

    imported.forEach(p => {
      const isActive = patients.some(act => act.id === p.id);
      if (!isActive) {
        const existingIdx = newDischarged.findIndex(d => d.id === p.id);
        if (existingIdx >= 0) {
          newDischarged[existingIdx] = p;
        } else {
          newDischarged.push(p);
        }
      }
    });

    setDischargedPatients(newDischarged);
    saveMultiplePatientsToDB(imported).catch(console.error);
  };

  const getPatientById = (id: string) => patients.find(p => p.id === id);

  const getPatientByBedId = (bedId: string) => patients.find(p => p.bedId === bedId);

  const getRoomGender = (roomId: string, excludePatientId?: string): { gender: Gender | 'free'; label: string } => {
    const roomBeds = config.beds.filter(b => b.roomId === roomId);
    const roomPatients = patients.filter(
      p => roomBeds.some(b => b.id === p.bedId) && p.id !== excludePatientId
    );

    if (roomPatients.length === 0) {
      return { gender: 'free', label: 'Libre / Disponible' };
    }

    const firstSex = roomPatients[0].sex;
    return {
      gender: firstSex,
      label: firstSex === 'M' ? 'Hombres (M)' : 'Mujeres (F)'
    };
  };

  const getRoomIsolationStatus = (
    roomId: string,
    excludePatientId?: string
  ): { isIsolated: boolean; isolatedPatient?: Patient; isolationType?: IsolationType; reason?: string } => {
    const roomBeds = config.beds.filter(b => b.roomId === roomId);
    const isolatedPatient = patients.find(
      p => roomBeds.some(b => b.id === p.bedId) && p.id !== excludePatientId && p.isIsolated
    );

    if (isolatedPatient) {
      return {
        isIsolated: true,
        isolatedPatient,
        isolationType: isolatedPatient.isolationType,
        reason: isolatedPatient.isolationReason || 'Aislamiento epidemiológico'
      };
    }

    return { isIsolated: false };
  };

  const isBedBlockedByIsolation = (
    bedId: string
  ): { isBlocked: boolean; isolatedPatient?: Patient; room?: Room } => {
    const bed = config.beds.find(b => b.id === bedId);
    if (!bed) return { isBlocked: false };

    // If bed is already occupied by the isolated patient itself, it's not "blocked by others"
    const occupant = patients.find(p => p.bedId === bedId);
    if (occupant?.isIsolated) {
      return { isBlocked: false, isolatedPatient: occupant };
    }

    const room = config.rooms.find(r => r.id === bed.roomId);
    if (!room) return { isBlocked: false };

    // In multi-bed rooms (e.g. Piso), an isolated patient blocks all other beds in the room
    const isolationStatus = getRoomIsolationStatus(room.id, occupant?.id);
    if (isolationStatus.isIsolated && isolationStatus.isolatedPatient) {
      return {
        isBlocked: true,
        isolatedPatient: isolationStatus.isolatedPatient,
        room
      };
    }

    return { isBlocked: false };
  };

  const canAssignPatientToRoom = (
    patientSex: Gender,
    roomId: string,
    excludePatientId?: string,
    patientIsIsolated?: boolean
  ): { allowed: boolean; reason?: string; roomGender?: Gender | 'free' } => {
    const room = config.rooms.find(r => r.id === roomId);
    if (!room) return { allowed: false, reason: 'Habitación no encontrada' };

    // 1. Isolation check: If the room currently has an isolated patient, other patients cannot be assigned!
    const roomIsolation = getRoomIsolationStatus(roomId, excludePatientId);
    if (roomIsolation.isIsolated && roomIsolation.isolatedPatient) {
      return {
        allowed: false,
        reason: `Habitación bloqueada por aislamiento: ${roomIsolation.isolatedPatient.fullName.split(',')[0]} requiere habitación exclusiva (${roomIsolation.reason || 'Aislamiento epidemiológico'}).`
      };
    }

    // If the patient to assign is isolated, check if room already has other patients
    if (patientIsIsolated) {
      const roomBeds = config.beds.filter(b => b.roomId === roomId);
      const otherPatients = patients.filter(
        p => roomBeds.some(b => b.id === p.bedId) && p.id !== excludePatientId
      );
      if (otherPatients.length > 0) {
        return {
          allowed: false,
          reason: 'El paciente requiere aislamiento epidemiológico: no puede compartir sala con otros pacientes internados.'
        };
      }
    }

    // 2. Ward gender cohorting rules
    if (!room.isGenderRestricted) {
      return { allowed: true, roomGender: 'free' };
    }

    const { gender: currentGender } = getRoomGender(roomId, excludePatientId);

    if (currentGender === 'free') {
      return { allowed: true, roomGender: 'free' };
    }

    if (currentGender !== patientSex) {
      const roomSexLabel = currentGender === 'M' ? 'Varones' : 'Mujeres';
      const patientSexLabel = patientSex === 'M' ? 'masculino' : 'femenino';
      return {
        allowed: false,
        reason: `Conflicto de género: Habitación ocupada por pacientes ${roomSexLabel}. No se puede internar paciente ${patientSexLabel}.`,
        roomGender: currentGender
      };
    }

    return { allowed: true, roomGender: currentGender };
  };

  const addPatient = (patientData: Omit<Patient, 'id'>): Patient => {
    const newId = `p-${Date.now()}`;
    const newPatient: Patient = {
      ...patientData,
      id: newId
    };

    setPatients(prev => [...prev, newPatient]);

    setConfig(prev => ({
      ...prev,
      beds: prev.beds.map(b => b.id === newPatient.bedId ? { ...b, status: 'ocupada', patientId: newId } : b)
    }));

    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const dischargePatient = (id: string, reason: 'alta_medica' | 'traslado_externo' | 'obito' | 'alta_voluntaria' = 'alta_medica') => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    const dischargedRecord: Patient = {
      ...patient,
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargeReason: reason
    };

    setDischargedPatients(prev => [dischargedRecord, ...prev]);

    setConfig(prev => ({
      ...prev,
      beds: prev.beds.map(b => b.id === patient.bedId ? { ...b, status: 'libre', patientId: null } : b)
    }));

    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatientId === id) setSelectedPatientId(null);
  };

  const transferPatient = (patientId: string, targetBedId: string): { success: boolean; error?: string } => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return { success: false, error: 'Paciente no encontrado' };

    const targetBed = config.beds.find(b => b.id === targetBedId);
    if (!targetBed) return { success: false, error: 'Cama destino no encontrada' };

    if (targetBed.status === 'ocupada' && targetBed.patientId !== patientId) {
      return { success: false, error: 'La cama de destino ya está ocupada' };
    }

    const targetRoom = config.rooms.find(r => r.id === targetBed.roomId);
    if (!targetRoom) return { success: false, error: 'Habitación destino no encontrada' };

    // Check if target bed is blocked by room isolation
    const blockedCheck = isBedBlockedByIsolation(targetBed.id);
    if (blockedCheck.isBlocked && blockedCheck.isolatedPatient) {
      return {
        success: false,
        error: `Cama bloqueada: la habitación está en aislamiento exclusivo por ${blockedCheck.isolatedPatient.fullName.split(',')[0]} (${blockedCheck.isolatedPatient.isolationReason || 'Aislamiento'})`
      };
    }

    const roomCheck = canAssignPatientToRoom(patient.sex, targetRoom.id, patient.id, patient.isIsolated);
    if (!roomCheck.allowed) {
      return { success: false, error: roomCheck.reason };
    }

    const previousBedId = patient.bedId;

    setConfig(prev => ({
      ...prev,
      beds: prev.beds.map(b => {
        if (b.id === previousBedId) {
          return { ...b, status: 'libre', patientId: null };
        }
        if (b.id === targetBedId) {
          return { ...b, status: 'ocupada', patientId: patient.id };
        }
        return b;
      })
    }));

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          bedId: targetBed.id,
          roomId: targetRoom.id,
          sectorId: targetRoom.sectorId,
          plannedTransfer: null
        };
      }
      return p;
    }));

    return { success: true };
  };

  const addTask = (patientId: string, text: string, urgent: boolean = false, dueTime?: string) => {
    const newTask: PatientTask = {
      id: `task-${Date.now()}`,
      text,
      done: false,
      urgent,
      dueTime,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, tasks: [newTask, ...p.tasks] };
      }
      return p;
    }));
  };

  const toggleTask = (patientId: string, taskId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t)
        };
      }
      return p;
    }));
  };

  const deleteTask = (patientId: string, taskId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
        };
      }
      return p;
    }));
  };

  const addEcg = (patientId: string, ecg: Omit<ECGRecord, 'id'>) => {
    const newEcg: ECGRecord = {
      ...ecg,
      id: `ecg-${Date.now()}`
    };

    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, ecgs: [newEcg, ...p.ecgs] };
      }
      return p;
    }));
  };

  const deleteEcg = (patientId: string, ecgId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          ecgs: p.ecgs.filter(e => e.id !== ecgId)
        };
      }
      return p;
    }));
  };

  const updateHospitalConfig = (newConfig: HospitalConfig) => {
    setConfig(newConfig);
  };

  const addRoom = (sectorId: string, name: string, capacity: number, isGenderRestricted: boolean) => {
    const roomId = `room-${Date.now()}`;
    const newRoom: Room = {
      id: roomId,
      sectorId,
      name,
      capacity,
      isGenderRestricted
    };

    const newBeds: Bed[] = Array.from({ length: capacity }, (_, i) => {
      const suffix = capacity > 1 ? `-${String.fromCharCode(65 + i)}` : '';
      return {
        id: `bed-${Date.now()}-${i}`,
        roomId,
        sectorId,
        name: `${name}${suffix}`,
        status: 'libre',
        patientId: null
      };
    });

    setConfig(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
      beds: [...prev.beds, ...newBeds]
    }));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_PATIENTS);
    localStorage.removeItem(STORAGE_KEY_DISCHARGED);
    setConfig(initialHospitalConfig);
    setPatients(initialPatients);
    setDischargedPatients([]);
    setSelectedPatientId(null);
  };

  const getSectorStats = (sectorId: string) => {
    const sectorBeds = config.beds.filter(b => sectorId === 'all' || b.sectorId === sectorId);
    const totalBeds = sectorBeds.length;
    const occupiedBeds = sectorBeds.filter(b => b.status === 'ocupada').length;
    
    // Beds blocked because another patient in the same room is isolated
    const blockedByIsolationBeds = sectorBeds.filter(
      b => b.status !== 'ocupada' && isBedBlockedByIsolation(b.id).isBlocked
    ).length;

    // Real operative free beds (excluding both occupied and isolation-blocked beds)
    const freeBeds = Math.max(0, totalBeds - occupiedBeds - blockedByIsolationBeds);

    const sectorPatients = patients.filter(p => sectorId === 'all' || p.sectorId === sectorId);
    const maleOccupiedBeds = sectorPatients.filter(p => p.sex === 'M').length;
    const femaleOccupiedBeds = sectorPatients.filter(p => p.sex === 'F').length;

    let freeMaleBeds = 0;
    let freeFemaleBeds = 0;

    sectorBeds.filter(b => b.status === 'libre' && !isBedBlockedByIsolation(b.id).isBlocked).forEach(bed => {
      const room = config.rooms.find(r => r.id === bed.roomId);
      if (!room || !room.isGenderRestricted) {
        freeMaleBeds++;
        freeFemaleBeds++;
      } else {
        const { gender } = getRoomGender(room.id);
        if (gender === 'free') {
          freeMaleBeds++;
          freeFemaleBeds++;
        } else if (gender === 'M') {
          freeMaleBeds++;
        } else if (gender === 'F') {
          freeFemaleBeds++;
        }
      }
    });

    const criticalCount = sectorPatients.filter(p => p.clinicalStatus === 'critico').length;
    const transfersPendingCount = sectorPatients.filter(p => Boolean(p.plannedTransfer)).length;

    return {
      totalBeds,
      occupiedBeds,
      blockedByIsolationBeds,
      freeBeds,
      maleOccupiedBeds,
      femaleOccupiedBeds,
      freeMaleBeds,
      freeFemaleBeds,
      criticalCount,
      transfersPendingCount
    };
  };

  return (
    <CardioContext.Provider
      value={{
        config,
        patients,
        dischargedPatients,
        getAllHistoricalPatients,
        findHistoricalPatientsByDni,
        importHistoricalPatients,
        isLocked,
        pin,
        selectedPatientId,
        activeSectorId,
        activeView,
        setSelectedPatientId,
        setActiveSectorId,
        setActiveView,
        setIsLocked,
        verifyPin,
        setSecurityPin,
        getPatientById,
        getPatientByBedId,
        addPatient,
        updatePatient,
        dischargePatient,
        getRoomGender,
        getRoomIsolationStatus,
        isBedBlockedByIsolation,
        canAssignPatientToRoom,
        transferPatient,
        addTask,
        toggleTask,
        deleteTask,
        addEcg,
        deleteEcg,
        updateHospitalConfig,
        addRoom,
        resetToDemoData,
        getSectorStats
      }}
    >
      {children}
    </CardioContext.Provider>
  );
};

export const useCardio = () => {
  const context = useContext(CardioContext);
  if (!context) throw new Error('useCardio must be used within a CardioProvider');
  return context;
};
