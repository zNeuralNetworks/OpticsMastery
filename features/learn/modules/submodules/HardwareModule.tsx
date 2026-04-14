import React from 'react';
import { Activity, Box, History, Zap, ArrowRightLeft, Cable, CheckCircle2, Rotate3d, ArrowUpRight } from 'lucide-react';
import { 
  ImpactCallout, 
  LessonIntroCard,
  TransitionDivider, 
  CopyNoteAction, 
  AdvancedNotesPanel,
  ModuleProps 
} from '../../components/ModuleShared';
import { SvgLaneConcept, SvgBreakoutDiagram } from '../../components/ModuleSvgs';
import { BreakoutSelector } from '../widgets/BreakoutSelector';
import { 
  DECISION_IMPACTS, 
  TRANSITION_TEXTS 
} from '../../../../data/knowledgeBase';
import { Page } from '../../../../types';

// Helper components that were internal to HardwareModule
const SFPFormFactorMatrix: React.FC<{ onNavigate?: (page: Page) => void }> = ({ onNavigate }) => (
  <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Form Factor Evolution</h4>
      {onNavigate && (
        <button 
          onClick={() => onNavigate(Page.FORM_FACTOR_EXPLORER)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
        >
          <Rotate3d size={12} /> Launch 3D Explorer <ArrowUpRight size={12} />
        </button>
      )}
    </div>
    <div className="space-y-4">
      {[
        { type: 'SFP+', lanes: '1x10G/25G', usage: 'Campus/Edge' },
        { type: 'QSFP28', lanes: '4x25G', usage: '100G Data Center' },
        { type: 'QSFP-DD', lanes: '8x50G', usage: '400G High Density' },
        { type: 'OSFP', lanes: '8x50G/100G', usage: '800G+ AI Fabrics' }
      ].map((f, i) => (
        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[13px] font-bold text-slate-900 dark:text-white aom-mono">{f.type}</div>
            <div className="text-[11px] text-slate-500 font-medium">{f.usage}</div>
          </div>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{f.lanes}</span>
        </div>
      ))}
    </div>
  </div>
);

export const HardwareModule: React.FC<ModuleProps> = ({ onNavigate }) => (
  <div className="space-y-10 animate-fade-in font-sans">
    <LessonIntroCard
      title="Form Factors, Lanes, and Breakout"
      summary="This lesson connects physical transceiver packaging to lane math, breakout behavior, and connector consequences. The goal is to help users reason from platform hardware to actual attachment options."
      goals={[
        'Understand how lane count and lane speed create aggregate bandwidth.',
        'See why form factor affects cooling, compatibility, and future scale.',
        'Treat breakout as a lane-mapping decision, not just a cable choice.',
        'Translate optics architecture into connector and BOM consequences.',
      ]}
      nextAction="After this lesson, use the visualizer, part finder, or compatibility tools to validate a specific breakout or connector decision."
    />
    <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity size={20} className="text-blue-500" /> Lane Density Comparison
        </h4>
        <CopyNoteAction conceptId="LANE_DENSITY" title="Lane Density Comparison" level="Basics" />
      </div>
      <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner">
        <SvgLaneConcept />
      </div>
      <ImpactCallout text={DECISION_IMPACTS.LANE_DENSITY} onNavigate={onNavigate} />
    </div>

    <TransitionDivider text={TRANSITION_TEXTS.HARDWARE_1} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-8 -bottom-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
           <Box size={200} />
        </div>
        <div className="flex items-center justify-between mb-6 relative z-20">
          <h4 className="text-xl font-black text-white uppercase tracking-tighter border-b border-white/10 pb-2">OSFP (Next-Gen)</h4>
          <CopyNoteAction conceptId="FORM_FACTORS" title="OSFP Hardware Note" level="Basics" />
        </div>
        
        <div className="space-y-6 relative z-20">
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Structure</div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Octal Small Form Factor Pluggable. Engineered with an <span className="text-white font-bold">Integrated Heatsink</span> for high-power AI fabrics.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">Rationale</div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Helps manage thermal density constraints of 800G+ by moving the cooling surface to the transceiver body.
            </p>
          </div>
          <div className="space-y-3 pt-2">
             <div className="flex items-center gap-3 text-[13px] text-white font-semibold">
               <Activity size={16} className="text-blue-400" /> <span className="aom-mono">8</span> Electrical Lanes (<span className="aom-mono">Octal</span> Interface)
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm group">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter border-b border-slate-100 dark:border-slate-800 pb-2">QSFP-DD (Backward Comp.)</h4>
          <CopyNoteAction conceptId="FORM_FACTORS" title="QSFP-DD Hardware Note" level="Basics" />
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Structure</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Double Density QSFP. Uses a <span className="text-slate-900 dark:text-white font-bold">Flat Top</span> design compatible with many legacy <span className="aom-mono font-bold text-blue-500">QSFP28/QSFP56</span> ports.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">Rationale</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Enables mixed 100G/400G environments. Typically relies on switch-side "Riding Heatsinks" for cooling.
            </p>
          </div>
          <div className="space-y-3 pt-2">
             <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-400 font-semibold">
               <History size={16} className="text-indigo-500" /> Common for Campus and Spine Upgrades
             </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap size={20} className="text-amber-500" /> Thermal & Power Constraints
            </h4>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Critical</div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            High-speed optics (400G/800G) generate significant heat. Exceeding thermal limits can cause premature laser failure or switch-side port shutdowns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Standard (DR4)</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mb-1">~10W</div>
              <div className="text-[11px] text-slate-500 italic">Manageable in most high-density leaf switches.</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-amber-600 uppercase mb-2 tracking-widest">Coherent (ZR)</div>
              <div className="text-xl font-black text-amber-600 mb-1">~20W+</div>
              <div className="text-[11px] text-slate-500 italic">Requires OSFP with integrated heatsinks for cooling.</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-red-600 uppercase mb-2 tracking-widest">800G-ZR</div>
              <div className="text-xl font-black text-red-600 mb-1">~25W+</div>
              <div className="text-[11px] text-slate-500 italic">May require specific port spacing (checkerboard) in some cages.</div>
            </div>
          </div>
        </div>
        <BreakoutSelector />
        <SFPFormFactorMatrix onNavigate={onNavigate} />
        <AdvancedNotesPanel conceptId="FORM_FACTORS" />
        <ImpactCallout text={DECISION_IMPACTS.FORM_FACTORS} onNavigate={onNavigate} />
      </div>
    </div>

    <TransitionDivider text={TRANSITION_TEXTS.HARDWARE_2} />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-green-500" /> Cage Breakout Concept
          </h4>
          <CopyNoteAction conceptId="BREAKOUT_LOGIC" title="Cage Breakout Concept" level="Intermediate" />
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8 shadow-inner">
          <SvgBreakoutDiagram />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Breakouts allow high-speed ports to function as multiple lower-speed ports. This mapping occurs in the hardware SerDes.
        </p>
        <div className="space-y-3">
          {[
            { label: '8-Lane Breakout', pattern: '1x800G → 2x400G or 8x100G', note: 'OSFP / QSFP-DD800' },
            { label: '4-Lane Breakout', pattern: '1x400G → 4x100G or 2x200G', note: 'QSFP-DD / OSFP' },
            { label: 'Legacy Breakout', pattern: '1x100G → 4x25G', note: 'QSFP28' }
          ].map((b, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{b.label}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-500 aom-mono italic font-semibold">{b.note}</span>
              </div>
              <div className="text-[15px] aom-mono text-blue-600 dark:text-blue-400 font-bold tracking-tight">{b.pattern}</div>
            </div>
          ))}
        </div>
        <ImpactCallout text={DECISION_IMPACTS.BREAKOUT_LOGIC} onNavigate={onNavigate} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cable size={18} className="text-blue-500" /> Port-to-Connector Mapping
          </h4>
          <CopyNoteAction conceptId="CONNECTOR_MAPPING" title="Port-to-Connector Mapping" level="Intermediate" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
           Transceiver form factor determines the physical connector typically required for mating. 
        </p>
        <div className="space-y-7">
          <div className="flex gap-5 items-start">
            <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600"><CheckCircle2 size={18} /></div>
            <div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white">Duplex LC</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">
                Commonly used with <span className="aom-mono font-bold text-blue-500">WDM</span> and <span className="aom-mono font-bold text-blue-500">Single-Lambda</span> optics. Used for point-to-point duplex fiber pairs.
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start">
            <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600"><CheckCircle2 size={18} /></div>
            <div>
              <h5 className="text-[15px] font-bold text-slate-900 dark:text-white aom-mono">MPO-12 / MPO-16</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5 font-medium">Typically used with parallel optics. Often used for physical breakout applications.</p>
            </div>
          </div>
        </div>
        <ImpactCallout text={DECISION_IMPACTS.CONNECTOR_MAPPING} onNavigate={onNavigate} />
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-slate-900/40">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Lesson Takeaways</div>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          'Lane model comes first; breakout options inherit from the physical and electrical lane structure.',
          'Form factor is a thermal and platform choice, not just a mechanical shell.',
          'Breakout validity depends on supported port modes, cage design, and matching optics behavior.',
          'Connector type follows the optics engine, so connector mapping should drive patching and BOM decisions.',
        ].map((item) => (
          <div key={item} className="rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);
