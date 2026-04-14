
import React, { useState } from 'react';
import { 
  Network, 
  Download, 
  Zap, 
  Box, 
  Activity,
  Server,
  FileJson,
  Save,
  History,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DecisionOutput from './DecisionOutput';
import { TOPOLOGY_BOM } from '../features/topology/data/bom';
import { AppNavigationParams, BomItem, Page, LearnPageTab, PlannerTopologySeed } from '../types';
import { downloadCSV } from '../shared/lib/export';
import { useLocalSnapshots } from '../hooks/useLocalSnapshots';

type SelectionType = 'NONE' | 'SPINE' | 'LEAF' | 'FABRIC_LINK' | 'MLAG_LINK' | 'VAST_LINK' | 'HPC_LINK' | 'HA_LINK';
type MediaStrategy = 'OS2_FIBER' | 'DAC_AOC' | 'MIXED_AI';

interface SnapshotState {
  selection: SelectionType;
  strategy: MediaStrategy;
}

// --- Sub-components ---

const Port: React.FC<{ num: number; type: 'uplink' | 'downlink' | 'mlag' | 'free' }> = ({ num, type }) => {
  let color = 'bg-slate-700/50 border border-slate-600'; 
  if (type === 'uplink') color = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
  if (type === 'downlink') color = 'bg-indigo-500';
  if (type === 'mlag') color = 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.6)]';

  return (
    <div className="group relative">
      <div className={`h-8 w-full rounded-sm ${color} transition-all hover:brightness-125`}>
          <div className="w-full h-[2px] bg-black/20 absolute top-1/2 -translate-y-1/2"></div>
      </div>
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[7px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 pointer-events-none">{num}</span>
    </div>
  );
};

const BomRow: React.FC<{ item: BomItem; onInspect?: (sku: string) => void }> = ({ item, onInspect }) => (
  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700 mb-1 group">
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 font-mono">{item.sku}</span>
        {onInspect && (item.type.includes('Optic') || item.type.includes('Transceiver')) && (
          <button 
            onClick={() => onInspect(item.sku)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400"
            title="Inspect Datasheet"
          >
            <FileJson size={10} />
          </button>
        )}
      </div>
      <span className="text-[9px] text-slate-500">{item.desc}</span>
    </div>
    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
      x{item.qty}
    </div>
  </div>
);

const SwitchFaceplate: React.FC = () => (
    <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700 aom-border shadow-inner select-none">
      <div className="flex justify-between items-end mb-3">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-mono">Front Panel View (7280DR3-24)</div>
        <div className="text-[9px] text-slate-500 font-mono">QSFP-DD 400G</div>
      </div>
      <div className="grid grid-cols-12 gap-1.5 mb-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const portNum = i + 1;
          const type = portNum <= 9 ? 'downlink' : 'free';
          return <Port key={portNum} num={portNum} type={type} />;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const portNum = i + 13;
          let type: 'uplink' | 'mlag' | 'free' = 'free';
          if (portNum === 21 || portNum === 22) type = 'uplink';
          if (portNum === 23 || portNum === 24) type = 'mlag';
          return <Port key={portNum} num={portNum} type={type} />;
        })}
      </div>
    </div>
);

interface TopologyLabProps {
    onNavigate: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
    initialPlannerSeed?: PlannerTopologySeed | null;
}

