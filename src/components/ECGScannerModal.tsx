import React, { useState, useRef } from 'react';
import { Patient, ECGRecord } from '../types';
import { useCardio } from '../context/CardioContext';
import { Camera, Upload, X, Check } from 'lucide-react';
import { generateEcgSvgDataUrl } from '../mock/ecgSvgs';

interface ECGScannerModalProps {
  patient: Patient;
  onClose: () => void;
}

export const ECGScannerModal: React.FC<ECGScannerModalProps> = ({ patient, onClose }) => {
  const { addEcg } = useCardio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState<string>('ECG del Día');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [type, setType] = useState<ECGRecord['type']>('control_diario');
  const [notes, setNotes] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseDemoEcg = (pattern: 'stemi' | 'avblock' | 'normal', label: string) => {
    const svgUrl = generateEcgSvgDataUrl(pattern);
    setPreviewImage(svgUrl);
    setTitle(`ECG ${label}`);
  };

  const handleSave = () => {
    if (!previewImage) {
      alert('Por favor toma una foto o selecciona una imagen de ECG');
      return;
    }

    addEcg(patient.id, {
      title,
      date,
      time,
      type,
      imageUrl: previewImage,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-lg max-w-xl w-full border border-slate-300 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              <Camera className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Escanear / Adjuntar ECG
              </h2>
              <p className="text-xs text-slate-500">
                {patient.fullName} • Cama {patient.bedId}
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

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Capture Actions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Origen del Trazo de ECG:
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-3 rounded-md border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 text-blue-700 transition-colors text-xs font-medium gap-1.5"
              >
                <Camera className="w-5 h-5 text-blue-700 stroke-[1.75]" />
                <span>Tomar Foto / Subir Archivo</span>
              </button>

              <div className="flex flex-col gap-1 justify-center">
                <span className="text-[11px] font-medium text-slate-400">O usar trazo clínico de muestra:</span>
                <button
                  type="button"
                  onClick={() => handleUseDemoEcg('stemi', 'IAM ST')}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-left truncate transition-colors"
                >
                  IAM Elevación del ST (IAMCEST)
                </button>
                <button
                  type="button"
                  onClick={() => handleUseDemoEcg('avblock', 'Bloqueo AV')}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-left truncate transition-colors"
                >
                  Bloqueo AV Completo (BAVC)
                </button>
                <button
                  type="button"
                  onClick={() => handleUseDemoEcg('normal', 'Ritmo Sinusal')}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-left truncate transition-colors"
                >
                  Ritmo Sinusal Normal
                </button>
              </div>
            </div>
          </div>

          {/* Preview if uploaded */}
          {previewImage && (
            <div className="rounded-md border border-slate-200 p-2 bg-slate-50">
              <div className="flex items-center justify-between px-1 pb-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Vista previa del papel milimetrado:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-blue-700 font-medium text-[11px]">
                  <input
                    type="checkbox"
                    checked={enhanceContrast}
                    onChange={e => setEnhanceContrast(e.target.checked)}
                    className="rounded-xs text-blue-700"
                  />
                  <span>Filtro de nitidez clínica</span>
                </label>
              </div>
              <div
                className={`overflow-auto max-h-48 rounded-md bg-white border border-slate-200 p-2 ${
                  enhanceContrast ? 'contrast-125 saturate-110' : ''
                }`}
              >
                <img src={previewImage} alt="Preview ECG" className="w-full object-contain" />
              </div>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Título del Electro:
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. ECG Control Matutino"
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo:
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
              >
                <option value="control_diario">Control Diario (Pase)</option>
                <option value="ingreso">ECG de Ingreso</option>
                <option value="post_procedimiento">Post-ATC / Post-TAVI</option>
                <option value="urgencia">Episodio de Dolor / Urgencia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha:
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hora:
              </label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Informe / Hallazgos electrocardiográficos:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. RS 72 lpm, elevación del ST 3mm en V2-V4, inversión simétrica de T..."
              className="w-full p-2 rounded-md border border-slate-300 bg-white text-slate-800 text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-700 focus:border-blue-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!previewImage}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2]" />
            <span>Guardar ECG</span>
          </button>
        </div>
      </div>
    </div>
  );
};