import React, { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const BreakoutSelector: React.FC = () => {
  const [mode, setMode] = useState<'1x400G' | '4x100G' | '2x200G'>('1x400G');

  return (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap size={20} className="text-blue-500" /> Breakout Visualizer
        </h4>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['1x400G', '4x100G', '2x200G'] as const).map(m => (
            <button 
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-40 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center p-8">
        <div className="flex items-center gap-12">
          {/* Switch Port */}
          <div className="w-24 h-24 bg-slate-900 rounded-xl border-4 border-slate-800 flex items-center justify-center text-white font-black text-xs uppercase tracking-tighter text-center p-2">
            QSFP-DD<br/>400G
          </div>

          <ArrowRight className="text-slate-300" size={32} />

          {/* Breakout Ports */}
          <div className="flex flex-col gap-2">
            {mode === '1x400G' && (
              <motion.div layoutId="port" className="w-24 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">1x 400G</motion.div>
            )}
            {mode === '4x100G' && [1, 2, 3, 4].map(i => (
              <motion.div key={i} layoutId={`port-${i}`} className="w-24 h-6 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-[9px]">100G #{i}</motion.div>
            ))}
            {mode === '2x200G' && [1, 2].map(i => (
              <motion.div key={i} layoutId={`port-200-${i}`} className="w-24 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">200G #{i}</motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
