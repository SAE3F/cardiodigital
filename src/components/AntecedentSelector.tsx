import React, { useState } from 'react';
import { CARDIOLOGY_ANTECEDENTS, AntecedentItem } from '../data/cardioLibrary';
import { Search, X, Check, Plus, Activity, Heart } from 'lucide-react';

interface AntecedentSelectorProps {
  selectedAntecedents: string[];
  onChange: (antecedents: string[]) => void;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

export const AntecedentSelector: React.FC<AntecedentSelectorProps> = ({
  selectedAntecedents,
  onChange,
  notes,
  onNotesChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customInput, setCustomInput] = useState('');

  const handleToggle = (item: AntecedentItem) => {
    if (selectedAntecedents.includes(item.name)) {
      onChange(selectedAntecedents.filter(a => a !== item.name));
    } else {
      onChange([...selectedAntecedents, item.name]);
    }
  };

  const handleRemove = (name: string) => {
    onChange(selectedAntecedents.filter(a => a !== name));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!selectedAntecedents.includes(customInput.trim())) {
      onChange([...selectedAntecedents, customInput.trim()]);
    }
    setCustomInput('');
  };

  const filteredCategories = CARDIOLOGY_ANTECEDENTS.filter(cat => {
    if (selectedCategory === 'all') return true;
    return cat.category === selectedCategory;
  });

  return (
    <div className="space-y-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-700" />
          <span>Antecedentes Cardiovasculares y Factores de Riesgo (FRCV)</span>
        </label>
        <span className="text-[11px] text-slate-500">Estandarizado para reporte epidemiológico</span>
      </div>

      {/* Search & Custom Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar FRCV o antecedente (ej. HTA, DBT, tabaquismo, IAM, stent, marcapasos...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
          />
        </div>

        <form onSubmit={handleAddCustom} className="flex gap-1.5 shrink-0">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Otro antecedente..."
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

      {/* Category Filter Pills */}
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
          Todos los Grupos
        </button>
        {CARDIOLOGY_ANTECEDENTS.map(cat => (
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
            <span>{cat.category.split('(')[0].trim()}</span>
          </button>
        ))}
      </div>

      {/* Active Selected Antecedents Tag Cloud */}
      {selectedAntecedents.length > 0 && (
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-blue-700" />
              <span>Registrados ({selectedAntecedents.length}):</span>
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-medium"
            >
              Limpiar selección
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedAntecedents.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-blue-700 text-white shadow-xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="hover:bg-blue-800 p-0.5 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categorized List of Antecedents */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredCategories.map(cat => {
          const matchingItems = cat.items.filter(
            item =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.shortName.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (matchingItems.length === 0) return null;

          return (
            <div key={cat.category} className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">
                {cat.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchingItems.map(item => {
                  const isSelected = selectedAntecedents.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggle(item)}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left font-medium transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Free Text Specific Details */}
      {onNotesChange && (
        <div className="pt-1">
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Detalles o aclaraciones adicionales de antecedentes (opcional):
          </label>
          <input
            type="text"
            value={notes || ''}
            onChange={e => onNotesChange(e.target.value)}
            placeholder="Ej. Tabaquismo 30 paq/año, angioplastia con stent CD en 2021..."
            className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-800 outline-none focus:border-blue-700"
          />
        </div>
      )}
    </div>
  );
};
