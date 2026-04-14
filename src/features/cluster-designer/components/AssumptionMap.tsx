import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type { DesignAssumption } from "@/features/cluster-designer/types";

type AssumptionMapProps = {
  assumptions: DesignAssumption[];
};

export function AssumptionMap({ assumptions }: AssumptionMapProps) {
  return (
    <div className="space-y-3">
      {assumptions.map((assumption) => (
        <div key={assumption.label} className="card-subtle p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="data-label">{assumption.label}</p>
              <InfoTooltip label={assumption.label}>
                This stays assumption-driven in v1 so the tool does not imply validated hardware decisions it does not actually know yet.
              </InfoTooltip>
            </div>
            <Chip tone="cyan">Validate later</Chip>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{firstSentence(assumption.value)}</p>
          <Disclosure className="mt-3" label="Assumption detail">
            {assumption.value}
          </Disclosure>
        </div>
      ))}
    </div>
  );
}

function firstSentence(copy: string) {
  const sentence = copy.split(". ")[0];
  return sentence.endsWith(".") ? sentence : `${sentence}.`;
}
