import React from 'react';
import { 
  Calculator, 
  BookOpen, 
  Globe, 
  GitFork, 
  ArrowRightLeft, 
  Pill, 
  Database, 
  BarChart3, 
  Settings, 
  X,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import type { ClinicalToolsTab } from './ClinicalToolsModal';

interface ToolsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenClinicalTools: (tab: ClinicalToolsTab) => void;
  onOpenEpidemiology: () => void;
  onOpenHistoricalRegistry: () => void;
  onOpenSettings: () => void;
}

export const ToolsHubModal: React.FC<ToolsHubModalProps> = ({
  isOpen,
  onClose,
  onOpenClinicalTools,
  onOpenEpidemiology,
  onOpenHistoricalRegistry,
  onOpenSettings
}) => {
  if (!isOpen) return null;

  const toolsList = [
    {
      id: 'calculators',
      title: 'Calculadoras Médicas',
      subtitle: '33 scores: CHA₂DS₂-VASc, HAS-BLED, TIMI, GRACE, CrCl...',
      icon: Calculator,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      action: () => {
        onClose();
        onOpenClinicalTools('calculators');
      }
    },
    {
      id: 'national_guidelines',
      title: 'Evidencia Nacional (SAC & FAC)',
      subtitle: 'Consensos oficiales + 1.388 artículos RAC y RFAC + Portales',
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      action: () => {
        onClose();
        onOpenClinicalTools('national_guidelines');
      }
    },
    {
      id: 'openevidence',
      title: 'Evidencia Internacional (OpenEvidence)',
      subtitle: 'IA clínica sin paywalls + PubMed directo y Consensus',
      icon: Globe,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      action: () => {
        onClose();
        onOpenClinicalTools('openevidence');
      }
    },
    {
      id: 'algorithms',
      title: 'Algoritmos Clínicos Interactivos',
      subtitle: 'Protocolos SAC paso a paso: dolor precordial, arritmias, shock',
      icon: GitFork,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => {
        onClose();
        onOpenClinicalTools('algorithms');
      }
    },
    {
      id: 'anticoagulation',
      title: 'Rotación y Dosis de Anticoagulación',
      subtitle: 'Transición entre AVK, DOACs y Heparinas + Ajuste por CrCl',
      icon: ArrowRightLeft,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      action: () => {
        onClose();
        onOpenClinicalTools('anticoagulation');
      }
    },
    {
      id: 'interactions',
      title: 'Interacciones Farmacológicas Críticas',
      subtitle: 'Alertas de seguridad para combinaciones de alto riesgo en guardia',
      icon: Pill,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      action: () => {
        onClose();
        onOpenClinicalTools('interactions');
      }
    },
    {
      id: 'registry',
      title: 'Registro Histórico & Calidad (LOS)',
      subtitle: 'Base persistente de internación, días de estada e infecciones',
      icon: Database,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      action: () => {
        onClose();
        onOpenHistoricalRegistry();
      }
    },
    {
      id: 'epidemiology',
      title: 'Epidemiología & Métricas de FRCV',
      subtitle: 'Análisis de comorbilidades (HTA, DBT, DLP), reingresos y tiempos',
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => {
        onClose();
        onOpenEpidemiology();
      }
    },
    {
      id: 'settings',
      title: 'Configuración del Servicio & Camas',
      subtitle: 'Personalizar nombres del hospital, salas, camas y PIN',
      icon: Settings,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      action: () => {
        onClose();
        onOpenSettings();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="bg-white rounded-t-xl sm:rounded-lg max-w-lg w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col border border-slate-300 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              <Stethoscope className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Herramientas Clínicas & Recursos
              </h2>
              <p className="text-[11px] text-slate-500">
                Seleccioná el módulo de decisión médica o análisis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {toolsList.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full pt-2 first:pt-0 pb-2 flex items-center justify-between text-left hover:bg-slate-50/80 p-2 rounded-md transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 shrink-0">
          <span>CardioGuardia v8 • Sistema Clínico</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
