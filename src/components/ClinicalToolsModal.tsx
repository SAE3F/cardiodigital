import React, { useState, useMemo, useEffect } from 'react';
import { useCardio } from '../context/CardioContext';
import { 
  calculators, 
  getCalculatorBySlug, 
  CalculatorConfig, 
  Interpretation 
} from '../data/clinicalCalculators';
import { 
  ALGORITMOS, 
  AlgorithmConfig, 
  AlgorithmNode 
} from '../data/clinicalAlgorithms';
import { 
  ANTICOAGULANTES, 
  getConversionInstruction, 
  getRenalDosing 
} from '../data/anticoagulationTools';
import { 
  FARMACOS, 
  INTERACCIONES, 
  SeveridadInteraccion 
} from '../data/drugInteractions';
import { 
  NATIONAL_GUIDELINES, 
  NationalGuideline, 
  filterNationalGuidelines 
} from '../data/nationalGuidelines';
import { 
  OFFICIAL_PORTALS, 
  NATIONAL_ARTICLES, 
  filterNationalArticles, 
  JournalArticle 
} from '../data/nationalJournals';
import { 
  Calculator, 
  GitFork, 
  ArrowRightLeft, 
  AlertTriangle, 
  Search, 
  X, 
  Check, 
  Copy, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Info, 
  UserCheck, 
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Stethoscope,
  Pill,
  Globe,
  FileText,
  ExternalLink,
  Send,
  HelpCircle,
  Download,
  Building2,
  GraduationCap
} from 'lucide-react';

export type ClinicalToolsTab = 
  | 'calculators' 
  | 'algorithms' 
  | 'national_guidelines' 
  | 'openevidence' 
  | 'anticoagulation' 
  | 'interactions';

interface ClinicalToolsModalProps {
  onClose: () => void;
  initialPatientId?: string | null;
  initialTab?: ClinicalToolsTab;
  initialCalculatorSlug?: string;
}

