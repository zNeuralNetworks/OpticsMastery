import { useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Disclosure } from "@/components/ui/Disclosure";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import type { DiscoveryQuestionGroup } from "@/features/cluster-designer/types";

type DiscoveryWorkflowPanelProps = {
  groups: DiscoveryQuestionGroup[];
};

type DiscoveryState = Record<string, "new" | "asked" | "follow-up" | "important">;

export function DiscoveryWorkflowPanel({ groups }: DiscoveryWorkflowPanelProps) {
  const [state, setState] = useLocalStorageState<DiscoveryState>("cluster-designer-discovery-state", {});
  const [filter, setFilter] = useState<"all" | "important" | "follow-up" | "asked" | "new">("all");
  const flatQuestions = useMemo(
    () =>
      groups.flatMap((group) =>
        group.questions.map((question) => ({
          id: `${group.category}:${question}`,
          category: group.category,
          question,
        })),
      ),
    [groups],
  );
  const filteredQuestions =
    filter === "all"
      ? flatQuestions
      : flatQuestions.filter((item) => (state[item.id] ?? "new") === filter);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        {["new", "important", "follow-up", "asked"].map((key) => (
          <div key={key} className="card-subtle p-4">
            <p className="data-label">{key}</p>
            <p className="technical-value mt-3 text-[22px] font-semibold">
              {flatQuestions.filter((item) => (state[item.id] ?? "new") === key).length}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "important", "follow-up", "asked", "new"].map((key) => (
          <Chip
            key={key}
            active={filter === key}
            tone={key === "important" ? "ember" : key === "follow-up" ? "amethyst" : key === "asked" ? "emerald" : "default"}
            onClick={() => setFilter(key as typeof filter)}
          >
            {key}
          </Chip>
        ))}
      </div>

      <div className="space-y-3">
        {groups.slice(0, 4).map((group) => {
          const visibleQuestions = group.questions.filter((question) => {
            const id = `${group.category}:${question}`;
            return filteredQuestions.some((item) => item.id === id);
          });

          if (visibleQuestions.length === 0) {
            return null;
          }

          return (
            <div key={group.category} className="card-subtle p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="data-label">{group.category}</p>
                <span className="text-xs text-muted">{visibleQuestions.length} visible</span>
              </div>
              <div className="mt-3 space-y-3">
                {visibleQuestions.slice(0, 2).map((question) => {
                  const id = `${group.category}:${question}`;
                  const status = state[id] ?? "new";
                  return (
                    <div key={id} className="rounded-[16px] border border-border/80 bg-space/45 p-3">
                      <p className="text-sm leading-6 text-muted">{question}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["asked", "important", "follow-up"].map((next) => (
                          <Chip
                            key={next}
                            active={status === next}
                            tone={next === "important" ? "ember" : next === "follow-up" ? "amethyst" : "emerald"}
                            onClick={() =>
                              setState((current) => ({
                                ...current,
                                [id]: current[id] === next ? "new" : (next as DiscoveryState[string]),
                              }))
                            }
                          >
                            {next}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Disclosure label="Full discovery list">
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-sm font-medium text-ink">{group.category}</p>
              <ul className="mt-2 space-y-2">
                {group.questions.map((question) => (
                  <li key={question} className="text-sm leading-6 text-muted">
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Disclosure>
    </div>
  );
}
