import { Patient, HospitalConfig } from '../types';

const DB_NAME = 'CardioGuardiaRegistry_v1';
const DB_VERSION = 1;
const STORE_NAME = 'patients_registry';

/**
 * Initializes and returns the IndexedDB database instance.
 */
export function openClinicalDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('dni', 'dni', { unique: false });
        store.createIndex('admissionDate', 'admissionDate', { unique: false });
        store.createIndex('dischargeDate', 'dischargeDate', { unique: false });
        store.createIndex('fullName', 'fullName', { unique: false });
        store.createIndex('sectorId', 'sectorId', { unique: false });
        store.createIndex('isReadmissionWithin30Days', 'isReadmissionWithin30Days', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Error al abrir IndexedDB'));
    };
  });
}

/**
 * Saves or updates a patient in IndexedDB.
 */
export async function savePatientToDB(patient: Patient): Promise<void> {
  try {
    const db = await openClinicalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(patient);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error guardando paciente en IndexedDB:', err);
  }
}

/**
 * Batch saves multiple patients to IndexedDB.
 */
export async function saveMultiplePatientsToDB(patients: Patient[]): Promise<void> {
  try {
    const db = await openClinicalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      patients.forEach(p => store.put(p));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error('Error guardando lista de pacientes en IndexedDB:', err);
  }
}

/**
 * Retrieves all patients from IndexedDB.
 */
export async function getAllPatientsFromDB(): Promise<Patient[]> {
  try {
    const db = await openClinicalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result as Patient[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error obteniendo pacientes de IndexedDB:', err);
    return [];
  }
}

/**
 * Searches historical records matching a given DNI.
 */
export async function findHistoricalByDni(dni: string): Promise<Patient[]> {
  const cleanDni = dni.replace(/\D/g, '');
  if (!cleanDni) return [];

  const all = await getAllPatientsFromDB();
  return all.filter(p => (p.dni || '').replace(/\D/g, '') === cleanDni);
}

/**
 * Deletes a patient from IndexedDB.
 */
export async function deletePatientFromDB(id: string): Promise<void> {
  try {
    const db = await openClinicalDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error eliminando paciente de IndexedDB:', err);
  }
}

/**
 * Generates an Excel-ready CSV string with UTF-8 BOM encoding for all patient variables.
 */
export function exportPatientsToCSV(patients: Patient[]): string {
  const headers = [
    'ID Paciente',
    'DNI',
    'Apellido y Nombre',
    'Sexo',
    'Edad',
    'Estado Internación',
    'Sector',
    'Fecha Ingreso',
    'Hora Ingreso',
    'Fecha Egreso',
    'Motivo Egreso',
    'Días Estancia (LOS)',
    'Diagnóstico Principal',
    'Diagnósticos Secundarios',
    'FRCV y Antecedentes',
    'Estado Clínico',
    'Aislamiento',
    'Tipo Aislamiento',
    'Reingreso < 30 días',
    'Cant Reingresos Anual',
    'IACS Infección Intrahospitalaria',
    'Tipo IACS',
    'Germen Aislado',
    'Puerta-Balón Aplicable',
    'Puerta-Balón Minutos',
    'Meta D2B < 90m Lograda',
    'Medicaciones',
    'Notas Evolución',
    'Conducta Pendiente'
  ];

  const rows = patients.map(p => {
    // Calculate stay
    const adm = new Date(p.admissionDate || '2026-11-01');
    const end = p.dischargeDate ? new Date(p.dischargeDate) : new Date();
    const diffDays = Math.max(1, Math.round(Math.abs(end.getTime() - adm.getTime()) / (1000 * 60 * 60 * 24)));

    const statusLabel = p.dischargeDate 
      ? (p.dischargeReason === 'alta_medica' ? 'Alta Médica' : p.dischargeReason === 'obito' ? 'Óbito' : p.dischargeReason === 'traslado_externo' ? 'Traslado Externo' : 'Egresado')
      : 'Activo en Sala';

    const cleanField = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      cleanField(p.id),
      cleanField(p.dni),
      cleanField(p.fullName),
      cleanField(p.sex),
      cleanField(p.age),
      cleanField(statusLabel),
      cleanField(p.sectorId || 'Sin sector'),
      cleanField(p.admissionDate),
      cleanField(p.admissionTime || ''),
      cleanField(p.dischargeDate || ''),
      cleanField(p.dischargeReason || ''),
      cleanField(diffDays),
      cleanField(p.diagnosis),
      cleanField((p.diagnoses || []).join('; ')),
      cleanField((p.antecedentsList || []).join('; ')),
      cleanField(p.clinicalStatus),
      cleanField(p.isIsolated ? 'Sí' : 'No'),
      cleanField(p.isolationType || ''),
      cleanField(p.isReadmissionWithin30Days ? 'SÍ' : 'NO'),
      cleanField(p.readmissionCount || 0),
      cleanField(p.hospitalInfection?.hasInfection ? 'SÍ' : 'NO'),
      cleanField(p.hospitalInfection?.type || ''),
      cleanField(p.hospitalInfection?.germ || ''),
      cleanField(p.doorToBalloon?.isApplicable ? 'SÍ' : 'NO'),
      cleanField(p.doorToBalloon?.totalMinutes ?? ''),
      cleanField(p.doorToBalloon?.isWithinTarget !== undefined ? (p.doorToBalloon.isWithinTarget ? 'SÍ' : 'NO') : ''),
      cleanField((p.medications || []).join(' | ')),
      cleanField(p.evolutionNotes || ''),
      cleanField(p.pendingConduct || '')
    ].join(';');
  });

  // UTF-8 BOM + CSV with semicolon delimiter (Excel standard in Spanish locale)
  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Triggers a browser download of a CSV file.
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports complete database to JSON backup.
 */
export function exportDatabaseToJSON(patients: Patient[], config?: HospitalConfig): string {
  const payload = {
    appName: 'CardioGuardia',
    version: '8.0',
    exportDate: new Date().toISOString(),
    config,
    totalRecords: patients.length,
    patients
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Triggers a browser download of a JSON file.
 */
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