export const ClinicalToolsModal: React.FC<ClinicalToolsModalProps> = ({
  onClose,
  initialPatientId = null,
  initialTab = 'calculators',
  initialCalculatorSlug
}) => {
  const { patients, updatePatient } = useCardio();

  // Tab State
  const [activeTab, setActiveTab] = useState<ClinicalToolsTab>(initialTab);

  // Selected Patient for Auto-fill & note insertion
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId);
  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // --------------------------------------------------------------------------
  // TAB 1: CALCULATORS STATE
  // --------------------------------------------------------------------------
  const [searchCalc, setSearchCalc] = useState('');
  const [calcCategory, setCalcCategory] = useState<string>('all');
  const [selectedCalcSlug, setSelectedCalcSlug] = useState<string>(initialCalculatorSlug || 'chads2-vasc');
  const [calcValues, setCalcValues] = useState<Record<string, any>>({});
  const [copiedResult, setCopiedResult] = useState(false);
  const [insertedInNote, setInsertedInNote] = useState(false);

  const selectedCalc = useMemo(() => {
    return getCalculatorBySlug(selectedCalcSlug) || calculators[0];
  }, [selectedCalcSlug]);

  const calcCategories = useMemo(() => {
    const cats = Array.from(new Set(calculators.map(c => c.category)));
    return ['all', ...cats];
  }, []);

  const filteredCalculators = useMemo(() => {
    return calculators.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchCalc.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchCalc.toLowerCase()) ||
                          c.slug.toLowerCase().includes(searchCalc.toLowerCase());
      const matchCat = calcCategory === 'all' || c.category === calcCategory;
      return matchSearch && matchCat;
    });
  }, [searchCalc, calcCategory]);

  // Auto-populate inputs from active patient when calculator or patient changes
  useEffect(() => {
    if (!selectedCalc) return;
    const initialValues: Record<string, any> = {};

    if (activePatient) {
      selectedCalc.inputs.forEach(input => {
        // Age numeric
        if (input.type === 'number' && (input.id === 'edad' || input.id === 'age')) {
          initialValues[input.id] = activePatient.age;
        }

        // Age in radio options
        if (input.type === 'radio' && (input.id === 'edad' || input.id === 'age') && input.options) {
          const age = activePatient.age;
          for (const opt of input.options) {
            const lbl = opt.label.toLowerCase();
            const rangeMatch = lbl.match(/(\d+)\s*-\s*(\d+)/);
            if (rangeMatch && age >= parseInt(rangeMatch[1]) && age <= parseInt(rangeMatch[2])) {
              initialValues[input.id] = opt.id;
              break;
            }
            if ((lbl.includes('≥') || lbl.includes('>=') || lbl.includes('o más') || lbl.includes('mas')) && age >= 75) {
              if (opt.id.includes('75') || opt.id.includes('gte')) initialValues[input.id] = opt.id;
            } else if ((lbl.includes('<') || lbl.includes('menor')) && age < 65) {
              if (opt.id.includes('65') || opt.id.includes('lt')) initialValues[input.id] = opt.id;
            }
          }
        }

        // Gender checkbox or radio
        if (input.id === 'sexo' || input.id === 'sex' || input.id === 'female' || input.id === 'gender') {
          if (activePatient.sex === 'F') {
            if (input.type === 'checkbox' && input.options?.length === 1) {
              initialValues[input.id] = input.options[0].id;
            } else if (input.type === 'radio' && input.options) {
              const fOpt = input.options.find(o => o.label.toLowerCase().includes('mujer') || o.label.toLowerCase().includes('femenin'));
              if (fOpt) initialValues[input.id] = fOpt.id;
            }
          }
        }

        // Antecedents auto-detection for checkboxes
        if (input.type === 'checkbox' && input.options?.length === 1) {
          const id = input.id.toLowerCase();
          const pAntecedents = (activePatient.antecedentsList || []).join(' ').toLowerCase() + ' ' + (activePatient.antecedents || '').toLowerCase();
          
          if ((id.includes('hipertension') || id === 'h') && pAntecedents.includes('hipertens')) {
            initialValues[input.id] = input.options[0].id;
          }
          if ((id.includes('diabetes') || id === 'd') && pAntecedents.includes('diabet')) {
            initialValues[input.id] = input.options[0].id;
          }
          if ((id.includes('insuficiencia') || id.includes('ic') || id === 'c') && (pAntecedents.includes('insuficiencia cardíaca') || pAntecedents.includes('icfer') || pAntecedents.includes('icfep'))) {
            initialValues[input.id] = input.options[0].id;
          }
          if ((id.includes('acv') || id.includes('ait') || id === 's2') && (pAntecedents.includes('acv') || pAntecedents.includes('ait') || pAntecedents.includes('stroke'))) {
            initialValues[input.id] = input.options[0].id;
          }
          if ((id.includes('vascular') || id === 'v') && (pAntecedents.includes('infarto') || pAntecedents.includes('iam') || pAntecedents.includes('atc') || pAntecedents.includes('stent'))) {
            initialValues[input.id] = input.options[0].id;
          }
        }

        // Creatinine numeric
        if (input.id === 'creatinina' || input.id === 'cr') {
          const crText = activePatient.keyLabs?.creatinina;
          if (crText) {
            const numMatch = crText.match(/(\d+[.,]?\d*)/);
            if (numMatch) {
              initialValues[input.id] = parseFloat(numMatch[1].replace(',', '.'));
            }
          }
        }
      });
    }

    setCalcValues(initialValues);
    setCopiedResult(false);
    setInsertedInNote(false);
  }, [selectedCalc, activePatient]);

  // Compute Score & Interpretation
  const calculatedResult = useMemo<{ score: number | null; interpretation: Interpretation | null }>(() => {
    if (!selectedCalc) return { score: null, interpretation: null };
    try {
      const score = selectedCalc.calculate(calcValues);
      const interpretation = selectedCalc.interpret(score, calcValues);
      return { score, interpretation };
    } catch (err) {
      console.error('Error calculando score:', err);
      return { score: null, interpretation: null };
    }
  }, [selectedCalc, calcValues]);

  const handleCopyResult = () => {
    if (!selectedCalc || calculatedResult.score === null || !calculatedResult.interpretation) return;
    const text = `${selectedCalc.name}: ${calculatedResult.score} pts | ${calculatedResult.interpretation.risk} - ${calculatedResult.interpretation.recommendation} (${selectedCalc.reference || 'Guía Clínica'})`;
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2500);
  };

  const handleInsertInPatientNotes = () => {
    if (!activePatient || !selectedCalc || calculatedResult.score === null || !calculatedResult.interpretation) return;
    const summary = `\n[${selectedCalc.name}]: ${calculatedResult.score} pts (${calculatedResult.interpretation.risk}). ${calculatedResult.interpretation.recommendation}`;
    
    updatePatient(activePatient.id, {
      evolutionNotes: (activePatient.evolutionNotes || '') + summary
    });

    setInsertedInNote(true);
    setTimeout(() => setInsertedInNote(false), 3000);
  };

  // --------------------------------------------------------------------------
  // TAB 2: CLINICAL ALGORITHMS STATE
  // --------------------------------------------------------------------------
  const [selectedAlgoSlug, setSelectedAlgoSlug] = useState<string>('iamcest-repf');
  const selectedAlgo = useMemo(() => {
    return ALGORITMOS.find(a => a.slug === selectedAlgoSlug) || ALGORITMOS[0];
  }, [selectedAlgoSlug]);

  const [algoHistory, setAlgoHistory] = useState<string[]>([selectedAlgo.initialNodeId]);

  useEffect(() => {
    setAlgoHistory([selectedAlgo.initialNodeId]);
  }, [selectedAlgo]);

  const currentAlgoNodeId = algoHistory[algoHistory.length - 1];
  const currentAlgoNode = selectedAlgo.nodes[currentAlgoNodeId];

  // --------------------------------------------------------------------------
  // TAB 3: NATIONAL GUIDELINES & JOURNALS (SAC & FAC) STATE
  // --------------------------------------------------------------------------
  const [nationalSubSection, setNationalSubSection] = useState<'guidelines' | 'journals' | 'portals'>('guidelines');
  const [searchGuideline, setSearchGuideline] = useState('');
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  const [selectedGuidelineCat, setSelectedGuidelineCat] = useState<string>('all');
  const [expandedGuidelineId, setExpandedGuidelineId] = useState<string | null>(NATIONAL_GUIDELINES[0]?.id || null);

  // Journal search state
  const [searchJournal, setSearchJournal] = useState('');
  const [journalSource, setJournalSource] = useState<'all' | 'sac' | 'fac'>('all');
  const [journalCategory, setJournalCategory] = useState<string>('all');
  const [journalLimit, setJournalLimit] = useState(40);

  const filteredGuidelines = useMemo(() => {
    return filterNationalGuidelines({
      search: searchGuideline,
      society: selectedSociety,
      category: selectedGuidelineCat
    });
  }, [searchGuideline, selectedSociety, selectedGuidelineCat]);

  const { articles: filteredArticles, totalMatches: totalArticleMatches } = useMemo(() => {
    return filterNationalArticles({
      search: searchJournal,
      sourceId: journalSource,
      category: journalCategory,
      limit: journalLimit
    });
  }, [searchJournal, journalSource, journalCategory, journalLimit]);

  // --------------------------------------------------------------------------
  // TAB 4: OPEN EVIDENCE (INTERNATIONAL) STATE
  // --------------------------------------------------------------------------
  const [openEvidenceQuery, setOpenEvidenceQuery] = useState('');
  const [evidenceNotice, setEvidenceNotice] = useState<string | null>(null);

  const launchOpenEvidence = (
    query: string,
    engine: 'openevidence' | 'pubmed' | 'consensus' | 'scholar' = 'openevidence'
  ) => {
    const q = query.trim() || 'ESC Cardiology Guidelines 2024';

    // Auto-copy clinical query to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(q).catch(() => {});
    }

    if (engine === 'pubmed') {
      const targetUrl = `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setEvidenceNotice(`Abriendo PubMed (NCBI) con la búsqueda clínica.`);
    } else if (engine === 'consensus') {
      const targetUrl = `https://consensus.app/results/?q=${encodeURIComponent(q)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setEvidenceNotice(`Abriendo Consensus AI con la búsqueda clínica.`);
    } else if (engine === 'scholar') {
      const targetUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setEvidenceNotice(`Abriendo Google Scholar con la búsqueda clínica.`);
    } else {
      // NOTE: OpenEvidence route /ask expects an existing conversation UUID.
      // Passing /ask?q= causes "You do not have access to this conversation".
      // Navigating directly to https://www.openevidence.com opens the clean clinical interface.
      const targetUrl = 'https://www.openevidence.com';
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      setEvidenceNotice(`Consulta copiada al portapapeles. Se abrió OpenEvidence: pegala en el buscador con Ctrl+V.`);
    }

    setTimeout(() => {
      setEvidenceNotice(null);
    }, 8000);
  };

  // Patient contextual questions for OpenEvidence
  const patientContextQuestions = useMemo(() => {
    if (!activePatient) return [];
    const questions: string[] = [];
    const diag = (activePatient.diagnosis || '').toLowerCase();

    if (diag.includes('iam') || diag.includes('infarto') || diag.includes('coronari')) {
      questions.push(`Optimal DAPT duration after STEMI/NSTEMI with high bleeding risk (ESC 2024 / ACC 2024)`);
      questions.push(`Early beta-blocker and statin therapy after acute myocardial infarction: current recommendations`);
      questions.push(`Complete vs culprit-only revascularization in acute myocardial infarction with multivessel disease`);
    } else if (diag.includes('insuficiencia cardíaca') || diag.includes('icfer') || diag.includes('icfep')) {
      questions.push(`Simultaneous rapid initiation of quadruple therapy (ARNI, SGLT2i, MRA, Beta-blocker) in acute heart failure`);
      questions.push(`SGLT2 inhibitors and GLP-1 receptor agonists in heart failure with preserved ejection fraction (HFpEF)`);
      questions.push(`Intravenous iron supplementation in heart failure with iron deficiency (FAIR-HF2 and HEART-FID evidence)`);
    } else if (diag.includes('fibrilación') || diag.includes('fa') || diag.includes('arritmia')) {
      questions.push(`Early rhythm control and catheter ablation vs medical therapy in atrial fibrillation`);
      questions.push(`DOAC choice and dosing in extreme renal impairment or body weight extremes`);
      questions.push(`Antithrombotic management in atrial fibrillation patients undergoing percutaneous coronary intervention`);
    } else if (diag.includes('aórt') || diag.includes('valvul') || diag.includes('tavi')) {
      questions.push(`TAVR vs SAVR in patients with severe aortic stenosis: long term durability and outcomes`);
      questions.push(`Antithrombotic strategy after transcatheter aortic valve implantation (TAVI)`);
      questions.push(`Antibiotic prophylaxis and management of native vs prosthetic valve infective endocarditis`);
    } else {
      questions.push(`Recommended cardiovascular risk assessment and primary prevention guidelines`);
      questions.push(`Target blood pressure thresholds in high-risk cardiovascular patients (SPRINT / STEP trials)`);
    }

    return questions;
  }, [activePatient]);

  // --------------------------------------------------------------------------
  // TAB 5: ANTICOAGULATION TOOLS STATE
  // --------------------------------------------------------------------------
  const [fromAnticoag, setFromAnticoag] = useState<string>('vka');
  const [toAnticoag, setToAnticoag] = useState<string>('apixaban');
  const [crclInput, setCrclInput] = useState<number>(65);
  const [selectedDoacForRenal, setSelectedDoacForRenal] = useState<string>('apixaban');

  const conversionResult = useMemo(() => {
    return getConversionInstruction(fromAnticoag, toAnticoag);
  }, [fromAnticoag, toAnticoag]);

  const renalDosingResult = useMemo(() => {
    return getRenalDosing(selectedDoacForRenal, crclInput);
  }, [selectedDoacForRenal, crclInput]);

  // --------------------------------------------------------------------------
  // TAB 6: DRUG INTERACTIONS STATE
  // --------------------------------------------------------------------------
  const [drug1, setDrug1] = useState<string>('amiodarona');
  const [drug2, setDrug2] = useState<string>('bisoprolol');

  const interactionResult = useMemo(() => {
    if (drug1 === drug2) return null;
    return INTERACCIONES.find(
      i => (i.farmacos[0] === drug1 && i.farmacos[1] === drug2) ||
           (i.farmacos[0] === drug2 && i.farmacos[1] === drug1)
    ) || null;
  }, [drug1, drug2]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl border-0 sm:border sm:border-slate-300 w-full max-w-6xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* MODAL HEADER */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 flex items-start sm:items-center justify-between gap-2 bg-slate-50 shrink-0">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-md bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm font-semibold text-slate-900 leading-snug">Centro de Evidencia & Herramientas Clínicas</h2>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium shrink-0">
                  SAC • FAC • OpenEvidence
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Calculadoras indexadas, consensos nacionales oficiales y síntesis de evidencia internacional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Patient Context Dropdown */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-blue-700" />
              <div className="text-left">
                <div className="text-[10px] font-medium text-slate-400 leading-none">Paciente:</div>
                <select
                  value={selectedPatientId || ''}
                  onChange={e => setSelectedPatientId(e.target.value || null)}
                  className="text-xs font-semibold text-slate-800 bg-transparent outline-none cursor-pointer"
                >
                  <option value="">(Modo libre / General)</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.age}a • {p.sex})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition-colors"
              title="Cerrar"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS - Wrapped cleanly on mobile (zero horizontal scroll) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-5 sm:py-0 border-b border-slate-200 bg-slate-50/70 sm:bg-white text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab('calculators')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'calculators'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>Calculadoras ({calculators.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'algorithms'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 shrink-0" />
            <span>Algoritmos ({ALGORITMOS.length})</span>
          </button>

          {/* TAB: EVIDENCIA NACIONAL SAC & FAC */}
          <button
            onClick={() => setActiveTab('national_guidelines')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'national_guidelines'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>SAC & FAC</span>
          </button>

          {/* TAB: OPEN EVIDENCE INTERNACIONAL */}
          <button
            onClick={() => setActiveTab('openevidence')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'openevidence'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>OpenEvidence</span>
          </button>

          <button
            onClick={() => setActiveTab('anticoagulation')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'anticoagulation'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Anticoagulación</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`flex-auto sm:flex-initial justify-center rounded-md sm:rounded-none border sm:border-0 sm:border-b-2 py-1.5 px-2.5 sm:py-2.5 sm:px-3 flex items-center gap-1.5 transition-colors ${
              activeTab === 'interactions'
                ? 'bg-blue-700 text-white border-blue-700 sm:bg-transparent sm:border-blue-700 sm:text-blue-700 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 sm:bg-transparent sm:border-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:hover:bg-transparent'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Interacciones</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 bg-slate-50">
          
          {/* ================================================================= */}
          {/* TAB 1: CALCULADORAS MÉDICAS                                       */}
          {/* ================================================================= */}
          {activeTab === 'calculators' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left sidebar: Calculator Search & List */}
              <div className="lg:col-span-4 space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchCalc}
                    onChange={e => setSearchCalc(e.target.value)}
                    placeholder="Buscar score (ej. CHA2DS2, Wells, GRACE...)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:border-blue-700"
                  />
                </div>

                {/* Categories pills */}
                <div className="flex flex-wrap gap-1.5 pb-1 text-[11px] font-medium">
                  {calcCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCalcCategory(cat)}
                      className={`px-2 py-1 rounded-md whitespace-nowrap transition-colors ${
                        calcCategory === cat
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>

                {/* Calculators Cards List */}
                <div className="space-y-1 max-h-[58vh] overflow-y-auto pr-1">
                  {filteredCalculators.map(c => {
                    const isSelected = c.slug === selectedCalcSlug;
                    return (
                      <button
                        key={c.slug}
                        onClick={() => setSelectedCalcSlug(c.slug)}
                        className={`w-full text-left p-2.5 rounded-md transition-colors border ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-700'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {c.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                            {c.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {c.description}
                        </p>
                      </button>
                    );
                  })}
                  {filteredCalculators.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-md border border-slate-200">
                      No se encontraron calculadoras con ese término.
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel: Active Calculator Form & Results */}
              <div className="lg:col-span-8 space-y-4">
                {selectedCalc ? (
                  <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-5">
                    
                    {/* Calc Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">{selectedCalc.name}</h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                            {selectedCalc.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{selectedCalc.description}</p>
                        {selectedCalc.reference && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                            <span>{selectedCalc.reference}</span>
                          </div>
                        )}
                      </div>

                      {/* Active Patient Indicator */}
                      {activePatient && (
                        <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                          <span>Auto-cargado: <strong>{activePatient.fullName.split(',')[0]}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Inputs Grid */}
                    <div className="space-y-3">
                      {selectedCalc.inputs.map(input => {
                        const isSingleCheckbox = input.type === 'checkbox' && input.options?.length === 1;
                        const singleOpt = isSingleCheckbox ? input.options![0] : null;
                        const isChecked = isSingleCheckbox ? calcValues[input.id] === singleOpt!.id : false;

                        // Case 1: Single checkbox
                        if (isSingleCheckbox && singleOpt) {
                          return (
                            <label
                              key={input.id}
                              className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-blue-50/50 border-blue-700 text-slate-900'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={e => {
                                  setCalcValues(prev => ({
                                    ...prev,
                                    [input.id]: e.target.checked ? singleOpt.id : null
                                  }));
                                }}
                                className="mt-0.5 rounded text-blue-700 focus:ring-blue-700 w-4 h-4 cursor-pointer"
                              />
                              <div className="flex-1 text-xs">
                                <span className="font-medium text-slate-900">{input.label}</span>
                                {input.description && (
                                  <p className="text-[11px] text-slate-500 mt-0.5">{input.description}</p>
                                )}
                              </div>
                              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                +{singleOpt.points} pt
                              </span>
                            </label>
                          );
                        }

                        // Case 2: Radio options (Age brackets, risk tiers, etc.)
                        if (input.type === 'radio' && input.options) {
                          return (
                            <div key={input.id} className="p-3 rounded-md border border-slate-200 bg-slate-50/50 space-y-2">
                              <label className="block text-xs font-semibold text-slate-800">
                                {input.label}
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {input.options.map(opt => {
                                  const isSelected = calcValues[input.id] === opt.id;
                                  return (
                                    <button
                                      type="button"
                                      key={opt.id}
                                      onClick={() => {
                                        setCalcValues(prev => ({ ...prev, [input.id]: opt.id }));
                                      }}
                                      className={`p-2 rounded-md text-xs font-medium text-left border flex items-center justify-between transition-colors ${
                                        isSelected
                                          ? 'bg-blue-700 border-blue-700 text-white'
                                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span>{opt.label}</span>
                                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                        isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        +{opt.points}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        // Case 3: Numeric inputs (e.g. Clearance, QTc, heart rate, blood pressure)
                        if (input.type === 'number') {
                          return (
                            <div key={input.id} className="p-3 rounded-md border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                              <div className="min-w-0 flex-1">
                                <label className="block text-xs font-semibold text-slate-800">
                                  {input.label}
                                </label>
                                {input.description && (
                                  <p className="text-[11px] text-slate-500">{input.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="number"
                                  min={input.min}
                                  max={input.max}
                                  step={input.step || 1}
                                  value={calcValues[input.id] ?? ''}
                                  onChange={e => {
                                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                    setCalcValues(prev => ({ ...prev, [input.id]: val }));
                                  }}
                                  placeholder="0"
                                  className="w-24 px-2.5 py-1 text-xs font-mono font-semibold text-right rounded-md border border-slate-300 bg-white focus:outline-none focus:border-blue-700"
                                />
                                {input.unit && (
                                  <span className="text-xs font-medium text-slate-500 min-w-[36px]">
                                    {input.unit}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>

                    {/* Result Card */}
                    {calculatedResult.interpretation && (
                      <div className={`p-4 rounded-md border transition-all ${
                        calculatedResult.interpretation.color === 'red'
                          ? 'bg-rose-50 border-rose-200 text-rose-900 border-l-4 border-l-rose-600'
                          : calculatedResult.interpretation.color === 'yellow'
                          ? 'bg-amber-50 border-amber-200 text-amber-900 border-l-4 border-l-amber-500'
                          : calculatedResult.interpretation.color === 'green'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 border-l-4 border-l-emerald-600'
                          : 'bg-blue-50 border-blue-200 text-blue-900 border-l-4 border-l-blue-700'
                      }`}>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-2.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono tracking-tight">
                              {calculatedResult.score}
                            </span>
                            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                              Puntos / Score
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              {calculatedResult.interpretation.risk}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 text-xs leading-relaxed font-normal">
                          <strong>Conducta:</strong> {calculatedResult.interpretation.recommendation}
                        </div>

                        {/* Action buttons: Copy & Insert into patient note */}
                        <div className="mt-3 pt-2.5 border-t border-black/10 flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={handleCopyResult}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
                          >
                            {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedResult ? 'Copiado' : 'Copiar Score'}</span>
                          </button>

                          {activePatient && (
                            <button
                              onClick={handleInsertInPatientNotes}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                            >
                              {insertedInNote ? <Check className="w-3.5 h-3.5" /> : <Stethoscope className="w-3.5 h-3.5" />}
                              <span>{insertedInNote ? 'Agregado a la Nota' : `Añadir a Ficha de ${activePatient.fullName.split(',')[0]}`}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-md border border-slate-200">
                    Seleccioná una calculadora de la lista lateral.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: ALGORITMOS DE TRATAMIENTO                                  */}
          {/* ================================================================= */}
          {activeTab === 'algorithms' && (
            <div className="space-y-4">
              
              {/* Algorithm selector pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {ALGORITMOS.map(algo => (
                  <button
                    key={algo.slug}
                    onClick={() => setSelectedAlgoSlug(algo.slug)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                      selectedAlgoSlug === algo.slug
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>{algo.name}</span>
                  </button>
                ))}
              </div>

              {/* Active Algorithm Interactive Engine */}
              <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-4">
                
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-2.5 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{selectedAlgo.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{selectedAlgo.description}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Fuente: {selectedAlgo.source}
                    </span>
                  </div>

                  {algoHistory.length > 1 && (
                    <button
                      onClick={() => setAlgoHistory([selectedAlgo.initialNodeId])}
                      className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar Algoritmo</span>
                    </button>
                  )}
                </div>

                {/* History Breadcrumbs of previous decisions */}
                {algoHistory.length > 1 && (
                  <div className="space-y-1.5 border-l-2 border-blue-200 pl-3 py-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Decisiones Previas:
                    </span>
                    {algoHistory.slice(0, -1).map((nodeId, idx) => {
                      const prevNode = selectedAlgo.nodes[nodeId];
                      const nextNodeId = algoHistory[idx + 1];
                      const chosenOpt = prevNode?.options?.find(o => o.nextId === nextNodeId);

                      return (
                        <div key={nodeId} className="text-xs flex items-center gap-2 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                          <span className="font-medium text-slate-700">{prevNode.title}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                            {chosenOpt?.label || 'Siguiente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Active Node: Question or Final Endpoint */}
                {currentAlgoNode && (
                  <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                    
                    {currentAlgoNode.type === 'question' ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-xs">
                            ?
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                              {currentAlgoNode.title}
                            </h4>
                            {currentAlgoNode.description && (
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {currentAlgoNode.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Question options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {currentAlgoNode.options?.map(opt => (
                            <button
                              key={opt.nextId}
                              onClick={() => setAlgoHistory(prev => [...prev, opt.nextId])}
                              className="p-3 rounded-md text-left font-medium text-xs border border-slate-300 bg-white hover:bg-blue-700 hover:text-white hover:border-blue-700 text-slate-800 shadow-2xs transition-colors flex items-center justify-between group"
                            >
                              <span>{opt.label}</span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Final Endpoint / Recommendation Box
                      <div className={`p-4 rounded-md border space-y-2.5 ${
                        currentAlgoNode.color === 'red'
                          ? 'bg-rose-50 border-rose-200 text-rose-950 border-l-4 border-l-rose-600'
                          : currentAlgoNode.color === 'yellow'
                          ? 'bg-amber-50 border-amber-200 text-amber-950 border-l-4 border-l-amber-500'
                          : currentAlgoNode.color === 'green'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950 border-l-4 border-l-emerald-600'
                          : 'bg-blue-50 border-blue-200 text-blue-950 border-l-4 border-l-blue-700'
                      }`}>
                        <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <span>Conducta: {currentAlgoNode.title}</span>
                        </div>

                        {currentAlgoNode.description && (
                          <p className="text-xs font-normal opacity-90">
                            {currentAlgoNode.description}
                          </p>
                        )}

                        <div className="p-3 rounded bg-white/90 border border-black/10 text-xs font-medium leading-relaxed whitespace-pre-line">
                          {currentAlgoNode.recommendation}
                        </div>

                        {currentAlgoNode.alert && (
                          <div className="p-2 rounded bg-rose-100/80 border border-rose-200 text-rose-900 text-[11px] font-medium flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                            <span>{currentAlgoNode.alert}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: EVIDENCIA NACIONAL (SAC & FAC: GUÍAS, REVISTAS Y PORTALES) */}
          {/* ================================================================= */}
          {activeTab === 'national_guidelines' && (
            <div className="space-y-4">
              
              {/* Header Banner */}
              <div className="bg-slate-900 rounded-md p-4 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm bg-blue-700 text-white font-medium text-[10px] uppercase tracking-wider">
                      Repositorio Científico Nacional
                    </span>
                    <span className="text-xs text-slate-300 font-normal">SAC • RAC • FAC • RFAC</span>
                  </div>
                  <h3 className="text-base font-semibold">Consensos, Revistas y Portales SAC & FAC</h3>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                    Biblioteca integral de cardiología argentina: guías clínicas oficiales, más de 1.300 artículos de las revistas RAC y RFAC indexadas, y accesos directos a los portales oficiales.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                    {NATIONAL_GUIDELINES.length} Consensos
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                    {NATIONAL_ARTICLES.length} Artículos
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                    {OFFICIAL_PORTALS.length} Portales
                  </span>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-slate-100 rounded-md border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setNationalSubSection('guidelines')}
                  className={`flex-auto sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold transition-all ${
                    nationalSubSection === 'guidelines'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 stroke-[1.75] shrink-0" />
                  <span>Consensos & Guías ({NATIONAL_GUIDELINES.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNationalSubSection('journals')}
                  className={`flex-auto sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold transition-all ${
                    nationalSubSection === 'journals'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 stroke-[1.75] shrink-0" />
                  <span>Revistas RAC & FAC ({NATIONAL_ARTICLES.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNationalSubSection('portals')}
                  className={`flex-auto sm:flex-initial justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold transition-all ${
                    nationalSubSection === 'portals'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 stroke-[1.75] shrink-0" />
                  <span>Portales SAC / FAC ({OFFICIAL_PORTALS.length})</span>
                </button>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUB-VIEW 1: GUÍAS & CONSENSOS OFICIALES                       */}
              {/* ------------------------------------------------------------- */}
              {nationalSubSection === 'guidelines' && (
                <div className="space-y-3">
                  {/* Filters Bar */}
                  <div className="bg-white rounded-md p-3 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5">
                    <div className="w-full sm:flex-1 sm:min-w-[240px] relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchGuideline}
                        onChange={e => setSearchGuideline(e.target.value)}
                        placeholder="Buscar consenso (ej. IAMCEST, Shock, FA...)"
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden focus:border-blue-700"
                      />
                    </div>

                    {/* Society Filter */}
                    <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                      <span className="text-slate-500 font-medium text-[11px] shrink-0">Sociedad:</span>
                      <select
                        value={selectedSociety}
                        onChange={e => setSelectedSociety(e.target.value)}
                        className="flex-1 sm:flex-initial py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800"
                      >
                        <option value="all">Todas (SAC & FAC)</option>
                        <option value="SAC">Solo SAC</option>
                        <option value="FAC">Solo FAC</option>
                        <option value="SAC/FAC Conjunto">Conjunto SAC/FAC</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                      <span className="text-slate-500 font-medium text-[11px] shrink-0">Tema:</span>
                      <select
                        value={selectedGuidelineCat}
                        onChange={e => setSelectedGuidelineCat(e.target.value)}
                        className="flex-1 sm:flex-initial py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800"
                      >
                        <option value="all">Todos los temas</option>
                        <option value="Cardiopatía Isquémica & SCA">Cardiopatía Isquémica & SCA</option>
                        <option value="Insuficiencia Cardíaca">Insuficiencia Cardíaca</option>
                        <option value="Arritmias & Dispositivos">Arritmias & Dispositivos</option>
                        <option value="Hipertensión & Prevención">Hipertensión & Prevención</option>
                        <option value="Cuidados Críticos & Shock">Cuidados Críticos & Shock</option>
                        <option value="Valvulopatías & Imágenes">Valvulopatías & Imágenes</option>
                        <option value="Misceláneas & Chagas">Misceláneas & Chagas</option>
                      </select>
                    </div>
                  </div>

                  {/* Guidelines List */}
                  <div className="space-y-2.5">
                    {filteredGuidelines.map(g => {
                      const isExpanded = expandedGuidelineId === g.id;
                      return (
                        <div
                          key={g.id}
                          className="bg-white rounded-md border border-slate-200 overflow-hidden transition-colors hover:border-slate-300 shadow-2xs"
                        >
                          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="min-w-0 w-full sm:flex-1 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-blue-50 text-blue-800 border border-blue-200">
                                  {g.society}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {g.year}
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
                                  {g.category}
                                </span>
                              </div>

                              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                {g.title}
                              </h4>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {g.quickSummary}
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <button
                                onClick={() => setExpandedGuidelineId(isExpanded ? null : g.id)}
                                className="px-3 py-1.5 sm:py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                              >
                                {isExpanded ? 'Ocultar Puntos' : 'Puntos Clave'}
                              </button>

                              {g.pdfUrl && (
                                <a
                                  href={g.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 sm:py-1 rounded-md text-xs font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-2xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>PDF ↗</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Expanded Section with Bulleted Key Points */}
                          {isExpanded && (
                            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
                              {g.keyPoints && g.keyPoints.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                                    Conducta y Puntos Clínicos Clave:
                                  </span>
                                  <ul className="space-y-1">
                                    {g.keyPoints.map((pt, idx) => (
                                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                                        <span>{pt}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {g.markdownContent && (
                                <div className="text-xs text-slate-700 bg-white p-3 rounded-md border border-slate-200 prose prose-slate max-w-none">
                                  <div className="font-normal whitespace-pre-line">
                                    {g.markdownContent}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {filteredGuidelines.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-md border border-slate-200">
                        No se encontraron consensos que coincidan con la búsqueda.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-VIEW 2: REVISTAS & ARTÍCULOS CIENTÍFICOS (RAC & RFAC)     */}
              {/* ------------------------------------------------------------- */}
              {nationalSubSection === 'journals' && (
                <div className="space-y-3">
                  {/* Journal Filters Bar */}
                  <div className="bg-white rounded-md p-3 border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2.5">
                      <div className="w-full sm:flex-1 sm:min-w-[240px] relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={searchJournal}
                          onChange={e => setSearchJournal(e.target.value)}
                          placeholder="Buscar artículo por título o tema..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-hidden focus:border-blue-700"
                        />
                      </div>

                      {/* Source filter: SAC vs FAC */}
                      <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                        <span className="text-slate-500 font-medium text-[11px] shrink-0">Revista:</span>
                        <select
                          value={journalSource}
                          onChange={e => {
                            setJournalSource(e.target.value as any);
                            setJournalLimit(40);
                          }}
                          className="flex-1 sm:flex-initial py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800"
                        >
                          <option value="all">Todas (RAC y RFAC)</option>
                          <option value="sac">Revista Argentina de Cardiología (RAC - SAC)</option>
                          <option value="fac">Revista de la FAC (RFAC)</option>
                        </select>
                      </div>

                      {/* Category filter */}
                      <div className="flex items-center gap-1.5 text-xs w-full sm:w-auto">
                        <span className="text-slate-500 font-medium text-[11px] shrink-0">Sección:</span>
                        <select
                          value={journalCategory}
                          onChange={e => {
                            setJournalCategory(e.target.value);
                            setJournalLimit(40);
                          }}
                          className="flex-1 sm:flex-initial py-1.5 px-2.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800"
                        >
                          <option value="all">Todas las secciones</option>
                          <option value="original">Artículos Originales</option>
                          <option value="revision">Artículos de Revisión</option>
                          <option value="editorial">Editoriales</option>
                          <option value="casos">Casos Clínicos & Cartas Científicas</option>
                          <option value="imagenes">Imágenes en Cardiología</option>
                          <option value="consenso">Consensos en Revista</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>
                        Mostrando <strong className="text-slate-800 font-mono">{filteredArticles.length}</strong> de <strong className="text-slate-800 font-mono">{totalArticleMatches}</strong> publicaciones encontradas
                      </span>
                      {searchJournal && (
                        <button
                          onClick={() => setSearchJournal('')}
                          className="text-blue-700 hover:underline"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Articles List */}
                  <div className="space-y-2 max-h-none sm:max-h-[600px] sm:overflow-y-auto pr-0 sm:pr-1">
                    {filteredArticles.map((art, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-md p-3 border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm border ${
                              art.sourceId === 'sac'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {art.sourceId === 'sac' ? 'RAC (SAC)' : 'Revista FAC'}
                            </span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                              {art.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-full sm:max-w-xs">
                              {art.issueTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {art.link && (
                              <a
                                href={art.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
                              >
                                <span>Ver Artículo</span>
                                <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                              </a>
                            )}
                            {art.pdfLink && (
                              <a
                                href={art.pdfLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded text-[11px] font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Download className="w-3 h-3 stroke-[2]" />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <h5 className="text-xs font-semibold text-slate-900 leading-snug">
                          {art.title}
                        </h5>
                      </div>
                    ))}

                    {filteredArticles.length === 0 && (
                      <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-md border border-slate-200">
                        No se encontraron artículos con los criterios seleccionados.
                      </div>
                    )}

                    {filteredArticles.length < totalArticleMatches && (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => setJournalLimit(prev => prev + 40)}
                          className="px-4 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          Cargar 40 artículos más... (Restan {totalArticleMatches - filteredArticles.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-VIEW 3: PORTALES INSTITUCIONALES SAC & FAC                */}
              {/* ------------------------------------------------------------- */}
              {nationalSubSection === 'portals' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {OFFICIAL_PORTALS.map(portal => (
                      <div
                        key={portal.id}
                        className="bg-white rounded-md p-4 border border-slate-200 hover:border-blue-300 shadow-2xs transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm border ${
                              portal.society === 'SAC'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {portal.society}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              {portal.badge}
                            </span>
                          </div>

                          <h4 className="text-sm font-semibold text-slate-900">
                            {portal.name}
                          </h4>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {portal.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                            {portal.url.replace(/^https?:\/\//, '')}
                          </span>
                          <a
                            href={portal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-2xs"
                          >
                            <span>Ingresar al Sitio</span>
                            <ExternalLink className="w-3 h-3 stroke-[2]" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: EVIDENCIA INTERNACIONAL (OPENEVIDENCE)                     */}
          {/* ================================================================= */}
          {activeTab === 'openevidence' && (
            <div className="space-y-4">
              
              {/* Floating Notice when query is copied / launched */}
              {evidenceNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-md text-xs flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2]" />
                    <span className="font-semibold">{evidenceNotice}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && openEvidenceQuery) {
                        navigator.clipboard.writeText(openEvidenceQuery);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 rounded text-[11px] font-semibold shrink-0 transition-colors shadow-2xs"
                  >
                    Volver a copiar
                  </button>
                </div>
              )}

              {/* Banner OpenEvidence */}
              <div className="bg-slate-900 border border-slate-800 rounded-md p-4 text-white shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-blue-300 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <span>OpenEvidence Intelligence</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                          Sin Restricciones ni Paywalls
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Motor de IA clínica que sintetiza guías internacionales (ESC, ACC, AHA) y ensayos (NEJM, Lancet, JACC)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => launchOpenEvidence(openEvidenceQuery || 'ESC Cardiology Guidelines 2024', 'openevidence')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    <span>Ir a OpenEvidence</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                </div>

                {/* Direct Search Input */}
                <div className="pt-1 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800/90 p-2 sm:p-1.5 rounded-md border border-slate-700">
                    <div className="flex items-center flex-1 min-w-0">
                      <Search className="w-4 h-4 text-slate-400 ml-1.5 sm:ml-2 shrink-0 stroke-[1.75]" />
                      <input
                        type="text"
                        value={openEvidenceQuery}
                        onChange={e => setOpenEvidenceQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') launchOpenEvidence(openEvidenceQuery, 'openevidence');
                        }}
                        placeholder="Escribí tu pregunta clínica (ej: 'DAPT ESC 2024')..."
                        className="flex-1 min-w-0 bg-transparent border-0 text-white placeholder-slate-400 text-xs font-medium focus:outline-hidden px-2 py-1"
                      />
                    </div>
                    <button
                      onClick={() => launchOpenEvidence(openEvidenceQuery, 'openevidence')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
                      title="Copia la pregunta al portapapeles y abre OpenEvidence"
                    >
                      <span>Consultar en OpenEvidence</span>
                      <Send className="w-3.5 h-3.5 stroke-[1.75]" />
                    </button>
                  </div>

                  {/* Secondary Direct Engines */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <span className="font-medium text-slate-400">O buscar directamente con parámetros en:</span>
                    <button
                      onClick={() => launchOpenEvidence(openEvidenceQuery || 'cardiology guidelines', 'pubmed')}
                      className="px-2.5 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      <span>PubMed (NCBI)</span>
                    </button>
                    <button
                      onClick={() => launchOpenEvidence(openEvidenceQuery || 'cardiology guidelines', 'consensus')}
                      className="px-2.5 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      <span>Consensus AI</span>
                    </button>
                    <button
                      onClick={() => launchOpenEvidence(openEvidenceQuery || 'cardiology guidelines', 'scholar')}
                      className="px-2.5 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      <span>Google Scholar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contextual Patient Evidence Prompts (If active patient) */}
              {activePatient && (
                <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 flex items-center gap-2 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-blue-700 stroke-[1.75] shrink-0" />
                      <span>Consultas sugeridas para <strong>{activePatient.fullName}</strong> ({activePatient.diagnosis})</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200 shrink-0">
                      Copia automática y apertura segura
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {patientContextQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-md border border-slate-200 bg-slate-50/70 hover:border-blue-300 text-left transition-all flex flex-col justify-between space-y-2.5"
                      >
                        <p className="text-xs font-medium text-slate-800 leading-snug">
                          {q}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                          <button
                            onClick={() => launchOpenEvidence(q, 'openevidence')}
                            className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                          >
                            <span>OpenEvidence</span>
                            <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                          </button>
                          <div className="flex items-center gap-2 text-slate-500">
                            <button
                              onClick={() => launchOpenEvidence(q, 'pubmed')}
                              className="hover:text-slate-800 underline decoration-slate-300 text-[10px]"
                              title="Buscar en PubMed"
                            >
                              PubMed
                            </button>
                            <button
                              onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                                  navigator.clipboard.writeText(q);
                                  setEvidenceNotice(`Pregunta copiada: "${q.slice(0, 35)}..."`);
                                  setTimeout(() => setEvidenceNotice(null), 4000);
                                }
                              }}
                              className="hover:text-slate-800 p-0.5 rounded hover:bg-slate-200 transition-colors"
                              title="Copiar texto"
                            >
                              <Copy className="w-3 h-3 stroke-[1.75]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated International Topics */}
              <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Temas y Controversias Internacionales Más Frecuentes</h4>
                  <p className="text-xs text-slate-500">
                    Consultá al instante la evidencia de guías de la Sociedad Europea de Cardiología (ESC) y del American College of Cardiology (ACC).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Item 1 */}
                  <div 
                    className="p-3 rounded-md border border-slate-200 hover:border-blue-300 bg-white transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 block mb-0.5">Cardiopatía Isquémica</span>
                      <strong className="text-slate-900 font-semibold">Duración de DAPT en Alto Riesgo de Sangrado (HBR)</strong>
                      <p className="text-[11px] text-slate-500 mt-1">¿Cuándo desescalar a monoterapia con P2Y12 a 1 o 3 meses tras angioplastia coronaria?</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => launchOpenEvidence('DAPT duration in high bleeding risk after drug-eluting stents according to 2024 ESC guidelines', 'openevidence')}
                        className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>OpenEvidence</span>
                        <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => launchOpenEvidence('DAPT duration in high bleeding risk ESC guidelines', 'pubmed')}
                        className="text-slate-500 hover:text-slate-800 text-[10px] underline decoration-slate-300"
                      >
                        PubMed
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div 
                    className="p-3 rounded-md border border-slate-200 hover:border-blue-300 bg-white transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 block mb-0.5">Insuficiencia Cardíaca</span>
                      <strong className="text-slate-900 font-semibold">iSGLT2 y Semaglutida en ICFEp (STEP-HFpEF)</strong>
                      <p className="text-[11px] text-slate-500 mt-1">Evidencia clínica en pacientes obesos con IC y FEVI preservada.</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => launchOpenEvidence('SGLT2 inhibitors and GLP-1 agonists in heart failure with preserved ejection fraction STEP-HFpEF trial', 'openevidence')}
                        className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>OpenEvidence</span>
                        <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => launchOpenEvidence('STEP-HFpEF trial heart failure preserved ejection fraction', 'pubmed')}
                        className="text-slate-500 hover:text-slate-800 text-[10px] underline decoration-slate-300"
                      >
                        PubMed
                      </button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div 
                    className="p-3 rounded-md border border-slate-200 hover:border-blue-300 bg-white transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 block mb-0.5">Arritmias</span>
                      <strong className="text-slate-900 font-semibold">Ablación vs Fármacos Antiarrítmicos en FA</strong>
                      <p className="text-[11px] text-slate-500 mt-1">Indicación de primera línea según guías internacionales y reducción de recurrencias.</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => launchOpenEvidence('Catheter ablation vs antiarrhythmic drugs as first-line therapy for symptomatic atrial fibrillation', 'openevidence')}
                        className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>OpenEvidence</span>
                        <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => launchOpenEvidence('Catheter ablation vs antiarrhythmic drugs first-line atrial fibrillation', 'pubmed')}
                        className="text-slate-500 hover:text-slate-800 text-[10px] underline decoration-slate-300"
                      >
                        PubMed
                      </button>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div 
                    className="p-3 rounded-md border border-slate-200 hover:border-blue-300 bg-white transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-700 block mb-0.5">Shock & UCO</span>
                      <strong className="text-slate-900 font-semibold">Soporte Mecánico en Shock Cardiogénico (DanGer Shock)</strong>
                      <p className="text-[11px] text-slate-500 mt-1">Impacto en mortalidad de la asistencia microaxial (Impella) vs balón intraaórtico.</p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => launchOpenEvidence('Mechanical circulatory support with Impella vs IABP in cardiogenic shock complicating acute myocardial infarction DanGer Shock trial', 'openevidence')}
                        className="font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>OpenEvidence</span>
                        <ExternalLink className="w-3 h-3 stroke-[1.75]" />
                      </button>
                      <button
                        onClick={() => launchOpenEvidence('DanGer Shock trial Impella cardiogenic shock', 'pubmed')}
                        className="text-slate-500 hover:text-slate-800 text-[10px] underline decoration-slate-300"
                      >
                        PubMed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: ROTACIÓN & DOSIS DE ANTICOAGULANTES                        */}
          {/* ================================================================= */}
          {activeTab === 'anticoagulation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Column: Anticoagulant Switcher */}
              <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-700 stroke-[1.75]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Conversor y Rotación de Anticoagulación</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transición segura entre AVK (Acenocumarol/Warfarina), DOACs y Heparinas.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Fármaco Actual (Suspender):</label>
                    <select
                      value={fromAnticoag}
                      onChange={e => setFromAnticoag(e.target.value)}
                      className="w-full p-2 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                    >
                      {ANTICOAGULANTES.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Fármaco Nuevo (Iniciar):</label>
                    <select
                      value={toAnticoag}
                      onChange={e => setToAnticoag(e.target.value)}
                      className="w-full p-2 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                    >
                      {ANTICOAGULANTES.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversion Instructions Card */}
                {conversionResult ? (
                  <div className="p-3.5 rounded-md bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                    <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[1.75]" />
                      <span>Instrucción de Transición:</span>
                    </span>
                    <p className="text-xs font-medium text-emerald-950 leading-relaxed">
                      {conversionResult.instruction}
                    </p>

                    {conversionResult.warnings.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-emerald-200/60">
                        {conversionResult.warnings.map((warn, i) => (
                          <div key={i} className="text-[11px] font-medium text-emerald-900 flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5 stroke-[1.75]" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    Seleccioná dos fármacos distintos para ver las reglas de transición.
                  </div>
                )}
              </div>

              {/* Right Column: Renal Dosing of DOACs */}
              <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-700 stroke-[1.75]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Ajuste Renal de DOACs por CrCl</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dosis recomendadas en función del Clearance de Creatinina (Cockcroft-Gault).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Anticoagulante Directo (DOAC):</label>
                    <select
                      value={selectedDoacForRenal}
                      onChange={e => setSelectedDoacForRenal(e.target.value)}
                      className="w-full p-2 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                    >
                      <option value="apixaban">Apixabán (Eliquis)</option>
                      <option value="rivaroxaban">Rivaroxabán (Xarelto)</option>
                      <option value="dabigatran">Dabigatrán (Pradaxa)</option>
                      <option value="edoxaban">Edoxabán (Lixiana)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Clearance Cr (mL/min):</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={5}
                        max={160}
                        value={crclInput}
                        onChange={e => setCrclInput(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 text-xs font-mono tabular-nums font-semibold text-right rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                      />
                      <span className="text-xs font-medium text-slate-400">mL/min</span>
                    </div>
                  </div>
                </div>

                {/* Dosing Recommendation Card */}
                {renalDosingResult ? (
                  <div className={`p-3 rounded-md border space-y-1.5 ${
                    renalDosingResult.dose === 'No recomendado'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-blue-50/60 border-blue-200 text-blue-950'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dosis Ajustada:</span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-900 shadow-xs">
                        {renalDosingResult.dose}
                      </span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">
                      {renalDosingResult.note}
                    </p>
                  </div>
                ) : null}

                {/* Quick Reference Table */}
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
                  <span className="font-semibold text-slate-800 block">Regla de Apixabán (Criterios ABC):</span>
                  <p>Reducir a 2.5 mg c/12h si cumple al menos 2 de los 3 criterios:</p>
                  <ul className="list-disc list-inside space-y-0.5 font-medium pl-1 text-slate-600">
                    <li>Edad ≥ 80 años</li>
                    <li>Peso ≤ 60 kg</li>
                    <li>Creatinina sérica ≥ 1.5 mg/dL</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: INTERACCIONES FÁRMACO-CARDIOVASCULARES                      */}
          {/* ================================================================= */}
          {activeTab === 'interactions' && (
            <div className="bg-white rounded-md p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-amber-700 stroke-[1.75]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Verificador de Interacciones Farmacológicas Críticas</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Alertas de seguridad para combinaciones de alto riesgo en guardia y UCO.
                </p>
              </div>

              {/* Selector of 2 drugs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Primer Fármaco:</label>
                  <select
                    value={drug1}
                    onChange={e => setDrug1(e.target.value)}
                    className="w-full p-2 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                  >
                    {FARMACOS.map(f => (
                      <option key={f.id} value={f.id}>{f.nombre} ({f.grupo})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Segundo Fármaco:</label>
                  <select
                    value={drug2}
                    onChange={e => setDrug2(e.target.value)}
                    className="w-full p-2 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
                  >
                    {FARMACOS.map(f => (
                      <option key={f.id} value={f.id}>{f.nombre} ({f.grupo})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interaction Details or Safe Result */}
              {interactionResult ? (
                <div className={`p-3.5 rounded-md border space-y-2.5 ${
                  interactionResult.severidad === 'contraindicado'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : interactionResult.severidad === 'mayor'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Severidad de Interacción:</span>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm ${
                      interactionResult.severidad === 'contraindicado'
                        ? 'bg-rose-700 text-white'
                        : interactionResult.severidad === 'mayor'
                        ? 'bg-amber-700 text-white'
                        : 'bg-blue-700 text-white'
                    }`}>
                      {interactionResult.severidad}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 pt-1">
                    <div>
                      <strong className="block text-slate-900 font-semibold">Efecto Clínico:</strong>
                      <p className="mt-0.5 text-slate-700">{interactionResult.efecto_clinico}</p>
                    </div>

                    <div>
                      <strong className="block text-slate-900 font-semibold">Mecanismo:</strong>
                      <p className="mt-0.5 text-slate-700">{interactionResult.mecanismo}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70">
                      <strong className="block text-slate-900 font-semibold">Manejo Sugerido:</strong>
                      <p className="mt-0.5 font-medium text-slate-900">{interactionResult.manejo}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-md bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 mx-auto stroke-[1.75]" />
                  <p className="text-xs font-semibold">Sin interacciones críticas registradas en la biblioteca offline para esta combinación.</p>
                  <p className="text-[11px] text-emerald-800">Verificar siempre la función renal y electrolitos basales del paciente.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="px-4 py-3 sm:px-5 border-t border-slate-200 bg-white flex items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <span className="font-mono text-[11px] text-slate-400 truncate min-w-0">CardioGuardia v8 • SAC • FAC • OpenEvidence</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors shadow-xs shrink-0"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
