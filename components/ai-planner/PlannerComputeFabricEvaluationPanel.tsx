import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Network, ShieldCheck, TimerReset, Workflow } from 'lucide-react';
import { PlannerModel, PlannerRequirementStatusType } from '../../features/ai-planner/types';

interface PlannerComputeFabricEvaluationPanelProps {
  model: PlannerModel;
}

const statusTone: Record<PlannerRequirementStatusType, string> = {
  pass: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  caution: 'border-amber-100 bg-amber-50 text-amber-700',
  fail: 'border-rose-100 bg-rose-50 text-rose-700',
  'assumption-driven': 'border-blue-100 bg-blue-50 text-blue-700',
};

export const PlannerComputeFabricEvaluationPanel: React.FC<PlannerComputeFabricEvaluationPanelProps> = ({ model }) => {
  const [copied, setCopied] = useState(false);
  const evaluation = model.view.computeFabricEvaluation;
  const groupedScorecard = useMemo(() => {
    return [
      {
        title: 'Fabric fundamentals',
        requirements: evaluation.requirementScorecard.slice(0, 7),
      },
      {
        title: 'Lossless and routing',
        requirements: evaluation.requirementScorecard.slice(7, 14),
      },
    ];
  }, [evaluation.requirementScorecard]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(evaluation.writtenJustification);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Failed to copy compute fabric justification', error);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2">Compute fabric evaluation</div>
          <h3 className="text-xl font-black text-slate-900">NCCL / RoCEv2 design compliance</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Directional evaluation against the current GPU compute-fabric rubric for AllReduce-heavy AI training clusters.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
          {copied ? 'Copied' : 'Copy Justification'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groupedScorecard.map((group) => (
          <div key={group.title} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{group.title}</div>
            <div className="space-y-3">
              {group.requirements.map((item) => (
                <div key={item.requirement} className={`rounded-2xl border p-3 ${statusTone[item.status]}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-black">{item.requirement}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest">{item.status}</div>
                  </div>
                  <div className="text-xs mt-2">{item.summary}</div>
                  <div className="text-[11px] mt-2 opacity-90">{item.why}</div>
                  <div className="text-[11px] mt-2 font-medium">{item.followUpValidation}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 rounded-2xl border border-sky-100 bg-sky-50">
        <div className="text-[10px] font-black text-sky-700 uppercase tracking-widest mb-2">Protocol profile</div>
        <div className="text-xs text-slate-700">{evaluation.protocolProfile}</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <Network size={14} /> Topology decision
          </div>
          <div className="text-sm font-black text-slate-900 capitalize">{evaluation.topologyDecision.recommendedTopology.replace(/-/g, ' ')}</div>
          <div className="text-xs text-slate-700 mt-2">{evaluation.topologyDecision.decisionRationale}</div>
          <div className="text-[11px] text-slate-600 mt-3">{evaluation.topologyDecision.whenThisBreaks}</div>
          <div className="text-[11px] text-slate-600 mt-2">{evaluation.topologyDecision.failureDomainNote}</div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <TimerReset size={14} /> Latency and load-balancing
          </div>
          <div className="text-xs text-slate-700">{evaluation.latencyAssessment}</div>
          <div className="text-xs text-slate-700 mt-3">{evaluation.ecmpAndLoadBalancing}</div>
          <div className="text-xs text-slate-700 mt-3">{evaluation.oversubscriptionAssessment}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Topology justification</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current endpoints</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.topologyJustification.currentEndpointCount}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Future endpoints</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.topologyJustification.futureEndpointCount}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current fabric</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.topologyJustification.currentLeafCount}L / {evaluation.topologyJustification.currentSpineCount}S</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Future fabric</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.topologyJustification.futureLeafCount}L / {evaluation.topologyJustification.futureSpineCount}S</div>
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div><span className="font-black text-slate-900">2-tier:</span> {evaluation.topologyJustification.twoTierAssessment}</div>
            <div><span className="font-black text-slate-900">3-tier:</span> {evaluation.topologyJustification.threeTierAssessment}</div>
            <div><span className="font-black text-slate-900">Rail-optimized:</span> {evaluation.topologyJustification.railOptimizedAssessment}</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Latency and ECMP detail</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Latency target</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.latencyDetail.targetUsec.toFixed(1)} µs</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Estimated path</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.latencyDetail.estimatedPathLatencyUsec.toFixed(2)} µs</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Hop model</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.latencyDetail.hopCount} hops</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">ECMP paths</div>
              <div className="text-sm font-black text-slate-900 font-mono">{evaluation.ecmpDetail.currentPathCount}</div>
            </div>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div><span className="font-black text-slate-900">Hop model:</span> {evaluation.latencyDetail.hopModel}</div>
            <div><span className="font-black text-slate-900">Latency posture:</span> {evaluation.latencyDetail.assessment}</div>
            <div><span className="font-black text-slate-900">Entropy source:</span> {evaluation.ecmpDetail.entropySource}</div>
            <div><span className="font-black text-slate-900">Polarization risk:</span> {evaluation.ecmpDetail.polarizationRisk}</div>
            <div><span className="font-black text-slate-900">Collective fit:</span> {evaluation.ecmpDetail.collectiveFit}</div>
          </div>
          <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
            {evaluation.ecmpDetail.validationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <Workflow size={14} /> Lossless RoCEv2 posture
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div><span className="font-black text-slate-900">Classification:</span> {evaluation.losslessDesign.classificationModel}</div>
            <div><span className="font-black text-slate-900">PFC:</span> {evaluation.losslessDesign.pfcStrategy}</div>
            <div><span className="font-black text-slate-900">ECN:</span> {evaluation.losslessDesign.ecnStrategy}</div>
            <div><span className="font-black text-slate-900">DCQCN:</span> {evaluation.losslessDesign.dcqcnStrategy}</div>
            <div><span className="font-black text-slate-900">Deadlock avoidance:</span> {evaluation.losslessDesign.deadlockAvoidance}</div>
          </div>
          <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
            {evaluation.losslessDesign.validationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Underlay and fault tolerance
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <div><span className="font-black text-slate-900">BGP:</span> {evaluation.routingUnderlay.bgpRecommendation}</div>
            <div><span className="font-black text-slate-900">ASN strategy:</span> {evaluation.routingUnderlay.asnAllocationStrategy}</div>
            <div><span className="font-black text-slate-900">BFD:</span> {evaluation.routingUnderlay.bfdPosture}</div>
            <div><span className="font-black text-slate-900">Convergence:</span> {evaluation.routingUnderlay.convergenceTarget}</div>
            <div><span className="font-black text-slate-900">ECMP posture:</span> {evaluation.routingUnderlay.ecmpPosture}</div>
            <div><span className="font-black text-slate-900">Graceful degradation:</span> {evaluation.faultToleranceAssessment.gracefulDegradation}</div>
            <div><span className="font-black text-slate-900">No single isolation posture:</span> {evaluation.faultToleranceAssessment.noSingleIsolationPosture}</div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">{evaluation.faultToleranceAssessment.spineFailure.scenario}</div>
              <div className="text-[11px] text-slate-700">{evaluation.faultToleranceAssessment.spineFailure.impact}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Design response:</span> {evaluation.faultToleranceAssessment.spineFailure.designResponse}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Operator note:</span> {evaluation.faultToleranceAssessment.spineFailure.operatorNote}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Proportional share:</span> {evaluation.faultToleranceAssessment.spineProportionalSharePct}% of bisection bandwidth</div>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
              <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">{evaluation.faultToleranceAssessment.leafFailure.scenario}</div>
              <div className="text-[11px] text-slate-700">{evaluation.faultToleranceAssessment.leafFailure.impact}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Design response:</span> {evaluation.faultToleranceAssessment.leafFailure.designResponse}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Operator note:</span> {evaluation.faultToleranceAssessment.leafFailure.operatorNote}</div>
              <div className="text-[11px] text-slate-700 mt-2"><span className="font-black text-slate-900">Isolation risk:</span> {evaluation.faultToleranceAssessment.leafIsolationRisk}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-2xl border border-sky-100 bg-sky-50">
        <div className="text-[10px] font-black text-sky-700 uppercase tracking-widest mb-3">Written justification</div>
        <div className="text-xs text-slate-700 leading-6 whitespace-pre-wrap">{evaluation.writtenJustification}</div>
      </div>
    </section>
  );
};
