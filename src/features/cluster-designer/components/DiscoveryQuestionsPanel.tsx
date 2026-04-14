import { Card } from "@/components/ui/Card";
import { DiscoveryWorkflowPanel } from "@/features/cluster-designer/components/DiscoveryWorkflowPanel";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type DiscoveryQuestionsPanelProps = {
  design: DesignEngineResult;
};

export function DiscoveryQuestionsPanel({ design }: DiscoveryQuestionsPanelProps) {
  const { showConversationLayer } = useConversationLayer();

  return (
    <Card eyebrow="6. Customer Discovery Questions" title="Customer architecture discovery" accent="emerald">
      <DiscoveryWorkflowPanel groups={design.discoveryQuestions} />

      <ConversationHelper show={showConversationLayer}>
        {`These questions help move the conversation from generic AI interest to the actual workload and operating realities that should shape the fabric. The goal is to discover what traffic behavior, storage behavior, and deployment pattern the customer really expects before locking in a topology posture.`}
      </ConversationHelper>
    </Card>
  );
}
