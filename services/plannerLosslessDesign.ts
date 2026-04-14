import { PlannerLosslessDesign, PlannerModel } from '../features/ai-planner/types';

type PlannerBaseModel = Omit<PlannerModel, 'view'>;

export const buildLosslessDesign = (model: PlannerBaseModel): PlannerLosslessDesign => {
  const workloadLabel = model.inputs.collectiveTrafficProfile === 'ALLREDUCE_HEAVY'
    ? 'AllReduce-heavy training traffic'
    : 'AI training traffic';

  return {
    classificationModel: `${workloadLabel} should use a strict traffic-class model: CNP/control in a highest-priority class, routing control separate from RoCE data, and lossless treatment only for the RoCE data class rather than for best-effort traffic.`,
    pfcStrategy: 'Apply PFC only to the no-drop RoCE data priority. Do not enable PFC on best-effort classes. This planner should state that per-priority pause is scoped to the lossless queue only.',
    ecnStrategy: 'Use early ECN marking as the primary congestion signal and present thresholds as directional starting points tied to queue/buffer allocation, not as final production values. Start conservative for synchronized bursts and validate with queue counters and host response.',
    dcqcnStrategy: 'Describe DCQCN as the NIC-driven feedback loop: switch acts as congestion point, receiver NIC generates CNP, sender NIC reduces rate. The planner should require host-side validation rather than implying switch-only control is sufficient.',
    deadlockAvoidance: 'PFC watchdog is required on lossless ports, with deadlock handling explicitly documented as part of the design. The planner should call out deadlock avoidance as mandatory, not optional.',
    validationChecklist: [
      'Validate DSCP / queue classification for CNP, routing control, and RoCE data.',
      'Confirm PFC is enabled only on the no-drop RoCE data queue.',
      'Confirm ECN marks are visible at the intended queue under representative load.',
      'Validate host NIC congestion response and DCQCN behavior alongside switch-side counters.',
      'Confirm PFC watchdog posture and deadlock recovery handling before production.',
    ],
  };
};
