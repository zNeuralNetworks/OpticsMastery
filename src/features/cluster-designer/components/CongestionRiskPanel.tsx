import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type CongestionRiskPanelProps = {
  design: DesignEngineResult;
};

const levelClasses = {
  low: "border-success/50 bg-success/10",
  moderate: "border-accent/40 bg-accent/10",
  high: "border-warning/50 bg-warning/10",
  severe: "border-warning bg-warning/20",
} as const;

export function CongestionRiskPanel({ design }: CongestionRiskPanelProps) {
  const { showConversationLayer } = useConversationLayer();
  const reduceMotion = useReducedMotion();
  const risk = design.congestionRisk;
  const [activeDriver, setActiveDriver] = useState<string | null>(risk.primaryDrivers[0] ?? null);
  const severityScale = { low: 25, moderate: 50, high: 75, severe: 100 }[risk.level];
  const activeDriverDetail = useMemo(
    () => risk.primaryDrivers.find((driver) => driver === activeDriver) ?? risk.primaryDrivers[0] ?? "",
    [activeDriver, risk.primaryDrivers],
  );

  return (
    <Card eyebrow="5. Congestion Risk" title="Congestion risk assessment" accent="ember" elevated>
      <motion.div
        className={`rounded-[20px] border p-5 ${levelClasses[risk.level]}`}
        animate={{ borderColor: "rgba(239,68,68,0.42)" }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
      >
        <div className="flex items-center gap-2">
          <p className="data-label">Risk rating</p>
          <InfoTooltip label="Congestion risk">
            This is an architecture-level severity view. It combines oversubscription, east-west posture, storage sharing, and training communication pressure.
          </InfoTooltip>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <p className="text-[34px] font-semibold capitalize tracking-[-0.03em] text-ink">{risk.level}</p>
          <p className="pb-2 text-sm text-muted">risk</p>
        </div>
        <div className="mt-4 metric-bar">
          <motion.div
            className="metric-bar-fill bg-ember/85"
            initial={{ width: 0 }}
            animate={{ width: `${severityScale}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{risk.summary}</p>
      </motion.div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-line/70 p-4">
          <p className="data-label">Primary drivers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {risk.primaryDrivers.map((driver) => (
              <Chip
                key={driver}
                tone="ember"
                active={activeDriverDetail === driver}
                onClick={() => setActiveDriver(driver)}
              >
                {driverLabel(driver)}
              </Chip>
            ))}
          </div>
          {activeDriverDetail ? (
            <motion.div
              key={activeDriverDetail}
              className="mt-3 rounded-[16px] border border-border/80 bg-space/35 p-3 text-sm leading-6 text-muted"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              {activeDriverDetail}
            </motion.div>
          ) : null}
        </div>
        <div className="rounded-[20px] border border-line/70 p-4">
          <p className="data-label">Recommended mitigation</p>
          <p className="mt-3 text-sm leading-6 text-muted">{risk.recommendedMitigation}</p>
        </div>
      </div>

      <Disclosure label="Why this matters">
        <p>{risk.summary}</p>
        <p className="mt-3">{risk.recommendedMitigation}</p>
      </Disclosure>

      <ConversationHelper show={showConversationLayer}>
        {`Use this panel to explain that congestion is not a binary failure state; it is a function of oversubscription, traffic synchronization, storage behavior, and how likely the GPUs are to exchange data heavily. The mitigation is usually to lower oversubscription, add fabric bandwidth, or tighten the operating assumptions before deployment.`}
      </ConversationHelper>
    </Card>
  );
}

function driverLabel(driver: string) {
  if (driver.includes("oversubscription")) return "Oversub pressure";
  if (driver.includes("east-west")) return "East-west load";
  if (driver.includes("Storage")) return "Storage sharing";
  if (driver.includes("collective")) return "Collective traffic";
  if (driver.includes("100G")) return "100G constraint";
  if (driver.includes("NIC port")) return "Port fan-in";
  if (driver.includes("synchronization")) return "Sync sensitivity";
  return "Traffic driver";
}
