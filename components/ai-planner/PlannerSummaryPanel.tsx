import React, { useEffect, useState } from 'react';
import { AlertTriangle, Cable, Eye, Expand, HelpCircle, Layout, Thermometer, X } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';
import { ClusterDiagram } from '../ClusterDiagram';
import { PlannerExecutivePanel } from './PlannerExecutivePanel';
import { PlannerNarrativePanel } from './PlannerNarrativePanel';
import { PlannerDiscoveryPanel } from './PlannerDiscoveryPanel';
import { PlannerValidationPanel } from './PlannerValidationPanel';
import { PlannerPressurePanel } from './PlannerPressurePanel';
import { PlannerFabricJustificationPanel } from './PlannerFabricJustificationPanel';
import { PlannerComputeFabricEvaluationPanel } from './PlannerComputeFabricEvaluationPanel';

interface PlannerSummaryPanelProps {
  model: PlannerModel;
  onValidateLink: () => void;
  onOpenTopologyLab?: () => void;
  onInspectDatasheet?: (sku: string) => void;
}

export const PlannerSummaryPanel: React.FC<PlannerSummaryPanelProps> = ({ model, onValidateLink, onOpenTopologyLab, onInspectDatasheet }) => {
  const { currentResult, view, gpuPlatform, leafSwitch, spineSwitch } = model;
  const [showExpandedTopology, setShowExpandedTopology] = useState(false);

  useEffect(() => {
    if (!showExpandedTopology) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExpandedTopology(false);
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showExpandedTopology]);

  const diagramProps = {
    spineCount: currentResult.computeFabric.spineCount,
    leafCount: currentResult.computeFabric.leafCount,
    gpuCount: model.inputs.gpuCount,
    mediaType: view.fabricMedia.type,
    mediaColor: view.fabricMedia.color,
    portSpeedLabel: `${leafSwitch.portSpeed} fabric`,
    latencyLabel: view.visualMetrics.latencyLabel,
    leafSwitchLabel: view.visualMetrics.leafLabel,
    spineSwitchLabel: view.visualMetrics.spineLabel,
    gpuRackLabel: gpuPlatform.name,
    storageNodeLabel: model.storagePlatform?.name ?? 'Storage fabric node',
    nicsPerPort: currentResult.computeFabric.nicsPerPort,
    planningMode: model.inputs.scope === 'COMPUTE_AND_STORAGE' ? 'FULL_STACK' as const : 'BACKEND_ONLY' as const,
    storageFabric: currentResult.storageFabric,
  };

  return (
    <>
    <div className="space-y-8">
      <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{view.title}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{view.subtitle}</p>
          </div>
          <div className="text-right text-xs text-gray-400 uppercase tracking-widest">
            Representative architect workflow
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Fabric</div>
            <div className="text-lg font-black text-slate-900 font-mono">{currentResult.computeFabric.leafCount}L / {currentResult.computeFabric.spineCount}S</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Uplinks</div>
            <div className="text-lg font-black text-slate-900 font-mono">{currentResult.computeFabric.usedUplinkPorts}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nodes / Rack</div>
            <div className="text-lg font-black text-slate-900 font-mono">{currentResult.rackPlanning.nodesPerRack}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Power / Rack</div>
            <div className="text-lg font-black text-slate-900 font-mono">{currentResult.rackPlanning.powerPerRackKw.toFixed(1)}kW</div>
          </div>
        </div>

        {(onOpenTopologyLab || onInspectDatasheet) && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onOpenTopologyLab && (
              <button
                type="button"
                onClick={onOpenTopologyLab}
                className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                Open in Topology Lab
              </button>
            )}
            {onInspectDatasheet && (
              <>
                <button
                  type="button"
                  onClick={() => onInspectDatasheet(leafSwitch.sku)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Inspect Leaf Hardware
                </button>
                <button
                  type="button"
                  onClick={() => onInspectDatasheet(spineSwitch.sku)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Inspect Spine Hardware
                </button>
              </>
            )}
          </div>
        )}
      </section>

      <PlannerExecutivePanel model={model} />

      <section className="bg-slate-900 rounded-[2rem] p-8 min-h-[620px] shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Representative Topology</div>
            <div className="text-sm text-slate-400">{view.visualMetrics.representativeNote}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-mono text-slate-500 text-right">
              {leafSwitch.name} leafs • {spineSwitch.name} spines
            </div>
            <button
              type="button"
              onClick={() => setShowExpandedTopology(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400"
            >
              <Expand size={14} />
              Open Full Topology View
            </button>
          </div>
        </div>

        <ClusterDiagram {...diagramProps} />

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowExpandedTopology(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/70 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-blue-400 hover:text-white"
          >
            <Expand size={16} />
            Open Full View
          </button>
        </div>
      </section>

      <PlannerNarrativePanel model={model} />

      <PlannerPressurePanel model={model} />

      <PlannerComputeFabricEvaluationPanel model={model} />

      <PlannerFabricJustificationPanel model={model} />

      <PlannerDiscoveryPanel model={model} />

      <PlannerValidationPanel model={model} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl bg-gray-50 ${view.fabricMedia.color}`}>
              <Cable size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Media Advisor</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Catalog-backed recommendations</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fabric Interconnect</div>
              <div className="text-xl font-black text-gray-900">{view.fabricMedia.label}</div>
              <div className="text-xs font-mono text-gray-500 mt-1">{view.fabricMedia.item.sku}</div>
              <p className="text-xs text-gray-500 mt-3">{view.fabricMedia.rationale}</p>
              {onInspectDatasheet && (
                <button
                  type="button"
                  onClick={() => onInspectDatasheet(view.fabricMedia.item.sku)}
                  className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Inspect Recommended Optics
                </button>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Compute Access</div>
              <div className="text-xl font-black text-gray-900">{view.accessMedia.label}</div>
              <div className="text-xs font-mono text-gray-500 mt-1">{view.accessMedia.item.sku}</div>
              <p className="text-xs text-gray-500 mt-3">{view.accessMedia.rationale}</p>
              {onInspectDatasheet && (
                <button
                  type="button"
                  onClick={() => onInspectDatasheet(view.accessMedia.item.sku)}
                  className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Inspect Access Media
                </button>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                <HelpCircle size={14} /> Assumptions
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {[...view.fabricMedia.assumptions, ...view.accessMedia.assumptions].join(' ')}
              </p>
            </div>

            <button
              onClick={onValidateLink}
              disabled={!view.fabricMedia.validationEligible}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors ${
                view.fabricMedia.validationEligible
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Eye size={16} />
              {view.fabricMedia.validationEligible ? 'Validate Fabric Link Budget' : 'Fabric Link Budget Unavailable'}
            </button>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gray-50 text-blue-600">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Growth and Warnings</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Capacity deltas and operational caveats</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Add Leaves</div>
                <div className="text-lg font-black text-gray-900 font-mono">{view.capacityPlan.additionalLeaves}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Add Spines</div>
                <div className="text-lg font-black text-gray-900 font-mono">{view.capacityPlan.additionalSpines}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Add Racks</div>
                <div className="text-lg font-black text-gray-900 font-mono">{view.capacityPlan.additionalRacks}</div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Representative Metrics</div>
              <div className="text-sm text-slate-700 flex justify-between"><span>Fabric bandwidth</span><span className="font-mono font-bold">{view.visualMetrics.fabricBandwidthLabel}</span></div>
              <div className="text-sm text-slate-700 flex justify-between"><span>Latency</span><span className="font-mono font-bold">{view.visualMetrics.latencyLabel}</span></div>
              <div className="text-sm text-slate-700 flex justify-between"><span>Buffer profile</span><span className="font-bold">{view.visualMetrics.bufferLabel}</span></div>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-xl border ${currentResult.rackPlanning.powerPerRackKw > 30 ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
              <Thermometer size={14} />
              <span className="text-[11px] font-bold">
                {currentResult.rackPlanning.powerPerRackKw > 30 ? 'Power density suggests liquid-cooling validation.' : 'Representative rack density stays within standard air-cooling assumptions.'}
              </span>
            </div>

            {view.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="text-amber-800 font-bold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Planner Warnings
                </div>
                <ul className="space-y-2">
                  {view.warnings.map((warning) => (
                    <li key={warning} className="text-xs text-amber-700 leading-relaxed">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
    {showExpandedTopology && (
      <div className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm p-4 md:p-8">
        <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950 shadow-2xl">
          <div className="flex items-start justify-between gap-6 border-b border-slate-800 px-6 py-5 md:px-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-400">Full Topology Review</div>
              <h3 className="mt-2 text-2xl font-bold text-white">{view.title}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                Expanded representative FE/BE network view for architecture review. Use this surface for presentation-scale inspection; counts stay compressed for readability.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExpandedTopology(false)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <X size={16} />
              Close
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-h-0 p-4 md:p-6">
              <div className="h-full min-h-[720px] rounded-[1.75rem] border border-slate-800 bg-slate-900 p-4 md:p-6">
                <ClusterDiagram {...diagramProps} />
              </div>
            </div>

            <aside className="border-t border-slate-800 bg-slate-950 px-6 py-6 xl:border-l xl:border-t-0">
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">What You Are Seeing</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {model.inputs.scope === 'COMPUTE_AND_STORAGE'
                      ? 'Full-stack mode separates front-end services and storage adjacency from the back-end GPU collective fabric.'
                      : 'Compute-only mode emphasizes the back-end GPU collective fabric without front-end storage overlays.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Active Profiles</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-200">
                    <div className="flex justify-between gap-4"><span>Leaf class</span><span className="font-mono">{leafSwitch.name}</span></div>
                    <div className="flex justify-between gap-4"><span>Spine class</span><span className="font-mono">{spineSwitch.name}</span></div>
                    <div className="flex justify-between gap-4"><span>Media</span><span className="font-mono">{view.fabricMedia.item.sku}</span></div>
                    <div className="flex justify-between gap-4"><span>Scope</span><span className="font-mono">{model.inputs.scope === 'COMPUTE_AND_STORAGE' ? 'Full Stack' : 'Compute Only'}</span></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Topology Notes</div>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
                    <li>Counts are compressed for readability; the diagram is representative, not a rack elevation.</li>
                    <li>Hovering the diagram still surfaces node-level context, but the main review surface is intentionally cleaner.</li>
                    <li>Use the BOM and warnings panels for exact modeled counts, breakout assumptions, and rack-power caveats.</li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
