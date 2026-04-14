
import React, { useState } from 'react';
import { 
  Rotate3d, 
  Info, 
  Cpu, 
  Zap, 
  Maximize2, 
  ChevronRight,
  ChevronLeft,
  Box,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormFactor {
  id: string;
  name: string;
  description: string;
  dimensions: string;
  pins: number;
  lanes: number;
  maxSpeed: string;
  color: string;
  features: string[];
}

const FORM_FACTORS: FormFactor[] = [
  {
    id: 'sfp',
    name: 'SFP / SFP+',
    description: 'The standard 1-lane module for 1G to 25G. Compact and reliable.',
    dimensions: '13.4mm x 8.5mm x 56.5mm',
    pins: 20,
    lanes: 1,
    maxSpeed: '25G',
    color: 'bg-blue-500',
    features: ['Single Lane SerDes', 'Legacy Compatible', 'Low Power (< 1.5W)']
  },
  {
    id: 'qsfp',
    name: 'QSFP28 / QSFP56',
    description: 'Quad Small Form-factor Pluggable. 4 lanes for 40G to 200G.',
    dimensions: '18.35mm x 8.5mm x 72mm',
    pins: 38,
    lanes: 4,
    maxSpeed: '200G',
    color: 'bg-indigo-500',
    features: ['4 Parallel Lanes', 'MPO or LC Options', 'Standard 100G/200G']
  },
  {
    id: 'qsfp-dd',
    name: 'QSFP-DD',
    description: 'Double Density. 8 lanes for 400G and 800G. Backward compatible with QSFP.',
    dimensions: '18.35mm x 8.5mm x 78mm',
    pins: 76,
    lanes: 8,
    maxSpeed: '800G',
    color: 'bg-emerald-500',
    features: ['8 Parallel Lanes', 'Double Row of Pins', 'Backward Compatible with QSFP']
  },
  {
    id: 'osfp',
    name: 'OSFP',
    description: 'Octal Small Form-factor Pluggable. Integrated heat sink for 800G+.',
    dimensions: '22.58mm x 13mm x 100mm',
    pins: 60,
    lanes: 8,
    maxSpeed: '1.6T',
    color: 'bg-purple-600',
    features: ['Integrated Heat Sink', 'High Power (up to 30W)', 'Future-proof for 1.6T']
  }
];

const FormFactorExplorer: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState({ x: -15, y: 45 });
  const [isRotating, setIsRotating] = useState(true);

  const current = FORM_FACTORS[activeIndex];

  const next = () => setActiveIndex((prev) => (prev + 1) % FORM_FACTORS.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + FORM_FACTORS.length) % FORM_FACTORS.length);

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
          <Box className="text-blue-600 dark:text-blue-400" />
          3D Form Factor Explorer
        </h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Rotate and inspect the physical architecture of optical transceivers. Observe the evolution from single-lane SFP to high-density OSFP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: 3D Visualization */}
        <div className="lg:col-span-7 relative h-[500px] flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-white/5 shadow-inner overflow-hidden group">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Controls Overlay */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
            <button 
              onClick={() => setIsRotating(!isRotating)}
              className={`p-3 rounded-xl border transition-all ${isRotating ? 'bg-blue-600 text-white border-blue-500' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-white/10'}`}
            >
              <Rotate3d size={20} />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
            <button onClick={prev} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              <ChevronLeft size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex gap-2">
              {FORM_FACTORS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
              ))}
            </div>
            <button onClick={next} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              <ChevronRight size={24} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* 3D Scene */}
          <div 
            className="perspective-1000 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseMove={(e) => {
              if (e.buttons === 1) {
                setRotation(prev => ({
                  x: prev.x - e.movementY * 0.5,
                  y: prev.y + e.movementX * 0.5
                }));
                setIsRotating(false);
              }
            }}
          >
            <motion.div 
              animate={{ 
                rotateX: rotation.x, 
                rotateY: isRotating ? [rotation.y, rotation.y + 360] : rotation.y 
              }}
              transition={isRotating ? { duration: 20, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-64 h-16"
            >
              {/* Module Body (6 faces) */}
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90 shadow-2xl`} style={{ transform: 'translateZ(16px)' }} />
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90 shadow-2xl`} style={{ transform: 'translateZ(-16px) rotateY(180deg)' }} />
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90`} style={{ height: '32px', width: '256px', transform: 'rotateX(90deg) translateZ(16px)' }} />
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90`} style={{ height: '32px', width: '256px', transform: 'rotateX(-90deg) translateZ(48px)' }} />
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90`} style={{ height: '64px', width: '32px', transform: 'rotateY(90deg) translateZ(240px)' }} />
              <div className={`absolute inset-0 ${current.color} border border-white/20 opacity-90`} style={{ height: '64px', width: '32px', transform: 'rotateY(-90deg) translateZ(16px)' }} />
              
              {/* Latch Handle */}
              <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-8 h-12 bg-slate-400 rounded-r-lg border border-white/20" style={{ transform: 'translateZ(0)' }} />
              
              {/* Pins (Gold contacts) */}
              <div className="absolute left-0 top-0 w-16 h-full flex flex-col justify-around p-1" style={{ transform: 'translateZ(17px)' }}>
                {Array.from({ length: current.lanes }).map((_, i) => (
                  <div key={i} className="h-1 bg-yellow-500/80 rounded-full w-full shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                ))}
              </div>

              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(17px)' }}>
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest font-mono">{current.name}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={current.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${current.color} shadow-lg`} />
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{current.name}</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {current.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Maximize2 size={12} /> Dimensions
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.dimensions}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Zap size={12} /> Max Speed
                  </div>
                  <div className="text-sm font-bold text-blue-600 font-mono">{current.maxSpeed}</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Layers size={12} /> Pin Count
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.pins} Contacts</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Cpu size={12} /> SerDes Lanes
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">{current.lanes} x Differential</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Key Architectural Features</h4>
                <div className="space-y-2">
                  {current.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-white/5">
                      <ChevronRight size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600/5 dark:bg-blue-600/10 p-6 rounded-2xl border border-blue-600/20">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                    <strong>Engineering Note:</strong> {current.id === 'qsfp-dd' ? 
                      "QSFP-DD achieves 400G by adding a second row of pins while maintaining the same width as legacy QSFP, allowing for high-density backward compatibility." : 
                      current.id === 'osfp' ? 
                      "OSFP is slightly wider than QSFP and includes an integrated heat sink, allowing it to handle the thermal load of 800G and 1.6T optics more efficiently." :
                      "Form factor selection is driven by port density requirements and the thermal profile of the optical engine."
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FormFactorExplorer;
