import React, { useState } from 'react';
import { CardioProvider, useCardio } from './context/CardioContext';
import { Header } from './components/Header';
import { HospitalFloorPlan } from './components/HospitalFloorPlan';
import { BedMatrix } from './components/BedMatrix';
import { RoundsView } from './components/RoundsView';
import { PresentationMode } from './components/PresentationMode';
import { PatientDetailModal } from './components/PatientDetailModal';
import { ECGScannerModal } from './components/ECGScannerModal';
import { TransferModal } from './components/TransferModal';
import { NewPatientModal } from './components/NewPatientModal';
import { HospitalSettingsModal } from './components/HospitalSettingsModal';
import { EpidemiologyModal } from './components/EpidemiologyModal';
import { ClinicalToolsModal, type ClinicalToolsTab } from './components/ClinicalToolsModal';
import { HistoricalRegistryModal } from './components/HistoricalRegistryModal';
import { ToolsHubModal } from './components/ToolsHubModal';
import { PinLockModal } from './components/PinLockModal';
import { LayoutGrid, Smartphone, Tv, Plus, Stethoscope } from 'lucide-react';

const CardioAppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedPatientId,
    setSelectedPatientId,
    getPatientById
  } = useCardio();

  // Modals state
  const [scanEcgPatientId, setScanEcgPatientId] = useState<string | null>(null);
  const [transferPatientId, setTransferPatientId] = useState<string | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState<boolean>(false);
  const [newPatientTargetBedId, setNewPatientTargetBedId] = useState<string | undefined>(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isEpidemiologyOpen, setIsEpidemiologyOpen] = useState<boolean>(false);
  const [isClinicalToolsOpen, setIsClinicalToolsOpen] = useState<boolean>(false);
  const [clinicalToolsPatientId, setClinicalToolsPatientId] = useState<string | null>(null);
  const [clinicalToolsInitialTab, setClinicalToolsInitialTab] = useState<ClinicalToolsTab>('calculators');
  const [isHistoricalRegistryOpen, setIsHistoricalRegistryOpen] = useState<boolean>(false);
  const [isToolsHubOpen, setIsToolsHubOpen] = useState<boolean>(false);

  const selectedPatient = selectedPatientId ? getPatientById(selectedPatientId) : null;
  const scanEcgPatient = scanEcgPatientId ? getPatientById(scanEcgPatientId) : null;
  const transferPatient = transferPatientId ? getPatientById(transferPatientId) : null;

  const handleOpenNewPatientInBed = (bedId: string) => {
    setNewPatientTargetBedId(bedId);
    setIsNewPatientModalOpen(true);
  };

  const handleOpenNewPatientGlobal = () => {
    setNewPatientTargetBedId(undefined);
    setIsNewPatientModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Main Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewPatientModal={handleOpenNewPatientGlobal}
        onOpenEpidemiology={() => setIsEpidemiologyOpen(true)}
        onOpenClinicalTools={(tab) => {
          setClinicalToolsInitialTab(tab || 'calculators');
          setClinicalToolsPatientId(null);
          setIsClinicalToolsOpen(true);
        }}
        onOpenHistoricalRegistry={() => setIsHistoricalRegistryOpen(true)}
        onOpenToolsHub={() => setIsToolsHubOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {activeView === 'floor' && (
          <>
            {/* Desktop / tablet shows floor plan */}
            <div className="hidden md:block">
              <HospitalFloorPlan
                onSelectPatient={id => setSelectedPatientId(id)}
                onOpenNewPatientInBed={handleOpenNewPatientInBed}
                onInitiateTransfer={id => setTransferPatientId(id)}
                onScanEcg={id => setScanEcgPatientId(id)}
              />
            </div>
            {/* Mobile shows Grilla / BedMatrix directly */}
            <div className="md:hidden">
              <BedMatrix
                onSelectPatient={id => setSelectedPatientId(id)}
                onInitiateTransfer={id => setTransferPatientId(id)}
                onOpenNewPatientInBed={handleOpenNewPatientInBed}
                onScanEcg={id => setScanEcgPatientId(id)}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </div>
          </>
        )}

        {activeView === 'map' && (
          <BedMatrix
            onSelectPatient={id => setSelectedPatientId(id)}
            onInitiateTransfer={id => setTransferPatientId(id)}
            onOpenNewPatientInBed={handleOpenNewPatientInBed}
            onScanEcg={id => setScanEcgPatientId(id)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeView === 'rounds' && (
          <RoundsView
            onSelectPatient={id => setSelectedPatientId(id)}
            onScanEcg={id => setScanEcgPatientId(id)}
            onInitiateTransfer={id => setTransferPatientId(id)}
          />
        )}

        {activeView === 'presentation' && (
          <PresentationMode onClose={() => setActiveView('map')} />
        )}
      </main>

      {/* Floating Action Button on Mobile (Quick Add) */}
      <div className="sm:hidden fixed bottom-16 right-4 z-20">
        <button
          onClick={handleOpenNewPatientGlobal}
          className="w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-lg flex items-center justify-center p-3 transition-colors"
          title="Ingresar Nuevo Paciente"
        >
          <Plus className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar: Camas, Recorrida, Herramientas, Pase TV */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium shadow-lg">
        <button
          onClick={() => setActiveView('map')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === 'map' || activeView === 'floor' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutGrid className="w-4 h-4 stroke-[2]" />
          <span>Camas</span>
        </button>

        <button
          onClick={() => setActiveView('rounds')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === 'rounds' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Smartphone className="w-4 h-4 stroke-[1.75]" />
          <span>Recorrida</span>
        </button>

        <button
          onClick={() => setIsToolsHubOpen(true)}
          className="flex flex-col items-center gap-1 transition-colors text-slate-700 hover:text-blue-700 font-semibold"
        >
          <Stethoscope className="w-4 h-4 stroke-[2] text-blue-700" />
          <span className="text-blue-800">Herramientas</span>
        </button>

        <button
          onClick={() => setActiveView('presentation')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeView === 'presentation' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Tv className="w-4 h-4 stroke-[1.75]" />
          <span>Pase TV</span>
        </button>
      </nav>

      {/* Modals */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatientId(null)}
          onScanEcg={id => setScanEcgPatientId(id)}
          onInitiateTransfer={id => setTransferPatientId(id)}
          onOpenClinicalTools={(patientId, tab) => {
            setClinicalToolsPatientId(patientId);
            setClinicalToolsInitialTab(tab || 'calculators');
            setIsClinicalToolsOpen(true);
          }}
        />
      )}

      {scanEcgPatient && (
        <ECGScannerModal
          patient={scanEcgPatient}
          onClose={() => setScanEcgPatientId(null)}
        />
      )}

      {transferPatient && (
        <TransferModal
          patient={transferPatient}
          onClose={() => setTransferPatientId(null)}
        />
      )}

      {isNewPatientModalOpen && (
        <NewPatientModal
          initialBedId={newPatientTargetBedId}
          onClose={() => {
            setIsNewPatientModalOpen(false);
            setNewPatientTargetBedId(undefined);
          }}
        />
      )}

      {isSettingsOpen && (
        <HospitalSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isEpidemiologyOpen && (
        <EpidemiologyModal onClose={() => setIsEpidemiologyOpen(false)} />
      )}

      {isClinicalToolsOpen && (
        <ClinicalToolsModal
          initialPatientId={clinicalToolsPatientId}
          initialTab={clinicalToolsInitialTab}
          onClose={() => {
            setIsClinicalToolsOpen(false);
            setClinicalToolsPatientId(null);
          }}
        />
      )}

      {isHistoricalRegistryOpen && (
        <HistoricalRegistryModal
          onClose={() => setIsHistoricalRegistryOpen(false)}
          onSelectPatientToView={(patient) => {
            setIsHistoricalRegistryOpen(false);
            setSelectedPatientId(patient.id);
          }}
        />
      )}

      {/* Tools Hub Sheet/Modal */}
      <ToolsHubModal
        isOpen={isToolsHubOpen}
        onClose={() => setIsToolsHubOpen(false)}
        onOpenClinicalTools={(tab) => {
          setClinicalToolsInitialTab(tab);
          setClinicalToolsPatientId(null);
          setIsClinicalToolsOpen(true);
        }}
        onOpenEpidemiology={() => setIsEpidemiologyOpen(true)}
        onOpenHistoricalRegistry={() => setIsHistoricalRegistryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <PinLockModal />
    </div>
  );
};

export default function App() {
  return (
    <CardioProvider>
      <CardioAppContent />
    </CardioProvider>
  );
}
