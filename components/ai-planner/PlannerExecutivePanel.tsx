import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerExecutivePanelProps {
  model: PlannerModel;
}

const confidenceTone = {
  high: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  medium: 'bg-amber-50 border-amber-100 text-amber-700',
  low: 'bg-rose-50 border-rose-100 text-rose-700',
} as const;

export const PlannerExecutivePanel: React.FC<PlannerExecutivePanelProps> = ({ model }) => {
  const { executiveSummary, confidenceSummary } = model.view;

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Recommendation detail</div>
          <h3 className="text-xl font-black text-slate-900">Executive summary</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{executiveSummary.architectureSummary}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-widest ${confidenceTone[confidenceSummary.level]}`}>
          {confidenceSummary.level} confidence
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Recommendation</div>
          <div className="text-base font-black text-slate-900">{executiveSummary.recommendation}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary risk</div>
          <div className="flex items-start gap-3">
            <ShieldAlert size={16} className="text-amber-600 mt-1" />
            <div>
              <div className="text-sm font-black text-slate-900">{executiveSummary.primaryRisk.title}</div>
              <div className="text-xs text-slate-500 mt-1">{executiveSummary.primaryRisk.body}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Confidence basis</div>
          <div className="text-sm text-slate-700">{confidenceSummary.summary}</div>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            {confidenceSummary.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-blue-500 mt-1 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Top notes</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {executiveSummary.topNotes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-emerald-600 mt-1 shrink-0" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
