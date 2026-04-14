import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Compass, FileSpreadsheet, Hammer, MessageSquareMore, ShieldCheck, Table } from 'lucide-react';
import { PlannerArtifactMeta, PlannerModel } from '../../features/ai-planner/types';

interface PlannerDesignPackagePanelProps {
  model: PlannerModel;
  onExportWorkbook: () => void;
  onExportInputsCsv: () => void;
  onExportCalculationsCsv: () => void;
  onExportDecisionCsv: () => void;
  onExportComputeFabricCsv: () => void;
  onExportTopologyCsv: () => void;
  onExportFailureCsv: () => void;
}

type WorkflowTab = 'recommend' | 'defend' | 'implement' | 'present';

const tabMeta: Record<WorkflowTab, { label: string; icon: React.ReactNode }> = {
  recommend: { label: 'Recommend', icon: <Compass size={14} /> },
  defend: { label: 'Defend', icon: <ShieldCheck size={14} /> },
  implement: { label: 'Implement', icon: <Hammer size={14} /> },
  present: { label: 'Present', icon: <MessageSquareMore size={14} /> },
};

const sourceTone: Record<string, string> = {
  'input-derived': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'policy-derived': 'bg-sky-50 text-sky-700 border-sky-100',
  'assumption-driven': 'bg-amber-50 text-amber-700 border-amber-100',
  'requires-validation': 'bg-rose-50 text-rose-700 border-rose-100',
};

const confidenceTone = {
  high: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  medium: 'bg-amber-50 border-amber-100 text-amber-700',
  low: 'bg-rose-50 border-rose-100 text-rose-700',
} as const;

const validationTone = {
  'ready-for-discussion': 'bg-emerald-50 border-emerald-100 text-emerald-700',
  'requires-customer-input': 'bg-sky-50 border-sky-100 text-sky-700',
  'requires-poc-validation': 'bg-amber-50 border-amber-100 text-amber-700',
} as const;

