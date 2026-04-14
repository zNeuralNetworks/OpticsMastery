import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import { getOversubscriptionResult } from "@/features/cluster-designer/lib/designSelectors";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type OversubscriptionViewProps = {
  design: DesignEngineResult;
  onTargetChange?: (target: 1 | 2 | 3) => void;
};

export function OversubscriptionView({ design, onTargetChange }: OversubscriptionViewProps) {
  const { showConversationLayer } = useConversationLayer();
  const reduceMotion = useReducedMotion();
  const oversubscriptionResult = getOversubscriptionResult(design);
  const target = design.derivedCapacity.targetOversubscriptionRatio;
  const actual = design.derivedCapacity.actualOversubscriptionRatio;
  const variance = Number((actual - target).toFixed(2));
  const posture =
    actual <= 1.2 ? "Near nonblocking posture" : actual <= 2 ? "Moderate oversubscription posture" : "Aggressive oversubscription posture";
  const ratioPercent = Math.min(100, (actual / 3) * 100);
  const targetPercent = Math.min(100, (target / 3) * 100);

  return (
    <Card eyebrow="4. Oversubscription Analysis" title="Target versus modeled result" accent="sapphire">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <div className="card-subtle p-5">
          <div className="flex items-center gap-2">
            <p className="data-label">Oversubscription result</p>
            <InfoTooltip label="Oversubscription">
              Lower oversubscription preserves more east-west fabric headroom. Training and HPC usually expose oversubscription more quickly than ordinary enterprise traffic.
            </InfoTooltip>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <p className="technical-value text-[42px] font-semibold tracking-[-0.04em]">
              {oversubscriptionResult.actual}
            </p>
            <p className="pb-2 text-sm text-muted">actual</p>
          </div>
          <div className="mt-4">
            <div className="metric-bar">
              <motion.div
                className="metric-bar-fill bg-sapphire/80"
                initial={{ width: 0 }}
                animate={{ width: `${ratioPercent}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
              />
              <div
                className="absolute inset-y-[-2px] w-[2px] rounded-full bg-ink/90"
                style={{ left: `${targetPercent}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip tone="sapphire">Target {oversubscriptionResult.target}</Chip>
              <Chip tone={variance > 0 ? "ember" : "emerald"}>
                Variance {variance >= 0 ? "+" : ""}
                {variance}:1
              </Chip>
              <Chip>{posture}</Chip>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card-subtle p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="data-label">Live target control</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((option) => (
                  <Chip
                    key={option}
                    active={target === option}
                    tone={target === option ? "sapphire" : "default"}
                    onClick={onTargetChange ? () => onTargetChange(option as 1 | 2 | 3) : undefined}
                  >
                    {option}:1
                  </Chip>
                ))}
              </div>
            </div>
            {onTargetChange ? (
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={target}
                  onChange={(event) => onTargetChange(Number(event.target.value) as 1 | 2 | 3)}
                  className="w-full accent-[var(--color-sapphire)]"
                  aria-label="Oversubscription target"
                />
              </div>
            ) : null}
            <p className="mt-3 text-sm leading-6 text-muted">{oversubscriptionResult.note}</p>
          </div>
          <Disclosure label="Why this matters">
            <p>
              The engine starts from growth-adjusted downlink demand, then sizes northbound capacity against the selected target.
              Variance appears after workload, east-west, redundancy, and storage headroom are applied.
            </p>
          </Disclosure>
        </div>
      </div>

      <ConversationHelper show={showConversationLayer}>
        {`If the customer asks why 1:1 versus 3:1 matters, the answer is that lower oversubscription gives a RoCE-based AI fabric more predictable east-west behavior for training and HPC. Higher oversubscription lowers hardware count, but it also raises the chance that collective traffic and checkpoint movement start competing for the same fabric capacity.`}
      </ConversationHelper>
    </Card>
  );
}
