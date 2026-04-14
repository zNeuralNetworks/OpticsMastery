
import React from 'react';
import { 
  X, 
  TrendingUp, 
  Settings2, 
  Activity,
  Box,
  CheckCircle2
} from 'lucide-react';
import { BACKLOG_DATA } from '../data/backlog';

interface EngineeringBacklogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EngineeringBacklog: React.FC<EngineeringBacklogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-[90rem] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950/40">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Settings2 className="text-blue-600" />
              Engineering Improvement Backlog
            </h2>
            <p className="text-sm text-slate-500 mt-1">Strategic roadmap for Optics Master platform evolution.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {BACKLOG_DATA.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${section.bgColor} ${section.color}`}>
                    <section.icon size={22} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-widest font-mono leading-tight">
                    {section.category}
                  </h3>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, i) => (
                    <div key={i} className={`group relative p-4 rounded-2xl border transition-all hover:shadow-lg ${
                      item.status === 'completed' 
                        ? 'border-green-500/20 bg-green-500/5' 
                        : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30 hover:border-blue-500/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        {item.status === 'completed' ? (
                          <CheckCircle2 size={14} className="mt-1 text-green-500 shrink-0" />
                        ) : (
                          <TrendingUp size={14} className="mt-1 text-slate-400 group-hover:text-blue-50 transition-colors shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className={`text-xs font-bold leading-snug ${
                              item.status === 'completed' ? 'text-green-700 dark:text-green-300' : 'text-slate-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                            }`}>
                              {item.title}
                            </h4>
                            {item.status === 'completed' && (
                              <span className="text-[8px] font-black uppercase tracking-tighter bg-green-500 text-white px-1.5 py-0.5 rounded shadow-sm">Completed</span>
                            )}
                          </div>
                          <p className={`text-[11px] leading-relaxed ${
                            item.status === 'completed' ? 'text-green-600/70 dark:text-green-400/60' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20 text-[10px] font-mono text-slate-400 tracking-widest uppercase">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Activity size={10} /> Sync: 2024.Q4</span>
            <span className="flex items-center gap-1.5"><Box size={10} /> Active Projects: 20</span>
          </div>
          <div className="italic normal-case text-slate-500">
            Submit formal feature requests via the Engineering Support Portal.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineeringBacklog;
