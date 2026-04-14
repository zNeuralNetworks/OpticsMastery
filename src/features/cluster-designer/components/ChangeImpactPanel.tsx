import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { buildChangeImpactRows } from "@/features/cluster-designer/engine/comparisonSupport";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type ChangeImpactPanelProps = {
  current: DesignEngineResult;
  previous: DesignEngineResult | null;
};

export function ChangeImpactPanel({ current, previous }: ChangeImpactPanelProps) {
  const changes = buildChangeImpactRows(current, previous);

  if (changes.length === 0) {
    return null;
  }

  return (
    <Card eyebrow="What Changed" title="Change impact" accent="indigo">
      <div className="grid gap-3 lg:grid-cols-3">
        {changes.map((change, index) => (
          <motion.div
            key={change.label}
            className="rounded-[20px] border border-line/70 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{change.label}</p>
              <Chip tone="indigo">Changed</Chip>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 rounded-[14px] border border-border/80 bg-space/35 px-3 py-3">
                <p className="data-label">Before</p>
                <p className="mt-2 text-sm text-ink">{change.previous}</p>
              </div>
              <div className="text-label">→</div>
              <div className="flex-1 rounded-[14px] border border-indigo/35 bg-indigo/10 px-3 py-3">
                <p className="data-label">After</p>
                <p className="mt-2 text-sm text-ink">{change.current}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{change.why}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
