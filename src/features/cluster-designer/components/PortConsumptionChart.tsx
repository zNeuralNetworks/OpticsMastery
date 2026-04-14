import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { ConversationHelper } from "@/features/cluster-designer/components/ConversationHelper";
import { useConversationLayer } from "@/features/cluster-designer/context/ConversationLayerContext";
import type { DesignEngineResult } from "@/features/cluster-designer/types";

type PortConsumptionChartProps = {
  design: DesignEngineResult;
};

export function PortConsumptionChart({ design }: PortConsumptionChartProps) {
  const { showConversationLayer } = useConversationLayer();
  return (
    <Card eyebrow="3. Capacity Summary" title="Port and uplink model" accent="cyan">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={design.portConsumption}>
            <CartesianGrid stroke="rgba(44,61,91,0.5)" vertical={false} />
            <XAxis dataKey="category" stroke="var(--color-muted)" tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted)" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
              contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16 }}
            />
            <Bar dataKey="ports" fill="var(--color-cyan)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Ports</th>
              <th className="pb-3 font-medium">Speed</th>
              <th className="pb-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {design.portConsumption.map((item) => (
              <tr key={item.category} className="border-t border-line/70">
                <td className="py-3.5 text-ink">{item.category}</td>
                <td className="py-3.5 text-ink">{item.ports}</td>
                <td className="py-3.5 text-ink">{item.speedGb}G</td>
                <td className="py-3.5 text-muted">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConversationHelper show={showConversationLayer}>
        {`This view shows why growth buffer matters. We are not just sizing for the current server ports; we are reserving the downlinks and uplinks needed to absorb expansion without forcing a disruptive fabric change later. That is a practical enterprise design choice because these environments usually grow in stages, not all at once.`}
      </ConversationHelper>
    </Card>
  );
}
