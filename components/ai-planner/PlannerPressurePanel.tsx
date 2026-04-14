import React from 'react';
import { Activity, ArrowRightLeft, Gauge } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerPressurePanelProps {
  model: PlannerModel;
}

const pressureTone = {
  low: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  moderate: 'border-amber-100 bg-amber-50 text-amber-700',
  high: 'border-orange-100 bg-orange-50 text-orange-700',
  severe: 'border-rose-100 bg-rose-50 text-rose-700',
} as const;

export const PlannerPressurePanel: React.FC<PlannerPressurePanelProps> = ({ model }) => {
  const { trainingCommunication, congestionAssessment } = model.view;

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Fabric pressure</div>
          <h3 className="text-xl font-black text-slate-900">Training and congestion posture</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This is a heuristic architecture view, not a packet simulator. It explains how synchronized AI traffic changes the quality of the fabric recommendation.
          </p>
        </div>
        <Activity className="text-amber-600" size={22} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${pressureTone[trainingCommunication.communicationPressure]}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3">
            <ArrowRightLeft size={14} /> Training communication pressure
          </div>
          <div className="text-2xl font-black capitalize">{trainingCommunication.communicationPressure}</div>
          <div className="text-xs mt-2">{trainingCommunication.patternSummary}</div>
          <div className="mt-4 text-[10px] font-black uppercase tracking-widest">Recommended ceiling</div>
          <div className="text-lg font-black mt-1">{trainingCommunication.recommendedOversubscriptionCeiling}</div>
          <div className="text-xs mt-2">{trainingCommunication.architectureNote}</div>
        </div>

        <div className={`rounded-2xl border p-5 ${pressureTone[congestionAssessment.level]}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3">
            <Gauge size={14} /> Congestion assessment
          </div>
          <div className="text-2xl font-black capitalize">{congestionAssessment.level}</div>
          <div className="text-xs mt-2">{congestionAssessment.summary}</div>
          <div className="mt-4 text-[10px] font-black uppercase tracking-widest">Recommended mitigation</div>
          <div className="text-xs mt-2">{congestionAssessment.recommendedMitigation}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Primary traffic drivers</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {congestionAssessment.primaryDrivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Architecture implications</div>
          <ul className="space-y-2 text-xs text-slate-700">
            {trainingCommunication.architectureImplications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-600">
            {trainingCommunication.trainingRiskNote}
          </div>
        </div>
      </div>
    </section>
  );
};
