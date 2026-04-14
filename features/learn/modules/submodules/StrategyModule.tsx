import React from 'react';
import { Target, Shield, Zap } from 'lucide-react';
import { 
  ImpactCallout, 
  TransitionDivider, 
  ModuleProps 
} from '../../components/ModuleShared';
import { SvgStrategyWheel } from '../../components/ModuleSvgs';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS, 
  STRATEGY_PILLARS,
  StrategyPillar
} from '../../../../data/knowledgeBase';

export const StrategyModule: React.FC<ModuleProps> = ({ onNavigate }) => (
  <div className="space-y-12 animate-fade-in font-sans">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">Core Methodology</span>
        </div>
        <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight uppercase">
          The Decidable <span className="text-blue-600">Optics</span> Framework
        </h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Optics strategy is not just about choosing a SKU; it's about ensuring <span className="text-slate-900 dark:text-white font-bold">lifecycle decidability</span> across the fabric.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STRATEGY_PILLARS.map((p: StrategyPillar, i: number) => (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:border-blue-500/30 transition-all group">
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{p.label}</div>
              <div className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{p.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex justify-center py-10">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
        <SvgStrategyWheel />
      </div>
    </div>

    <TransitionDivider text={TRANSITION_TEXTS.STRATEGY_1} />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { icon: <Target className="text-blue-500" />, title: 'Standardization', desc: 'Minimizing SKU sprawl to simplify sparing and operational overhead.' },
        { icon: <Shield className="text-emerald-500" />, title: 'Validation Discipline', desc: 'Ensuring physical fit, signaling alignment, and repeatable deployment choices.' },
        { icon: <Zap className="text-amber-500" />, title: 'Performance', desc: 'Optimizing for reach, power, and thermal constraints.' }
      ].map((card, i) => (
        <div key={i} className="bg-white dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
            {card.icon}
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{card.title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{card.desc}</p>
        </div>
      ))}
    </div>

    <ImpactCallout text={DECISION_IMPACTS.STRATEGY_1} onNavigate={onNavigate} />
  </div>
);
