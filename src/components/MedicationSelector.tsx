import React, { useState } from 'react';
import { CARDIOLOGY_MEDICATIONS, MedicationItem } from '../data/cardioLibrary';
import { Search, X, Check, Plus, Zap, Pill } from 'lucide-react';

interface MedicationSelectorProps {
  selectedMedications: string[];
  onChange: (medications: string[]) => void;
}

export const MedicationSelector: React.FC<MedicationSelectorProps> = ({
  selectedMedications,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customDrugName, setCustomDrugName] = useState('');
  const [customDose, setCustomDose] = useState('');

  // Helper to split a medication string into drug name and prescribed dose
  const parseMed = (m: string) => {
    if (m.includes(' • ')) {
      const [name, ...rest] = m.split(' • ');
      return { name: name.trim(), dose: rest.join(' • ').trim() };
    }
    if (m.includes(': ')) {
      const [name, ...rest] = m.split(': ');
      return { name: name.trim(), dose: rest.join(': ').trim() };
    }
    return { name: m.trim(), dose: '' };
  };

  // Find medication item in library to retrieve presets & metadata
  const findCatalogItem = (drugName: string): MedicationItem | undefined => {
    for (const cat of CARDIOLOGY_MEDICATIONS) {
      const found = cat.items.find(
        i => i.name.toLowerCase() === drugName.toLowerCase() || drugName.toLowerCase().startsWith(i.name.toLowerCase())
      );
      if (found) return found;
    }
    return undefined;
  };

  const handleToggle = (item: MedicationItem) => {
    const isAlreadySelected = selectedMedications.some(m => {
      const { name } = parseMed(m);
      return name.toLowerCase() === item.name.toLowerCase() || m.startsWith(item.name);
    });

    if (isAlreadySelected) {
      onChange(
        selectedMedications.filter(m => {
          const { name } = parseMed(m);
          return name.toLowerCase() !== item.name.toLowerCase() && !m.startsWith(item.name);
        })
      );
    } else {
      const defaultDose = item.dosePresets?.[0] || (item.commonDose ? item.commonDose.split('(')[0].trim() : '');
      const formatted = defaultDose ? `${item.name} • ${defaultDose}` : item.name;
      onChange([...selectedMedications, formatted]);
    }
  };

  const handleUpdateDose = (index: number, newDose: string) => {
    const updated = [...selectedMedications];
    const { name } = parseMed(updated[index]);
    updated[index] = newDose.trim() ? `${name} • ${newDose.trim()}` : name;
    onChange(updated);
  };

  const handleRemoveIndex = (index: number) => {
    onChange(selectedMedications.filter((_, i) => i !== index));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrugName.trim()) return;
    const formatted = customDose.trim()
      ? `${customDrugName.trim()} • ${customDose.trim()}`
      : customDrugName.trim();
    
    onChange([...selectedMedications, formatted]);
    setCustomDrugName('');
    setCustomDose('');
  };

  const filteredCategories = CARDIOLOGY_MEDICATIONS.filter(cat => {
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
            placeholder="Buscar fármaco (ej. noradrenalina, furosemida, sacubitrilo, carvedilol...)"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700"
          />
        </div>

        <form onSubmit={handleAddCustom} className="flex gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          <input
            type="text"
            value={customDrugName}
            onChange={e => setCustomDrugName(e.target.value)}
            placeholder="Fármaco..."
            className="px-3 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 w-36"
          />
          <input
            type="text"
            value={customDose}
            onChange={e => setCustomDose(e.target.value)}
            placeholder="Dosis / Goteo..."
            className="px-2.5 py-1.5 text-xs rounded-md border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-700 w-28"
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
          Todas las Familias
        </button>
        {CARDIOLOGY_MEDICATIONS.map(cat => (
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

      {/* Selected Medications: Interactive Cards with Dosage & Preset Controls */}
      {selectedMedications.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-blue-700" />
              <span>Medicación Prescripta y Dosificación ({selectedMedications.length}):</span>
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-medium"
            >
              Limpiar selección
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedMedications.map((medStr, idx) => {
              const { name, dose } = parseMed(medStr);
              const catalogItem = findCatalogItem(name);
              const presets = catalogItem?.dosePresets || [];

              return (
                <div
                  key={idx}
                  className="bg-white rounded-md p-2.5 border border-slate-200 flex flex-col justify-between space-y-1.5"
                >
                  {/* Drug Name & Remove */}
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {catalogItem?.isInfusion ? (
                        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <Pill className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-800 truncate" title={name}>
                        {name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveIndex(idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title="Quitar fármaco"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity / Dosage Input */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-slate-500 shrink-0">
                        Dosis:
                      </span>
                      <input
                        type="text"
                        value={dose}
                        onChange={e => handleUpdateDose(idx, e.target.value)}
                        placeholder="Ej. 5 mg/día, 0.1 mcg/kg/min..."
                        className="w-full px-2 py-0.5 text-xs rounded border border-slate-300 bg-white text-slate-900 focus:border-blue-700 outline-none"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    {presets.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-slate-400">Sugerida:</span>
                        {presets.map((preset, pIdx) => {
                          const isCurrent = dose.toLowerCase() === preset.toLowerCase();
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => handleUpdateDose(idx, preset)}
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors ${
                                isCurrent
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorized Drug Catalog */}
      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredCategories.map(cat => {
          const matchingItems = cat.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.commonDose && item.commonDose.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          if (matchingItems.length === 0) return null;

          return (
            <div key={cat.category} className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">
                {cat.category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchingItems.map(item => {
                  const isSelected = selectedMedications.some(m => {
                    const { name } = parseMed(m);
                    return name.toLowerCase() === item.name.toLowerCase() || m.startsWith(item.name);
                  });

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggle(item)}
                      title={item.commonDose ? `Dosis habitual: ${item.commonDose}` : undefined}
                      className={`text-xs px-2.5 py-1 rounded-md border text-left font-medium transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                      {item.isInfusion && <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                      <span>{item.name}</span>
                      {item.commonDose && !isSelected && (
                        <span className="text-[10px] opacity-75 font-mono text-slate-400">
                          ({item.commonDose.split('(')[0].trim()})
                        </span>
                      )}
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
