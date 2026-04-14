
import React from 'react';
import { 
  FileText, 
  Trash2, 
  Download, 
  Plus, 
  Minus, 
  ShoppingCart,
  ArrowRight,
  Box,
  AlertCircle
} from 'lucide-react';
import { useBOM } from '../context/BOMContext';
import { motion, AnimatePresence } from 'framer-motion';

const BOMBuilder: React.FC = () => {
  const { bom, removeFromBOM, updateQuantity, clearBOM, exportBOM } = useBOM();

  const totalItems = bom.reduce((acc, item) => acc + item.quantity, 0);
  const plannerItems = bom.filter((item) => item.sourceFeature === 'ai-planner');
  const plannerUnits = plannerItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ShoppingCart className="text-blue-600 dark:text-blue-400" />
              Project BOM Builder
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
              Manage your project's Bill of Materials. Add items from the Part Finder and export for procurement.
          </p>
          {plannerItems.length > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
              AI Planner set loaded · {plannerItems.length} SKUs · {plannerUnits} units
            </div>
          )}
        </div>
        
        {bom.length > 0 && (
          <div className="flex gap-3">
            <button 
              onClick={clearBOM}
              className="px-4 py-2 text-slate-500 hover:text-red-500 font-bold text-sm transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={exportBOM}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        )}
      </div>

      {bom.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
          <Box size={64} className="mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your BOM is empty</h3>
          <p className="text-sm mb-8">Go to the Part Finder to add optics and cables to your project.</p>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity">
            Go to Part Finder <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {bom.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-6 group hover:border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
                        {item.category}{item.role ? ` · ${item.role}` : ''}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white font-mono">{item.sku}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</p>
                      {item.quantitySource && (
                        <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${item.quantitySource === 'deterministic' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.quantitySource}
                        </p>
                      )}
                      {item.sourceFeature && (
                        <p className="text-[10px] mt-2 font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          {item.sourceFeature}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-bold text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromBOM(item.id)}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-900 dark:bg-blue-600/10 rounded-3xl p-8 text-white border border-white/10 sticky top-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShoppingCart size={20} /> Project Summary
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Unique SKUs</span>
                  <span className="font-bold">{bom.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Total Units</span>
                  <span className="font-bold">{totalItems}</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Project Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/30">Ready</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-8 flex gap-3">
                <AlertCircle className="text-blue-400 shrink-0" size={18} />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Quantities are estimated based on typical deployment patterns. Verify against project-specific design requirements before ordering.
                </p>
              </div>

              <button 
                onClick={exportBOM}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-colors shadow-xl"
              >
                Generate Quote Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMBuilder;
