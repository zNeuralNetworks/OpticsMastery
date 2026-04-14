import { Card } from "@/components/ui/Card";
import { buildComparisonRows } from "@/features/cluster-designer/engine/comparisonSupport";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type CompareSummaryPanelProps = {
  current: DesignEngineResult;
  comparison: DesignEngineResult;
  title?: string;
  eyebrow?: string;
};

export function CompareSummaryPanel({
  current,
  comparison,
  title = "Scenario comparison",
  eyebrow = "Compare Mode",
}: CompareSummaryPanelProps) {
  const rows = buildComparisonRows(current, comparison);

  return (
    <Card eyebrow={eyebrow} title={title} accent="amethyst">
      <div className="space-y-3">
        {rows.map((row) => {
          const delta = Number((currentValue(row.current) - currentValue(row.comparison)).toFixed(2));
          return (
            <div key={row.label} className="rounded-[20px] border border-line/70 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="data-label">{row.label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{row.why}</p>
                </div>
                <div className="grid min-w-[240px] gap-2 text-sm">
                  <Metric label="Current" value={String(row.current)} />
                  <Metric label="Comparison" value={String(row.comparison)} />
                  <Metric label="Delta" value={`${delta >= 0 ? "+" : ""}${delta}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function currentValue(value: number) {
  return value;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[16px] border border-line/70 px-3 py-2">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}
