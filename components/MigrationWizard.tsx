
import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Cable, 
  Box, 
  ArrowRight, 
  Info,
  Zap,
  Download,
  Copy
} from 'lucide-react';
import { FiberType } from '../features/migration/types';
import { SCENARIOS } from '../features/migration/data/scenarios';

const ICON_MAP = {
  'Cable': Cable
};

const MigrationWizard: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<FiberType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const activeScenario = SCENARIOS.find(s => s.id === selectedScenario);

  const handleExport = () => {
    if (!activeScenario) return;
    setIsExporting(true);
    
    // Simulate report generation
    setTimeout(() => {
      const report = `
ARISTA OPTICS MASTER - MIGRATION REPORT
---------------------------------------
Scenario: ${activeScenario.title}
Legacy Speed: ${activeScenario.legacySpeed}
Legacy Example: ${activeScenario.legacyExample}

RECOMMENDATION:
Name: ${activeScenario.recommendation.name}
SKU: ${activeScenario.recommendation.sku}
Description: ${activeScenario.recommendation.desc}
Disruption: ${activeScenario.recommendation.disruption}
Complexity: ${activeScenario.recommendation.complexity}/5
Cost: ${activeScenario.recommendation.cost}

ACTION ITEMS:
${activeScenario.recommendation.action}

ENGINEERING NOTES:
${activeScenario.recommendation.details}
      `.trim();

      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Migration_Report_${activeScenario.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ArrowRightLeft className="text-blue-600 dark:text-blue-400" />
              Legacy Migration Wizard
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
              Determine the optimal upgrade path from 10G/40G/100G to 400G based on your existing fiber plant.
          </p>
        </div>
        
        {activeScenario && (
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            {isExporting ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? 'Generating...' : 'Export Report'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: INPUT SELECTION */}
        <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Step 1: Select Current Infrastructure</h3>
            
            {SCENARIOS.map((scenario) => {
              const Icon = ICON_MAP[scenario.iconKey] || Cable;
              return (
                <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group
                        ${selectedScenario === scenario.id 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }
                    `}
                >
                    <div className={`p-2 rounded-lg ${selectedScenario === scenario.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-sm">{scenario.title}</div>
                        <div className={`text-xs mt-1 ${selectedScenario === scenario.id ? 'text-blue-100' : 'text-slate-500'}`}>
                            Ex: {scenario.legacyExample}
                        </div>
                    </div>
                    {selectedScenario === scenario.id && (
                        <CheckCircle2 className="ml-auto text-white" size={20} />
                    )}
                </button>
              );
            })}
        </div>

        {/* RIGHT: RESULTS PANEL */}
        <div className="lg:col-span-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Step 2: Migration Analysis</h3>

            {!activeScenario ? (
                 <div className="h-full min-h-[400px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                    <ArrowRightLeft size={48} className="mb-4 opacity-50" />
                    <p>Select your current cabling type to see recommendations.</p>
                 </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg animate-fade-in">
                    
                    {/* Result Header */}
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-4 py-2 text-xs font-bold rounded-bl-xl
                            ${activeScenario.recommendation.disruption === 'LOW' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                        `}>
                            Disruption Score: {activeScenario.recommendation.disruption}
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            {/* Before */}
                            <div className="text-center opacity-60">
                                <div className="text-xs uppercase font-bold text-slate-500 mb-2">Current State</div>
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <Box size={32} className="mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                                    <div className="font-mono text-sm font-bold">{activeScenario.legacySpeed}</div>
                                </div>
                            </div>

                            <ArrowRight size={24} className="text-slate-300 dark:text-slate-600" />

                            {/* After */}
                            <div className="text-center">
                                <div className="text-xs uppercase font-bold text-blue-500 mb-2">Target State</div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/10">
                                    <Zap size={32} className="mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                                    <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-200">400G</div>
                                </div>
                            </div>

                            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden md:block mx-4" />

                            {/* Metrics */}
                            <div className="flex flex-col gap-3">
                                <div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Complexity</div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((lvl) => (
                                            <div 
                                                key={lvl} 
                                                className={`h-1.5 w-4 rounded-full ${lvl <= activeScenario.recommendation.complexity ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Relative Cost</div>
                                    <div className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">
                                        {activeScenario.recommendation.cost}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Recommendation: {activeScenario.recommendation.name}
                             </h3>
                             <p className="text-slate-500 dark:text-slate-400">{activeScenario.recommendation.desc}</p>
                        </div>
                    </div>

                    {/* Details Body */}
                    <div className="p-8 space-y-6">
                         
                         <div className="flex gap-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg h-fit">
                                <Info className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Why this strategy?</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {activeScenario.recommendation.details}
                                </p>
                            </div>
                         </div>

                         <div className={`flex gap-4 p-4 rounded-lg border ${
                             activeScenario.recommendation.disruption === 'LOW' 
                             ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' 
                             : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                         }`}>
                            <div className="h-fit">
                                {activeScenario.recommendation.disruption === 'LOW' 
                                    ? <CheckCircle2 className="text-green-600 dark:text-green-400" size={20} />
                                    : <XCircle className="text-red-600 dark:text-red-400" size={20} />
                                }
                            </div>
                            <div>
                                <h4 className={`font-bold mb-1 ${
                                    activeScenario.recommendation.disruption === 'LOW' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                                }`}>
                                    Action Item: {activeScenario.recommendation.disruptionReason}
                                </h4>
                                <p className={`text-sm ${
                                    activeScenario.recommendation.disruption === 'LOW' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                }`}>
                                    {activeScenario.recommendation.action}
                                </p>
                            </div>
                         </div>

                         {activeScenario.recommendation.sku !== 'N/A' && (
                             <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                 <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                                     <div>
                                         <div className="text-xs text-slate-500 uppercase font-bold">Recommended SKU</div>
                                         <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">{activeScenario.recommendation.sku}</div>
                                     </div>
                                     <button 
                                         onClick={() => copyToClipboard(activeScenario.recommendation.sku)}
                                         className="flex items-center gap-2 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded transition-colors"
                                     >
                                         <Copy size={12} />
                                         Copy to Clipboard
                                     </button>
                                 </div>
                             </div>
                         )}

                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default MigrationWizard;
