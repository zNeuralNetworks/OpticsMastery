import React from 'react';
import { Target, Shield, Compass, CheckCircle2 } from 'lucide-react';
import { 
  ModuleProps 
} from '../../components/ModuleShared';
import { 
  APP_CONTEXT
} from '../../../../data/knowledgeBase';

export const ProjectModule: React.FC<ModuleProps> = () => (
  <div className="space-y-10 animate-fade-in font-sans">
    <div className="bg-slate-950 p-12 rounded-[2rem] text-white relative overflow-hidden border border-white/10 shadow-2xl">
      <Target className="absolute right-[-40px] top-[-40px] opacity-5 rotate-12" size={300} />
      <div className="max-w-3xl relative z-10">
         <div className="inline-block px-5 py-1.5 bg-blue-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-8 aom-mono shadow-lg shadow-blue-600/30">The Manifesto</div>
         <h2 className="text-4xl font-black mb-8 tracking-tight leading-tight text-white uppercase">Empowering Engineers through Decidable Optics Strategy</h2>
         <p className="text-[20px] text-slate-200 leading-relaxed font-medium italic border-l-4 border-blue-500 pl-8 mb-12">
            "We compress complex optics rules into clear recommendations an engineer can confidently utilize."
         </p>
         <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="font-black text-blue-400 mb-3 uppercase text-[11px] tracking-[0.2em] aom-mono">Our Intent</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{APP_CONTEXT.intent[0]}</p>
            </div>
            <div>
              <h4 className="font-black text-green-400 mb-3 uppercase text-[11px] tracking-[0.2em] aom-mono">Defensible Outcomes</h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{APP_CONTEXT.definitionOfSuccess}</p>
            </div>
         </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
         <h4 className="text-sm font-bold text-blue-600 mb-8 uppercase tracking-[0.15em] flex items-center gap-3">
           <Shield size={20} /> Behavioral Guardrails
         </h4>
         <div className="space-y-5">
            {APP_CONTEXT.behavioralRules.map((rule: string, idx: number) => (
              <div key={idx} className="flex gap-5 items-start p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-transparent hover:border-blue-500/30 transition-all shadow-sm">
                <div className="mt-1"><CheckCircle2 size={20} className="text-blue-500" /></div>
                <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">{rule}</span>
              </div>
            ))}
         </div>
      </div>
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
         <h4 className="text-sm font-bold text-indigo-600 mb-8 uppercase tracking-[0.15em] flex items-center gap-3">
           <Compass size={20} /> Scope & Boundaries
         </h4>
         <div className="space-y-10">
            <div>
              <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5 aom-mono">Engineering Scope</h5>
              <div className="flex flex-wrap gap-2.5">
                 {APP_CONTEXT.boundaries.allowed.map((item: string, i: number) => (
                   <span key={i} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-xl border border-blue-100 dark:border-blue-800 font-bold shadow-sm">{item}</span>
                 ))}
              </div>
            </div>
            <div>
              <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-5 aom-mono">Non-Core (Out of Scope)</h5>
              <div className="flex flex-wrap gap-2.5">
                 {APP_CONTEXT.boundaries.prohibited.map((item: string, i: number) => (
                   <span key={i} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500 text-sm rounded-xl border border-slate-200 dark:border-slate-700 font-bold shadow-sm">{item}</span>
                 ))}
              </div>
            </div>
         </div>
      </div>
    </div>
  </div>
);
