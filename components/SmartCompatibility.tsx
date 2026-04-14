
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Plug,
  ArrowRightLeft,
  Wrench,
  ShieldAlert,
  Info,
  FileJson
} from 'lucide-react';
import DecisionOutput from './DecisionOutput';
import { evaluateCompatibility } from '../features/compatibility/lib/engine';
import { INTERFACES } from '../features/compatibility/data/interfaces';
import { AppNavigationParams, Page, LearnPageTab } from '../types';

interface SmartCompatibilityProps {
    onNavigate: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
}

const SmartCompatibility: React.FC<SmartCompatibilityProps> = ({ onNavigate }) => {
  const [sourceId, setSourceId] = useState<string>('400G-DR4');
  const [destId, setDestId] = useState<string>('100G-DR');

  const source = INTERFACES.find(i => i.id === sourceId)!;
  const dest = INTERFACES.find(i => i.id === destId)!;

  const result = evaluateCompatibility(source, dest);

  return (
    <div className="space-y-6 animate-fade-in pb-12 decision-surface">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CheckCircle2 className="text-blue-600 dark:text-blue-400" />
            Link Validation
        </h2>
        <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed font-medium">
            Detailed physical and signaling validation. Understand the physics and logic behind the connection.
        </p>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-slate-900 dark:bg-none">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">Learning Lab</div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">What this teaches</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            'How connector, media, polish, and signaling rules combine into a real link outcome.',
            'Why two ports can have matching speed labels but still be incompatible.',
            'How to read warnings as engineering constraints rather than generic error messages.',
            'How to turn a failed validation result into a corrective design action.',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Port A (Local)</h3>
                <div className="space-y-2">
                    {INTERFACES.map(i => (
                        <button
                            key={i.id}
                            onClick={() => setSourceId(i.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center
                                ${sourceId === i.id 
                                    ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-500' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                            `}
                        >
                            <div className="flex flex-col">
                                <span className={`font-bold aom-mono ${sourceId === i.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{i.sku}</span>
                                <span className={`text-[10px] ${sourceId === i.id ? 'text-blue-100' : 'text-slate-500'}`}>{i.name}</span>
                            </div>
                            {sourceId === i.id && <CheckCircle2 size={16} />}
                        </button>
                    ))}
                </div>
             </div>

             <div className="flex justify-center text-slate-400">
                <ArrowRightLeft size={24} className="rotate-90 lg:rotate-0" />
             </div>

             <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Port B (Remote)</h3>
                 <div className="space-y-2">
                    {INTERFACES.map(i => (
                        <button
                            key={i.id}
                            onClick={() => setDestId(i.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex justify-between items-center
                                ${destId === i.id 
                                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-500' 
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                            `}
                        >
                            <div className="flex flex-col">
                                <span className={`font-bold aom-mono ${destId === i.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{i.sku}</span>
                                <span className={`text-[10px] ${destId === i.id ? 'text-indigo-100' : 'text-slate-500'}`}>{i.name}</span>
                            </div>
                            {destId === i.id && <CheckCircle2 size={16} />}
                        </button>
                    ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
              {/* Visual Result Card */}
              <div className={`rounded-xl border p-8 shadow-sm transition-all ${
                  result.status === 'Compatible' 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                  : result.status === 'Warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
              }`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-full shadow-lg ${
                           result.status === 'Compatible' ? 'bg-green-500 text-white' :
                           result.status === 'Warning' ? 'bg-yellow-500 text-white' :
                           'bg-red-500 text-white'
                      }`}>
                          {result.status === 'Compatible' ? <CheckCircle2 size={32} /> : result.status === 'Warning' ? <AlertTriangle size={32} /> : <XCircle size={32} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Analysis Result</div>
                        <h3 className="text-3xl font-black">{result.status.toUpperCase()}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Reasons List */}
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={14} className="opacity-70" /> Evaluation Logic
                        </h4>
                        <ul className="space-y-4">
                            {result.reasons.map((reason, idx) => (
                                <li key={idx} className="text-sm leading-relaxed flex gap-3 text-slate-800 dark:text-slate-200 font-medium items-start">
                                    <ArrowRight size={14} className="shrink-0 mt-1 text-slate-400" />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Warnings & Fixes */}
                    <div className="space-y-6">
                        {result.warnings.length > 0 && (
                            <div className="bg-white/40 dark:bg-slate-900/40 p-5 rounded-lg border border-yellow-200/50 dark:border-yellow-900/30">
                                <h4 className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldAlert size={14} /> Critical Warnings
                                </h4>
                                <ul className="space-y-2">
                                    {result.warnings.map((warn, idx) => (
                                        <li key={idx} className="text-sm leading-snug font-semibold text-yellow-700 dark:text-yellow-400">{warn}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.suggestedFixes.length > 0 && (
                            <div className="bg-blue-600/5 dark:bg-blue-400/5 p-5 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                <h4 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Wrench size={14} /> Suggested Engineering Fixes
                                </h4>
                                <ul className="space-y-3">
                                    {result.suggestedFixes.map((fix, idx) => (
                                        <li key={idx} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium list-disc ml-4">{fix}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                  </div>
              </div>

              {/* Technical Footprint Card with Actions */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl flex flex-col gap-3 group border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <Plug className="text-slate-400" size={20} />
                      <div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Port A Spec</div>
                          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{source.connector} {source.polish} | {source.modulation}</div>
                      </div>
                    </div>
                    {onNavigate && (
                      <button 
                        onClick={() => onNavigate(Page.INTERACTIVE_DATASHEETS, undefined, source.sku)}
                        className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FileJson size={12} /> Inspect Datasheet ({source.sku})
                      </button>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl flex flex-col gap-3 group items-end text-right border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div>
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Port B Spec</div>
                          <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">{dest.connector} {dest.polish} | {dest.modulation}</div>
                      </div>
                      <Plug className="text-slate-400" size={20} />
                    </div>
                    {onNavigate && (
                      <button 
                        onClick={() => onNavigate(Page.INTERACTIVE_DATASHEETS, undefined, dest.sku)}
                        className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <FileJson size={12} /> Inspect Datasheet ({dest.sku})
                      </button>
                    )}
                  </div>
              </div>

              {/* Official Recommendation Block */}
              <DecisionOutput 
                title={`${source.sku} ↔ ${dest.sku}`}
                recommended={result.status === 'Compatible' ? [
                  `Standard validated design.`,
                  `Verify ${source.wavelength} match across fiber distance.`,
                  `Clean all fiber end-faces before mating.`
                ] : result.status === 'Warning' ? [
                  `Requires specialized cabling or hardware.`,
                  `Confirm compatibility with host NIC SerDes (PAM4 vs NRZ).`
                ] : []}
                notRecommended={result.status === 'Incompatible' ? [
                  `Physics Mismatch: Cannot proceed without hardware change.`,
                  `Risk of hardware damage if polish type is mismatched.`
                ] : []}
                assumptions={[
                  'Standard OS2 SMF or OM4 MMF fiber quality.',
                  'Modern EOS release for 400G/800G support.',
                  'Direct connection or standard patch panel traversal.'
                ]}
                nextChecks={[
                  'Review Tx/Rx optical power levels via DOM.',
                  'Ensure FEC is matched across the link.',
                  'Validate patch cord polarity (Type A, B, or C).'
                ]}
                notes={result.status === 'Incompatible' ? 'Connection rejected based on fundamental physics or logical signaling mismatch.' : 'Defensible engineering decision based on current platform rules.'}
              />

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lab Takeaways</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    'A valid link is the result of multiple constraints, not one speed field.',
                    'Signal type, FEC expectations, connector style, and fiber assumptions all matter.',
                    'Warnings should drive the next validation step, not be treated as UI noise.',
                    'Use this lab after learning physical and signaling concepts, not before them.',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default SmartCompatibility;
