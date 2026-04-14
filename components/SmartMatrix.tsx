
import React, { useState } from 'react';
import { 
  Grid3X3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  Maximize2,
  Minimize2,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Compatibility = 'FULL' | 'PARTIAL' | 'NONE' | 'UNKNOWN';

interface MatrixCell {
  source: string;
  dest: string;
  status: Compatibility;
  note: string;
}

const MATRIX_DATA: MatrixCell[] = [
  { source: 'SFP+', dest: 'SFP28', status: 'FULL', note: 'SFP28 ports are backward compatible with 10G SFP+.' },
  { source: 'SFP28', dest: 'SFP+', status: 'PARTIAL', note: 'SFP+ ports cannot run SFP28 at 25G; must down-rate to 10G.' },
  { source: 'QSFP28', dest: 'QSFP-DD', status: 'FULL', note: 'QSFP-DD ports accept legacy QSFP28 modules natively.' },
  { source: 'QSFP-DD', dest: 'QSFP28', status: 'PARTIAL', note: 'QSFP28 ports cannot accept QSFP-DD modules (physical/power).' },
  { source: 'QSFP-DD', dest: 'OSFP', status: 'NONE', note: 'Physically incompatible. Requires an adapter (QDD-to-OSFP).' },
  { source: 'OSFP', dest: 'QSFP-DD', status: 'NONE', note: 'Physically incompatible. Different mechanical footprints.' },
  { source: 'QSFP56', dest: 'QSFP28', status: 'PARTIAL', note: 'QSFP28 ports can run QSFP56 at 100G (NRZ), but not 200G (PAM4).' },
  { source: 'QSFP28', dest: 'QSFP+', status: 'FULL', note: 'QSFP28 ports typically support 40G QSFP+ modules.' },
];

const SmartMatrix: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<Compatibility | 'ALL'>('ALL');
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);

  const filteredData = MATRIX_DATA.filter(cell => {
    const matchesSearch = cell.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cell.dest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || cell.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Compatibility) => {
    switch (status) {
      case 'FULL': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'PARTIAL': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'NONE': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: Compatibility) => {
    switch (status) {
      case 'FULL': return <CheckCircle2 size={16} />;
      case 'PARTIAL': return <AlertTriangle size={16} />;
      case 'NONE': return <XCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Grid3X3 className="text-blue-600 dark:text-blue-400" />
          Smart Matrix
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
          Quick reference for physical fit and signaling constraints across modern form factors.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search form factors (e.g. OSFP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400" size={18} />
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['ALL', 'FULL', 'PARTIAL', 'NONE'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${
                  filterStatus === s 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredData.map((cell) => (
            <motion.div
              layout
              key={`${cell.source}-${cell.dest}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSelectedCell(cell)}
              className="group cursor-pointer bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-500/50 hover:shadow-xl transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md border ${getStatusColor(cell.status)}`}>
                    {getStatusIcon(cell.status)}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(cell.status).split(' ')[0]}`}>
                    {cell.status}
                  </span>
                </div>
                <Maximize2 size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {cell.source}
                </div>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {cell.dest}
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {cell.note}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${getStatusColor(selectedCell.status)}`}>
                      {getStatusIcon(selectedCell.status)}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fit Level</div>
                      <h3 className={`text-2xl font-black ${getStatusColor(selectedCell.status).split(' ')[0]}`}>
                        {selectedCell.status} FIT
                      </h3>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCell(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <Minimize2 size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6 p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
                   <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Source Port</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedCell.source}</div>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="h-px w-24 bg-slate-300 dark:bg-slate-700" />
                      <div className="text-[9px] font-black text-slate-400 uppercase">Mates With</div>
                   </div>
                   <div className="text-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Module Type</div>
                      <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedCell.dest}</div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info size={16} className="text-blue-500" /> Engineering Analysis
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedCell.note}
                  </p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setSelectedCell(null)}
                    className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Close Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartMatrix;
