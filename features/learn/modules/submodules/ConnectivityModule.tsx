import React, { useState } from 'react';
import { Activity, ZapOff, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { 
  ImpactCallout, 
  LessonIntroCard,
  TransitionDivider, 
  CopyNoteAction, 
  FailureSymptomCallout,
  ModuleProps 
} from '../../components/ModuleShared';
import { SvgFiberCore, SvgPolarityLogic } from '../../components/ModuleSvgs';
import { LinkBudgetCalc } from '../widgets/LinkBudgetCalc';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS, 
  FIBER_TYPES,
  POLARITY_MODES,
  FiberType,
  PolarityMode
} from '../../../../data/knowledgeBase';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Check, X } from 'lucide-react';
import { Page } from '../../../../types';

const PolaritySimulator: React.FC<{ onNavigate?: (page: Page) => void }> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'A' | 'B' | 'C'>('A');
  
  const lanes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  const getTargetLane = (lane: number, m: 'A' | 'B' | 'C') => {
    if (m === 'A') return lane;
    if (m === 'B') return 13 - lane;
    if (m === 'C') {
      if (lane % 2 !== 0) return lane + 1;
      return lane - 1;
    }
    return lane;
  };

  const isCorrect = mode === 'B';

  return (
    <div className="space-y-6 mb-10">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ArrowRightLeft className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">MPO Polarity Simulator</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visualizing Lane Mapping</p>
            </div>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            {(['A', 'B', 'C'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Type {m}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-48 flex items-center justify-between px-10">
          {/* Source Connector */}
          <div className="flex flex-col gap-1">
            {lanes.map(l => (
              <div key={l} className="w-4 h-2 bg-slate-700 rounded-full relative group/lane">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">{l}</div>
              </div>
            ))}
          </div>

          {/* Dynamic Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none px-14 py-8">
            {lanes.map(l => {
              const target = getTargetLane(l, mode);
              const y1 = (l - 1) * (100 / 11);
              const y2 = (target - 1) * (100 / 11);
              return (
                <motion.line
                  key={l}
                  x1="0%"
                  y1={`${y1}%`}
                  x2="100%"
                  y2={`${y2}%`}
                  stroke={l <= 4 ? '#3b82f6' : l >= 9 ? '#f59e0b' : '#64748b'}
                  strokeWidth="1.5"
                  initial={false}
                  animate={{ y2: `${y2}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  opacity={0.4}
                />
              );
            })}
          </svg>

          {/* Destination Connector */}
          <div className="flex flex-col gap-1">
            {lanes.map(l => (
              <div key={l} className="w-4 h-2 bg-slate-700 rounded-full relative">
                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-[8px] font-mono text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isCorrect ? <Check size={16} /> : <X size={16} />}
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Simulation Result</div>
            <p className="text-xs text-slate-300 font-medium">
              {mode === 'A' && "Straight-through mapping. TX on one side hits TX on the other. Link will NOT come up."}
              {mode === 'B' && "Flipped mapping (Standard). TX on one side hits RX on the other. Link will come up."}
              {mode === 'C' && "Pair-wise flip. Useful for some duplex breakout scenarios, but rare for 400G parallel trunks."}
            </p>
          </div>
        </div>
      </div>

      {onNavigate && (
        <button 
          onClick={() => onNavigate(Page.COMPATIBILITY_EXPLAINER)}
          className="w-full flex items-center justify-between p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl group hover:bg-blue-600 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors">
              <CheckCircle2 size={20} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white transition-colors">Validate a Link Path</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-blue-100 transition-colors uppercase font-black tracking-widest">Launch Link Validation</p>
            </div>
          </div>
          <ArrowUpRight size={20} className="text-blue-600 group-hover:text-white transition-colors" />
        </button>
      )}
    </div>
  );
};

export const ConnectivityModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <LessonIntroCard
        title="Physical Link Foundations"
        summary="This lesson teaches the physical constraints behind optics decisions: media type, connector safety, polarity, and loss budget. The goal is to build the mental model you need before using validation and part-selection tools."
        goals={[
          'Choose the correct fiber family before choosing optics.',
          'Recognize connector and polarity mistakes before they become outages.',
          'Use loss budget as a physical validation step, not an afterthought.',
          'Translate physical rules into concrete link validation decisions.',
        ]}
        nextAction="After this lesson, validate a real link path in Link Validation."
      />
      <PolaritySimulator onNavigate={onNavigate} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <LinkBudgetCalc />
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-500" /> Fiber Core Dynamics
          </h4>
          <CopyNoteAction conceptId="FIBER_TYPES" title="Fiber Core Comparison" level="Basics" />
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
          <SvgFiberCore />
        </div>
        <div className="space-y-4">
          {FIBER_TYPES.map((f: FiberType, i: number) => (
            <div key={i} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[15px] font-bold text-slate-900 dark:text-white">{f.name}</span>
                <span className="text-[11px] aom-mono text-blue-600 dark:text-blue-400 font-black">{f.core}</span>
              </div>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
        <ImpactCallout text={DECISION_IMPACTS.FIBER_CORE} onNavigate={onNavigate} />
      </div>
    </div>

    <TransitionDivider text={TRANSITION_TEXTS.CONNECTIVITY_1} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Connector Safety & Standards</h4>
          <CopyNoteAction conceptId="SAFETY_RULES" title="Connector Standards" level="Basics" />
        </div>
        <div className="space-y-6">
          <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">UPC</div>
            <div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white">Ultra Physical Contact</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">Standard blue connector. Flat polish. High back-reflection compared to APC.</p>
            </div>
          </div>
          <div className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">APC</div>
            <div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white">Angled Physical Contact</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">Standard green connector. 8-degree angle. Required for most high-speed SMF links.</p>
            </div>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl flex items-center gap-5 shadow-sm">
             <ZapOff className="text-red-600 shrink-0" size={28} />
             <p className="text-sm text-red-900 dark:text-red-300 leading-relaxed font-bold uppercase tracking-tight">
                Critical: Never mate <span className="aom-mono">UPC</span> (Blue) to <span className="aom-mono">APC</span> (Green). Permanent fiber core damage will typically occur.
             </p>
          </div>
        </div>
        <FailureSymptomCallout conceptId="SAFETY_RULES" />
        <ImpactCallout text={DECISION_IMPACTS.SAFETY_RULES} onNavigate={onNavigate} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">MPO Polarity Logic</h4>
          <CopyNoteAction conceptId="POLARITY" title="MPO Polarity Logic" level="Intermediate" />
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
          <SvgPolarityLogic />
        </div>
        <div className="space-y-2">
          {POLARITY_MODES.map((p: PolarityMode, i: number) => (
            <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
              <span className="text-[15px] font-bold text-slate-900 dark:text-white">{p.type}</span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400 aom-mono tracking-tighter uppercase font-semibold">{p.logic}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-950 rounded-xl text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed italic font-medium">
          Note: <span className="aom-mono text-blue-500 font-bold">Type B</span> is standard for many modern MPO parallel trunks. Recommended practice is to cross-reference with the patch panel vendor.
        </div>
        <FailureSymptomCallout conceptId="POLARITY" />
        <ImpactCallout text={DECISION_IMPACTS.POLARITY} onNavigate={onNavigate} />
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lesson Takeaways</div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          'Media choice sets the physical boundary conditions for every optics decision that follows.',
          'Connector safety and polarity are binary correctness checks, not optimization steps.',
          'Loss budget should confirm a design that already makes physical sense, not rescue a bad one.',
          'The next applied step is validating a real interface pair against physical and signaling rules.',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);
};
