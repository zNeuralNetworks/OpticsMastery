import type { DesignInputs } from "@/features/cluster-designer/types";

export const workloadHeadroomFactors: Record<DesignInputs["workloadType"], number> = {
  training: 1.15,
  inference: 0.9,
  mixed: 1,
  hpc: 1.2,
};

export const workloadNarrativeBias: Record<DesignInputs["workloadType"], string> = {
  training: "Collective communication and checkpoint behavior should stay visible in the fabric discussion.",
  inference: "Operational simplicity can matter more than fully minimizing east-west contention.",
  mixed: "The design should absorb both synchronized training windows and more elastic inference behavior.",
  hpc: "Predictable east-west behavior and congestion visibility usually matter more than aggressive oversubscription savings.",
};
