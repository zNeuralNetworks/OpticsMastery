import React from 'react';
import { Globe, Grid3X3, ArrowUpRight } from 'lucide-react';
import { 
  ImpactCallout, 
  TransitionDivider, 
  ModuleProps 
} from '../../components/ModuleShared';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS 
} from '../../../../data/knowledgeBase';
import { Page } from '../../../../types';

// Helper component that was internal to UpgradesModule
const SmartMatrixCTA: React.FC<{ onNavigate?: (page: Page) => void }> = ({ onNavigate }) => (
  <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Migration Path Finder</h4>
      {onNavigate && (
        <button 
          onClick={() => onNavigate(Page.SMART_MATRIX)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
        >
          <Grid3X3 size={12} /> Launch Smart Matrix <ArrowUpRight size={12} />
        </button>
      )}
    </div>
    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Use the Smart Matrix to find definitive upgrade paths for your specific hardware.</p>
    </div>
  </div>
);

export const UpgradesModule: React.FC<ModuleProps> = ({ onNavigate }) => (
  <div className="space-y-10 animate-fade-in font-sans">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { phase: '01', title: '100G NRZ', color: 'blue', desc: 'Legacy 100G infrastructure. 4x25G Lanes.' },
          { phase: '02', title: '400G PAM4', color: 'indigo', desc: 'Modern OSFP Transition. 8x50G Lanes.' },
          { phase: '03', title: '800G Coherent', color: 'purple', desc: 'Advanced DCI / ZR+. 8x100G Lanes.' }
        ].map((p, i) => (
          <div key={i} className="p-8 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm text-center">
             <div className={`text-[11px] font-black text-${p.color}-600 uppercase tracking-[0.15em] mb-4 aom-mono`}>Phase {p.phase}</div>
             <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{p.title}</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{p.desc}</p>
          </div>
        ))}
     </div>

     <TransitionDivider text={TRANSITION_TEXTS.UPGRADES_1} />

     <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-white/10">
        <Globe className="absolute -right-10 -bottom-10 opacity-10" size={240} />
        <div className="max-w-2xl relative z-10">
          <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">The ZR Revolution</h4>
          <p className="text-[16px] text-blue-50 leading-relaxed mb-8 font-medium">
            Coherent optics (<span className="aom-mono text-white font-bold">400G-ZR / 800G-ZR</span>) enable long-haul connectivity without typical external transponders. They plug directly into standard high-speed ports, which can significantly reduce <span className="aom-mono uppercase font-bold text-white">DCI</span> <span className="aom-mono uppercase font-bold text-white">TCO</span>.
          </p>
          <div className="flex gap-4">
             <div className="bg-white/20 px-4 py-2.5 rounded-xl text-[12px] font-bold border border-white/20 aom-mono shadow-sm">16QAM Modulation</div>
             <div className="bg-white/20 px-4 py-2.5 rounded-xl text-[12px] font-bold border border-white/20 aom-mono shadow-sm">Integrated DSP</div>
          </div>
        </div>
     </div>
     <ImpactCallout text={DECISION_IMPACTS.ZR_TECH} onNavigate={onNavigate} />
     <TransitionDivider text="Interactive Migration Analysis" />
     <SmartMatrixCTA onNavigate={onNavigate} />
  </div>
);
