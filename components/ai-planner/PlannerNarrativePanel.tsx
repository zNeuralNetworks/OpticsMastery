import React from 'react';
import { BookOpenText, Network, Telescope } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerNarrativePanelProps {
  model: PlannerModel;
}

export const PlannerNarrativePanel: React.FC<PlannerNarrativePanelProps> = ({ model }) => {
  const { designNarrative, riskSummary, operatorReadiness, diagramBrief } = model.view;

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Architecture narrative</div>
          <h3 className="text-xl font-black text-slate-900">Why this design works</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{designNarrative.architectureSummary}</p>
        </div>
        <BookOpenText className="text-emerald-600" size={22} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <Network size={14} /> Design tradeoffs
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {designNarrative.designTradeoffs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <Telescope size={14} /> Operational considerations
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {designNarrative.operationalConsiderations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Diagram brief</div>
          <div className="text-sm font-black text-slate-900">{diagramBrief.title}</div>
          <div className="text-xs text-slate-600 mt-2">{diagramBrief.topology}</div>
          <ul className="mt-3 space-y-2 text-xs text-slate-700">
            {diagramBrief.callouts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-2xl border border-amber-100 bg-amber-50">
        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Highest-priority risk</div>
        <div className="text-sm font-black text-slate-900">{riskSummary[0]?.title}</div>
        <div className="text-xs text-slate-600 mt-1">{riskSummary[0]?.body}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Telemetry and visibility</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {operatorReadiness.telemetryAndVisibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Lifecycle and change</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {operatorReadiness.lifecycleAndChange.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
