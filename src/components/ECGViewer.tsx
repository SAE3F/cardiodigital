import React, { useState } from 'react';
import { ECGRecord } from '../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Columns, 
  SunMoon, 
  Eye
} from 'lucide-react';

interface ECGViewerProps {
  ecgs: ECGRecord[];
  initialEcgId?: string;
  onClose?: () => void;
}

export const ECGViewer: React.FC<ECGViewerProps> = ({ ecgs, initialEcgId }) => {
  const [selectedEcgIndex, setSelectedEcgIndex] = useState<number>(() => {
    if (!initialEcgId || ecgs.length === 0) return 0;
    const idx = ecgs.findIndex(e => e.id === initialEcgId);
    return idx >= 0 ? idx : 0;
  });

  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [compareEcgIndex, setCompareEcgIndex] = useState<number>(() => {
    return ecgs.length > 1 ? 1 : 0;
  });

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [invertContrast, setInvertContrast] = useState<boolean>(false);

  if (ecgs.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-md border border-dashed border-slate-300">
        No hay electrocardiogramas cargados para este paciente.
      </div>
    );
  }

  const currentEcg = ecgs[selectedEcgIndex];
  const compareEcg = ecgs[compareEcgIndex];

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col bg-white text-slate-900 rounded-md overflow-hidden border border-slate-200 shadow-xs">
      {/* Top Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* ECG selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-700 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 stroke-[1.75]" /> ECG Activo:
          </span>
          <select
            value={selectedEcgIndex}
            onChange={e => setSelectedEcgIndex(Number(e.target.value))}
            className="bg-white text-slate-800 border border-slate-300 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-700 outline-none font-medium"
          >
            {ecgs.map((e, idx) => (
              <option key={e.id} value={idx}>
                {e.date} {e.time} - {e.title}
              </option>
            ))}
          </select>

          {ecgs.length > 1 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                compareMode
                  ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Comparar con otro ECG</span>
            </button>
          )}

          {compareMode && ecgs.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">vs:</span>
              <select
                value={compareEcgIndex}
                onChange={e => setCompareEcgIndex(Number(e.target.value))}
                className="bg-white text-slate-800 border border-slate-300 rounded-md px-2 py-1 text-xs outline-none font-medium"
              >
                {ecgs.map((e, idx) => (
                  <option key={e.id} value={idx} disabled={idx === selectedEcgIndex}>
                    {e.date} {e.time} - {e.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Zoom & Contrast buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            title="Alejar (-)"
            className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
          <span className="text-[11px] font-mono tabular-nums px-1.5 text-slate-600 font-semibold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            title="Acercar (+)"
            className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Restablecer Zoom"
            className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 ml-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
          <button
            onClick={() => setInvertContrast(!invertContrast)}
            title="Invertir contraste (Modo Sala Oscura)"
            className={`p-1 rounded-md border ml-2 transition-colors ${
              invertContrast
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <SunMoon className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* Viewer Canvas Area */}
      <div className={`p-3 overflow-auto max-h-[500px] min-h-[280px] bg-slate-100/70 ${invertContrast ? 'filter invert hue-rotate-180' : ''}`}>
        {compareMode && ecgs.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Primary ECG */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-100 text-slate-800 px-3 py-1 text-xs font-semibold flex items-center justify-between border-b border-slate-200">
                <span>{currentEcg.title}</span>
                <span className="text-slate-500 font-mono text-[11px]">{currentEcg.date} {currentEcg.time}</span>
              </div>
              <div className="overflow-auto max-h-[360px] p-2 flex items-center justify-center">
                <img
                  src={currentEcg.imageUrl}
                  alt={currentEcg.title}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                  className="transition-transform duration-100 max-w-none"
                />
              </div>
              {currentEcg.notes && (
                <div className="p-2.5 bg-slate-50 text-slate-700 text-xs border-t border-slate-200 font-medium">
                  <span className="font-semibold text-slate-900">Informe:</span> {currentEcg.notes}
                </div>
              )}
            </div>

            {/* Comparison ECG */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-100 text-slate-800 px-3 py-1 text-xs font-semibold flex items-center justify-between border-b border-slate-200">
                <span>{compareEcg.title}</span>
                <span className="text-slate-500 font-mono text-[11px]">{compareEcg.date} {compareEcg.time}</span>
              </div>
              <div className="overflow-auto max-h-[360px] p-2 flex items-center justify-center">
                <img
                  src={compareEcg.imageUrl}
                  alt={compareEcg.title}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                  className="transition-transform duration-100 max-w-none"
                />
              </div>
              {compareEcg.notes && (
                <div className="p-2.5 bg-slate-50 text-slate-700 text-xs border-t border-slate-200 font-medium">
                  <span className="font-semibold text-slate-900">Informe:</span> {compareEcg.notes}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="overflow-auto max-w-full rounded-md border border-slate-200 bg-white shadow-xs p-1">
              <img
                src={currentEcg.imageUrl}
                alt={currentEcg.title}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                className="transition-transform duration-100 max-w-none"
              />
            </div>
            {currentEcg.notes && (
              <div className="w-full mt-2.5 px-3 py-2 bg-white rounded-md text-xs text-slate-700 border border-slate-200 shadow-xs font-medium">
                <span className="font-semibold text-blue-700">Informe clínico:</span> {currentEcg.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Technical Calibration Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>Velocidad estándar: 25 mm/s • Voltaje: 10 mm/mV (1 mV = 10 mm)</div>
        <div>Total: {ecgs.length} trazo(s) registrado(s)</div>
      </div>
    </div>
  );
};