
import React, { useState, useMemo } from 'react';
import { OPTICS, CABLES } from '../data/catalog';
import { 
  Search, 
  Filter, 
  Cable as CableIcon, 
  Box, 
  Eye, 
  Network, 
  RotateCcw, 
  Info, 
  FileJson, 
  Ruler,
  Plus,
  Check,
  X,
  Zap,
  ChevronRight,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { AppNavigationParams, Optic, Cable, Page, LearnPageTab } from '../types';
import { normalizeCatalog, filterCatalog, getUniqueFormFactors } from '../features/catalog/lib/query';
import { buildBOMItemId, useBOM } from '../context/BOMContext';

interface OpticsCatalogProps {
    onNavigate: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
}

const OpticsCatalog: React.FC<OpticsCatalogProps> = ({ onNavigate }) => {
  const { addToBOM, bom } = useBOM();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({ speed: '', reach: '', fiber: '' });

  // 1. Prepare Data (Memoized domain call)
  const allItems = useMemo(() => normalizeCatalog(OPTICS, CABLES), []);

  // 2. Execute Business Logic (Memoized domain call)
  const filtered = useMemo(() => {
    return filterCatalog(allItems, {
      searchTerm,
      typeFilter,
      categoryFilter
    });
  }, [allItems, searchTerm, typeFilter, categoryFilter]);

  // 3. Derived UI State
  const uniqueFormFactors = useMemo(() => getUniqueFormFactors(allItems), [allItems]);
  const types = ['ALL', ...uniqueFormFactors];

  const resetFilters = () => {
      setSearchTerm('');
      setTypeFilter('ALL');
      setCategoryFilter('ALL');
  };

  const toggleCompare = (sku: string) => {
    setCompareList(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku].slice(-3)
    );
  };

  const handleWizardSelect = (field: string, value: string) => {
    const newData = { ...wizardData, [field]: value };
    setWizardData(newData);
    if (field === 'fiber') {
      // Final step
      setSearchTerm(`${newData.speed} ${newData.reach} ${newData.fiber}`);
      setIsWizardOpen(false);
      setWizardStep(0);
    } else {
      setWizardStep(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Part Finder</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Search the normalized optics and cable catalog.</p>
        </div>
        <button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Zap size={16} /> Design Wizard
        </button>
      </div>

      {/* Comparison Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-slide-up">
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-4 shadow-2xl border border-white/10 flex items-center justify-between gap-6 backdrop-blur-xl">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-blue-600 rounded-xl"><BarChart3 size={20} /></div>
              <div className="flex -space-x-3">
                {compareList.map(sku => (
                  <div key={sku} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black overflow-hidden relative group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => toggleCompare(sku)}>
                      <X size={12} />
                    </div>
                    {sku.split('-')[1] || sku.substring(0, 4)}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400">{compareList.length}/3 items selected</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCompareList([])} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Clear</button>
              <button 
                className="px-6 py-2 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // In a real app, this would navigate to a comparison page
                  alert(`Comparing: ${compareList.join(', ')}`);
                }}
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Overlay */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsWizardOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 animate-fade-in">
            <button onClick={() => setIsWizardOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={24} /></button>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
                  <Zap size={14} /> Step {wizardStep + 1} of 3
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  {wizardStep === 0 && "Select Speed"}
                  {wizardStep === 1 && "Select Distance"}
                  {wizardStep === 2 && "Select Fiber Type"}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {wizardStep === 0 && ['100G', '400G', '800G'].map(v => (
                  <button key={v} onClick={() => handleWizardSelect('speed', v)} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{v}</span>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
                {wizardStep === 1 && ['100m (SR)', '500m (DR)', '2km (FR)', '10km (LR)'].map(v => (
                  <button key={v} onClick={() => handleWizardSelect('reach', v)} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{v}</span>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
                {wizardStep === 2 && ['SMF (Single Mode)', 'MMF (Multi Mode)'].map(v => (
                  <button key={v} onClick={() => handleWizardSelect('fiber', v.split(' ')[0])} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                    <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{v}</span>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </button>
                ))}
              </div>

              {wizardStep > 0 && (
                <button onClick={() => setWizardStep(prev => prev - 1)} className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRight className="rotate-180" size={14} /> Back to previous step
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white/80 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 sticky top-0 z-20 backdrop-blur-md shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by SKU (e.g. OSFP-400G-DR4, CAB-O-2Q)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
        
        {/* Category Filter */}
        <div className="relative w-full md:w-48">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                {categoryFilter === 'ALL' ? <Box size={18} /> : 
                 categoryFilter === 'OPTICS' ? <Eye size={18} /> : <CableIcon size={18} />}
            </div>
            <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
                <option value="ALL">All Categories</option>
                <option value="OPTICS">Optics Only</option>
                <option value="CABLES">Cables (DAC/AOC)</option>
            </select>
        </div>

        {/* Form Factor Filter */}
        <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
            <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
            >
                {types.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Form Factors' : t}</option>)}
            </select>
        </div>

        {(searchTerm || typeFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button 
                onClick={resetFilters}
                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                title="Reset Filters"
            >
                <RotateCcw size={18} />
            </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isOptic = item.catalogType === 'OPTIC';
          const optic = item as Optic;
          const cable = item as Cable;
          
          const speed = item.speed;
          const formFactor = isOptic ? optic.formFactor : cable.formFactorSource;
          const media = isOptic ? optic.media : cable.type;
          const connector = isOptic ? optic.connector : (cable.isBreakout ? 'Breakout' : 'Integrated');
          const isBreakout = isOptic ? (optic.breakoutModeIds.length > 0) : cable.isBreakout;

          return (
            <div key={item.sku} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col shadow-sm">
              
              {/* Card Header */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider aom-mono ${
                    speed.includes('400G') || speed.includes('800G')
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {speed}
                  </div>
                  <span className="text-xs text-slate-500 font-bold aom-mono">{formFactor}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 aom-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words">
                  {item.sku}
                </h3>
                {!isOptic && cable.skuPrecision === 'family-length-variable' && (
                  <div className="mb-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                    Family SKU, length suffix deferred
                  </div>
                )}
                
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                  {item.description}
                </p>
                
                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div className="flex flex-col">
                      <span className="aom-text-sub mb-0.5 uppercase text-[9px] font-bold tracking-tight">Media Type</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <CableIcon size={12} className={media === 'SMF' ? 'text-yellow-600 dark:text-yellow-500' : 'text-fuchsia-600 dark:text-fuchsia-500'} />
                          {media}
                      </span>
                  </div>
                  <div className="flex flex-col">
                      <span className="aom-text-sub mb-0.5 uppercase text-[9px] font-bold tracking-tight">Connector</span>
                      <span className={`font-medium aom-mono ${connector.includes('APC') ? 'text-green-600 dark:text-green-400' : connector.includes('UPC') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {connector}
                      </span>
                  </div>
                  <div className="flex flex-col">
                      <span className="aom-text-sub mb-0.5 uppercase text-[9px] font-bold tracking-tight">Reach</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium aom-mono">{isOptic ? optic.reach : cable.lengthOptions.join(', ')}</span>
                  </div>
                  {isBreakout && (
                      <div className="flex flex-col">
                          <span className="aom-text-sub mb-0.5 uppercase text-[9px] font-bold tracking-tight">Features</span>
                          <span className="text-orange-600 dark:text-orange-300 font-medium flex items-center gap-1">
                              <Network size={12}/> Breakout
                          </span>
                      </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                <div className="flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  <p>
                    {isOptic 
                      ? `Wavelength: ${optic.wavelength} | Power: ${optic.powerTypical}W typ / ${optic.powerMax}W max`
                      : `Cable Type: ${cable.type} | Dest FF: ${cable.formFactorDest}${cable.skuPrecision === 'family-length-variable' ? ' | Base family SKU' : ''}`
                    }
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {isOptic && onNavigate && (
                    <>
                      <button 
                        onClick={() => onNavigate(Page.LINK_BUDGET, undefined, undefined, { budget: optic.lossBudget, fiberType: optic.media as 'SMF' | 'MMF' })}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <Ruler size={14} />
                        Link Budget
                      </button>
                      <button 
                        onClick={() => onNavigate(Page.INTERACTIVE_DATASHEETS, undefined, item.sku)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                      >
                        <FileJson size={14} />
                        Datasheet
                      </button>
                      <button 
                        onClick={() => toggleCompare(item.sku)}
                        className={`p-2 rounded-lg border transition-all ${
                          compareList.includes(item.sku)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 hover:border-blue-500/50'
                        }`}
                        title="Add to Compare"
                      >
                        {compareList.includes(item.sku) ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                      <button 
                        onClick={() => addToBOM({
                          id: buildBOMItemId({
                            sku: item.sku,
                            category: item.catalogType,
                          }),
                          sku: item.sku,
                          quantity: 1,
                          description: item.description,
                          category: item.catalogType,
                          sourceFeature: 'part-finder',
                        })}
                        className={`p-2 rounded-lg border transition-all ${
                          bom.some(i => i.sku === item.sku)
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-green-600 hover:border-green-500/50'
                        }`}
                        title="Add to Project BOM"
                      >
                        {bom.some(i => i.sku === item.sku) ? <Check size={14} /> : <Plus size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-600">
          <Box size={48} className="mb-4 opacity-50" />
          <p className="text-lg">No parts found matching your criteria.</p>
          <button onClick={resetFilters} className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2">Clear filters</button>
        </div>
      )}
    </div>
  );
};

export default OpticsCatalog;
