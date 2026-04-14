
import React, { useState, useEffect, useMemo } from 'react';
import { TRANSCEIVERS } from '../features/datasheet/data/transceivers';
import { OPTICS_FAQ_KNOWLEDGE, ARISTA_800G_OPTICS } from '../data/opticsFAQ';
import { 
  FileJson, 
  Cpu, 
  Zap, 
  Activity, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Search,
  Cable,
  Eye,
  Info,
  HelpCircle,
  Thermometer,
  Terminal
} from 'lucide-react';
import { TransceiverType } from '../types';
import { checkEosCompatibility } from '../features/datasheet/lib/rules';
import { simulatePowerCurve, normalizeForChart } from '../features/datasheet/lib/thermal';

// Sub-component: Presentation Logic for Chart
interface PowerChartProps {
  speed: string;
}

const PowerChart: React.FC<PowerChartProps> = ({ speed }) => {
  // Call Domain Logic
  const points = useMemo(() => simulatePowerCurve(speed), [speed]);
  const { getX, getY, minTemp, maxTemp } = normalizeForChart(points);

  const pathD = `M ${points.map(p => `${getX(p.temp)},${getY(p.power)}`).join(' L ')}`;

  return (
    <div className="w-full h-48 relative bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
      <div className="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">Power (Watts) vs Temp (°C)</div>
      
      {/* Grid Lines */}
      <div className="absolute inset-4 border-l border-b border-slate-300 dark:border-slate-700">
         {[0, 1, 2, 3].map(i => (
            <div key={i} className="absolute w-full border-t border-dashed border-slate-200 dark:border-slate-800" style={{ bottom: `${i * 33}%` }}></div>
         ))}
      </div>

      {/* SVG Chart */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-4 overflow-visible">
         <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
         
         {points.map((p, i) => (
            <circle 
                key={i} 
                cx={getX(p.temp)} 
                cy={getY(p.power)} 
                r="1.5" 
                fill="#3b82f6" 
                className="hover:r-3 hover:fill-white hover:stroke-blue-600 transition-all cursor-crosshair"
                vectorEffect="non-scaling-stroke"
            >
                <title>{p.temp}°C : {p.power.toFixed(2)}W</title>
            </circle>
         ))}
      </svg>

      {/* Axis Labels */}
      <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[9px] text-slate-400">
         <span>{minTemp}°C</span>
         <span>{(minTemp + maxTemp) / 2}°C</span>
         <span>{maxTemp}°C</span>
      </div>
    </div>
  );
};

interface InteractiveDatasheetProps {
  initialSku?: string | null;
  initialSourceFeature?: string | null;
}

const InteractiveDatasheet: React.FC<InteractiveDatasheetProps> = ({ initialSku, initialSourceFeature }) => {
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [requestedSku, setRequestedSku] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eosVersion, setEosVersion] = useState('4.32.0');

  useEffect(() => {
    if (initialSku) {
      setRequestedSku(initialSku);
      const product = TRANSCEIVERS.find(t => t.sku === initialSku || t.id === initialSku);
      if (product) {
        setSelectedSku(product.id);
      } else {
        setSelectedSku(null);
      }
    }
  }, [initialSku]);

  const products = TRANSCEIVERS.filter(t => 
    t.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProduct = TRANSCEIVERS.find(t => t.id === selectedSku);
  const faqSpec = ARISTA_800G_OPTICS.find(o => o.partNumber === activeProduct?.sku || o.altPartNumber === activeProduct?.sku);

  // Call Domain Logic for Compatibility
  const compatResult = activeProduct ? checkEosCompatibility(activeProduct.sku, eosVersion) : { status: 'Supported', message: 'Supported' };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6 shrink-0">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileJson className="text-blue-600 dark:text-blue-400" />
            Interactive Datasheets
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
            Deep technical reference for selected optics. Explore internal architecture, thermal performance, and software support dynamically.
        </p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
          
          {/* LEFT: Product List */}
          <div className="w-80 flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search SKU..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {products.map(product => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedSku(product.id)}
                        className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all group flex items-start gap-3
                            ${selectedSku === product.id 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                        `}
                      >
                          <div className={`mt-0.5 p-1.5 rounded ${selectedSku === product.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                              {product.mediaType.includes('Copper') || product.mediaType.includes('AOC') ? <Cable size={14} /> : <Eye size={14} />}
                          </div>
                          <div>
                              <div className={`font-mono font-bold ${selectedSku === product.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                  {product.sku}
                              </div>
                              <div className={`text-xs mt-0.5 line-clamp-1 ${selectedSku === product.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                  {product.description}
                              </div>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* RIGHT: Detail View */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 p-8 relative">
              {!activeProduct ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                      <Layers size={64} className="mb-4" />
                      {requestedSku ? (
                        <div className="max-w-2xl text-center space-y-4 opacity-100">
                          <p className="text-lg text-slate-700 dark:text-slate-200 font-bold">No interactive datasheet is available yet for {requestedSku}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {initialSourceFeature === 'ai-planner'
                              ? 'This request came from the AI Cluster Planner. Treat the selected hardware or media as a representative architecture choice and use the planner narrative plus BOM for context.'
                              : 'Search or select a transceiver from the left-hand list to inspect its datasheet.'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg">Select a product to view its datasheet</p>
                      )}
                  </div>
              ) : (
                  <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
                      {initialSourceFeature === 'ai-planner' && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                          Loaded from AI Cluster Planner
                        </div>
                      )}
                      
                      {/* Hero Header */}
                      <div className="flex justify-between items-start">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <h1 className="text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{activeProduct.sku}</h1>
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                      activeProduct.speed.includes('800G') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                      activeProduct.speed.includes('400G') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                      {activeProduct.speed}
                                  </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{activeProduct.description}</p>
                          </div>
                          
                          {/* EOS Simulator Widget */}
                          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-64">
                              <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                  <Activity size={14}/> EOS Compatibility
                              </div>
                              <input 
                                type="range" 
                                min="0" max="4" step="1" 
                                className="w-full mb-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                onChange={(e) => {
                                    const vers = ['4.20.0', '4.23.0', '4.28.0', '4.30.0', '4.32.0'];
                                    setEosVersion(vers[parseInt(e.target.value)]);
                                }}
                                defaultValue="4"
                              />
                              <div className="flex justify-between items-center mt-2">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">{eosVersion}</span>
                                  {compatResult.status === 'Supported' 
                                    ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10}/> Supported</span>
                                    : <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1"><XCircle size={10}/> Invalid</span>
                                  }
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* 0. FAQ Knowledge Card (If 800G) */}
                          {activeProduct.speed.includes('800G') && (
                              <div className="lg:col-span-2 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-500/20 flex flex-col md:flex-row gap-8 items-center">
                                  <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shrink-0">
                                      <HelpCircle size={32} />
                                  </div>
                                  <div className="flex-1 space-y-4">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                          800G Engineering FAQ
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                  <Zap size={14} className="text-yellow-500" /> Power Draw
                                              </div>
                                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                  {OPTICS_FAQ_KNOWLEDGE.power.max}. {OPTICS_FAQ_KNOWLEDGE.power.note}
                                              </p>
                                          </div>
                                          <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                  <Thermometer size={14} className="text-orange-500" /> Thermal
                                              </div>
                                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                                                  {OPTICS_FAQ_KNOWLEDGE.thermal.osfp_vs_qsfpdd}
                                              </p>
                                          </div>
                                          <div className="space-y-1">
                                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                  <Terminal size={14} className="text-slate-500" /> CLI Mode
                                              </div>
                                              <code className="text-[10px] font-mono block bg-white/50 dark:bg-black/30 p-1.5 rounded border border-blue-100/50 dark:border-white/5">
                                                  {activeProduct.sku.includes('2FR4') || activeProduct.sku.includes('2LR4') || activeProduct.sku.includes('2XDR4') 
                                                    ? OPTICS_FAQ_KNOWLEDGE.cli['2x400G'] 
                                                    : activeProduct.sku.includes('VSR8') || activeProduct.sku.includes('XDR8')
                                                    ? 'switch(config-if-Et1/1)#speed 800g'
                                                    : 'N/A'}
                                              </code>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* 1. Exploded View (CSS 3D) */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <Layers className="text-purple-500" /> Internal Architecture
                              </h3>
                              <p className="text-sm text-slate-500 mb-4">Hover over the diagram to explode the module layers.</p>
                              
                              <div className="h-64 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center relative group perspective-1000 overflow-hidden">
                                  {/* Base PCB */}
                                  <div className="w-48 h-32 bg-green-700 rounded shadow-xl absolute transform transition-all duration-500 group-hover:translate-y-16 group-hover:rotate-x-12 group-hover:scale-90 z-10 flex items-center justify-center border-b-4 border-green-900">
                                      <span className="text-[10px] font-mono text-green-100 font-bold opacity-0 group-hover:opacity-100">PCB / Gearbox DSP</span>
                                      <Cpu className="text-white/20 absolute" size={64} />
                                  </div>

                                  {/* Optics Block */}
                                  <div className="w-40 h-24 bg-slate-800 rounded shadow-xl absolute transform transition-all duration-500 group-hover:translate-y-0 group-hover:rotate-x-12 group-hover:scale-90 z-20 flex items-center justify-center border-b-4 border-slate-950">
                                      <span className="text-[10px] font-mono text-slate-300 font-bold opacity-0 group-hover:opacity-100">Optical Engine (OSA)</span>
                                      <div className="flex gap-2 opacity-50">
                                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-75"></div>
                                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-150"></div>
                                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse delay-300"></div>
                                      </div>
                                  </div>

                                  {/* Housing / Heatsink */}
                                  <div className="w-52 h-36 bg-slate-300 dark:bg-slate-600 rounded shadow-2xl absolute transform transition-all duration-500 group-hover:-translate-y-24 group-hover:rotate-x-12 group-hover:scale-90 z-30 flex items-center justify-center border-b-4 border-slate-400 dark:border-slate-700">
                                      <span className="text-[10px] font-mono text-slate-700 dark:text-slate-200 font-bold opacity-0 group-hover:opacity-100">
                                          {activeProduct.type === TransceiverType.OSFP ? 'OSFP Integrated Heatsink' : 'QSFP-DD Flat Top'}
                                      </span>
                                      {/* Fins */}
                                      <div className="absolute top-0 w-full h-full flex justify-between px-4 opacity-20">
                                          {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-full bg-black"></div>)}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* 2. Power Curve Chart */}
                          <div className="space-y-4">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <Zap className="text-yellow-500" /> Power vs Temperature
                              </h3>
                              <p className="text-sm text-slate-500 mb-4">Simulated power draw under varying thermal load.</p>
                              
                              <PowerChart speed={activeProduct.speed} />
                              
                              <div className="grid grid-cols-3 gap-4 mt-4">
                                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                                      <div className="text-[10px] text-slate-500 uppercase">Typical</div>
                                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                                          {activeProduct.speed.includes('800G') ? '16.5W' : activeProduct.speed.includes('400G') ? '10.2W' : '3.5W'}
                                      </div>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                                      <div className="text-[10px] text-slate-500 uppercase">Max</div>
                                      <div className="font-mono font-bold text-red-600 dark:text-red-400">
                                          {activeProduct.speed.includes('800G') ? '21.0W' : activeProduct.speed.includes('400G') ? '12.0W' : '4.5W'}
                                      </div>
                                  </div>
                                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                                      <div className="text-[10px] text-slate-500 uppercase">Cooling</div>
                                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                                          {activeProduct.type === TransceiverType.OSFP ? 'Integrated' : 'Riding'}
                                      </div>
                                  </div>
                              </div>
                          </div>

                      </div>

                      {/* Technical Specs Table */}
                      <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                              <Info className="text-blue-500" /> Technical Specifications
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-12">
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Form Factor</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.type}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Media Type</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.mediaType}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Connector</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.connector}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Reach</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.reach}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Wavelength</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.wavelength || 'N/A'}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Breakout Capable</div>
                                  <div className="text-sm font-medium text-slate-900 dark:text-white">{activeProduct.breakoutCapable ? 'Yes' : 'No'}</div>
                              </div>
                              {faqSpec?.interopNotes && (
                                  <div className="col-span-2 md:col-span-4 mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployment Notes</div>
                                      <div className="space-y-2">
                                          {faqSpec.interopNotes.map((note, i) => (
                                              <div key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                  {note}
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default InteractiveDatasheet;
