
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Ruler, 
  Settings2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { calculateLinkBudget } from '../features/link-budget/lib/calculation';
import { LinkBudgetInputs } from '../features/link-budget/types';
import { motion } from 'framer-motion';
import { Zap, Activity } from 'lucide-react';

interface LinkBudgetResult {
  fiberLossDb: number;
  connectorLossDb: number;
  spliceLossDb: number;
  totalLossDb: number;
  marginDb: number;
  status: 'PASS' | 'WARN' | 'FAIL';
}

const LinkVisualizer: React.FC<{ inputs: LinkBudgetInputs; result: LinkBudgetResult }> = ({ inputs, result }) => {
  return (
    <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800 shadow-2xl overflow-hidden relative mb-10 group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Ruler className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tightest leading-extra-tight">Optical Path Visualization</h3>
            <p className="micro-label">Cumulative Loss Distribution</p>
          </div>
        </div>
      </div>

      <div className="relative h-32 flex items-center justify-center px-10">
        <div className="absolute h-1 bg-slate-800 w-full left-0 rounded-full" />
        
        <div className="absolute left-0 flex flex-col items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">TX Node</span>
        </div>

        <div className="flex-1 h-2 bg-blue-500/20 mx-12 rounded-full relative group/fiber">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-0 group-hover/fiber:opacity-100 transition-opacity">
            {inputs.distanceMeters}m Fiber (-{result.fiberLossDb.toFixed(2)}dB)
          </div>
        </div>

        <div className="absolute right-0 flex flex-col items-center">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
            <Activity size={20} className="text-slate-400" />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase mt-2 tracking-widest">RX Node</span>
        </div>

        {Array.from({ length: inputs.connectorPairs }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-1 h-6 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ left: `${15 + (i * (70 / (inputs.connectorPairs || 1)))}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-amber-500 uppercase whitespace-nowrap">Conn {i+1}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
          <div className="micro-label mb-1">Total Loss</div>
          <div className="text-xl font-black text-white font-mono">{result.totalLossDb.toFixed(2)}<span className="text-xs ml-1 opacity-50">dB</span></div>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
          <div className="micro-label mb-1">Budget Used</div>
          <div className="text-xl font-black text-white font-mono">{((result.totalLossDb / inputs.opticBudgetDb) * 100).toFixed(0)}<span className="text-xs ml-1 opacity-50">%</span></div>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50">
          <div className="micro-label mb-1">Status</div>
          <div className={`text-xl font-black font-mono ${result.status === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>{result.status}</div>
        </div>
      </div>
    </div>
  );
};

interface LinkBudgetCalculatorProps {
  initialParams?: { budget?: number; fiberType?: 'SMF' | 'MMF' } | null;
}

const LinkBudgetCalculator: React.FC<LinkBudgetCalculatorProps> = ({ initialParams }) => {
  const [fiberType, setFiberType] = useState<'SMF' | 'MMF'>('SMF');
  const [distance, setDistance] = useState(500);
  const [connectors, setConnectors] = useState(2);
  const [splices, setSplices] = useState(0);
  const [budget, setBudget] = useState(4.0);
  const [margin, setMargin] = useState(1.0);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attOverride, setAttOverride] = useState<string>('');
  const [connOverride, setConnOverride] = useState<string>('');
  const [spliceOverride, setSpliceOverride] = useState<string>('');

  const [copied, setCopied] = useState(false);

  // Handle prefill
  useEffect(() => {
    if (initialParams) {
      if (initialParams.fiberType) setFiberType(initialParams.fiberType);
      if (initialParams.budget !== undefined) setBudget(initialParams.budget);
    }
  }, [initialParams]);

  const inputs: LinkBudgetInputs = {
    fiberType,
    distanceMeters: distance,
    connectorPairs: connectors,
    spliceCount: splices,
    opticBudgetDb: budget,
    includeMarginDb: margin,
    attenuationOverride: attOverride ? parseFloat(attOverride) : undefined,
    connectorLossOverride: connOverride ? parseFloat(connOverride) : undefined,
    spliceLossOverride: spliceOverride ? parseFloat(spliceOverride) : undefined,
  };

  const result = useMemo(() => calculateLinkBudget(inputs), [inputs]);

  const handleCopy = () => {
    const text = `
Optical Link Budget Report
--------------------------
Status: ${result.status}
Fiber Type: ${fiberType}
Distance: ${distance}m (${(distance/1000).toFixed(2)}km)
Total Est. Loss: ${result.totalLossDb.toFixed(2)} dB
Remaining Margin: ${result.marginDb.toFixed(2)} dB
Optic Budget: ${budget} dB

Breakdown:
- Fiber Loss: ${result.fiberLossDb.toFixed(2)} dB
- Connector Loss (${connectors} pairs): ${result.connectorLossDb.toFixed(2)} dB
- Splice Loss (${splices}): ${result.spliceLossDb.toFixed(2)} dB
- Included Margin: ${margin} dB

Assumptions:
- ${result.notes.join('\n- ')}

Generated by Optics Master
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Ruler className="text-blue-600 dark:text-blue-400" />
          Link Budget Calculator
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Estimate optical channel loss and validate against transceiver power budgets.
        </p>
      </div>
      
      <LinkVisualizer inputs={inputs} result={result} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
            {/* Media Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Fiber Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setFiberType('SMF')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${fiberType === 'SMF' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  Singlemode (OS2)
                </button>
                <button 
                  onClick={() => setFiberType('MMF')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all border ${fiberType === 'MMF' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  Multimode (OM4)
                </button>
              </div>
            </div>

            {/* Distance & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Distance (Meters)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={distance} 
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold uppercase">M</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">Equivalent to {(distance/1000).toFixed(3)} km</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Optic Loss Budget (dB)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={budget} 
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold uppercase">dB</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">Found in transceiver specification</p>
              </div>
            </div>

            {/* Connectors & Splices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Connector Pairs</label>
                <input 
                  type="number" 
                  value={connectors} 
                  onChange={(e) => setConnectors(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Splice Count</label>
                <input 
                  type="number" 
                  value={splices} 
                  onChange={(e) => setSplices(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Safety Margin */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Safety Margin (dB)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.5"
                  value={margin} 
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold uppercase">dB</span>
              </div>
            </div>

            {/* Advanced Assuptions */}
            <div className="pt-4">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors"
              >
                <Settings2 size={14} />
                Advanced Assumptions
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showAdvanced && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Atten (dB/km)</label>
                    <input type="number" step="0.01" value={attOverride} onChange={e => setAttOverride(e.target.value)} placeholder={fiberType === 'SMF' ? "0.35" : "3.00"} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Conn Loss (dB)</label>
                    <input type="number" step="0.01" value={connOverride} onChange={e => setConnOverride(e.target.value)} placeholder="0.50" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Splice Loss (dB)</label>
                    <input type="number" step="0.01" value={spliceOverride} onChange={e => setSpliceOverride(e.target.value)} placeholder="0.10" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono outline-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`bg-white dark:bg-slate-900 rounded-xl border p-8 shadow-lg relative overflow-hidden transition-colors ${
            result.status === 'PASS' ? 'border-green-500/30' : 
            result.status === 'WARN' ? 'border-yellow-500/30' : 
            'border-red-500/30'
          }`}>
            <div className={`absolute top-0 right-0 px-6 py-2 text-xs font-black uppercase tracking-widest text-white shadow-sm ${
              result.status === 'PASS' ? 'bg-green-500' : 
              result.status === 'WARN' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}>
              {result.status}
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className={`p-4 rounded-full shadow-lg ${
                result.status === 'PASS' ? 'bg-green-500 text-white' : 
                result.status === 'WARN' ? 'bg-yellow-500 text-white' : 
                'bg-red-500 text-white'
              }`}>
                {result.status === 'PASS' ? <CheckCircle2 size={32} /> : 
                 result.status === 'WARN' ? <AlertTriangle size={32} /> : 
                 <XCircle size={32} />}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Resulting Margin</div>
                <h3 className="text-4xl font-black font-mono tracking-tighter">
                  {result.marginDb > 0 ? '+' : ''}{result.marginDb.toFixed(2)} <span className="text-sm font-sans uppercase opacity-50 ml-1">dB</span>
                </h3>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-4 mb-8">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Loss Breakdown</h4>
              <div className="space-y-2">
                {[
                  { label: 'Fiber Loss', val: result.fiberLossDb },
                  { label: 'Connectors', val: result.connectorLossDb },
                  { label: 'Splices', val: result.spliceLossDb },
                  { label: 'Safety Margin', val: inputs.includeMarginDb },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center group">
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{item.val.toFixed(2)} dB</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Total Channel Loss</span>
                  <span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400">{result.totalLossDb.toFixed(2)} dB</span>
                </div>
              </div>
            </div>

            {/* Rules / Disclaimer */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-white/5 mb-8">
              <div className="flex items-start gap-2">
                 <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                 <p className="text-[10px] text-slate-500 leading-relaxed italic">
                   Note: Budget calculations use conservative typical values. Field results vary based on splice quality and fiber age.
                 </p>
              </div>
              <div className="flex items-start gap-2">
                 <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold leading-relaxed uppercase">
                   Always verify optic power budget (dB) against the official technical specifications for your specific SKU.
                 </p>
              </div>
            </div>

            <button 
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-md active:scale-95"
            >
              {copied ? <><Check size={14} className="text-green-400"/> Copied Report</> : <><Copy size={14}/> Copy Plain Text Report</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkBudgetCalculator;