const MetaBadgeRow: React.FC<{ meta: PlannerArtifactMeta }> = ({ meta }) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${confidenceTone[meta.confidence]}`}>
      {meta.confidence} confidence
    </div>
    <div className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${validationTone[meta.validationState]}`}>
      {meta.validationState.replace(/-/g, ' ')}
    </div>
    <div className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
      {meta.audience}
    </div>
    {meta.sourceClass.map((source) => (
      <div key={source} className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${sourceTone[source]}`}>
        {source.replace(/-/g, ' ')}
      </div>
    ))}
  </div>
);

export const PlannerDesignPackagePanel: React.FC<PlannerDesignPackagePanelProps> = ({
  model,
  onExportWorkbook,
  onExportInputsCsv,
  onExportCalculationsCsv,
  onExportDecisionCsv,
  onExportComputeFabricCsv,
  onExportTopologyCsv,
  onExportFailureCsv,
}) => {
  const [activeTab, setActiveTab] = useState<WorkflowTab>('recommend');
  const [copied, setCopied] = useState<WorkflowTab | null>(null);
  const designPackage = model.view.designPackage;

  const copyMap = useMemo<Record<WorkflowTab, string>>(() => ({
    recommend: [
      designPackage.recommendation.recommendation,
      designPackage.recommendation.fitSummary,
      ...designPackage.recommendation.notClaimed,
    ].join('\n'),
    defend: designPackage.decisionRecord.items.map((item) => (
      `${item.title}\nDecision: ${item.decision}\nWhy: ${item.why}\nTradeoffs: ${item.tradeoffs.join(' ')}\nChange conditions: ${item.changeConditions.join(' ')}`
    )).join('\n\n'),
    implement: [
      'Underlay posture:',
      ...designPackage.implementationReadiness.underlayPosture.map((item) => `- ${item}`),
      'RoCE / QoS posture:',
      ...designPackage.implementationReadiness.roceQosPosture.map((item) => `- ${item}`),
      'Validation sequence:',
      ...designPackage.implementationReadiness.validationSequence.map((item) => `- ${item}`),
    ].join('\n'),
    present: [
      designPackage.presentationPack.customerSummary,
      '',
      `Topology story: ${designPackage.presentationPack.topologyStory}`,
      '',
      'Proof checklist:',
      ...designPackage.presentationPack.proofChecklist.map((item) => `- ${item}`),
    ].join('\n'),
  }), [designPackage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyMap[activeTab]);
      setCopied(activeTab);
      window.setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.warn('Failed to copy design package artifact', error);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Design package</div>
          <h3 className="text-xl font-black text-slate-900">Workflow artifacts</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Durable outputs grouped by how an SE actually uses the result: recommend, defend, implement, and present.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          {copied === activeTab ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
          {copied === activeTab ? 'Copied' : 'Copy Artifact'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExportWorkbook}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-emerald-700 transition hover:border-emerald-300 hover:text-emerald-800"
        >
          <FileSpreadsheet size={14} />
          Export Workbook
        </button>
        <button
          type="button"
          onClick={onExportInputsCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Inputs CSV
        </button>
        <button
          type="button"
          onClick={onExportCalculationsCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Calculations CSV
        </button>
        <button
          type="button"
          onClick={onExportDecisionCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Decision CSV
        </button>
        <button
          type="button"
          onClick={onExportComputeFabricCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Compute Fabric CSV
        </button>
        <button
          type="button"
          onClick={onExportTopologyCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Topology CSV
        </button>
        <button
          type="button"
          onClick={onExportFailureCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          <Table size={14} />
          Export Failure CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        {(Object.keys(tabMeta) as WorkflowTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
              activeTab === tab
                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {tabMeta[tab].icon}
            {tabMeta[tab].label}
          </button>
        ))}
      </div>

      {activeTab === 'recommend' && (
        <div className="space-y-4">
          <MetaBadgeRow meta={designPackage.recommendation.meta} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Design recommendation</div>
              <div className="text-lg font-black text-slate-900">{designPackage.recommendation.recommendation}</div>
              <div className="mt-3 text-sm text-slate-700 leading-6">{designPackage.recommendation.fitSummary}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Topology', designPackage.recommendation.topology],
                ['Leaf class', designPackage.recommendation.leafClass],
                ['Spine class', designPackage.recommendation.spineClass],
                ['Rail posture', designPackage.recommendation.railPosture],
                ['Scope', designPackage.recommendation.scope],
                ['Growth', designPackage.recommendation.growthPosture],
              ].map(([label, value]) => (
                <div key={label} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</div>
                  <div className="text-sm font-black text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">Key risks</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {designPackage.recommendation.keyRisks.map((risk) => (
                  <li key={risk.title}><span className="font-black text-slate-900">{risk.title}:</span> {risk.body}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-2">What this package is not claiming</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {designPackage.recommendation.notClaimed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'defend' && (
        <div className="space-y-4">
          <MetaBadgeRow meta={designPackage.decisionRecord.items[0].meta} />
          <div className="space-y-4">
            {designPackage.decisionRecord.items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{item.title}</div>
                    <div className="text-base font-black text-slate-900">{item.decision}</div>
                  </div>
                  <div className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    {item.meta.validationState.replace(/-/g, ' ')}
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-700 leading-6">{item.why}</div>
                <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4 text-xs text-slate-700">
                  <div>
                    <div className="font-black text-slate-900 mb-2">Tradeoffs</div>
                    <ul className="space-y-2">{item.tradeoffs.map((entry) => <li key={entry}>{entry}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-black text-slate-900 mb-2">Alternatives considered</div>
                    <ul className="space-y-2">{item.alternativesConsidered.map((entry) => <li key={entry}>{entry}</li>)}</ul>
                  </div>
                  <div>
                    <div className="font-black text-slate-900 mb-2">What would change this</div>
                    <ul className="space-y-2">{item.changeConditions.map((entry) => <li key={entry}>{entry}</li>)}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'implement' && (
        <div className="space-y-4">
          <MetaBadgeRow meta={designPackage.implementationReadiness.meta} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {([
              ['Underlay posture', designPackage.implementationReadiness.underlayPosture],
              ['RoCE / QoS posture', designPackage.implementationReadiness.roceQosPosture],
              ['Host / rail posture', designPackage.implementationReadiness.hostRailPosture],
              ['Config skeleton labels', designPackage.implementationReadiness.configSkeletonLabels],
            ] as Array<[string, string[]]>).map(([label, items]) => (
              <div key={label} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{label}</div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(items as string[]).map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-3">Validation sequence</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {designPackage.implementationReadiness.validationSequence.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-3">CLI validation categories</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {designPackage.implementationReadiness.cliValidationCategories.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'present' && (
        <div className="space-y-4">
          <MetaBadgeRow meta={designPackage.presentationPack.meta} />
          <div className="p-4 rounded-2xl border border-sky-100 bg-sky-50">
            <div className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-3">Customer-safe summary</div>
            <div className="text-sm text-slate-700 leading-6 whitespace-pre-wrap">{designPackage.presentationPack.customerSummary}</div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Topology story</div>
              <div className="text-sm text-slate-700 leading-6">{designPackage.presentationPack.topologyStory}</div>
              <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Diagram brief</div>
              <div className="text-sm font-black text-slate-900">{designPackage.presentationPack.diagramBrief.title}</div>
              <div className="mt-2 text-xs text-slate-700">{designPackage.presentationPack.diagramBrief.topology}</div>
            </div>
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Proof checklist</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {designPackage.presentationPack.proofChecklist.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3">Objections, caveats, and next validations</div>
            <ul className="space-y-2 text-xs text-slate-700">
              {designPackage.presentationPack.objectionsAndCaveats.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
