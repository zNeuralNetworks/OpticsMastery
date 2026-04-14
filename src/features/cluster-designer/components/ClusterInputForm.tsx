import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Disclosure } from "@/components/ui/Disclosure";
import {
  applyFabricProfile,
  detectFabricProfileId,
  fabricProfileOptions,
} from "@/features/cluster-designer/data/fabricProfiles";
import { platformProfiles } from "@/features/cluster-designer/data/platformProfiles";
import { getScenarioPreset, scenarioPresets } from "@/features/cluster-designer/data/presets";
import { storageProfileFor } from "@/features/cluster-designer/data/storageProfiles";
import { deriveClusterScaleClass } from "@/features/cluster-designer/models/trainingCommunicationModel";
import type {
  ClusterInput,
  ClusterScaleClass,
  CommunicationPattern,
  EastWestTrafficIntensity,
  FabricProfileId,
  FutureGrowthBuffer,
  ManagementSimplicityPriority,
  ModelSynchronizationSensitivity,
  OpticsPreference,
  RedundancyPreference,
  ResearchWorkloadProfile,
  StorageProfileId,
  TargetOversubscription,
  TrainingCommunicationIntensity,
  WorkloadType,
} from "@/features/cluster-designer/types";

type ClusterInputFormProps = {
  value: ClusterInput;
  onChange: (next: ClusterInput) => void;
  title?: string;
  eyebrow?: string;
};

type NumberKey = keyof Pick<
  ClusterInput,
  | "gpuCount"
  | "allocatedRackCount"
  | "rackUnitsPerRack"
  | "powerCapacityKwPerRack"
  | "computeNodeRackUnits"
  | "computeNodePowerKw"
  | "thermalNodeCapPerRack"
>;
type ScopeValue = "compute-only" | "compute-and-storage";
type StorageIntentValue = "generic-shared" | "dedicated-roce";

const storageProfileOptions: { value: StorageIntentValue; label: string }[] = [
  { value: "generic-shared", label: "Generic shared storage" },
  { value: "dedicated-roce", label: "Dedicated high-priority RoCE storage fabric" },
];

const checkpointBurstOptions: { value: NonNullable<ClusterInput["checkpointBurstProfile"]>; label: string }[] = [
  { value: "light", label: "Light checkpoint bursts" },
  { value: "moderate", label: "Moderate checkpoint bursts" },
  { value: "high", label: "High checkpoint bursts" },
];

const opticsOptions: { value: OpticsPreference; label: string }[] = [
  { value: "mixed", label: "Auto-select media (Recommended)" },
  { value: "dac", label: "Prefer passive copper" },
  { value: "aoc", label: "Prefer direct-attach optics" },
  { value: "sr", label: "Prefer structured multimode fiber" },
  { value: "dr", label: "Prefer structured single-mode fiber" },
];

const growthOptions: { value: FutureGrowthBuffer; label: string }[] = [
  { value: 0, label: "No reserved growth" },
  { value: 25, label: "25% reserved growth" },
  { value: 50, label: "50% reserved growth" },
];

const workloadOptions: { value: WorkloadType; label: string }[] = [
  { value: "training", label: "Training-led" },
  { value: "inference", label: "Inference-led" },
  { value: "mixed", label: "Mixed" },
  { value: "hpc", label: "HPC / tightly coupled" },
];

const eastWestOptions: { value: EastWestTrafficIntensity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Moderate" },
  { value: "high", label: "High" },
];

const oversubscriptionOptions: { value: TargetOversubscription; label: string }[] = [
  { value: 1, label: "1:1" },
  { value: 2, label: "2:1" },
  { value: 3, label: "3:1" },
];

const redundancyOptions: { value: RedundancyPreference; label: string }[] = [
  { value: "standard", label: "Standard redundancy" },
  { value: "high", label: "Higher redundancy" },
];

const simplicityOptions: { value: ManagementSimplicityPriority; label: string }[] = [
  { value: "low", label: "Lower simplicity bias" },
  { value: "medium", label: "Balanced operations" },
  { value: "high", label: "Simpler operations" },
];

