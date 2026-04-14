
import React from 'react';
import { 
  X, Shield, Target, Compass, Palette, Cpu, Zap, Globe, Activity, 
  CheckCircle2, Moon, Sun, Monitor, Type, Eye, 
  ChevronRight, BookOpen
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl transition-opacity animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-7xl bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        
        {/* Header Section */}
        <div className="p-8 md:p-12 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 relative overflow-hidden shrink-0">
          <div className="absolute right-[-20px] top-[-20px] opacity-5 rotate-12 pointer-events-none">
            <Shield size={320} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                  <Shield className="text-white" size={24} />
               </div>
               <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] aom-mono">System Specification & Philosophy</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              Optics Master
            </h2>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-4xl font-medium leading-relaxed">
              A high-fidelity decision engine designed to bridge the gap between physical photonics and logical network architecture across the 100G, 400G, and 800G spectrum.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 z-20"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Content Explorer */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin space-y-20">
          
          {/* Section: Intent & Context */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Target className="text-blue-500" size={24} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Mission Statement</h3>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                The primary intent of Optics Master is to eliminate "Analysis Paralysis" in high-speed physical layers.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                By encoding the strict geometric and signaling constraints of modern fiber optics into a deterministic logic engine, we provide engineers with a defensible source of truth for 100G+ connectivity.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col">
                <Globe className="text-indigo-500 mb-6" size={32} />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ecosystem Context</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                  Supporting the full lifecycle of high-performance networking—from standard <span className="aom-mono text-blue-500">100G QSFP28</span> datacenter pods to cutting-edge <span className="aom-mono text-indigo-500">800G OSFP</span> AI fabrics.
                </p>
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                   <div className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Baseline</div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200">100G NRZ</div>
                   </div>
                   <div className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Growth</div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200">100G/400G PAM4</div>
                   </div>
                   <div className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Next-Gen</div>
                      <div className="text-xs font-black text-slate-700 dark:text-slate-200">800G/1.6T</div>
                   </div>
                </div>
              </div>
              <div className="p-8 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20 flex flex-col">
                <Zap className="text-blue-200 mb-6" size={32} />
                <h4 className="text-lg font-bold mb-4 uppercase tracking-tight">Engineering Success</h4>
                <p className="text-sm text-blue-50 leading-relaxed flex-1 italic font-medium">
                  "A response is successful if an engineer can confidently design a 100G or 400G fabric without second-guessing physical fit or signaling logic."
                </p>
                <ul className="mt-6 space-y-2">
                   {['Defensible Recommendations', 'Deterministic Outcomes', 'Physics-First Safety'].map((item, i) => (
                     <li key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                       <CheckCircle2 size={12} className="text-blue-300" /> {item}
                     </li>
                   ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section: Typography & Design Language */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Type className="text-purple-500" size={24} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Typography & DNA</h3>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                The interface uses a dual-font strategy to separate human guidance from technical data.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Sans</div>
                   <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Inter</div>
                   <p className="text-xs text-slate-500">Optimized for UI clarity and reading complex documentation.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Mono</div>
                   <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">JetBrains Mono</div>
                   <p className="text-xs text-slate-500">Enhanced legibility for alphanumeric hardware SKUs.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <Monitor size={18} className="text-blue-500" /> Theme Architecture
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center gap-2 text-center shadow-sm">
                         <Sun className="text-orange-500" size={20} />
                         <span className="text-[10px] font-black uppercase text-slate-900">Light Lab</span>
                         <p className="text-[10px] text-slate-500 leading-tight">High-glare environments.</p>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-2 text-center shadow-sm">
                         <Moon className="text-blue-400" size={20} />
                         <span className="text-[10px] font-black uppercase text-white">Deep Dark</span>
                         <p className="text-[10px] text-slate-400 leading-tight">Default NOC theme.</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                     <Palette size={18} className="text-purple-500" /> Design Tokens
                   </h4>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Brand Blue', hex: '#003366' },
                        { name: 'Signal Green', hex: '#4DB848' },
                        { name: 'Core Slate', hex: '#020617' },
                        { name: 'Interactive', hex: '#6366f1' }
                      ].map((color, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                           <div className="w-5 h-5 rounded shadow-sm border border-black/10" style={{ backgroundColor: color.hex }} />
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-slate-400 leading-none mb-1">{color.name}</span>
                              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 leading-none">{color.hex}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-8 rounded-3xl border border-slate-200 dark:border-white/5 space-y-6">
                <div className="flex items-center gap-3">
                   <Eye size={24} className="text-blue-500" />
                   <h4 className="text-lg font-bold text-slate-900 dark:text-white">Accessibility & Legibility</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                   <div className="space-y-2 text-slate-600 dark:text-slate-400">
                      <p><strong>Color-Blind Safety:</strong> Decisions are never communicated by color alone. Every warning or success state utilizes distinct iconography (Shield, Zap, Check) and monospaced text labels.</p>
                   </div>
                   <div className="space-y-2 text-slate-600 dark:text-slate-400">
                      <p><strong>Typography Scale:</strong> The type hierarchy utilizes an <span className="font-bold text-slate-900 dark:text-white underline decoration-blue-500">8px grid system</span> to ensure consistent vertical rhythm, preventing optical fatigue during long design sessions.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Technical Constraints & Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Compass className="text-orange-500" size={24} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Boundaries & Safety</h3>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                Hard guardrails are implemented to protect physical hardware.
              </p>
              <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                 <ul className="space-y-3">
                   {[
                     "Zero speculation on inventory/availability.",
                     "No unsupported platform or media assumptions.",
                     "Deterministic rejection of mismatched polishes.",
                     "Strict compliance with industry MSA standards."
                   ].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">
                        <ChevronRight size={14} className="shrink-0" /> {item}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <Cpu size={24} className="text-green-500" />
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white">The Stack</h4>
                  </div>
                  <div className="space-y-3">
                     {[
                       { label: 'Runtime', val: 'React 19 (ESM Mode)' },
                       { label: 'Styling', val: 'Tailwind CSS (JIT Engine)' },
                       { label: 'Logic', val: 'Deterministic Pattern Matcher' },
                       { label: 'Security', val: '100% Client-Side Logic (No API)' }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{item.val}</span>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                     <BookOpen size={24} className="text-blue-500" />
                     <h4 className="text-lg font-bold text-slate-900 dark:text-white">Content Integrity</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    All technical data is mapped from official equipment datasheets and high-speed optics standards (IEEE 802.3ck, OIF CEI-112G).
                  </p>
                  <div className="pt-4 flex flex-wrap gap-2">
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter border border-slate-200 dark:border-slate-700">Multi-Source Agreement (MSA)</span>
                     <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter border border-slate-200 dark:border-slate-700">Optics Master Certified</span>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
           <div className="flex gap-8">
              <span className="flex items-center gap-1.5"><Activity size={12} /> Ver: 2.6.0-Deterministic</span>
              <span className="flex items-center gap-1.5"><Shield size={12} /> Privacy First / Offline Ready</span>
           </div>
           <div className="flex gap-8 items-center">
              <span>Built for High-Speed Ecosystems</span>
              <span className="font-black text-blue-600 dark:text-blue-400">© 2024 Optics Master Project</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
