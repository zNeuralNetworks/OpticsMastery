import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import { 
  ImpactCallout, 
  LessonIntroCard,
  TransitionDivider, 
  CopyNoteAction, 
  FailureSymptomCallout,
  ModuleProps 
} from '../../components/ModuleShared';
import { SvgSignalModulation } from '../../components/ModuleSvgs';
import { FECChecker } from '../widgets/FECChecker';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS, 
  MODULATION_TYPES,
  ModulationType
} from '../../../../data/knowledgeBase';
import { motion } from 'framer-motion';
import { Eye, Sliders } from 'lucide-react';

const EyeDiagramSimulator: React.FC = () => {
  const [noise, setNoise] = useState(0.2);
  const [jitter, setJitter] = useState(0.1);
  
  const generatePath = (isTop: boolean) => {
    const base = isTop ? 20 : 80;
    const amp = isTop ? 1 : -1;
    return `M 0 ${base} 
            Q 25 ${base + (amp * 40 * (1-noise))} 50 ${base + (amp * 40 * (1-noise))} 
            T 100 ${base}`;
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-2xl overflow-hidden relative group mb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Eye className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Signal Integrity: Eye Diagram</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visualizing BER & Jitter</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Sliders size={14} className="text-slate-500" />
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Noise</span>
              <input 
                type="range" min="0" max="1" step="0.1" value={noise} 
                onChange={e => setNoise(parseFloat(e.target.value))}
                className="w-20 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Jitter</span>
            <input 
              type="range" min="0" max="0.5" step="0.05" value={jitter} 
              onChange={e => setJitter(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="relative h-48 bg-slate-900/50 rounded-xl border border-slate-800/50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-slate-500" />
          ))}
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
          {/* Eye Paths */}
          {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
              <motion.path
                d={generatePath(true)}
                stroke="#3b82f6"
                strokeWidth="0.5"
                fill="none"
                opacity={0.3}
                animate={{ 
                  d: generatePath(true),
                  x: (Math.random() - 0.5) * jitter * 20,
                  y: (Math.random() - 0.5) * noise * 20
                }}
                transition={{ repeat: Infinity, duration: 0.1, repeatType: 'reverse' }}
              />
              <motion.path
                d={generatePath(false)}
                stroke="#3b82f6"
                strokeWidth="0.5"
                fill="none"
                opacity={0.3}
                animate={{ 
                  d: generatePath(false),
                  x: (Math.random() - 0.5) * jitter * 20,
                  y: (Math.random() - 0.5) * noise * 20
                }}
                transition={{ repeat: Infinity, duration: 0.1, repeatType: 'reverse' }}
              />
            </React.Fragment>
          ))}

          {/* Eye Center (Mask) */}
          <rect x="40" y="40" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="2 2" opacity={0.5} />
        </svg>

        <div className="absolute bottom-4 right-4 flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Eye Opening</span>
            <span className={`text-xs font-black font-mono ${noise > 0.6 ? 'text-red-500' : 'text-emerald-500'}`}>
              {(100 - noise * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</span>
            <span className={`text-xs font-black font-mono ${noise > 0.6 || jitter > 0.3 ? 'text-red-500' : 'text-emerald-500'}`}>
              {noise > 0.6 || jitter > 0.3 ? 'CRITICAL' : 'OPTIMAL'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-slate-500 font-medium leading-relaxed italic">
        Note: High noise (vertical) and jitter (horizontal) close the "eye," increasing the Bit Error Rate (BER). PAM4 signaling requires tighter eye tolerances than NRZ.
      </div>
    </div>
  );
};

export const SignalingModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <LessonIntroCard
        title="Signal Logic and Error Correction"
        summary="This lesson explains why modern high-speed optics need different signaling and error-correction assumptions than legacy links. The goal is to help users recognize when speed matches but signal logic does not."
        goals={[
          'Understand why NRZ and PAM4 are not interchangeable.',
          'Connect signal quality to BER, eye opening, and link reliability.',
          'Treat FEC as part of the link contract rather than an optional setting.',
          'Translate signal behavior into link validation and troubleshooting decisions.',
        ]}
        nextAction="After this lesson, validate real interface pairs and FEC behavior in Link Validation."
      />
      <EyeDiagramSimulator />
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity size={20} className="text-blue-500" /> Modulation: NRZ vs PAM4
        </h4>
        <CopyNoteAction conceptId="MODULATION" title="Modulation Comparison" level="Basics" />
      </div>
      <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
        <SvgSignalModulation />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MODULATION_TYPES.map((m: ModulationType, i: number) => (
          <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{m.type}</span>
              <span className="text-[11px] aom-mono text-slate-400 font-bold">{m.speed}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{m.desc}</p>
          </div>
        ))}
      </div>
      <ImpactCallout text={DECISION_IMPACTS.MODULATION} onNavigate={onNavigate} />
    </div>

    <TransitionDivider text={TRANSITION_TEXTS.SIGNALING_1} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <FECChecker />
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-500" /> FEC Validation Matrix
          </h4>
          <CopyNoteAction conceptId="FEC_TYPES" title="FEC Validation Matrix" level="Intermediate" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Forward Error Correction (FEC) is mandatory for PAM4 signaling (400G/800G). Mismatched FEC modes will prevent link UP status.
        </p>
        <div className="space-y-3">
          {[
            { mode: 'RS-FEC (544, 514)', usage: 'Standard for 400G-DR4/FR4', status: 'Mandatory' },
            { mode: 'RS-FEC (528, 514)', usage: 'Standard for 100G-SR4', status: 'Common' },
            { mode: 'Base-R FEC', usage: 'Legacy 25G/50G links', status: 'Legacy' }
          ].map((f, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-[13px] font-bold text-slate-900 dark:text-white aom-mono">{f.mode}</div>
                <div className="text-[11px] text-slate-500 font-medium">{f.usage}</div>
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{f.status}</span>
            </div>
          ))}
        </div>
        <FailureSymptomCallout conceptId="FEC_TYPES" />
        <ImpactCallout text={DECISION_IMPACTS.FEC_MODES} onNavigate={onNavigate} />
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lesson Takeaways</div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          'Speed labels alone are not enough; the signaling method must match.',
          'PAM4 increases throughput by using more levels, but that reduces signal margin and increases FEC dependency.',
          'A link can have light present and still fail if FEC expectations are misaligned.',
          'The next applied step is link validation with explicit signal and FEC assumptions.',
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
