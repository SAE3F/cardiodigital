import React, { useState } from 'react';
import { CARDIOLOGY_DIAGNOSES, DiagnosisItem } from '../data/cardioLibrary';
import { Search, X, Check, Plus } from 'lucide-react';

interface DiagnosisSelectorProps {
  selectedDiagnoses: string[];
  onChange: (diagnoses: string[]) => void;
}

export const DiagnosisSelector: React.FC<DiagnosisSelectorProps> = ({
  selectedDiagnoses,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customInput, setCustomInput] = useState('');

  const handleToggle = (diagName: string) => {
    if (selectedDiagnoses.includes(diagName)) {
      onChange(selectedDiagnoses.filter(d => d !== diagName));
    } else {
      onChange([...selectedDiagnoses, diagName]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!selectedDiagnoses.includes(customInput.trim())) {
      onChange([...selectedDiagnoses, customInput.trim()]);
    }
    setCustomInput('');
  };

  const filteredCategories = CARDIOLOGY_DIAGNOSES.filter(cat => {
    if (selectedCategory === 'all') return true;
    return cat.category === selectedCategory;
  });

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
      {/* Search & Custom Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar diagnóstico (ej. IAMCEST, shock, BAV, TAVI, FA...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
          />
        </div>

        <form onSubmit={handleAddCustom} className="flex gap-1.5 shrink-0">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Otro diagnóstico..."
            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 w-44"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </form>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todas las Categorías
        </button>
        {CARDIOLOGY_DIAGNOSES.map(cat => (
          <button
            key={cat.category}
            type="button"
            onClick={() => setSelectedCategory(cat.category)}
            className={`px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors flex items-center gap-1 ${
              selectedCategory === cat.category
                ? 'bg-blue-700 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.category.split('&')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Selected Diagnoses Tag Cloud */}
      {selectedDiagnoses.length > 0 && (
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
          <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
            <span>Diagnósticos Seleccionados ({selectedDiagnoses.length}):</span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-medium"
            >
              Limpiar selección
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedDiagnoses.map((diag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-blue-700 text-white shadow-xs"
              >
                <span>{diag}</span>
                <button
                  type="button"
                  onClick={() => handleToggle(diag)}
                  className="hover:bg-blue-800 p-0.5 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categorized List */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredCategories.map(cat => {
          const matchingItems = cat.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (matchingItems.length === 0) return null;

          return (
            <div key={cat.category} className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">
                {cat.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchingItems.map(item => {
                  const isSelected = selectedDiagnoses.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggle(item.name)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left font-medium transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      {item.isUrgent && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
