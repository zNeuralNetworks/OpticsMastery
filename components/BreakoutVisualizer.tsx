
import React from 'react';
import { Zap, Info, Server, AlertTriangle, Settings2, Cable } from 'lucide-react';
import { BREAKOUT_CONFIGS } from '../features/breakout/data/configs';

const BreakoutVisualizer: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Cable Configurator</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-4xl">
          Visualizing the three primary methods to breakout a 400G switch port to 100G hosts.
        </p>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-slate-900 dark:bg-none">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-700 dark:text-indigo-300">Learning Lab</div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">What this teaches</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            'Breakout is a lane-mapping and host-attachment decision, not just a cable selection problem.',
            'Connector family, media type, and host NIC assumptions change which breakout approach is valid.',
            'Short-reach and parallel-optics options create different operational and BOM consequences.',
            'Use this lab to understand why a breakout path works before choosing a specific SKU family.',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {BREAKOUT_CONFIGS.map((config) => {
          const isSMF = config.id === 'SMF';
          const isPassive = config.id === 'DAC_PASSIVE';
          const isActive = config.id === 'DAC_ACTIVE';

          return (
            <div key={config.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg">
                
                <div className={`px-8 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${
                    isSMF ? 'bg-blue-50 dark:bg-blue-900/10' : 
                    isPassive ? 'bg-orange-50 dark:bg-orange-900/10' : 
                    'bg-red-50 dark:bg-red-900/10'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            isSMF ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            isPassive ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                            {isSMF ? <Zap size={20} /> : isPassive ? <Cable size={20} /> : <Settings2 size={20} />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{config.title}</h3>
                    </div>
                    {isActive && (
                        <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border border-red-200 dark:border-red-900/30">
                            <AlertTriangle size={12} /> Legacy Compatibility
                        </div>
                    )}
                </div>

                <div className="p-8">
                    
                    <div className="relative mb-12">
                        <div className={`absolute inset-0 -mx-8 -my-4 opacity-5 pointer-events-none bg-gradient-to-r 
                            ${isSMF ? 'from-blue-500/20 via-transparent to-blue-500/20' : ''}
                            ${isPassive ? 'from-orange-500/20 via-transparent to-orange-500/20' : ''}
                            ${isActive ? 'from-red-500/20 via-transparent to-red-500/20' : ''}
                        `} />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                            
                            <div className="w-full lg:w-64 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Leaf Switch (400G)</div>
                                <div className="w-full h-16 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center relative mb-2">
                                    <div className="w-24 h-6 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded flex items-center justify-center shadow-inner">
                                        <div className="w-20 h-1 bg-slate-400 dark:bg-black/50 rounded-full"></div>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-sm font-mono font-bold ${isSMF ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                    {config.switchSku}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{config.switchDesc}</div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center relative w-full lg:w-auto">
                                <div className={`w-full lg:w-[calc(100%+4rem)] h-1.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-0 hidden lg:block
                                    ${isSMF ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}
                                `}>
                                    <div className="absolute top-0 left-0 h-full w-24 bg-white/60 dark:bg-white/40 skew-x-12 animate-shimmer"></div>
                                </div>
                                <div className={`h-16 w-1.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-0 lg:hidden
                                    ${isSMF ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'bg-slate-300 dark:bg-slate-700'}
                                `}></div>

                                <div className={`relative z-10 bg-white dark:bg-slate-900 border px-4 py-2 rounded-lg shadow-md flex items-center gap-3
                                    ${isSMF ? 'border-blue-500/50' : isPassive ? 'border-orange-500/50' : 'border-red-500/50'}
                                `}>
                                    {isActive && <Settings2 className="text-red-500 animate-pulse" size={16} />}
                                    {isSMF && <Zap className="text-yellow-500" size={16} />}
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{config.cableSku}</div>
                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{config.cableDesc}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-64 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Host NIC (100G)</div>
                                <div className="w-full h-16 flex flex-col justify-center gap-1.5 mb-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-1.5 bg-white dark:bg-slate-950 rounded-full w-full relative overflow-hidden border border-slate-200 dark:border-slate-800">
                                            <div className={`absolute top-0 left-0 h-full w-full opacity-30 ${isSMF ? 'bg-yellow-500' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                                        </div>
                                    ))}
                                </div>
                                <div className={`px-2 py-0.5 rounded text-sm font-mono font-bold 
                                    ${isActive ? 'text-red-600 dark:text-red-400' : isPassive ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}
                                `}>
                                    {config.hostSku}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{config.hostDesc}</div>
                            </div>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex gap-4">
                            <div className={`mt-1 p-2 rounded-lg h-fit ${isSMF ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : isPassive ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                <Info size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Technical Rationale</h4>
                                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {config.description}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="mt-1 p-2 rounded-lg h-fit bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                <Server size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Host Requirements</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
                                        <span className="text-slate-500">NIC:</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{config.hostReq}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
                                        <span className="text-slate-500">FEC:</span>
                                        <div className="font-mono text-slate-900 dark:text-white">{config.fecMode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
        <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lab Takeaways</div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            'Start with lane structure and host requirements, then evaluate media and cable family.',
            'The same 400G port can lead to different 100G attachment strategies with different tradeoffs.',
            'Breakout validity depends on platform support, optics architecture, and cabling model together.',
            'The next applied step is to validate the specific interface pair or part family in the link-validation and catalog tools.',
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

export default BreakoutVisualizer;
