import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

export const FECChecker: React.FC = () => {
  const [speed, setSpeed] = useState('400G');
  const [optic, setOptic] = useState('DR4');

  const getFEC = () => {
    if (speed === '400G') return 'RS-FEC (544, 514)';
    if (speed === '100G' && optic === 'SR4') return 'RS-FEC (528, 514)';
    return 'None / Optional';
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCcw size={20} className="text-indigo-500" /> FEC Interop Matrix
        </h4>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Alignment</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port Speed</label>
          <select 
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
          >
            <option>100G</option>
            <option>400G</option>
            <option>800G</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optic Type</label>
          <select 
            value={optic}
            onChange={(e) => setOptic(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none"
          >
            <option>SR4</option>
            <option>DR4</option>
            <option>FR4</option>
            <option>ZR</option>
          </select>
        </div>
      </div>

      <div className="p-6 bg-indigo-500 rounded-2xl text-white text-center shadow-lg shadow-indigo-500/20">
        <div className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em] mb-2">Required FEC Mode</div>
        <div className="text-2xl font-black aom-mono tracking-tight">{getFEC()}</div>
      </div>
    </div>
  );
};
