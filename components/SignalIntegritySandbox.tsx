
import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  CheckCircle2, 
  Eye,
  Waves,
  Cpu,
  Ruler
} from 'lucide-react';
import { motion } from 'framer-motion';

const SignalIntegritySandbox: React.FC = () => {
  const [fiberLength, setFiberLength] = useState(2); // km
  const [connectorLoss, setConnectorLoss] = useState(0.5); // dB
  const [laserPower, setLaserPower] = useState(0); // dBm
  const [fecEnabled, setFecEnabled] = useState(true);
  const [modulation, setModulation] = useState<'NRZ' | 'PAM4'>('PAM4');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derived metrics
  const fiberLossPerKm = 0.35; // OS2 typical
  const totalFiberLoss = fiberLength * fiberLossPerKm;
  const totalLoss = totalFiberLoss + connectorLoss;
  const rxPower = laserPower - totalLoss;
  
  // Signal quality calculation (simplified for visualization)
  const noiseFloor = -25;
  const snr = rxPower - noiseFloor;
  const eyeOpening = Math.max(0, Math.min(1, (snr - 5) / 15));
  
  // BER estimation
  const rawBer = Math.pow(10, - (eyeOpening * 10 + 2));
  const postFecBer = fecEnabled ? Math.pow(rawBer, 2) * 1e-5 : rawBer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * (width / 10), 0);
      ctx.lineTo(i * (width / 10), height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * (height / 10));
      ctx.lineTo(width, i * (height / 10));
      ctx.stroke();
    }

    // Draw Eye Diagram
    const levels = modulation === 'NRZ' ? [0.2, 0.8] : [0.1, 0.35, 0.65, 0.9];
    const jitter = (1 - eyeOpening) * 40;
    const noise = (1 - eyeOpening) * 30;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    const drawEye = (levelStart: number, levelEnd: number, color: string, alpha: number) => {
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      
      for (let i = 0; i < 20; i++) {
        const startY = height * (1 - levelStart) + (Math.random() - 0.5) * noise;
        const endY = height * (1 - levelEnd) + (Math.random() - 0.5) * noise;
        const midX = width / 2 + (Math.random() - 0.5) * jitter;
        
        ctx.beginPath();
        ctx.moveTo(0, startY);
        ctx.bezierCurveTo(
          midX - 20, startY,
          midX + 20, endY,
          width, endY
        );
        ctx.stroke();
      }
    };

    const colors = modulation === 'NRZ' ? ['#3b82f6'] : ['#3b82f6', '#6366f1', '#8b5cf6'];
    
    levels.forEach((l1, i) => {
      levels.forEach((l2, j) => {
        drawEye(l1, l2, colors[Math.min(i, j, colors.length - 1)], 0.15 * eyeOpening + 0.05);
      });
    });

    ctx.globalAlpha = 1;
  }, [eyeOpening, modulation]);

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
          <Activity className="text-blue-600 dark:text-blue-400" />
          Signal Integrity Sandbox
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Observe how physical layer impairments like attenuation and connector loss impact the PAM4 eye diagram and Bit Error Rate (BER).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-8">
            
            {/* Modulation Toggle */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Modulation Scheme</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                <button 
                  onClick={() => setModulation('NRZ')}
                  className={`py-2 rounded-lg text-xs font-black transition-all ${modulation === 'NRZ' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  NRZ (10/25G)
                </button>
                <button 
                  onClick={() => setModulation('PAM4')}
                  className={`py-2 rounded-lg text-xs font-black transition-all ${modulation === 'PAM4' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  PAM4 (100/400G)
                </button>
              </div>
            </div>

            {/* Fiber Length */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiber Length (km)</label>
                <span className="text-sm font-mono font-bold text-blue-600">{fiberLength} km</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.1"
                value={fiberLength}
                onChange={(e) => setFiberLength(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                <span>0km</span>
                <span>10km (LR Reach)</span>
              </div>
            </div>

            {/* Connector Loss */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connector Loss (dB)</label>
                <span className="text-sm font-mono font-bold text-amber-600">{connectorLoss} dB</span>
              </div>
              <input 
                type="range" min="0" max="3" step="0.1"
                value={connectorLoss}
                onChange={(e) => setConnectorLoss(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                <span>0dB</span>
                <span>3dB (Dirty/Misaligned)</span>
              </div>
            </div>

            {/* Laser Power */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TX Power (dBm)</label>
                <span className="text-sm font-mono font-bold text-emerald-600">{laserPower} dBm</span>
              </div>
              <input 
                type="range" min="-5" max="5" step="0.5"
                value={laserPower}
                onChange={(e) => setLaserPower(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* FEC Toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setFecEnabled(!fecEnabled)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${fecEnabled ? 'bg-blue-600/10 border-blue-600/30 text-blue-600' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500'}`}
              >
                <div className="flex items-center gap-3">
                  <Cpu size={20} />
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-widest">Forward Error Correction</div>
                    <div className="text-[10px] opacity-70">KP4 FEC (IEEE 802.3bs)</div>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${fecEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${fecEnabled ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Right: Visualization & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Eye Diagram Display */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Real-time Eye Diagram</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Simulated {modulation} Signal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Eye Opening</div>
                  <div className={`text-lg font-black font-mono ${(eyeOpening * 100) > 40 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(eyeOpening * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="relative aspect-video bg-black/40 rounded-xl border border-white/5 overflow-hidden">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={450} 
                className="w-full h-full"
              />
              
              {/* Overlay labels */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                {modulation === 'PAM4' ? (
                  <>
                    <div className="text-[8px] font-bold text-slate-600 uppercase">Level 3 (11)</div>
                    <div className="text-[8px] font-bold text-slate-600 uppercase mt-8">Level 2 (10)</div>
                    <div className="text-[8px] font-bold text-slate-600 uppercase mt-8">Level 1 (01)</div>
                    <div className="text-[8px] font-bold text-slate-600 uppercase mt-8">Level 0 (00)</div>
                  </>
                ) : (
                  <>
                    <div className="text-[8px] font-bold text-slate-600 uppercase">Level 1 (High)</div>
                    <div className="text-[8px] font-bold text-slate-600 uppercase mt-24">Level 0 (Low)</div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">RX Power</div>
                <div className={`text-xl font-black font-mono ${rxPower > -15 ? 'text-white' : 'text-red-400'}`}>
                  {rxPower.toFixed(2)} <span className="text-[10px] opacity-50">dBm</span>
                </div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">SNR</div>
                <div className="text-xl font-black font-mono text-white">
                  {snr.toFixed(1)} <span className="text-[10px] opacity-50">dB</span>
                </div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Raw BER</div>
                <div className="text-xl font-black font-mono text-white">
                  10<sup className="text-xs">-{Math.round(-Math.log10(rawBer))}</sup>
                </div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Post-FEC BER</div>
                <div className={`text-xl font-black font-mono ${postFecBer < 1e-12 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {postFecBer < 1e-15 ? '< 10⁻¹⁵' : `10⁻${Math.round(-Math.log10(postFecBer))}`}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Waves size={20} className="text-blue-500" />
              Engineering Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                  <Ruler className="text-slate-400 mt-1 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Link Budget Impact</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Total channel loss is <span className="font-bold text-slate-700 dark:text-slate-300">{totalLoss.toFixed(2)} dB</span>. 
                      At {fiberLength}km, fiber attenuation accounts for {((totalFiberLoss/totalLoss)*100).toFixed(0)}% of total loss.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                  <Zap className="text-amber-500 mt-1 shrink-0" size={18} />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Signal Degradation</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {eyeOpening < 0.3 ? 
                        "The eye is nearly closed. Without FEC, this link would be unstable or completely down." : 
                        "The eye opening is healthy. Signal-to-Noise ratio is sufficient for reliable data recovery."
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-2xl border border-blue-600/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">FEC Performance</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Forward Error Correction is currently {fecEnabled ? 'correcting' : 'bypassed'}. 
                    {fecEnabled ? 
                      ` It is providing a coding gain that improves the BER from 10⁻${Math.round(-Math.log10(rawBer))} to 10⁻${Math.round(-Math.log10(postFecBer))}.` : 
                      " Without FEC, the receiver must rely purely on the raw optical signal quality."
                    }
                  </p>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${eyeOpening * 100}%` }}
                      className={`h-full ${eyeOpening > 0.5 ? 'bg-emerald-500' : eyeOpening > 0.3 ? 'bg-amber-500' : 'bg-red-500'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignalIntegritySandbox;
