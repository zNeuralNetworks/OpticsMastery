import type {
  DesignInputs,
  DiscoveryQuestionGroup,
  TrainingCommunicationAssessment,
} from "@/features/cluster-designer/types";

export function generateDiscoveryQuestions(
  inputs: DesignInputs,
  trainingCommunication: TrainingCommunicationAssessment,
): DiscoveryQuestionGroup[] {
  const researchProfileQuestions: Record<DesignInputs["researchWorkloadProfile"], DiscoveryQuestionGroup> = {
    genomics: {
      category: "Genomics workflow",
      questions: [
        "Which pipeline stages are most bandwidth-sensitive: ingest, alignment, feature generation, or model training?",
        "Are large reference datasets or intermediate result sets reused across many jobs at the same time?",
      ],
    },
    imaging: {
      category: "Imaging workflow",
      questions: [
        "How large are the imaging datasets per study, and are they streamed continuously or staged in batches?",
        "Do image preprocessing and model training run on the same GPU fabric or in separate operational domains?",
      ],
    },
    "drug-discovery": {
      category: "Drug discovery workflow",
      questions: [
        "Are the primary jobs model-training heavy, simulation-assisted, or a mix of training and data preparation?",
        "How often do teams expect synchronized checkpointing or shared model-state movement across the cluster?",
      ],
    },
    "multimodal-research": {
      category: "Multi-modal research workflow",
      questions: [
        "Which data domains share the fabric at the same time, and where do you expect the largest cross-domain data movement?",
        "Do training runs span most of the cluster, or are workloads isolated by team, project, or pod?",
      ],
    },
    "clinical-inference": {
      category: "Clinical / inference serving workflow",
      questions: [
        "Is the priority latency consistency, throughput scale, or coexistence with adjacent analytics and training jobs?",
        "Will the serving environment reload models or reference data often enough to create burst traffic on the shared fabric?",
      ],
    },
    simulation: {
      category: "Simulation / HPC workflow",
      questions: [
        "How sensitive are the applications to jitter, congestion visibility, and synchronized east-west communication phases?",
        "Will the simulation jobs share infrastructure with AI training jobs, or do they need cleaner isolation domains?",
      ],
    },
    "large-inference": {
      category: "Large-scale inference serving workflow",
      questions: [
        "Is serving latency consistency or aggregate throughput the more important success metric for the inference environment?",
        "Are model weights loaded from shared storage on each serving request, or kept resident in GPU memory across requests?",
        "How many concurrent model versions or tenants need to share the same GPU pool, and what is the expected burst pattern during high-demand windows?",
      ],
    },
  };

  const groups: DiscoveryQuestionGroup[] = [
    researchProfileQuestions[inputs.researchWorkloadProfile],
    {
      category: "Dataset",
      questions: [
        "How large are the active datasets and how quickly do they need to be read into the training or inference pipeline?",
      ],
    },
    {
      category: "Compute",
      questions: [
        "Are the GPUs primarily used for training, inference, or a shared mixed-use environment?",
        "What GPU platform and server form factor are planned for the first deployment stage, and what is the NIC model and per-server NIC speed?",
        "How many GPUs will typically participate in a single training job, and what fraction of the cluster does that represent?",
      ],
    },
    {
      category: "Traffic",
      questions: [
        "Are large east-west collective operations expected during normal operation, or mostly during specific training windows?",
      ],
    },
    {
      category: "Fabric direction",
      questions: [
        "Is the customer evaluating or already committed to an Ethernet AI fabric, or is InfiniBand still part of the conversation?",
        "What observability and telemetry tools are currently in place for the GPU or networking infrastructure, and is streaming telemetry to a management platform already planned?",
      ],
    },
  ];

  if (inputs.storageNetworkPresent) {
    groups.push({
      category: "Storage",
      questions:
        inputs.storageProfileId === "high-priority-roce-parallel-fs"
          ? [
              "Will all compute nodes really keep one dedicated 400G storage port, or is that an aspirational requirement that still needs to be negotiated?",
              "Does the storage platform remain operationally isolated from the GPU collective fabric, including change control and troubleshooting ownership?",
              "What checkpoint interval, checkpoint size, and concurrent job count should the dedicated storage fabric tolerate during peak training windows?",
            ]
          : [
              "Does the storage platform share the same fabric as the GPUs, or is it isolated operationally?",
              "Is the storage platform RDMA-capable or expected to use a simpler Ethernet/NAS interaction model?",
            ],
    });
  }

  if (inputs.workloadType === "training") {
    groups.push({
      category: "Training behavior",
      questions: [
        "How frequently are training checkpoints written, and how large are those checkpoints?",
        "Are large gradient exchanges or collective synchronization phases expected to dominate the runtime profile?",
        "Are distributed training jobs expected to run concurrently, or is the cluster usually dedicated to one major training run at a time?",
      ],
    });
  }

  if (inputs.workloadType === "inference") {
    groups.push({
      category: "Inference behavior",
      questions: [
        "Will inference workloads share the same fabric as training or batch analytics workloads?",
        "Is throughput scaling or latency consistency the more important success metric for the serving environment?",
      ],
    });
  }

  if (inputs.targetOversubscription > 2) {
    groups.push({
      category: "Burst behavior",
      questions: [
        "Are there burst periods where many nodes synchronize, checkpoint, or reload data at the same time?",
        "If the fabric is more oversubscribed, which workloads are expected to be tolerant of that contention?",
      ],
    });
  }

  if (inputs.eastWestTrafficIntensity === "high") {
    groups.push({
      category: "Collective traffic",
      questions: [
        "Do you expect large collective communication patterns across most GPUs, or more isolated job placement by rack or pod?",
        "If collectives dominate runtime, what telemetry or performance visibility is already in place to prove where congestion shows up?",
      ],
    });
  }

  if (trainingCommunication.communicationPressureRating === "high" || trainingCommunication.communicationPressureRating === "severe") {
    groups.push({
      category: "Training communication",
      questions: [
        "How often will gradients, optimizer state, or checkpoints cross the fabric during normal training operation?",
        "Is model training latency sensitivity understood well enough to know when fabric contention becomes material?",
        inputs.storageProfileId === "high-priority-roce-parallel-fs"
          ? "If storage remains on a dedicated fabric, what queueing and throughput evidence is available to show checkpoint bursts stay isolated from collective GPU traffic?"
          : "Will storage traffic share the same network paths as collective GPU communication during training windows?",
      ],
    });
  }

  if (inputs.collectivePattern === "nccl-framework-managed") {
    groups.push({
      category: "NCCL and framework configuration",
      questions: [
        "Has NCCL topology file configuration been done, or is NCCL running with auto-detected topology hints from the OS?",
        "Is the workload using NCCL SHARP or hierarchical AllReduce for large GPU counts, and has that been validated against the planned fabric topology?",
        "What NCCL version and tuning flags are in use — has the team confirmed NCCL_IB_GID_INDEX, NCCL_NET, or similar environment variables are set for Ethernet-based RoCEv2?",
      ],
    });
  }

  if (inputs.managementSimplicityPriority === "high") {
    groups.push({
      category: "Operations",
      questions: [
        "What level of network automation and operational repeatability is expected from day one?",
        "Does the operations team want a simpler shared Ethernet fabric, or are they prepared to take on more specialized RoCE validation work early?",
      ],
    });
  }

  return groups;
}