const collectivePatternOptions: { value: CommunicationPattern; label: string }[] = [
  { value: "nccl-framework-managed", label: "NCCL / framework-managed" },
  { value: "ring-all-reduce", label: "Ring all-reduce" },
  { value: "tree-all-reduce", label: "Tree all-reduce" },
  { value: "hierarchical", label: "Hierarchical" },
  { value: "mixed-unknown", label: "Mixed / unknown" },
];

const communicationIntensityOptions: { value: TrainingCommunicationIntensity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "extreme", label: "Extreme" },
];

const syncSensitivityOptions: { value: ModelSynchronizationSensitivity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const profileGuidance: Record<ResearchWorkloadProfile, string> = Object.fromEntries(
  scenarioPresets.map((preset) => [preset.id, preset.workloadSummary]),
) as Record<ResearchWorkloadProfile, string>;

const gpuPlatformShortcuts: Array<{
  id: string;
  label: string;
  nicSpeedGb: 100 | 200 | 400 | 800;
  gpusPerServer: number;
}> = [
  { id: "a100", label: "A100 HGX", nicSpeedGb: 200, gpusPerServer: 8 },
  { id: "h100", label: "H100 SXM", nicSpeedGb: 400, gpusPerServer: 8 },
  { id: "h200", label: "H200 SXM", nicSpeedGb: 400, gpusPerServer: 8 },
  { id: "b200nvl72", label: "B200 NVL72", nicSpeedGb: 800, gpusPerServer: 72 },
];

function deriveServerCount(gpuCount: number, gpusPerServer: number) {
  return Math.max(1, Math.ceil(gpuCount / Math.max(1, gpusPerServer)));
}

function deriveScope(storageNetworkPresent: boolean): ScopeValue {
  return storageNetworkPresent ? "compute-and-storage" : "compute-only";
}

function deriveStorageIntent(storageProfileId: StorageProfileId): StorageIntentValue {
  return storageProfileId === "high-priority-roce-parallel-fs" ? "dedicated-roce" : "generic-shared";
}

function normalizeStorageProfile(
  storageProfileId: StorageProfileId,
  fallback: StorageProfileId = "generic-shared-roce",
): StorageProfileId {
  return storageProfileId === "none" ? fallback : storageProfileId;
}

export function ClusterInputForm({
  value,
  onChange,
  title = "Cluster design inputs",
  eyebrow = "1. Cluster Inputs",
}: ClusterInputFormProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    workload: true,
    fabric: true,
    physical: true,
    expansion: true,
  });

  const activePreset = getScenarioPreset(value.researchWorkloadProfile);
  const availableLeafOptions = useMemo(
    () => platformProfiles.leafOptions.filter((option) => option.portSpeedGb === value.nicSpeedGb),
    [value.nicSpeedGb],
  );
  const availableSpineOptions = useMemo(
    () => platformProfiles.spineOptions.filter((option) => option.portSpeedGb === value.nicSpeedGb),
    [value.nicSpeedGb],
  );
  const fabricProfileId = useMemo(
    () =>
      detectFabricProfileId({
        nicSpeedGb: value.nicSpeedGb,
        targetOversubscription: value.targetOversubscription,
        redundancyPreference: value.redundancyPreference,
        managementSimplicityPriority: value.managementSimplicityPriority,
      }),
    [value.managementSimplicityPriority, value.nicSpeedGb, value.redundancyPreference, value.targetOversubscription],
  );

  const updateNumber =
    (key: NumberKey) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const numericValue = Number(event.target.value);
      if (key === "gpuCount") {
        onChange({
          ...value,
          gpuCount: numericValue,
          gpuServerCount: deriveServerCount(numericValue, value.gpusPerServer),
          clusterScaleClass: deriveClusterScaleClass(numericValue),
        });
        return;
      }

      onChange({
        ...value,
        [key]: numericValue,
      });
    };

  const applyPreset = (profile: ResearchWorkloadProfile) => {
    const preset = getScenarioPreset(profile).input;
    const nextGpuCount = value.gpuCount;

    onChange({
      ...value,
      researchWorkloadProfile: profile,
      gpusPerServer: preset.gpusPerServer,
      nicPortsPerServer: preset.nicPortsPerServer,
      workloadType: preset.workloadType,
      eastWestTrafficIntensity: preset.eastWestTrafficIntensity,
      collectivePattern: preset.collectivePattern,
      trainingCommunicationIntensity: preset.trainingCommunicationIntensity,
      modelSynchronizationSensitivity: preset.modelSynchronizationSensitivity,
      gpuCount: nextGpuCount,
      gpuServerCount: deriveServerCount(nextGpuCount, preset.gpusPerServer),
      clusterScaleClass: deriveClusterScaleClass(nextGpuCount),
      storageNetworkPresent: value.storageNetworkPresent,
      storageType: value.storageNetworkPresent ? value.storageType : "ethernet",
      storageProfileId: value.storageNetworkPresent ? normalizeStorageProfile(value.storageProfileId) : "none",
      storageComputePortsPerNode:
        value.storageNetworkPresent && value.storageProfileId === "high-priority-roce-parallel-fs"
          ? value.storageComputePortsPerNode
          : preset.storageComputePortsPerNode,
      storagePortSpeedGb:
        value.storageNetworkPresent && value.storageProfileId === "high-priority-roce-parallel-fs"
          ? value.storagePortSpeedGb
          : preset.storagePortSpeedGb,
      storageServerCount:
        value.storageNetworkPresent && value.storageProfileId === "high-priority-roce-parallel-fs"
          ? value.storageServerCount
          : preset.storageServerCount,
      storagePortsPerServer:
        value.storageNetworkPresent && value.storageProfileId === "high-priority-roce-parallel-fs"
          ? value.storagePortsPerServer
          : preset.storagePortsPerServer,
      checkpointBurstProfile:
        value.storageNetworkPresent && value.storageProfileId === "high-priority-roce-parallel-fs"
          ? value.checkpointBurstProfile
          : preset.checkpointBurstProfile,
      preferredLeafModelId:
        value.preferredLeafModelId &&
        platformProfiles.leafOptions.some(
          (option) => option.id === value.preferredLeafModelId && option.portSpeedGb === preset.nicSpeedGb,
        )
          ? value.preferredLeafModelId
          : undefined,
      preferredSpineModelId:
        value.preferredSpineModelId &&
        platformProfiles.spineOptions.some(
          (option) => option.id === value.preferredSpineModelId && option.portSpeedGb === preset.nicSpeedGb,
        )
          ? value.preferredSpineModelId
          : undefined,
    });
  };

  const applyScope = (scope: ScopeValue) => {
    const nextStorageProfileId =
      scope === "compute-and-storage" ? normalizeStorageProfile(value.storageProfileId) : "none";
    const nextStorageProfile = storageProfileFor(nextStorageProfileId);
    onChange({
      ...value,
      storageNetworkPresent: scope === "compute-and-storage",
      storageProfileId: nextStorageProfileId,
      storageType: scope === "compute-and-storage" ? nextStorageProfile.storageType : "ethernet",
      storageComputePortsPerNode: scope === "compute-and-storage" ? value.storageComputePortsPerNode : 0,
      storagePortSpeedGb: scope === "compute-and-storage" ? value.storagePortSpeedGb : 200,
      storageServerCount: scope === "compute-and-storage" ? value.storageServerCount : 0,
      storagePortsPerServer: scope === "compute-and-storage" ? value.storagePortsPerServer : 0,
      checkpointBurstProfile: scope === "compute-and-storage" ? value.checkpointBurstProfile : "moderate",
    });
  };

  const applyStorageIntent = (intent: StorageIntentValue) => {
    const nextStorageProfileId = intent === "dedicated-roce" ? "high-priority-roce-parallel-fs" : "generic-shared-roce";
    const nextStorageProfile = storageProfileFor(nextStorageProfileId);

    onChange({
      ...value,
      storageNetworkPresent: true,
      storageProfileId: nextStorageProfileId,
      storageType: nextStorageProfile.storageType,
      storageComputePortsPerNode: nextStorageProfile.defaultComputePortsPerNode,
      storagePortSpeedGb: nextStorageProfile.defaultStoragePortSpeedGb,
      storageServerCount: nextStorageProfile.defaultStorageServerCount,
      storagePortsPerServer: nextStorageProfile.defaultStoragePortsPerServer,
      checkpointBurstProfile: nextStorageProfile.defaultCheckpointBurstProfile,
    });
  };

  const applyGpuPlatform = (platform: typeof gpuPlatformShortcuts[number]) => {
    onChange({
      ...value,
      nicSpeedGb: platform.nicSpeedGb,
      gpusPerServer: platform.gpusPerServer,
      gpuServerCount: deriveServerCount(value.gpuCount, platform.gpusPerServer),
      preferredLeafModelId:
        value.preferredLeafModelId &&
        platformProfiles.leafOptions.some(
          (option) => option.id === value.preferredLeafModelId && option.portSpeedGb === platform.nicSpeedGb,
        )
          ? value.preferredLeafModelId
          : undefined,
      preferredSpineModelId:
        value.preferredSpineModelId &&
        platformProfiles.spineOptions.some(
          (option) => option.id === value.preferredSpineModelId && option.portSpeedGb === platform.nicSpeedGb,
        )
          ? value.preferredSpineModelId
          : undefined,
    });
  };

  const activeGpuPlatformId = gpuPlatformShortcuts.find(
    (p) => p.nicSpeedGb === value.nicSpeedGb && p.gpusPerServer === value.gpusPerServer,
  )?.id;

  const activeStorageProfile = storageProfileFor(
    value.storageNetworkPresent ? normalizeStorageProfile(value.storageProfileId) : "none",
  );
  const storageIntent = deriveStorageIntent(activeStorageProfile.id);
  const dedicatedStorageSelected = value.storageNetworkPresent && activeStorageProfile.id === "high-priority-roce-parallel-fs";

  const applyProfile = (profileId: FabricProfileId) => {
    if (profileId === "custom") {
      onChange({ ...value });
      return;
    }

    const next = applyFabricProfile(value, profileId);
    onChange({
      ...next,
      preferredLeafModelId:
        next.preferredLeafModelId &&
        platformProfiles.leafOptions.some(
          (option) => option.id === next.preferredLeafModelId && option.portSpeedGb === next.nicSpeedGb,
        )
          ? next.preferredLeafModelId
          : undefined,
      preferredSpineModelId:
        next.preferredSpineModelId &&
        platformProfiles.spineOptions.some(
          (option) => option.id === next.preferredSpineModelId && option.portSpeedGb === next.nicSpeedGb,
        )
          ? next.preferredSpineModelId
          : undefined,
    });
  };

  return (
    <Card
      eyebrow={eyebrow}
      title={title}
      className="h-full"
      accent="sapphire"
      elevated
      actions={<p className="text-sm leading-6 text-muted">Intent-driven inputs for live AI fabric architecture review</p>}
    >
      <div className="space-y-6">
        <Section
          sectionKey="workload"
          title="Workload"
          detail="Choose the research posture and cluster size, then tune workload specifics only when the conversation needs it."
          open={openSections.workload}
          onToggle={() => setOpenSections((current) => ({ ...current, workload: !current.workload }))}
        >
          <div>
            <span className="mb-2 block text-sm font-medium text-muted">GPU platform shortcut</span>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {gpuPlatformShortcuts.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => applyGpuPlatform(platform)}
                  className={`choice-tile ${platform.id === activeGpuPlatformId ? "choice-tile--selected" : ""}`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Sets NIC speed and GPUs/server. Adjust facility parameters manually for B200 NVL72 deployments.</p>
          </div>

          <ChoiceGroup
            label="Research workload profile"
            value={value.researchWorkloadProfile}
            options={scenarioPresets.map((preset) => ({ value: preset.id, label: preset.name }))}
            columns="md:grid-cols-2"
            onChange={(next) => applyPreset(next as ResearchWorkloadProfile)}
          />
          <NumberField label="Current GPU count" value={value.gpuCount} onChange={updateNumber("gpuCount")} />
          <InlineHint>{profileGuidance[value.researchWorkloadProfile]}</InlineHint>

          <Disclosure label="Advanced workload tuning">
            <div className="space-y-4">
              <ChoiceGroup
                label="Application posture"
                value={value.workloadType}
                options={workloadOptions}
                columns="md:grid-cols-2"
                onChange={(next) => onChange({ ...value, workloadType: next as WorkloadType })}
              />
              <ChoiceGroup
                label="East-west traffic posture"
                value={value.eastWestTrafficIntensity}
                options={eastWestOptions}
                onChange={(next) => onChange({ ...value, eastWestTrafficIntensity: next as EastWestTrafficIntensity })}
              />
              <ChoiceGroup
                label="Collective communication pattern"
                value={value.collectivePattern}
                options={collectivePatternOptions}
                columns="md:grid-cols-2"
                onChange={(next) => onChange({ ...value, collectivePattern: next as CommunicationPattern })}
              />
              <ChoiceGroup
                label="Training communication intensity"
                value={value.trainingCommunicationIntensity}
                options={communicationIntensityOptions}
                onChange={(next) =>
                  onChange({ ...value, trainingCommunicationIntensity: next as TrainingCommunicationIntensity })
                }
              />
              <ChoiceGroup
                label="Gradient sync sensitivity"
                value={value.modelSynchronizationSensitivity}
                options={syncSensitivityOptions}
                onChange={(next) =>
                  onChange({ ...value, modelSynchronizationSensitivity: next as ModelSynchronizationSensitivity })
                }
              />
            </div>
          </Disclosure>
        </Section>

        <Section
          sectionKey="fabric"
          title="Fabric"
          detail="Select the directional fabric posture first, then open advanced override only when you need direct control."
          open={openSections.fabric}
          onToggle={() => setOpenSections((current) => ({ ...current, fabric: !current.fabric }))}
        >
          <ChoiceGroup
            label="Fabric profile"
            value={fabricProfileId}
            options={fabricProfileOptions.map((option) => ({ value: option.id, label: option.label }))}
            columns="md:grid-cols-2"
            onChange={(next) => applyProfile(next as FabricProfileId)}
          />
          <InlineHint>
            {(fabricProfileOptions.find((option) => option.id === fabricProfileId) ?? fabricProfileOptions[0]).description}
          </InlineHint>
          <ChoiceGroup
            label="Scope"
            value={deriveScope(value.storageNetworkPresent)}
            options={[
              { value: "compute-only", label: "Compute fabric only" },
              { value: "compute-and-storage", label: "Compute + storage fabric" },
            ]}
            columns="md:grid-cols-2"
            onChange={(next) => applyScope(next as ScopeValue)}
          />
          {value.storageNetworkPresent ? (
            <>
              <ChoiceGroup
                label="Storage fabric profile"
                value={storageIntent}
                options={storageProfileOptions}
                columns="md:grid-cols-2"
                onChange={(next) => applyStorageIntent(next as StorageIntentValue)}
              />
              <InlineHint>{activeStorageProfile.label}. Keep this directional unless the customer has validated storage-fabric policy and endpoint inventory.</InlineHint>

              {dedicatedStorageSelected ? (
                <div className="rounded-[20px] border border-border/80 bg-surface-2/80 p-4">
                  <p className="data-label">Modeled storage assumptions</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <CompactFact label="Storage protocol" value={`${activeStorageProfile.defaultStoragePortSpeedGb}GbE RoCEv2`} />
                    <CompactFact label="Compute attachment" value={`${value.gpuServerCount} compute nodes x ${(value.storageComputePortsPerNode ?? activeStorageProfile.defaultComputePortsPerNode) || 1} dedicated storage port`} />
                    <CompactFact label="Storage backend" value={`${value.storageServerCount ?? activeStorageProfile.defaultStorageServerCount} backend nodes`} />
                    <CompactFact label="Storage server ports" value={`${value.storagePortsPerServer ?? activeStorageProfile.defaultStoragePortsPerServer} x ${(value.storagePortSpeedGb ?? activeStorageProfile.defaultStoragePortSpeedGb)}G per server`} />
                    <CompactFact label="Throughput target" value={`>${activeStorageProfile.aggregateReadThroughputTbps / 8} TB/s read • >${activeStorageProfile.aggregateWriteThroughputTbps / 8} TB/s write`} />
                    <CompactFact label="Queueing validation" value={(activeStorageProfile.queueingControls ?? []).join(", ")} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <Disclosure label="Advanced fabric override">
            <div className="space-y-4">
              <SelectField
                label="NIC speed per server"
                value={String(value.nicSpeedGb)}
                onChange={(event) => {
                  const nextSpeed = Number(event.target.value) as 100 | 200 | 400 | 800;
                  onChange({
                    ...value,
                    nicSpeedGb: nextSpeed,
                    preferredLeafModelId:
                      value.preferredLeafModelId &&
                      platformProfiles.leafOptions.some(
                        (option) => option.id === value.preferredLeafModelId && option.portSpeedGb === nextSpeed,
                      )
                        ? value.preferredLeafModelId
                        : undefined,
                    preferredSpineModelId:
                      value.preferredSpineModelId &&
                      platformProfiles.spineOptions.some(
                        (option) => option.id === value.preferredSpineModelId && option.portSpeedGb === nextSpeed,
                      )
                        ? value.preferredSpineModelId
                        : undefined,
                  });
                }}
                options={["100", "200", "400", "800"]}
                suffix="G"
              />
              <ChoiceGroup
                label="Leaf profile"
                value={value.preferredLeafModelId ?? "auto"}
                options={[
                  { value: "auto", label: "Auto-select recommended" },
                  ...availableLeafOptions.map((option) => ({ value: option.id, label: option.name })),
                ]}
                columns="md:grid-cols-2"
                onChange={(next) =>
                  onChange({
                    ...value,
                    preferredLeafModelId: next === "auto" ? undefined : next,
                  })
                }
              />
              <ChoiceGroup
                label="Spine profile"
                value={value.preferredSpineModelId ?? "auto"}
                options={[
                  { value: "auto", label: "Auto-select recommended" },
                  ...availableSpineOptions.map((option) => ({ value: option.id, label: option.name })),
                ]}
                columns="md:grid-cols-2"
                onChange={(next) =>
                  onChange({
                    ...value,
                    preferredSpineModelId: next === "auto" ? undefined : next,
                  })
                }
              />
              <ChoiceGroup
                label="Target oversubscription"
                value={String(value.targetOversubscription)}
                options={oversubscriptionOptions.map((option) => ({ value: String(option.value), label: option.label }))}
                onChange={(next) => onChange({ ...value, targetOversubscription: Number(next) as TargetOversubscription })}
              />
              <ChoiceGroup
                label="Redundancy posture"
                value={value.redundancyPreference}
                options={redundancyOptions}
                onChange={(next) => onChange({ ...value, redundancyPreference: next as RedundancyPreference })}
              />
              <ChoiceGroup
                label="Operations simplicity bias"
                value={value.managementSimplicityPriority}
                options={simplicityOptions}
                onChange={(next) =>
                  onChange({ ...value, managementSimplicityPriority: next as ManagementSimplicityPriority })
                }
              />
              {dedicatedStorageSelected ? (
                <>
                  <ChoiceGroup
                    label="Checkpoint burst posture"
                    value={value.checkpointBurstProfile ?? activeStorageProfile.defaultCheckpointBurstProfile ?? "high"}
                    options={checkpointBurstOptions}
                    onChange={(next) =>
                      onChange({
                        ...value,
                        checkpointBurstProfile: next as NonNullable<ClusterInput["checkpointBurstProfile"]>,
                      })
                    }
                  />
                  <NumberField
                    label="Storage backend nodes"
                    value={value.storageServerCount ?? activeStorageProfile.defaultStorageServerCount}
                    onChange={(event) =>
                      onChange({
                        ...value,
                        storageServerCount: Number(event.target.value),
                      })
                    }
                  />
                </>
              ) : null}
            </div>
          </Disclosure>
        </Section>

        <Section
          sectionKey="physical"
          title="Physical"
          detail="Keep media posture and facility envelope user-facing. Intra-rack DAC and hall fit should both be explicit before the design is shared."
          open={openSections.physical}
          onToggle={() => setOpenSections((current) => ({ ...current, physical: !current.physical }))}
        >
          <ChoiceGroup
            label="Media preference"
            value={value.opticsPreference}
            options={opticsOptions}
            columns="md:grid-cols-2"
            onChange={(next) => onChange({ ...value, opticsPreference: next as OpticsPreference })}
          />
          <NumberField
            label="Representative inter-rack link distance (m)"
            value={value.representativeInterRackDistanceMeters}
            onChange={(event) =>
              onChange({
                ...value,
                representativeInterRackDistanceMeters: Number(event.target.value),
              })
            }
          />
          <InlineHint>
            Assume passive DAC for intra-rack server-to-leaf or adjacent in-rack links up to roughly 2 meters. Use this field only for inter-rack paths, where the planner should assume AOC or pluggable optics rather than passive copper.
          </InlineHint>
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField label="Allocated racks" value={value.allocatedRackCount} onChange={updateNumber("allocatedRackCount")} />
            <NumberField
              label="Rack power capacity (kW)"
              value={value.powerCapacityKwPerRack}
              onChange={updateNumber("powerCapacityKwPerRack")}
            />
            <NumberField
              label="Thermal node cap per rack"
              value={value.thermalNodeCapPerRack}
              onChange={updateNumber("thermalNodeCapPerRack")}
            />
          </div>
          <InlineHint>
            The current modeled facility envelope assumes {value.rackUnitsPerRack}U racks, {value.computeNodeRackUnits}U compute nodes, and {value.computeNodePowerKw} kW max draw per node. Physical density, thermal guidance, and per-rack power all feed the rack-fit result.
          </InlineHint>
        </Section>

        <Section
          sectionKey="expansion"
          title="Expansion"
          detail="Keep future growth explicit as reserved headroom rather than burying it inside the recommendation."
          open={openSections.expansion}
          onToggle={() => setOpenSections((current) => ({ ...current, expansion: !current.expansion }))}
        >
          <ChoiceGroup
            label="Planned expansion target"
            value={String(value.futureGrowthBufferPercent)}
            options={growthOptions.map((option) => ({ value: String(option.value), label: option.label }))}
            onChange={(next) => onChange({ ...value, futureGrowthBufferPercent: Number(next) as FutureGrowthBuffer })}
          />
        </Section>

        <section className="space-y-4 border-t border-border/75 pt-5">
          <div>
            <p className="data-label">Modeled assumptions</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              These inputs still drive the engine, but they are treated as workload or fabric assumptions rather than first-line controls.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CompactFact label="Profile" value={activePreset.name} />
            <CompactFact label="Estimated GPU servers" value={String(value.gpuServerCount)} />
            <CompactFact label="GPUs per server" value={String(value.gpusPerServer)} />
            <CompactFact label="Server NIC model" value={`${value.nicPortsPerServer} x ${value.nicSpeedGb}G`} />
            <CompactFact label="Inter-rack distance" value={`${value.representativeInterRackDistanceMeters} m`} />
            <CompactFact label="Allocated racks" value={String(value.allocatedRackCount)} />
            <CompactFact label="Rack power" value={`${value.powerCapacityKwPerRack} kW/rack`} />
            <CompactFact label="Rack form factor" value={`${value.rackUnitsPerRack}U racks • ${value.computeNodeRackUnits}U/node`} />
            <CompactFact label="Node power draw" value={`${value.computeNodePowerKw} kW max/node`} />
            <CompactFact label="Thermal guidance" value={`${value.thermalNodeCapPerRack} nodes/rack`} />
            <CompactFact label="Storage profile" value={value.storageNetworkPresent ? activeStorageProfile.label : "No storage fabric"} />
            <CompactFact
              label="Leaf profile"
              value={
                value.preferredLeafModelId
                  ? availableLeafOptions.find((option) => option.id === value.preferredLeafModelId)?.name ?? "Custom leaf"
                  : "Auto-select recommended"
              }
            />
            <CompactFact
              label="Spine profile"
              value={
                value.preferredSpineModelId
                  ? availableSpineOptions.find((option) => option.id === value.preferredSpineModelId)?.name ?? "Custom spine"
                  : "Auto-select recommended"
              }
            />
            <CompactFact label="Workload posture" value={value.workloadType} />
            <CompactFact label="Traffic posture" value={value.eastWestTrafficIntensity} />
            <CompactFact label="Collective pattern" value={value.collectivePattern} />
            <CompactFact label="Gradient sync sensitivity" value={value.modelSynchronizationSensitivity} />
            <CompactFact label="Cluster scale class" value={value.clusterScaleClass as ClusterScaleClass} />
            <CompactFact label="Fabric profile" value={fabricProfileOptions.find((option) => option.id === fabricProfileId)?.label ?? "Custom fabric override"} />
            {dedicatedStorageSelected ? (
              <>
                <CompactFact label="Storage path" value={`${value.storagePortSpeedGb ?? activeStorageProfile.defaultStoragePortSpeedGb}G dedicated RoCEv2`} />
                <CompactFact label="Checkpoint posture" value={value.checkpointBurstProfile ?? activeStorageProfile.defaultCheckpointBurstProfile ?? "high"} />
              </>
            ) : null}
          </div>
          <InlineHint>
            If these assumptions are wrong for the customer, use the advanced workload or fabric override controls rather than forcing the default form to expose every low-level knob all the time.
          </InlineHint>
        </section>

        <div className="card-subtle sticky bottom-0 z-[1] border border-border/90 bg-surface/95 p-4 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2">
            <CompactFact label="Profile" value={activePreset.name} />
            <CompactFact label="Fabric" value={`${value.nicSpeedGb}G @ ${value.targetOversubscription}:1`} />
            <CompactFact label="Scope" value={value.storageNetworkPresent ? "Compute + storage" : "Compute only"} />
            <CompactFact label="Storage" value={value.storageNetworkPresent ? activeStorageProfile.label : "None"} />
            <CompactFact label="Inter-rack" value={`${value.representativeInterRackDistanceMeters}m`} />
            <CompactFact label="Growth" value={`${value.futureGrowthBufferPercent}% reserved`} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Section({
  sectionKey,
  title,
  detail,
  open,
  onToggle,
  children,
}: {
  sectionKey: string;
  title: string;
  detail: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border/75 pt-5 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 text-left"
        aria-expanded={open}
        aria-controls={`section-${sectionKey}`}
      >
        <div>
          <p className="data-label">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
        </div>
        <span className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div id={`section-${sectionKey}`} className="space-y-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function InlineHint({ children }: { children: ReactNode }) {
  return (
    <Disclosure label="Why this matters">
      <div className="text-sm leading-6 text-muted">{children}</div>
    </Disclosure>
  );
}

function CompactFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="data-label">{label}</p>
      <p className="mt-2 text-sm text-ink">{value}</p>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <input type="number" min={0} className="input-field" value={value} onChange={onChange} />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  suffix?: string;
};

function SelectField({ label, value, onChange, options, suffix }: SelectFieldProps) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <select className="input-field" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {suffix ? `${option}${suffix}` : option}
          </option>
        ))}
      </select>
    </label>
  );
}

type ChoiceGroupProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
  columns?: string;
};

function ChoiceGroup({ label, value, options, onChange, disabled = false, columns = "md:grid-cols-3" }: ChoiceGroupProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-muted">{label}</span>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`choice-tile ${
              disabled ? "choice-tile--disabled" : option.value === value ? "choice-tile--selected" : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
