import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerFabricJustificationPanelProps {
  model: PlannerModel;
}

export const PlannerFabricJustificationPanel: React.FC<PlannerFabricJustificationPanelProps> = ({ model }) => {
  const { fabricJustification } = model.view;

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2">Fabric design justification</div>
          <h3 className="text-xl font-black text-slate-900">Why this topology is defensible</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This is the written rationale for the topology, oversubscription posture, and representative latency and bandwidth fit.
          </p>
        </div>
        <FileText className="text-cyan-600" size={22} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Topology choice</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.topologyChoice}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Oversubscription analysis</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.oversubscriptionAnalysis}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Latency and bandwidth fit</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.latencyAndBandwidthFit}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Load balancing</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.loadBalancingStrategy}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Lossless design</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.losslessDesignSummary}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Routing underlay</div>
          <div className="text-xs text-slate-700 leading-6">{fabricJustification.routingUnderlaySummary}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Failure-mode analysis</div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {fabricJustification.failureModeAnalysis.map((scenario) => (
            <div key={scenario.scenario} className="p-4 rounded-2xl border border-amber-100 bg-amber-50">
              <div className="flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
                <ShieldAlert size={14} /> {scenario.scenario}
              </div>
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <div className="font-black text-slate-900 mb-1">Impact</div>
                  <div>{scenario.impact}</div>
                </div>
                <div>
                  <div className="font-black text-slate-900 mb-1">Design response</div>
                  <div>{scenario.designResponse}</div>
                </div>
                <div>
                  <div className="font-black text-slate-900 mb-1">Operator note</div>
                  <div>{scenario.operatorNote}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {fabricJustification.assumptionsAndOpenValidations?.length ? (
        <div className="mt-4 p-4 rounded-2xl border border-blue-100 bg-blue-50">
          <div className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3">Open validations</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {fabricJustification.assumptionsAndOpenValidations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};
