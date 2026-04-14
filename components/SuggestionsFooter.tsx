
import React from 'react';
import { 
  Settings2,
  Activity, 
  Database,
  MessageSquare,
  Globe,
  ChevronRight
} from 'lucide-react';

interface SuggestionsFooterProps {
  onOpenBacklog: () => void;
}

const SuggestionsFooter: React.FC<SuggestionsFooterProps> = ({ onOpenBacklog }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-white/10 pt-12 pb-16 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600/5 to-transparent dark:from-blue-400/5 rounded-3xl border border-blue-200/20 dark:border-blue-500/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse-slow"></div>
            <div className="relative p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl group-hover:scale-110 transition-transform">
              <Settings2 className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Platform Engineering Backlog
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Explore the technical roadmap including 800G validation matrices, signal tuning guides, and real-time DSP visualization tools.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onOpenBacklog}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
          >
            Launch Roadmap Viewer
            <ChevronRight size={18} />
          </button>
          
          <div className="flex gap-2">
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm">
              <MessageSquare size={18} />
            </button>
            <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm">
              <Globe size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 py-6 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Activity size={10} /> Engine: v2.4.0-Stable</span>
          <span className="flex items-center gap-1.5"><Database size={10} /> Part Catalog: 2024.Q4</span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-600 italic">
          Optics Master is an independent decision support surface. Verify all link budgets with official technical datasheets.
        </div>
      </div>
    </footer>
  );
};

export default SuggestionsFooter;
