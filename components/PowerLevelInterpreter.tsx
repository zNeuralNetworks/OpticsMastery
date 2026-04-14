
import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, XCircle, ArrowDown } from 'lucide-react';
import { SignalMode } from '../features/power-meter/types';
import { SIGNAL_RANGES } from '../features/power-meter/data/ranges';
import { analyzeSignalStatus, calculateGaugePosition, getBandWidth } from '../features/power-meter/lib/analysis';

const PowerLevelInterpreter: React.FC = () => {
  const [value, setValue] = useState<string>('-4.50');
  const [mode, setMode] = useState<SignalMode>('PAM4_SMF');

  const range = SIGNAL_RANGES[mode];
  const numValue = parseFloat(value);

  // Derived State via Pure Functions
  const status = analyzeSignalStatus(numValue, range);
  const pointerPos = calculateGaugePosition(numValue, range);

  // Visualization Boundaries (for the gauge background)
  const graphMin = range.min - 3;
  const graphMax = range.max + 3;

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Activity className="text-blue-600 dark:text-blue-400" />
          Signal Interpreter
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Translate raw dBm values from CLI into actionable health status.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden">
        
        {/* Controls */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Optic Category</label>
            <div className="space-y-2">
              {Object.entries(SIGNAL_RANGES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setMode(key as SignalMode)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group
                    ${mode === key 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                    }`}
                >
                  <span className="font-bold text-sm">{config.label}</span>
                  {mode === key && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Measured Rx Power (dBm)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 text-4xl font-mono font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-center"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">dBm</span>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              {range.desc}
            </p>
          </div>
        </div>

        {/* Visualizer */}
        <div className="p-8">
          <div className="relative h-24 mt-4 mb-8">
            {/* Range Bar */}
            <div className="absolute top-8 left-0 right-0 h-6 rounded-full overflow-hidden flex text-[0px] shadow-inner border border-slate-200 dark:border-slate-700">
              {/* Critical Low */}
              <div style={{ width: getBandWidth(graphMin, range.min, range) }} className="h-full bg-red-500/80 transition-all duration-500"></div>
              {/* Warning Low */}
              <div style={{ width: getBandWidth(range.min, range.goodLow, range) }} className="h-full bg-yellow-500/80 transition-all duration-500"></div>
              {/* Good */}
              <div style={{ width: getBandWidth(range.goodLow, range.goodHigh, range) }} className="h-full bg-green-500/80 transition-all duration-500"></div>
              {/* Warning High */}
              <div style={{ width: getBandWidth(range.goodHigh, range.max, range) }} className="h-full bg-yellow-500/80 transition-all duration-500"></div>
              {/* Critical High */}
              <div style={{ width: getBandWidth(range.max, graphMax, range) }} className="h-full bg-red-500/80 transition-all duration-500"></div>
            </div>

            {/* Labels */}
            <div className="absolute top-16 w-full text-[10px] font-bold text-slate-400 font-mono flex justify-between px-1">
              <span>{graphMin.toFixed(0)}</span>
              <span style={{ left: `${calculateGaugePosition(range.goodLow, range)}%` }} className="absolute -translate-x-1/2 hidden md:block">{range.goodLow}</span>
              <span style={{ left: `${calculateGaugePosition(range.goodHigh, range)}%` }} className="absolute -translate-x-1/2 hidden md:block">{range.goodHigh}</span>
              <span>+{graphMax.toFixed(0)}</span>
            </div>

            {/* Pointer */}
            <div 
              className="absolute top-0 -ml-3 transition-all duration-300 ease-out flex flex-col items-center z-10"
              style={{ left: `${pointerPos}%` }}
            >
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded mb-1 shadow-lg whitespace-nowrap font-mono">
                {Number(value).toFixed(2)} dBm
              </div>
              <ArrowDown size={24} className="text-slate-900 dark:text-white drop-shadow-md" fill="currentColor" />
            </div>
          </div>

          {/* Result Block */}
          <div className={`rounded-xl border p-6 flex items-start gap-5 transition-colors ${
            status === 'GOOD' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' :
            status === 'WARNING' || status === 'HIGH' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30' :
            'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
          }`}>
            <div className={`p-3 rounded-full shadow-sm shrink-0 ${
               status === 'GOOD' ? 'bg-green-500 text-white' :
               status === 'WARNING' || status === 'HIGH' ? 'bg-yellow-500 text-white' :
               'bg-red-500 text-white'
            }`}>
              {status === 'GOOD' ? <CheckCircle2 size={24} /> : status === 'WARNING' || status === 'HIGH' ? <AlertTriangle size={24} /> : <XCircle size={24} />}
            </div>
            
            <div>
              <h4 className="text-lg font-black uppercase tracking-tight mb-2">
                {status === 'GOOD' ? 'Optimal Signal Level' : 
                 status === 'WARNING' ? 'Marginal Signal (Low)' :
                 status === 'HIGH' ? 'Marginal Signal (High)' :
                 status === 'DAMAGE' ? 'Receiver Overload (Risk)' :
                 'Critical Signal Loss (LOS)'}
              </h4>
              
              <div className="space-y-2 text-sm font-medium opacity-90">
                {status === 'GOOD' && <p>The receiver is operating within the ideal linear range. Typical for healthy links with clean connectors.</p>}
                {status === 'WARNING' && <p>Power is approaching the sensitivity floor. Check for dirty fiber end-faces or excessive cable bends. Bit errors may occur.</p>}
                {status === 'CRITICAL' && <p>Signal is below the receiver sensitivity threshold. Link will likely flap or stay down. This usually indicates a broken fiber, severe bend, or disconnected patch.</p>}
                {status === 'HIGH' && <p>Signal is hotter than optimal. While usually safe, consider adding attenuation if it approaches the max threshold.</p>}
                {status === 'DAMAGE' && <p><strong>DANGER:</strong> Signal exceeds the damage threshold. You risk burning out the photo-detector. <strong>Insert an attenuator immediately</strong> (e.g., 5dB or 10dB) before connecting.</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PowerLevelInterpreter;
