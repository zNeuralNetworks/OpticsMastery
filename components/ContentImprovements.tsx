
import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Box, 
  Activity, 
  Network, 
  ArrowRightLeft, 
  Ruler, 
  Layers, 
  FileJson,
  Cpu,
  ShieldCheck,
  TrendingUp,
  LineChart,
  Target,
  BrainCircuit,
  ThumbsUp,
  Clock,
  ChevronRight,
  Database,
  Search
} from 'lucide-react';

const CompletedBadge = () => (
  <span className="ml-2 text-[9px] font-black uppercase tracking-tighter bg-green-500 text-white px-2 py-0.5 rounded shadow-sm inline-flex items-center gap-1">
    <CheckCircle2 size={10} /> Active
  </span>
);

interface RoadmapItemProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  completed?: boolean;
  status?: string;
  tag?: string;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ icon: Icon, title, desc, completed, status, tag }) => (
  <div className={`p-6 rounded-2xl border transition-all duration-300 group ${
    completed 
      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5' 
      : 'bg-slate-50/50 dark:bg-slate-950/30 border-dashed border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100'
  }`}>
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${
        completed ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
      }`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center">
            {title}
            {completed && <CompletedBadge />}
          </h4>
          {tag && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tag}</span>}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {desc}
        </p>
        {!completed && status && (
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            <Clock size={12} /> {status}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ContentImprovements: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Strategic Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-8">
        <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-blue-600 dark:text-blue-400" size={32} />
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Platform Roadmap
            </h2>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed font-medium">
            Advancing the <strong>Optics Master</strong> towards full fabric lifecycle automation, 800G/1.6T readiness, and deep decision intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* PILLAR 1: CORE DECISION ENGINES */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Target className="text-blue-500" size={20} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Decision Support Tools</h3>
            </div>
            
            <div className="space-y-4">
                <RoadmapItem 
                    icon={ShieldCheck}
                    title="Smart Compatibility Matrix"
                    desc="Physics-based validation for APC/UPC polishes, media types, and lane speeds. Prevents hardware damage and connection failures."
                    completed
                />
                <RoadmapItem 
                    icon={ArrowRightLeft}
                    title="Migration Wizard"
                    desc="Scenario-based planner for upgrading legacy 10G/40G fiber plants to modern 400G PAM4 architectures."
                    completed
                />
                <RoadmapItem 
                    icon={Ruler}
                    title="Link Budget Calculator"
                    desc="Optical loss estimator for validating end-to-end transceiver reach against conservative engineering margins."
                    completed
                />
                <RoadmapItem 
                    icon={Cpu}
                    title="DSP Lane Math Engine"
                    desc="Calculate baud rates, SerDes speeds, and symbol rates for 100G, 400G, and 800G interfaces."
                    status="Planning for 1.6T"
                    tag="Signal Physics"
                />
            </div>
        </section>

        {/* PILLAR 2: VISUAL ENGINEERING */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Box className="text-purple-500" size={20} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Visual Architecture Lab</h3>
            </div>
            
            <div className="space-y-4">
                <RoadmapItem 
                    icon={Network}
                    title="Fabric Architecture Lab"
                    desc="Interactive 2-tier Spine/Leaf visualizer with automatic BOM generation for validated designs."
                    completed
                />
                <RoadmapItem 
                    icon={Layers}
                    title="SFP Family Matrix"
                    desc="High-fidelity breakdown of 1-lane and 2-lane form factors, demystifying the physical evolution of the SFP."
                    completed
                />
                <RoadmapItem 
                    icon={FileJson}
                    title="Interactive Datasheets"
                    desc="Dynamic, hover-to-explode product cards showing internal structures and power/thermal curves."
                    completed
                />
                <RoadmapItem 
                    icon={Zap}
                    title="3D Thermal Simulator"
                    desc="Visualize faceplate heat density for high-power 400G-ZR modules comparing OSFP vs QSFP-DD cooling."
                    status="Development"
                    tag="Simulation"
                />
            </div>
        </section>

        {/* PILLAR 3: FABRIC AUTOMATION */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <BrainCircuit className="text-green-500" size={20} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Next-Gen Intelligence</h3>
            </div>
            
            <div className="space-y-4">
                <RoadmapItem 
                    icon={TrendingUp}
                    title="AI Cluster Sizer"
                    desc="Input GPU counts (H100/B200) to generate rail-optimized leaf-spine topologies with precise cable counts."
                    status="In Research"
                    tag="AI Fabrics"
                />
                <RoadmapItem 
                    icon={ShieldCheck}
                    title="Compliance Validator"
                    desc="Automatic audit of fiber plants to ensure encryption-capable optics (MACsec) on sensitive links."
                    status="Backlog"
                    tag="Security"
                />
                <RoadmapItem 
                    icon={LineChart}
                    title="Predictive RMA Engine"
                    desc="Analyze DOM error slopes to predict optical failure 72 hours before packet loss occurs using machine learning."
                    status="In Evaluation"
                    tag="Operations"
                />
            </div>
        </section>

        {/* PILLAR 4: ECOSYSTEM INTEGRATION */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
                <Database className="text-indigo-500" size={20} />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Cloud Integration</h3>
            </div>
            
            <div className="space-y-4">
                <RoadmapItem 
                    icon={Activity}
                    title="Network Ops Sync"
                    desc="Connect the visualizer to your monitoring instance to pull real-time transceiver DDM data directly onto the canvas."
                    status="Planning"
                    tag="Cloud"
                />
                <RoadmapItem 
                    icon={Search}
                    title="Part Finder (Deep Scan)"
                    desc="Search the unified high-speed optics catalog with advanced filters for reach, wavelength, and power."
                    completed
                />
            </div>
        </section>
      </div>

      {/* Community Engagement */}
      <div className="mt-16 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-12 opacity-5 pointer-events-none">
            <Sparkles size={200} />
        </div>
        <div className="max-w-3xl relative z-10">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Evolve the Tooling</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
            This roadmap is driven by field requirements. If you have a specific optics decision that needs automation or visualization, let us know.
          </p>
          <div className="flex flex-wrap gap-4">
             <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 flex items-center gap-2">
                Submit Feature Request <ChevronRight size={18} />
             </button>
             <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                <ThumbsUp size={18} /> Vote on Backlog
             </button>
          </div>
        </div>
      </div>

      <div className="pt-8 text-center">
         <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Roadmap Status: Active Evolution | Last Sync: 2024.Q4</p>
      </div>
    </div>
  );
};

export default ContentImprovements;
