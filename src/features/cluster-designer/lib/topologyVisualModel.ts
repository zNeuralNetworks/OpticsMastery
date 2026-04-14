import type {
  AiFabricDiagramBlock,
  AiFabricDiagramLink,
  DesignEngineResult,
  DiagramBoundaryTag,
  OversubscriptionGuidance,
  PressureLevel,
  TopologyVisualAnnotation,
  TopologyVisualModel,
} from "@/features/cluster-designer/types";

const pressureScore: Record<PressureLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
};

const oversubscriptionCeilingScore: Record<OversubscriptionGuidance, number> = {
  "1:1": 1,
  "1.5:1": 2,
  "2:1": 3,
  ">2:1 acceptable only with caution": 4,
};

export function buildTopologyVisualModel(design: DesignEngineResult): TopologyVisualModel {
  const layoutMode: TopologyVisualModel["layoutMode"] = design.inputs.storageNetworkPresent ? "full-stack" : "compute-only";
  const boundaryTags: DiagramBoundaryTag[] = ["modeled", "representative", "assumption-driven"];
  const dedicatedStorage = design.derivedCapacity.storageFabric.dedicated;
  const computeGroupCount = clamp(Math.ceil(design.inputs.gpuServerCount / 12), 2, 4);
  const beLeafGroupCount = clamp(Math.ceil(design.topologyRecommendation.leafSwitchCountEstimate / 3), 2, 4);
  const feAccessCount = layoutMode === "full-stack" ? clamp(Math.ceil(computeGroupCount / 2), 1, 2) : 0;
  const storageAccessCount = dedicatedStorage
    ? clamp(Math.ceil(design.derivedCapacity.storageFabric.storageLeafCountEstimate / 2), 1, 2)
    : 0;

  const computeBlocks: AiFabricDiagramBlock[] = Array.from({ length: computeGroupCount }, (_, index) => ({
    id: `gpu-rack-group-${index + 1}`,
    type: "gpu-rack-group" as const,
    label: `GPU Rack Group ${index + 1}`,
    shortLabel: `GPU Rack ${index + 1}`,
    compactDetail: `${Math.ceil(design.inputs.gpuServerCount / computeGroupCount)} servers • ${Math.ceil(design.inputs.gpuCount / computeGroupCount)} GPUs`,
    description: `Representative shared compute block ${index + 1}. Counts are compressed from ${design.inputs.gpuServerCount} GPU servers and ${design.inputs.gpuCount} GPUs in the current model.`,
    visibility: ["compute-only", "full-stack"],
  }));

  const frontEndBlocks: AiFabricDiagramBlock[] =
    layoutMode === "full-stack"
      ? [
          {
            id: "fe-spine",
            type: "fe-spine",
            label: "Front-End Core",
            shortLabel: "FE Core",
            compactDetail: dedicatedStorage
              ? `${design.derivedCapacity.storageFabric.storagePortSpeedGb}G storage and service aggregation`
              : `${design.inputs.nicSpeedGb}G service and ingress aggregation`,
            description: "Representative front-end aggregation tier for services, ingress, and storage access. It is intentionally separate from the back-end collective fabric.",
            visibility: ["full-stack"],
          },
          ...Array.from({ length: feAccessCount }, (_, index) => ({
            id: `fe-access-${index + 1}`,
            type: "fe-leaf" as const,
            label: `Front-End Access ${index + 1}`,
            shortLabel: `FE Access ${index + 1}`,
            compactDetail: dedicatedStorage ? "north-south and shared services" : "north-south services",
            description: "Compressed front-end access block connecting services and storage-facing access toward the shared compute estate.",
            visibility: ["full-stack"] as const,
          })),
          ...(dedicatedStorage
            ? Array.from({ length: storageAccessCount }, (_, index) => ({
                id: `storage-access-${index + 1}`,
                type: "fe-leaf" as const,
                label: `Storage Fabric Access ${index + 1}`,
                shortLabel: `Storage Access ${index + 1}`,
                compactDetail: `${design.derivedCapacity.storageFabric.storagePortSpeedGb}G dedicated storage path`,
                description: "Representative storage-fabric access block carrying the dedicated compute-to-storage path.",
                visibility: ["full-stack"] as const,
              }))
            : []),
        ]
      : [];

  const storageBlocks: AiFabricDiagramBlock[] =
    layoutMode === "full-stack"
      ? [
          {
            id: "service-domain",
            type: "service-domain",
            label: "Service Domain",
            shortLabel: "Services",
            compactDetail: "ingress, management, and shared services",
            description: "Representative north-south services and management adjacency kept outside the back-end fabric explanation.",
            visibility: ["full-stack"],
          },
          {
            id: "storage-domain",
            type: "storage-domain",
            label: dedicatedStorage ? "Storage Fabric" : `${labelStorage(design.inputs.storageType)} Storage`,
            shortLabel: dedicatedStorage ? "Storage Fabric" : "Shared Storage",
            compactDetail: dedicatedStorage
              ? `${design.derivedCapacity.storageFabric.storageServerCount} storage nodes • ${design.derivedCapacity.storageFabric.storageFacingPortRequirement} ports`
              : `${design.derivedCapacity.estimatedStorageFacingLeafPorts} modeled storage-facing ports`,
            description: dedicatedStorage
              ? "Dedicated front-end storage domain showing the separate storage-fabric path for checkpoint and dataset movement."
              : "Shared storage domain shown on the front-end side so storage traffic is not confused with the GPU collective fabric.",
            visibility: ["full-stack"],
          },
        ]
      : [];

  const backEndBlocks: AiFabricDiagramBlock[] = [
    {
      id: "be-spine",
      type: "be-spine",
      label: "Back-End Spine Tier",
      shortLabel: "BE Spine Tier",
      compactDetail: `${design.topologyRecommendation.spineSwitchCountEstimate} modeled spines • ${design.topologyRecommendation.recommendedSpine.portSpeedGb}G`,
      description: `Modeled back-end spine tier using ${design.topologyRecommendation.recommendedSpine.name}. This carries the GPU collective east-west traffic posture.`,
      visibility: ["compute-only", "full-stack"],
    },
    ...Array.from({ length: beLeafGroupCount }, (_, index) => ({
      id: `be-rail-${index + 1}`,
      type: "be-leaf" as const,
      label: `Back-End Rail Group ${index + 1}`,
      shortLabel: `BE Rail ${index + 1}`,
      compactDetail: `${design.derivedCapacity.uplinksPerLeaf} uplinks • ${design.derivedCapacity.estimatedDownlinkCapacityPerLeaf} downlinks`,
      description: "Representative back-end rail group feeding the GPU collective fabric. Rails remain compressed unless the engine models exact rail topology.",
      visibility: ["compute-only", "full-stack"] as const,
    })),
  ];

  const representativeLinks: AiFabricDiagramLink[] = [
    ...(layoutMode === "full-stack"
      ? [
          makeLink({
            from: "service-domain",
            to: "fe-spine",
            semantic: "representative",
            description: "Representative service and ingress attachment into the front-end fabric.",
          }),
          makeLink({
            from: "storage-domain",
            to: dedicatedStorage ? "storage-access-1" : "fe-spine",
            semantic: dedicatedStorage ? "modeled" : "assumption-driven",
            description: dedicatedStorage
              ? "Modeled dedicated storage-domain attachment into the front-end storage fabric."
              : "Assumption-driven shared-storage path shown on the front-end side.",
          }),
          ...frontEndBlocks
            .filter((block) => block.id.startsWith("fe-access-"))
            .map((block) =>
              makeLink({
                from: "fe-spine",
                to: block.id,
                semantic: "representative",
                description: "Bundled front-end core-to-access path.",
              }),
            ),
          ...(dedicatedStorage
            ? frontEndBlocks
                .filter((block) => block.id.startsWith("storage-access-"))
                .flatMap((block) => [
                  makeLink({
                    from: "fe-spine",
                    to: block.id,
                    semantic: "representative",
                    description: "Bundled front-end storage-core path.",
                  }),
                  makeLink({
                    from: block.id,
                    to: "storage-domain",
                    semantic: "modeled",
                    description: "Dedicated storage access path toward the storage backend domain.",
                  }),
                ])
            : []),
          ...computeBlocks.flatMap((block, index) => {
            const target = frontEndBlocks.filter((item) => item.id.startsWith("fe-access-"))[index % Math.max(feAccessCount, 1)];
            return target
              ? [
                  makeLink({
                    from: target.id,
                    to: block.id,
                    semantic: "modeled",
                    description: "Front-end access attachment from services and storage-facing adjacency into the shared compute estate.",
                  }),
                ]
              : [];
          }),
          ...(dedicatedStorage
            ? computeBlocks.flatMap((block, index) => {
                const target =
                  frontEndBlocks.filter((item) => item.id.startsWith("storage-access-"))[
                    index % Math.max(storageAccessCount, 1)
                  ];
                return target
                  ? [
                      makeLink({
                        from: block.id,
                        to: target.id,
                        semantic: "modeled",
                        description: "Dedicated compute-to-storage path kept separate from the back-end collective fabric.",
                      }),
                    ]
                  : [];
              })
            : []),
        ]
      : []),
    ...computeBlocks.flatMap((block, index) => {
      const target = backEndBlocks.filter((item) => item.id.startsWith("be-rail-"))[index % beLeafGroupCount];
      return target
        ? [
            makeLink({
              from: block.id,
              to: target.id,
              semantic: "modeled",
              description: "Modeled GPU rack attachment into the back-end rail layer.",
            }),
          ]
        : [];
    }),
    ...backEndBlocks
      .filter((block) => block.id.startsWith("be-rail-"))
      .map((block) =>
        makeLink({
          from: block.id,
          to: "be-spine",
          semantic: "representative",
          description: "Representative bundled rail-to-spine path for the GPU collective fabric.",
        }),
      ),
  ];

  return {
    layoutMode,
    boundaryTags,
    representativeNote:
      "Counts come from the current model. Geometry and bundled links are representative so the topology stays readable in live architecture conversations.",
    frontEndTitle: "Front-End Fabric",
    frontEndSubtitle: "Services, storage, ingress/egress",
    backEndTitle: "Back-End Fabric",
    backEndSubtitle: "GPU collective / east-west training fabric",
    frontEndBlocks,
    backEndBlocks,
    storageBlocks,
    computeBlocks,
    representativeLinks,
    countLabels: [
      `${design.inputs.gpuCount} GPUs • ${design.inputs.gpuServerCount} GPU servers`,
      `${design.topologyRecommendation.leafSwitchCountEstimate} BE leafs • ${design.topologyRecommendation.spineSwitchCountEstimate} BE spines`,
      ...(layoutMode === "full-stack"
        ? [
            dedicatedStorage
              ? `${design.derivedCapacity.storageFabric.storageServerCount} storage nodes on a dedicated FE storage fabric`
              : "Shared storage remains on the FE side of the architecture view",
          ]
        : []),
    ],
    callouts: buildCallouts(design, layoutMode),
    legend: [
      ...(layoutMode === "full-stack"
        ? [
            { label: "FE core", tone: "fe-core" as const },
            { label: "FE access", tone: "fe-access" as const },
            { label: "Storage / services", tone: "storage-domain" as const },
          ]
        : []),
      { label: "GPU rack group", tone: "gpu-rack" as const },
      { label: "BE rail", tone: "be-leaf" as const },
      { label: "BE spine tier", tone: "be-spine" as const },
      { label: "Modeled attachment", tone: "modeled-link" as const },
      { label: "Representative bundled path", tone: "representative-link" as const },
      { label: "Assumption-driven path", tone: "assumption-link" as const },
    ],
  };
}

