
import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  History, 
  Zap, 
  Cpu, 
  ChevronRight,
  Info,
  Layers
} from 'lucide-react';
import { SFP_DATA } from '../features/sfp/data/modules';
import { SfpType } from '../features/sfp/types';

const SfpModuleIcon: React.FC<{ type: SfpType; isSelected?: boolean }> = ({ type }) => {
  const isDD = type.id === 'sfp-dd';
  
  return (
    <svg viewBox="0 0 200 100" className="w-full h-auto drop-shadow-md">
      {/* Module Body */}
      <rect x="10" y="30" width="160" height="40" rx="2" className="fill-slate-200 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" strokeWidth="1" />
      
      {/* Latch Handle */}
      <rect x="170" y="35" width="20" height="30" rx="4" className={type.color} />
      <rect x="175" y="40" width="10" height="20" rx="1" fill="white" fillOpacity="0.2" />

      {/* Pin Contact Row 1 */}
      <g transform="translate(15, 35)">
        {[...Array(6)].map((_, i) => (
           <rect key={i} x={i*15} y="0" width="8" height="30" className="fill-yellow-500/30" />
        ))}
      </g>

      {/* Pin Contact Row 2 (DD Only) */}
      {isDD && (
        <g transform="translate(15, 35)">
          {[...Array(6)].map((_, i) => (
            <rect key={i} x={i*15 + 4} y="5" width="8" height="20" className="fill-yellow-600 animate-pulse" />
          ))}
        </g>
      )}

      {/* Label on module */}
      <text x="90" y="55" textAnchor="middle" className="text-[12px] font-black fill-slate-400 dark:fill-slate-500 font-mono tracking-tighter uppercase">{type.name}</text>
    </svg>
  );
};

const SFPFormFactorMatrix: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Layers className="text-blue-600 dark:text-blue-400" />
          The SFP Form Factor Matrix
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
          The SFP family has evolved from 1G NRZ to 100G Double Density. While physically similar, the SerDes requirements and pin counts vary significantly.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {SFP_DATA.map((type) => (
          <div key={type.id} className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 shadow-sm">
            <div className="p-4 border-b border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40">
               <SfpModuleIcon type={type} />
            </div>
            
            <div className="p-6 space-y-5 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white aom-mono">{type.name}</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-tighter shadow-sm ${type.color}`}>
                    {type.speed}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed italic font-medium">
                  {type.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[13px] border-b border-slate-50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5"><Activity size={14}/> Signaling</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 aom-mono">{type.modulation}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] border-b border-slate-50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5"><Cpu size={14}/> Lanes</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 aom-mono">{type.lanes} {type.lanes > 1 ? 'Lanes' : 'Lane'}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] border-b border-slate-50 dark:border-white/5 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5"><Zap size={14}/> SerDes Rate</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 aom-mono">{type.baudRate}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <History size={10} /> Backward Logic
                  </div>
                  <div className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                    {type.backCompat === 'N/A' ? 'Legacy Initial Entry' : `Accepts ${type.backCompat}`}
                  </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-50 dark:border-white/5">
              <div className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Common Use Case</div>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-snug">{type.aristaUsage}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Compatibility Logic Surface */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute right-[-50px] top-[-50px] opacity-10 rotate-12">
            <Info size={300} />
        </div>
        <div className="max-w-3xl relative z-10">
          <h3 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
             <CheckCircle2 size={28} /> Engineering Logic: Port Compatibility
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ChevronRight size={16} className="text-blue-300" /> High-to-Low Support
                  </h4>
                  <p className="text-sm text-blue-100 leading-relaxed font-medium">
                    Modern high-speed ports (e.g., SFP28) are typically built with high-performance SerDes that can "slow down" to support legacy modules (SFP+ 10G).
                  </p>
               </div>
            </div>
            <div className="space-y-4">
               <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <ChevronRight size={16} className="text-blue-300" /> Low-to-High Constraint
                  </h4>
                  <p className="text-sm text-blue-100 leading-relaxed font-medium">
                    A legacy 10G SFP+ port <strong className="text-white">cannot</strong> run an SFP28 (25G) module at its native speed, even if physically inserted. The SerDes is physically capped.
                  </p>
               </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs font-bold uppercase">SFP-DD = 2 Rows of Pins</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-300" />
                <span className="text-xs font-bold uppercase">SFP+ = 1 Row of Pins</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SFPFormFactorMatrix;
