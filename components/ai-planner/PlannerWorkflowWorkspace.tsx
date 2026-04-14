import React, { useEffect, useState } from 'react';
import { AlertTriangle, Cable, Eye, Expand, Layout, Thermometer, X } from 'lucide-react';
import { PlannerChangeImpactRow, PlannerComparisonRow, PlannerModel, PlannerPortConsumptionItem } from '../../features/ai-planner/types';
import { ClusterDiagram } from '../ClusterDiagram';
import { PlannerArchitectureCanvasPanel } from './PlannerArchitectureCanvasPanel';
import { PlannerComparisonPanel } from './PlannerComparisonPanel';
import { PlannerComputeFabricEvaluationPanel } from './PlannerComputeFabricEvaluationPanel';
import { PlannerDesignPackagePanel } from './PlannerDesignPackagePanel';
import { PlannerFabricJustificationPanel } from './PlannerFabricJustificationPanel';
import { PlannerPortConsumptionPanel } from './PlannerPortConsumptionPanel';
import { PlannerReviewNav } from './PlannerReviewNav';

interface PlannerWorkflowWorkspaceProps {
  model: PlannerModel;
  comparisonLabel?: string | null;
  comparisonRows: PlannerComparisonRow[];
  changeImpactRows: PlannerChangeImpactRow[];
  portConsumption: PlannerPortConsumptionItem[];
  onClearComparison?: () => void;
  onValidateLink: () => void;
  onOpenTopologyLab?: () => void;
  onInspectDatasheet?: (sku: string) => void;
  onExportWorkbook: () => void;
  onExportInputsCsv: () => void;
  onExportCalculationsCsv: () => void;
  onExportDecisionCsv: () => void;
  onExportComputeFabricCsv: () => void;
  onExportTopologyCsv: () => void;
  onExportFailureCsv: () => void;
}

export const PlannerWorkflowWorkspace: React.FC<PlannerWorkflowWorkspaceProps> = ({
  model,
  comparisonLabel,
  comparisonRows,
  changeImpactRows,
  portConsumption,
  onClearComparison,
  onValidateLink,
  onOpenTopologyLab,
  onInspectDatasheet,
  onExportWorkbook,
  onExportInputsCsv,
  onExportCalculationsCsv,
  onExportDecisionCsv,
  onExportComputeFabricCsv,
  onExportTopologyCsv,
  onExportFailureCsv,
}) => {
  const { currentResult, view, gpuPlatform, leafSwitch } = model;
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
        <PlannerReviewNav />

        <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{view.title}</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{view.subtitle}</p>
            </div>
            <div className="text-right text-xs text-gray-400 uppercase tracking-widest">Design package</div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute Fabric</div>
              <div className="text-lg font-black text-slate-900 font-mono">{currentResult.computeFabric.leafCount}L / {currentResult.computeFabric.spineCount}S</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Recommended Spine</div>
              <div className="text-lg font-black text-slate-900">{model.spineSwitch.name}</div>
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
        </section>

        <section id="planner-topology" className="bg-slate-900 rounded-[2rem] p-8 min-h-[620px] shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Representative Topology</div>
              <div className="text-sm text-slate-400">{view.visualMetrics.representativeNote}</div>
            </div>
            <div className="flex items-center gap-3">
              {onOpenTopologyLab && (
                <button
                  type="button"
                  onClick={onOpenTopologyLab}
                  className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-100 transition hover:border-blue-400 hover:text-white"
                >
                  Open in Topology Lab
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowExpandedTopology(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400"
              >
                <Expand size={14} />
                Open Full View
              </button>
            </div>
          </div>

          <ClusterDiagram {...diagramProps} />
        </section>

        <PlannerArchitectureCanvasPanel model={model} />

        <PlannerComparisonPanel
          comparisonLabel={comparisonLabel}
          comparisonRows={comparisonRows}
          changeImpactRows={changeImpactRows}
          onClearComparison={onClearComparison}
        />

        <PlannerPortConsumptionPanel rows={portConsumption} />

        <div id="planner-fabric-eval">
          <PlannerComputeFabricEvaluationPanel model={model} />
        </div>

        <div id="planner-fabric-justify">
          <PlannerFabricJustificationPanel model={model} />
        </div>

        <div id="planner-package">
          <PlannerDesignPackagePanel
          model={model}
          onExportWorkbook={onExportWorkbook}
          onExportInputsCsv={onExportInputsCsv}
          onExportCalculationsCsv={onExportCalculationsCsv}
          onExportDecisionCsv={onExportDecisionCsv}
          onExportComputeFabricCsv={onExportComputeFabricCsv}
          onExportTopologyCsv={onExportTopologyCsv}
          onExportFailureCsv={onExportFailureCsv}
          />
        </div>

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
              {[view.fabricMedia, view.accessMedia].map((media, index) => (
                <div key={media.item.sku + index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{index === 0 ? 'Fabric Interconnect' : 'Compute Access'}</div>
                  <div className="text-xl font-black text-gray-900">{media.label}</div>
                  <div className="text-xs font-mono text-gray-500 mt-1">{media.item.sku}</div>
                  {'skuPrecision' in media.item && media.item.skuPrecision === 'family-length-variable' ? (
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
                      Family SKU shown; exact length suffix selected later
                    </div>
                  ) : null}
                  <p className="text-xs text-gray-500 mt-3">{media.rationale}</p>
                  {onInspectDatasheet && (
                    <button
                      type="button"
                      onClick={() => onInspectDatasheet(media.item.sku)}
                      className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                    >
                      Inspect Datasheet
                    </button>
                  )}
                </div>
              ))}
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
                <span className="text-[11px] font-bold">{currentResult.rackPlanning.powerPerRackKw > 30 ? 'Power density suggests liquid-cooling validation.' : 'Representative rack density stays within standard air-cooling assumptions.'}</span>
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
            <div className="flex-1 overflow-auto p-6 md:p-8">
              <ClusterDiagram {...diagramProps} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