export function getPressureComparison(design: DesignEngineResult) {
  const actualScore = pressureScore[design.trainingCommunication.communicationPressureRating];
  const guidanceScore = oversubscriptionCeilingScore[design.trainingCommunication.recommendedOversubscriptionCeiling];

  return {
    actualLabel: design.trainingCommunication.communicationPressureRating,
    targetLabel: design.trainingCommunication.recommendedOversubscriptionCeiling,
    actualValue: actualScore,
    targetValue: guidanceScore,
    note:
      actualScore <= guidanceScore
        ? "Current communication pressure still aligns with the recommended ceiling posture."
        : "Communication pressure is more severe than the current ceiling guidance would ideally tolerate.",
  };
}

function buildCallouts(
  design: DesignEngineResult,
  layoutMode: TopologyVisualModel["layoutMode"],
): TopologyVisualAnnotation[] {
  const callouts: TopologyVisualAnnotation[] = [
    {
      title: layoutMode === "full-stack" ? "Why FE is separate" : "Why the view is BE-first",
      body:
        layoutMode === "full-stack"
          ? design.derivedCapacity.storageFabric.dedicated
            ? `The front-end band isolates the dedicated ${design.derivedCapacity.storageFabric.storagePortSpeedGb}G storage fabric and service adjacency so checkpoint and dataset movement do not clutter the back-end collective explanation.`
            : "The front-end band isolates service and storage adjacency so the back-end section can stay focused on GPU collective traffic."
          : "Compute-only mode removes the heavier FE storage story and keeps the diagram focused on GPU rack attachment, rail groups, and the shared back-end spine pool.",
    },
    {
      title: "Why BE is sized this way",
      body: `${design.topologyRecommendation.spineSwitchCountEstimate} modeled spines and ${design.topologyRecommendation.leafSwitchCountEstimate} modeled BE leafs are driven by ${design.derivedCapacity.estimatedSpineFacingUplinkRequirement} uplinks and a ${design.derivedCapacity.actualOversubscriptionRatio}:1 modeled oversubscription result.`,
    },
  ];

  if (design.derivedCapacity.storageFabric.dedicated) {
    callouts.push({
      title: "Where storage sits",
      body: `Storage leaf/spine counts are derived from ${design.derivedCapacity.storageFabric.computeNodeCount} compute nodes plus ${design.derivedCapacity.storageFabric.storageServerCount} storage nodes at ${design.derivedCapacity.storageFabric.storagePortSpeedGb}G, so the dedicated FE storage fabric stays distinct from the BE collective network.`,
    });
  } else {
    callouts.push({
      title: "Main pressure focus",
      body:
        design.trainingCommunication.communicationPressureRating === "high" ||
        design.trainingCommunication.communicationPressureRating === "severe"
          ? `${design.inputs.collectivePattern} plus ${design.inputs.clusterScaleClass} scale keep the main pressure on the back-end east-west fabric.`
          : `${design.risks[0]?.title ?? "No major modeled blocker"} remains the leading follow-on validation item for the current design posture.`,
    });
  }

  return callouts.slice(0, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeLink(link: AiFabricDiagramLink): AiFabricDiagramLink {
  return link;
}

function labelStorage(storageType: DesignEngineResult["inputs"]["storageType"]) {
  return {
    ethernet: "Ethernet",
    roce: "RoCE",
    "nas-like": "NAS-like",
  }[storageType];
}
