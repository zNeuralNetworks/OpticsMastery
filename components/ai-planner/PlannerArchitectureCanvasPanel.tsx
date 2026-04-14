import React from 'react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerArchitectureCanvasPanelProps {
  model: PlannerModel;
}

const TrackRow: React.FC<{
  label: string;
  current: number;
  reference: number;
  currentLabel: string;
  referenceLabel: string;
  note: string;
}> = ({ label, current, reference, currentLabel, referenceLabel, note }) => {
  const maxValue = Math.max(current, reference, 1);
  const currentWidth = Math.max(6, (current / maxValue) * 100);
  const referenceWidth = Math.max(6, (reference / maxValue) * 100);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{label}</div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-700 mb-2">
            <span>{currentLabel}</span>
            <span className="font-black text-slate-900">{current}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: `${currentWidth}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3 text-xs text-slate-700 mb-2">
            <span>{referenceLabel}</span>
            <span className="font-black text-slate-900">{reference}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${referenceWidth}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs leading-6 text-slate-600">{note}</div>
    </div>
  );
};

export const PlannerArchitectureCanvasPanel: React.FC<PlannerArchitectureCanvasPanelProps> = ({ model }) => {
  const { currentResult, futureResult, view, inputs } = model;
  const pressurePercent = {
    low: 28,
    moderate: 48,
    high: 72,
    severe: 94,
  }[view.trainingCommunication.communicationPressure];
  const burstPercent = {
    low: 28,
    medium: 48,
    high: 72,
    extreme: 94,
  }[view.trainingCommunication.eastWestBurstFactor];
  const oversubGuidancePercent = {
    '1:1': 28,
    '1.5:1': 44,
    '2:1': 62,
    '>2:1 acceptable only with caution': 86,
  }[view.trainingCommunication.recommendedOversubscriptionCeiling];

  return (
    <section id="planner-canvas" className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="mb-6">
        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Architecture Canvas</div>
        <h3 className="text-xl font-black text-slate-900">Analytical topology review</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Use this surface to explain why the recommendation landed where it did: demand versus uplinks, oversubscription posture, growth headroom, and collective pressure.
        </p>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          <TrackRow
            label="Leaf-facing demand vs fabric uplinks"
            current={currentResult.computeFabric.usedDownlinkPorts}
            reference={currentResult.computeFabric.usedUplinkPorts}
            currentLabel="Compute downlink ports used"
            referenceLabel="Leaf uplinks reserved"
            note="This shows how much GPU-facing demand is being carried into the shared uplink pool."
          />
          <TrackRow
            label="Current vs future leaf demand"
            current={currentResult.computeFabric.leafCount}
            reference={futureResult.computeFabric.leafCount}
            currentLabel="Current leaf count"
            referenceLabel="Future leaf count"
            note="This is the cleanest view of growth reserve in the compute fabric."
          />
          <TrackRow
            label="Target vs policy oversubscription"
            current={inputs.oversubscription}
            reference={inputs.maxOversubscriptionTarget}
            currentLabel="Current oversubscription target"
            referenceLabel="Policy ceiling"
            note="This track shows whether the modeled design is aligned with the planner’s AI-fabric policy ceiling."
          />
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Pressure indicators</div>
            <div className="space-y-4">
              {[
                ['Collective pressure', view.trainingCommunication.communicationPressure, pressurePercent, 'bg-violet-500'],
                ['East-west burst', view.trainingCommunication.eastWestBurstFactor, burstPercent, 'bg-indigo-500'],
                ['Oversub guidance', view.trainingCommunication.recommendedOversubscriptionCeiling, oversubGuidancePercent, 'bg-amber-500'],
              ].map(([label, value, percent, tone]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-700 mb-2">
                    <span>{label}</span>
                    <span className="font-black text-slate-900">{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Congestion risk', view.congestionAssessment.level],
              ['Confidence', view.confidenceSummary.level],
              ['Primary spine', model.spineSwitch.name],
              ['Main warning', view.warnings[0] ?? 'No modeled blocker'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</div>
                <div className="text-sm font-black text-slate-900 capitalize leading-6">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
