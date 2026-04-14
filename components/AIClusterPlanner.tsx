import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, History, Save, Trash2, X } from 'lucide-react';
import { Page, LearnPageTab, AppNavigationParams } from '../types';
import { useAIPlanner } from '../hooks/useAIPlanner';
import {
  exportPlannerBomCsv,
  exportPlannerCalculationsCsv,
  exportPlannerComputeFabricCsv,
  exportPlannerDecisionCsv,
  exportPlannerFailureAnalysisCsv,
  exportPlannerInputsCsv,
  exportPlannerTopologyJustificationCsv,
  exportPlannerWorkbook,
} from '../services/plannerExportService';
import { buildPlannerChangeImpactRows, buildPlannerComparisonRows, buildPlannerPortConsumption } from '../services/plannerComparisonService';
import { buildAIPlannerModel } from '../services/aiPlannerService';
import { PlannerInputsPanel } from './ai-planner/PlannerInputsPanel';
import { PlannerWorkflowWorkspace } from './ai-planner/PlannerWorkflowWorkspace';
import { PlannerBomSummary } from './ai-planner/PlannerBomSummary';

interface AIClusterPlannerProps {
  onNavigate?: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
  initialSnapshotRef?: string | null;
}

const AIClusterPlanner: React.FC<AIClusterPlannerProps> = ({ onNavigate, initialSnapshotRef }) => {
  const {
    inputs,
    model,
    previousModel,
    snapshots,
    showSnapshots,
    setShowSnapshots,
    showSuccess,
    updateInput,
    saveCurrentSnapshot,
    loadSnapshot,
    deleteSnapshot,
    addPlannerBomToProject,
  } = useAIPlanner(initialSnapshotRef);
  const [comparisonSnapshotId, setComparisonSnapshotId] = useState<string | null>(null);

  const comparisonSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.id === comparisonSnapshotId) ?? null,
    [comparisonSnapshotId, snapshots],
  );
  const comparisonModel = useMemo(
    () => (comparisonSnapshot ? buildAIPlannerModel(comparisonSnapshot.state) : null),
    [comparisonSnapshot],
  );
  const comparisonRows = useMemo(
    () => (comparisonModel ? buildPlannerComparisonRows(model, comparisonModel) : []),
    [comparisonModel, model],
  );
  const changeImpactRows = useMemo(
    () => buildPlannerChangeImpactRows(model, previousModel ?? null),
    [model, previousModel],
  );
  const portConsumption = useMemo(
    () => buildPlannerPortConsumption(model),
    [model],
  );

  const handleSaveSnapshot = () => {
    const name = prompt('Snapshot Name:');
    if (!name) {
      return;
    }

    saveCurrentSnapshot(name);
  };

  const handleValidateLink = () => {
    const media = model.view.fabricMedia;

    if (!onNavigate || !media.validationEligible || typeof media.budgetValue !== 'number' || !('media' in media.item)) {
      return;
    }

    onNavigate(Page.LINK_BUDGET, undefined, undefined, {
      budget: media.budgetValue,
      fiberType: media.item.media as 'SMF' | 'MMF',
    });
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    deleteSnapshot(snapshotId);
    if (comparisonSnapshotId === snapshotId) {
      setComparisonSnapshotId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-gray-200 pb-6 relative z-30">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Cpu className="w-10 h-10 text-blue-600" />
            AI Cluster Planner
          </h1>
          <p className="text-gray-500 mt-2 text-lg leading-relaxed">
            {model.view.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSnapshots(!showSnapshots)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative"
            title="Saved designs"
          >
            <History size={20} />
            {snapshots.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />}
          </button>
          <button
            onClick={handleSaveSnapshot}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Save design"
          >
            <Save size={20} />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2" />
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Assumption-Driven Architect Workflow</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        <AnimatePresence>
          {showSnapshots && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 z-40 p-6 shadow-2xl rounded-l-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Saved Designs</h3>
                <button onClick={() => setShowSnapshots(false)}><X size={16} className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                {snapshots.length === 0 ? (
                  <p className="text-[10px] text-gray-500 italic">No designs saved.</p>
                ) : (
                  snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-500/30 transition-all">
                      <button onClick={() => loadSnapshot(snapshot)} className="flex-1 text-left">
                        <div className="text-[11px] font-bold text-gray-900 truncate">{snapshot.name}</div>
                        <div className="text-[9px] text-gray-500">
                          {snapshot.state.gpuCount} GPUs • {snapshot.state.oversubscription}:1 • {snapshot.state.customSpineSku ?? snapshot.state.fabricProfileId}
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setComparisonSnapshotId((current) => current === snapshot.id ? null : snapshot.id)}
                          className={`opacity-0 group-hover:opacity-100 rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-widest transition-all ${
                            comparisonSnapshotId === snapshot.id
                              ? 'bg-blue-100 text-blue-700 opacity-100'
                              : 'text-gray-400 hover:text-blue-600'
                          }`}
                        >
                          Compare
                        </button>
                        <button onClick={() => handleDeleteSnapshot(snapshot.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:col-span-4">
          <PlannerInputsPanel inputs={inputs} model={model} updateInput={updateInput} />
        </div>

        <div className="lg:col-span-8 space-y-8">
          <PlannerWorkflowWorkspace
            model={model}
            comparisonLabel={comparisonSnapshot?.name ?? null}
            comparisonRows={comparisonRows}
            changeImpactRows={changeImpactRows}
            portConsumption={portConsumption}
            onClearComparison={() => setComparisonSnapshotId(null)}
            onValidateLink={handleValidateLink}
            onExportWorkbook={() => { void exportPlannerWorkbook(model); }}
            onExportInputsCsv={() => exportPlannerInputsCsv(model)}
            onExportCalculationsCsv={() => exportPlannerCalculationsCsv(model)}
            onExportDecisionCsv={() => exportPlannerDecisionCsv(model)}
            onExportComputeFabricCsv={() => exportPlannerComputeFabricCsv(model)}
            onExportTopologyCsv={() => exportPlannerTopologyJustificationCsv(model)}
            onExportFailureCsv={() => exportPlannerFailureAnalysisCsv(model)}
            onOpenTopologyLab={onNavigate ? () => onNavigate(Page.TOPOLOGY, undefined, undefined, {
              plannerTopologySeed: {
                scope: model.inputs.scope,
                leafCount: model.currentResult.computeFabric.leafCount,
                spineCount: model.currentResult.computeFabric.spineCount,
                mediaType: model.view.fabricMedia.type,
                storageFabric: Boolean(model.currentResult.storageFabric),
              },
            }) : undefined}
            onInspectDatasheet={onNavigate ? (sku) => onNavigate(Page.INTERACTIVE_DATASHEETS, undefined, sku, {
              plannerDatasheetSeed: {
                sku,
                source: 'ai-planner',
              },
            }) : undefined}
          />
          <PlannerBomSummary
            bomLines={model.view.bomLines}
            bomSections={model.view.bomSections}
            hardwarePacket={model.view.designPackage.hardwarePacket}
            showSuccess={showSuccess}
            onAddToBOM={addPlannerBomToProject}
            onExportBomCsv={() => exportPlannerBomCsv(model)}
            onExportWorkbook={() => { void exportPlannerWorkbook(model); }}
            onOpenBOM={onNavigate ? () => onNavigate(Page.BOM_BUILDER) : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default AIClusterPlanner;
