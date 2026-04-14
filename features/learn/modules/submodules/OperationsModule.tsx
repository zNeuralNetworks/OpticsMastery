import React, { useState, useEffect } from 'react';
import { ChevronRight, Terminal, Activity, Copy, Check } from 'lucide-react';
import { 
  ImpactCallout, 
  LessonIntroCard,
  TransitionDivider, 
  CopyNoteAction, 
  ContextualToolAction,
  FieldNotes,
  ModuleProps 
} from '../../components/ModuleShared';
import { SvgDomRange } from '../../components/ModuleSvgs';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS, 
  DDM_METRICS,
  DdmMetric
} from '../../../../data/knowledgeBase';
import { 
  RefreshCw,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const PowerLevelInterpreter: React.FC = () => {
  const [power, setPower] = useState(-12.5);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isSimulating) {
      interval = setInterval(() => {
        setPower(prev => {
          const change = (Math.random() - 0.5) * 0.5;
          return Math.max(-30, Math.min(2, prev + change));
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const getStatus = (val: number) => {
    if (val > -3) return { label: 'HIGH (SATURATION)', color: 'text-red-500', bg: 'bg-red-500/10', icon: ShieldAlert };
    if (val > -10) return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: Activity };
    if (val > -15) return { label: 'MARGINAL', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle };
    return { label: 'LOW (FAILING)', color: 'text-red-500', bg: 'bg-red-500/10', icon: ShieldAlert };
  };

  const status = getStatus(power);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl overflow-hidden relative group mb-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Activity className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">DOM Health Simulator</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time RX Power Interpretation</p>
          </div>
        </div>
        <button 
          onClick={() => setIsSimulating(!isSimulating)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            isSimulating ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isSimulating ? <><RefreshCw size={12} className="animate-spin" /> Live</> : 'Start Simulation'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col justify-center">
          <div className="text-5xl font-black text-white font-mono mb-2 tracking-tighter">
            {power.toFixed(2)} <span className="text-lg text-slate-500 font-sans">dBm</span>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest w-fit ${status.bg} ${status.color}`}>
            <status.icon size={14} />
            {status.label}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Analysis & Action</div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {power > -3 && "High risk of receiver damage. Add a 5dB or 10dB attenuator immediately to prevent hardware burnout."}
            {power <= -3 && power > -10 && "Signal is within ideal operating range for 400G-FR4. No action required. Link is healthy."}
            {power <= -10 && power > -15 && "Link may experience CRC errors. Inspect fiber end-faces and clean all connectors with a click-cleaner."}
            {power <= -15 && "Link failure imminent. Check for macro-bends, faulty patch cables, or dirty bulkheads."}
          </p>
        </div>
      </div>

      {/* Visual Gauge */}
      <div className="mt-10 h-3 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 flex">
          <div className="h-full w-1/4 bg-red-500/20 border-r border-slate-900" />
          <div className="h-full w-1/4 bg-amber-500/20 border-r border-slate-900" />
          <div className="h-full w-1/4 bg-emerald-500/20 border-r border-slate-900" />
          <div className="h-full w-1/4 bg-red-500/20" />
        </div>
        <motion.div 
          animate={{ left: `${((power + 30) / 32) * 100}%` }}
          className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_15px_white] z-10"
        />
      </div>
      <div className="flex justify-between mt-3 text-[9px] font-black text-slate-600 uppercase tracking-widest font-mono">
        <span>-30dBm</span>
        <span>-15dBm</span>
        <span>-10dBm</span>
        <span>-3dBm</span>
        <span>+2dBm</span>
      </div>
    </div>
  );
};

export const OperationsModule: React.FC<ModuleProps> = ({ onNavigate }) => {
  const [interfaceId, setInterfaceId] = useState('ethernet 1/1');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const snippets = [
    { cmd: `show interfaces ${interfaceId} transceiver`, desc: 'Summary of all plugged optics and their status.' },
    { cmd: `show interfaces ${interfaceId} transceiver detail`, desc: 'Full DDM telemetry (Power, Temp, Bias).' },
    { cmd: `show interfaces ${interfaceId} counters errors`, desc: 'Pre-FEC and Post-FEC error rates.' },
    { cmd: 'show inventory', desc: 'Verify serial numbers and installed SKU identification.' },
    { cmd: 'show lldp neighbors', desc: 'Confirm physical link connectivity to remote host.' }
  ];

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      <LessonIntroCard
        title="Operational Validation and Troubleshooting"
        summary="This lesson turns optics knowledge into operational judgment. The goal is to help users interpret telemetry, choose the right CLI checks, and move from symptoms to structured troubleshooting steps."
        goals={[
          'Read DOM and power values as health signals, not just raw numbers.',
          'Use the right EOS commands to confirm optics state and error posture.',
          'Recognize common physical-layer failure patterns before deeper escalation.',
          'Apply a repeatable debug flow instead of troubleshooting by guesswork.',
        ]}
        nextAction="After this lesson, use dBm interpretation and link-validation workflows to test how operational symptoms map back to physical design choices."
      />
      <PowerLevelInterpreter />
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>
          <span className="text-[11px] aom-mono text-slate-500 uppercase tracking-[0.25em] font-black">EOS_DEBUG_CONSOLE</span>
        </div>
        <div className="p-10 aom-mono text-[15px] space-y-8">
          <div className="group">
            <div className="text-slate-500 dark:text-slate-500 text-[11px] mb-2.5 font-sans uppercase font-black tracking-widest"># CHECK OPTICAL HEALTH</div>
            <div className="text-white flex items-center gap-4">
               <ChevronRight size={16} className="text-blue-500" />
               <span className="aom-mono tracking-tight text-blue-50 hover:text-blue-400 transition-colors cursor-text">show interfaces {interfaceId} transceiver</span>
            </div>
          </div>
          <div className="group">
            <div className="text-slate-500 dark:text-slate-500 text-[11px] mb-2.5 font-sans uppercase font-black tracking-widest"># ANALYZE ERROR RATES (PRE-FEC)</div>
            <div className="text-white flex items-center gap-4">
               <ChevronRight size={16} className="text-blue-500" />
               <span className="aom-mono tracking-tight text-blue-50 hover:text-blue-400 transition-colors cursor-text">show interfaces {interfaceId} counters errors</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal size={18} className="text-blue-500" /> CLI Snippet Generator
            </h4>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Port:</span>
              <input 
                type="text" 
                value={interfaceId} 
                onChange={(e) => setInterfaceId(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-bold text-blue-600 dark:text-blue-400 w-24 aom-mono"
              />
            </div>
          </div>
          <div className="space-y-4">
            {snippets.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 group relative">
                <button 
                  onClick={() => handleCopy(item.cmd)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copied === item.cmd ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
                <div className="text-[13px] aom-mono text-blue-600 dark:text-blue-400 font-bold mb-1 group-hover:text-blue-500 transition-colors pr-10">{item.cmd}</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
          <FieldNotes 
            title="UPC vs APC Reflection" 
            content="Common Pitfall: Using a UPC patch cable on an APC optic will result in -40dB back-reflection, causing high pre-FEC error rates or link failure." 
          />
        </div>

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">DOM Monitoring Scale</h4>
          <CopyNoteAction conceptId="DOM_SCALE" title="DOM Monitoring Scale" level="Intermediate" />
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
          <SvgDomRange />
        </div>
        <div className="space-y-4">
          {DDM_METRICS.map((m: DdmMetric, i: number) => (
            <div key={i} className="flex gap-5 p-5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="mt-1"><Activity size={20} className="text-blue-500" /></div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">{m.metric}</span>
                  <span className="aom-mono text-blue-700 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-[11px] font-black">{m.unit}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <ContextualToolAction actionKey="DOM_SCALE" onNavigate={onNavigate} />
        <ImpactCallout text={DECISION_IMPACTS.DOM_SCALE} onNavigate={onNavigate} />
      </div>
      </div>

      <TransitionDivider text={TRANSITION_TEXTS.OPERATIONS_1} />

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Troubleshooting Flow</h4>
        <div className="space-y-8 relative pl-8 border-l-2 border-slate-100 dark:border-slate-800">
          {[
            { step: '01', title: 'Remote TX Verification', desc: 'Verify laser is firing at the remote end.' },
            { step: '02', title: 'Optical Cleaning', desc: 'Cleaning common contamination typically resolves many transceiver link issues.' },
            { step: '03', title: 'FEC Alignment', desc: 'Verify RS-FEC is aligned on both sides.' },
            { step: '04', title: 'Polarity Check', desc: 'Confirm appropriate flip across the trunk.' },
          ].map((s, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-11 top-1 bg-white dark:bg-slate-900 px-2.5 py-1 text-[10px] font-black text-blue-600 border border-slate-200 dark:border-slate-700 rounded uppercase aom-mono shadow-sm">{s.step}</div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white">{s.title}</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
        <ImpactCallout text={DECISION_IMPACTS.DEBUG_FLOW} onNavigate={onNavigate} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lesson Takeaways</div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            'Operational optics work starts with evidence: DOM, counters, and interface state before cable swapping.',
            'Power values become useful when interpreted as trends and thresholds, not isolated numbers.',
            'A repeatable CLI sequence reduces false diagnosis and speeds isolation of physical-layer faults.',
            'Troubleshooting should connect symptoms back to media, connector, polarity, and FEC assumptions learned earlier.',
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
