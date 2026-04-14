import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export const LinkBudgetCalc: React.FC = () => {
  const [tx, setTx] = useState(0);
  const [rx, setRx] = useState(-18);
  const [loss, setLoss] = useState(2.5);

  const margin = (tx - loss) - rx;
  const isSafe = margin >= 2;

  return (
    <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator size={20} className="text-emerald-500" /> Link Budget Calc
        </h4>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isSafe ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {isSafe ? 'Safe Margin' : 'Critical Loss'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tx Power (dBm)</label>
          <input 
            type="number" 
            value={tx} 
            onChange={(e) => setTx(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rx Sens (dBm)</label>
          <input 
            type="number" 
            value={rx} 
            onChange={(e) => setRx(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Loss (dB)</label>
          <input 
            type="number" 
            value={loss} 
            onChange={(e) => setLoss(Number(e.target.value))}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Calculated Margin</div>
        <div className={`text-4xl font-black tracking-tighter ${isSafe ? 'text-emerald-600' : 'text-red-600'}`}>
          {margin.toFixed(1)} <span className="text-xl">dB</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          {isSafe ? 'Link is within operational parameters.' : 'Signal attenuation exceeds receiver sensitivity.'}
        </p>
      </div>
    </div>
  );
};