export const TopologyLab: React.FC<TopologyLabProps> = ({ onNavigate, initialPlannerSeed }) => {
  const [selection, setSelection] = useState<SelectionType>('NONE');
  const [strategy, setStrategy] = useState<MediaStrategy>('OS2_FIBER');
  const [showSnapshots, setShowSnapshots] = useState(false);
  const { snapshots, saveSnapshot: persistSnapshot, deleteSnapshot } = useLocalSnapshots<SnapshotState>('topology_snapshots');

  React.useEffect(() => {
    if (!initialPlannerSeed) {
      return;
    }

    if (initialPlannerSeed.mediaType === 'DAC') {
      setStrategy('DAC_AOC');
      return;
    }

    if (initialPlannerSeed.storageFabric) {
      setStrategy('MIXED_AI');
      return;
    }

    setStrategy('OS2_FIBER');
  }, [initialPlannerSeed]);

  const saveSnapshot = () => {
    const name = prompt('Snapshot Name:');
    if (!name) return;
    persistSnapshot(name, {
      selection,
      strategy,
    });
  };

  // Dynamic BOM Logic based on Strategy
  const getFilteredBom = () => {
    let base = [...TOPOLOGY_BOM];
    
    if (strategy === 'DAC_AOC') {
      // Replace Fabric Optics with DAC/AOC where possible (though 2km usually needs fiber)
      // For this demo, let's assume "Short Reach" strategy
      base = base.map(item => {
        if (item.tier === 'Fabric' && item.type.includes('Optic')) {
          return { ...item, sku: 'QDD-400G-AOC-10M', desc: '400G Active Optical Cable (10m)', type: 'AOC Cable' };
        }
        if (item.tier === 'Fabric' && item.type === 'Fiber Cable') {
          return { ...item, qty: 0 }; // Remove fiber
        }
        return item;
      }).filter(item => item.qty > 0);
    } else if (strategy === 'MIXED_AI') {
      // AI Strategy: OSFP for Spine, QSFP-DD for Leaf, 800G ready
      base = base.map(item => {
        if (item.tier === 'Spine' && item.type === 'Switch') {
          return { ...item, sku: 'DCS-7060X6-64S', desc: '64x 800G OSFP, 51.2T (AI Optimized)' };
        }
        return item;
      });
    }
    
    return base;
  };

  const filteredBom = getFilteredBom();

  const handleExport = () => {
    const headers = ['Tier', 'Type', 'SKU', 'Qty', 'Description'];
    const rows = filteredBom.map(item => [item.tier, item.type, item.sku, item.qty, item.desc]);
    downloadCSV(`Architecture_BOM_${strategy}.csv`, headers, rows);
  };

  const getStrokeColor = (id: SelectionType, defaultColor: string, activeColor: string) => {
    if (selection === 'NONE') return defaultColor;
    return selection === id ? activeColor : '#64748b'; // Slate 500 for non-selected
  };

  const getOpacity = (id: SelectionType) => {
    if (selection === 'NONE') return 1;
    return selection === id ? 1 : 0.2; // Keep non-selected elements visible
  };

  const handleInspectSku = (sku: string) => {
    if (onNavigate) {
      onNavigate(Page.INTERACTIVE_DATASHEETS, undefined, sku);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4 animate-fade-in" id="topology-lab">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
              <Network className="text-blue-600 dark:text-blue-400" />
              Architecture Lab
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">400G Leaf-Spine Blueprint</p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="hidden md:flex items-center gap-2">
            <button 
              onClick={() => setShowSnapshots(!showSnapshots)}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative"
            >
              <History size={18} />
              {snapshots.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900" />}
            </button>
            <button 
              onClick={saveSnapshot}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              title="Save Snapshot"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/5 mr-2">
            {(['OS2_FIBER', 'DAC_AOC', 'MIXED_AI'] as MediaStrategy[]).map((s) => (
              <button
                key={s}
                onClick={() => setStrategy(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${
                  strategy === s 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all">
            <Download size={14}/> Export BOM
          </button>
        </div>
      </div>

      {initialPlannerSeed && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
          <span className="font-black uppercase tracking-widest text-[10px] mr-3">Loaded from AI Cluster Planner</span>
          Comparing a representative {initialPlannerSeed.scope === 'COMPUTE_AND_STORAGE' ? 'full-stack FE/BE' : 'compute-only'} design with {initialPlannerSeed.leafCount} leaves, {initialPlannerSeed.spineCount} spines, and {initialPlannerSeed.mediaType} media posture.
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
        {/* Snapshots Panel */}
        <AnimatePresence>
          {showSnapshots && (
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 z-30 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Snapshots</h3>
                <button onClick={() => setShowSnapshots(false)}><X size={16} className="text-slate-400" /></button>
              </div>
              <div className="space-y-2">
                {snapshots.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No snapshots saved.</p>
                ) : (
                  snapshots.map(snapshot => (
                    <div key={snapshot.id} className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all">
                      <button 
                        onClick={() => {
                          setSelection(snapshot.state.selection);
                          setStrategy(snapshot.state.strategy);
                          setShowSnapshots(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{snapshot.name}</div>
                        <div className="text-[9px] text-slate-500">{new Date(snapshot.timestamp).toLocaleDateString()}</div>
                      </button>
                      <button onClick={() => deleteSnapshot(snapshot.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-[2] bg-slate-50 dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/5 p-4 relative overflow-hidden flex items-center justify-center hw-grid-bg">
            <svg viewBox="0 0 800 500" className="w-full h-full overflow-visible aom-diagram-canvas drop-shadow-2xl">
              {/* Fabric Links (Curved) */}
              <g onClick={() => setSelection('FABRIC_LINK')} className="cursor-pointer group">
                {[
                  "M 280 120 C 280 250, 300 200, 300 300",
                  "M 280 120 C 280 250, 500 200, 500 300",
                  "M 520 120 C 520 250, 300 200, 300 300",
                  "M 520 120 C 520 250, 500 200, 500 300"
                ].map((d, i) => (
                  <motion.path 
                    key={i}
                    d={d} 
                    fill="none" 
                    stroke={getStrokeColor('FABRIC_LINK', '#3b82f6', '#3b82f6')} 
                    strokeWidth="3" 
                    opacity={getOpacity('FABRIC_LINK')} 
                    strokeDasharray="8,4" 
                    animate={{ strokeDashoffset: [0, -24] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="group-hover:stroke-blue-400" 
                  />
                ))}
              </g>

              {/* Spine Nodes */}
              <g onClick={() => setSelection('SPINE')} className="cursor-pointer group" style={{ opacity: getOpacity('SPINE') }}>
                {/* Spine 1 */}
                <rect x="230" y="60" width="100" height="60" rx="8" fill="white" className="dark:fill-slate-800" stroke="#94a3b8" strokeWidth="2" />
                <text x="280" y="90" textAnchor="middle" className="fill-slate-900 dark:fill-white font-bold text-[11px] font-mono pointer-events-none">SPINE-1</text>
                <text x="280" y="105" textAnchor="middle" className="fill-blue-500 font-bold text-[9px] pointer-events-none">400G CORE</text>
                
                {/* Spine 2 */}
                <rect x="470" y="60" width="100" height="60" rx="8" fill="white" className="dark:fill-slate-800" stroke="#94a3b8" strokeWidth="2" />
                <text x="520" y="90" textAnchor="middle" className="fill-slate-900 dark:fill-white font-bold text-[11px] font-mono pointer-events-none">SPINE-2</text>
                <text x="520" y="105" textAnchor="middle" className="fill-blue-500 font-bold text-[9px] pointer-events-none">400G CORE</text>
              </g>

              {/* Leaf Nodes */}
              <g onClick={() => setSelection('LEAF')} className="cursor-pointer group" style={{ opacity: getOpacity('LEAF') }}>
                {/* Leaf 1 */}
                <rect x="250" y="300" width="100" height="60" rx="8" fill="white" className="dark:fill-slate-800" stroke="#94a3b8" strokeWidth="2" />
                <text x="300" y="330" textAnchor="middle" className="fill-slate-900 dark:fill-white font-bold text-[11px] font-mono pointer-events-none">LEAF-1</text>
                <text x="300" y="345" textAnchor="middle" className="fill-indigo-500 font-bold text-[9px] pointer-events-none">7280R3</text>
                
                {/* Leaf 2 */}
                <rect x="450" y="300" width="100" height="60" rx="8" fill="white" className="dark:fill-slate-800" stroke="#94a3b8" strokeWidth="2" />
                <text x="500" y="330" textAnchor="middle" className="fill-slate-900 dark:fill-white font-bold text-[11px] font-mono pointer-events-none">LEAF-2</text>
                <text x="500" y="345" textAnchor="middle" className="fill-indigo-500 font-bold text-[9px] pointer-events-none">7280R3</text>
              </g>

              {/* MLAG Peer Link */}
              <g className="pointer-events-none">
                <line x1="350" y1="330" x2="450" y2="330" stroke="#f5d0fe" strokeWidth="3" strokeDasharray="4,4" opacity={getOpacity('LEAF')} />
                <text x="400" y="325" textAnchor="middle" className="fill-fuchsia-500 font-bold text-[8px] uppercase">MLAG Peer</text>
              </g>
            </svg>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 p-6 overflow-y-auto scrollbar-thin">
          {selection === 'NONE' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                <Activity className="text-slate-400" size={32} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Interactive Fabric Map</h3>
              <p className="text-xs text-slate-500">Select a node or link on the blueprint to inspect optical paths and hardware specifications.</p>
            </div>
          )}
          
          {selection === 'FABRIC_LINK' && (
            <div className="animate-slide-up">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                   <Zap className="text-blue-600" size={20} />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Fabric Uplinks (400G)</h3>
               </div>
               <div className="space-y-1 mb-6">
                    {filteredBom.filter(item => item.tier === 'Fabric').map(item => (
                        <BomRow key={item.sku} item={item} onInspect={handleInspectSku} />
                    ))}
               </div>
               <DecisionOutput 
                 title="Spine-Leaf Interconnect"
                 recommended={['400G-FR4 (CWDM4) Optics', 'OS2 Singlemode Fiber', 'Duplex LC Patching']}
                 notRecommended={['MPO Trunking (excessive cost)', 'MMF (reach constraints)']}
                 assumptions={['Max distance < 2km', 'Available OS2 fiber pairs']}
                 nextChecks={['Verify fiber cleaning', 'Check Rx levels']}
               />
            </div>
          )}

          {selection === 'LEAF' && (
             <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                   <Server className="text-indigo-600" size={20} />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Leaf Tier (7280R3)</h3>
               </div>
              <SwitchFaceplate />
              <div className="mt-6">
                <DecisionOutput 
                   title="Leaf Deployment Strategy"
                   recommended={['7280R3 Deep Buffer for Storage', 'MLAG Pair Configuration', '400G QSFP-DD Uplinks']}
                   notRecommended={['Shallow buffer for TCP Incast workloads']}
                   assumptions={['Rack unit availability (1RU)', 'Dual power feed available']}
                   nextChecks={['Confirm EOS version for R3 support', 'Verify airflow direction']}
                 />
              </div>
            </div>
          )}

          {selection === 'SPINE' && (
             <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                   <Box className="text-blue-600" size={20} />
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white">Spine Tier (7060X6)</h3>
               </div>
              <DecisionOutput 
                 title="Spine Tier Architecture"
                 recommended={['7060X6 OSFP for High Density', '1:1 Oversubscription for AI', 'ECMP Hashing Enabled']}
                 notRecommended={['Blocking architectures']}
                 assumptions={['Data center cooling can handle high-density OSFP']}
                 nextChecks={['Verify L3 BGP peering configuration']}
               />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
