import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { PlannerPortConsumptionItem } from '../../features/ai-planner/types';

interface PlannerPortConsumptionPanelProps {
  rows: PlannerPortConsumptionItem[];
}

export const PlannerPortConsumptionPanel: React.FC<PlannerPortConsumptionPanelProps> = ({ rows }) => (
  <section id="planner-capacity" className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
    <div className="mb-6">
      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Capacity Summary</div>
      <h3 className="text-xl font-black text-slate-900">Port and uplink model</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        This view shows the port pools the planner is actually consuming so switch-count decisions can be traced back to demand.
      </p>
    </div>

    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
          <XAxis dataKey="category" stroke="#64748b" tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
            contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16 }}
          />
          <Bar dataKey="ports" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="pb-3 font-medium">Category</th>
            <th className="pb-3 font-medium">Ports</th>
            <th className="pb-3 font-medium">Speed</th>
            <th className="pb-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.category} className="border-t border-slate-100">
              <td className="py-3.5 text-slate-900">{row.category}</td>
              <td className="py-3.5 text-slate-900 font-black">{row.ports}</td>
              <td className="py-3.5 text-slate-900">{row.speedGb}G</td>
              <td className="py-3.5 text-slate-600">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);
