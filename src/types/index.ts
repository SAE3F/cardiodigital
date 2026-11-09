export type Gender = 'M' | 'F';

export type ClinicalStatus = 'estable' | 'vigilar' | 'critico';

export type PlannedTransfer = 'baja_piso' | 'pasa_uco' | 'alta' | 'hemodinamia' | null;

export interface KeyLabs {
  troponinas?: string;
  bnp?: string;
  k?: string;
  na?: string;
  creatinina?: string;
  hb?: string;
  otros?: string;
}

export interface PatientTask {
  id: string;
  text: string;
  done: boolean;
  urgent?: boolean;
  createdAt: string;
  dueTime?: string;
}

export interface ECGRecord {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'ingreso' | 'control_diario' | 'post_procedimiento' | 'urgencia';
  imageUrl: string;
  notes?: string;
}

export type IsolationType = 'contacto' | 'respiratorio' | 'gotitas' | 'inverso' | 'estricto';

export type HospitalInfectionType = 
  | 'herida_quirurgica' // Infección de herida quirúrgica (esternotomía post-CRM, etc.)
  | 'sitio_marcapasos' // Infección de bolsillo de marcapasos / CDI
  | 'bacteriemia_cateter' // Bacteriemia asociada a catéter venoso (BAC)
  | 'neumonia_ventilador' // Neumonía asociada a ventilación mecánica (NAV)
  | 'infeccion_urinaria' // Infección urinaria asociada a sonda vesical (ITU-SV)
  | 'puncion_vascular' // Infección o pseudoaneurisma en sitio de punción femoral/radial
  | 'clostridium' // Infección intestinal por Clostridioides difficile
  | 'otra';

export interface HospitalInfectionRecord {
  hasInfection: boolean;
  type?: HospitalInfectionType;
  germ?: string; // e.g. 'SAMR', 'Pseudomonas', 'KPC (+)', 'Enterococo'
  onsetDate?: string;
  postProcedure?: boolean;
  isPostProcedure?: boolean;
  antibioticTreatment?: string;
  procedureType?: string;
  notes?: string;
}

export interface DoorToBalloonRecord {
  isApplicable: boolean; // Si es infarto con elevación del ST / angioplastia primaria
  painOnsetTime?: string; // Hora de inicio de dolor (HH:MM)
  doorTime?: string; // Hora llegada a la guardia (HH:MM)
  ecgTime?: string; // Hora realización de 1er ECG (meta < 10 min)
  cathLabActivationTime?: string; // Hora aviso / llamado al equipo de cateterismo
  balloonTime?: string; // Hora de apertura con balón (HH:MM)
  totalMinutes?: number; // Minutos puerta-balón (meta < 90 min)
  isWithinTarget?: boolean;
  operator?: string;
  reperfusionStrategy?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  dni: string;
  age: number;
  sex: Gender;
  admissionDate: string; // YYYY-MM-DD
  admissionTime?: string; // HH:MM
  bedId: string | null;
  sectorId: string | null;
  roomId: string | null;
  diagnosis: string; // Summary string or primary
  diagnoses?: string[]; // Multi-select array of diagnoses
  antecedents?: string; // HTA, DLP, DBT2, TBQ, etc. (Display string / custom notes)
  antecedentsList?: string[]; // Categorized array of standardized cardiovascular risk factors and antecedents
  clinicalStatus: ClinicalStatus;
  isIsolated?: boolean; // Requiere aislamiento epidemiológico
  isolationType?: IsolationType; // Tipo de aislamiento
  isolationReason?: string; // Motivo o germen (e.g. 'KPC (+)', 'SAMR', 'COVID-19')
  supportDevices: string[]; // e.g. 'Noradrenalina', 'Marcapasos transitorio', 'Balón BIAC', 'VNI'
  medications?: string[]; // Multi-select array of cardiology medications
  keyLabs: KeyLabs;
  evolutionNotes: string;
  pendingConduct: string;
  plannedTransfer?: PlannedTransfer;
  readmissionCount?: number; // Cantidad de ingresos previos en los últimos 12 meses
  isReadmissionWithin30Days?: boolean; // Reingreso precoz (< 30 días de la última alta)
  dischargeDate?: string; // Fecha de alta médica o egreso
  dischargeReason?: 'alta_medica' | 'traslado_externo' | 'obito' | 'alta_voluntaria';
  hospitalInfection?: HospitalInfectionRecord;
  doorToBalloon?: DoorToBalloonRecord;
  tasks: PatientTask[];
  ecgs: ECGRecord[];
}

export interface Bed {
  id: string;
  roomId: string;
  sectorId: string;
  name: string;
  patientId?: string | null;
  status: 'libre' | 'ocupada' | 'bloqueada';
}

export interface Room {
  id: string;
  sectorId: string;
  name: string;
  capacity: number;
  isGenderRestricted: boolean;
}

export interface Sector {
  id: string;
  name: string;
  shortName: string;
  type: 'critical' | 'ward' | 'transit';
  color: string;
  defaultGenderRestricted: boolean;
}

export interface HospitalConfig {
  hospitalName: string;
  serviceName: string;
  sectors: Sector[];
  rooms: Room[];
  beds: Bed[];
}
