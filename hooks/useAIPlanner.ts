import { useEffect, useMemo, useRef, useState } from 'react';
import { buildBOMItemId, useBOM } from '../context/BOMContext';
import { DEFAULT_PLANNER_INPUTS } from '../features/ai-planner/defaults';
import { applyPlannerInputChange, normalizePlannerInputsForPlatform } from '../features/ai-planner/inputState';
import type { PlannerInputs, PlannerSnapshotState } from '../features/ai-planner/types';
import { buildAIPlannerModel } from '../services/aiPlannerService';
import { useLocalSnapshots } from './useLocalSnapshots';

export const useAIPlanner = (initialSnapshotRef?: string | null) => {
  const { addToBOM } = useBOM();
  const [inputs, setInputs] = useState<PlannerInputs>(DEFAULT_PLANNER_INPUTS);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { snapshots, saveSnapshot, deleteSnapshot } = useLocalSnapshots<PlannerSnapshotState>('ai_planner_snapshots');
  const loadedSnapshotRef = useRef<string | null>(null);
  const previousModelRef = useRef<ReturnType<typeof buildAIPlannerModel> | null>(null);

  const model = useMemo(() => buildAIPlannerModel(inputs), [inputs]);

  useEffect(() => {
    previousModelRef.current = model;
  }, [model]);

  useEffect(() => {
    const normalized = normalizePlannerInputsForPlatform(inputs, model.gpuPlatform.defaultGpusPerNode);
    if (normalized !== inputs) {
      setInputs(normalized);
    }
  }, [inputs, model.gpuPlatform.defaultGpusPerNode]);

  useEffect(() => {
    if (!initialSnapshotRef || loadedSnapshotRef.current === initialSnapshotRef) {
      return;
    }

    const snapshot = snapshots.find((item) => item.id === initialSnapshotRef);
    if (!snapshot) {
      return;
    }

    setInputs(snapshot.state);
    setShowSnapshots(false);
    loadedSnapshotRef.current = initialSnapshotRef;
  }, [initialSnapshotRef, snapshots]);

  const updateInput = <K extends keyof PlannerInputs>(key: K, value: PlannerInputs[K]) => {
    setInputs((current) => applyPlannerInputChange(current, key, value));
  };

  const saveCurrentSnapshot = (name: string) => {
    saveSnapshot(name, inputs);
  };

  const loadSnapshot = (snapshot: { state: PlannerSnapshotState }) => {
    setInputs(snapshot.state);
    setShowSnapshots(false);
  };

  const addPlannerBomToProject = () => {
    model.view.bomLines.forEach((line) => {
      addToBOM({
        id: buildBOMItemId({
          sku: line.sku,
          category: line.category,
          role: line.role,
        }),
        sku: line.sku,
        quantity: line.quantity,
        description: line.description,
        category: line.category,
        role: line.role,
        sourceFeature: 'ai-planner',
        quantitySource: line.quantitySource,
      });
    });

    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 3000);
  };

  return {
    inputs,
    model,
    previousModel: previousModelRef.current,
    snapshots,
    showSnapshots,
    setShowSnapshots,
    showSuccess,
    updateInput,
    saveCurrentSnapshot,
    loadSnapshot,
    deleteSnapshot,
    addPlannerBomToProject,
  };
};
