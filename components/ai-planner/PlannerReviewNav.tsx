import React from 'react';

const navItems = [
  { id: 'planner-topology', label: 'Topology' },
  { id: 'planner-canvas', label: 'Canvas' },
  { id: 'planner-compare', label: 'Compare' },
  { id: 'planner-capacity', label: 'Capacity' },
  { id: 'planner-fabric-eval', label: 'Fabric Eval' },
  { id: 'planner-fabric-justify', label: 'Justification' },
  { id: 'planner-package', label: 'Design Package' },
] as const;

export const PlannerReviewNav: React.FC = () => (
  <section className="bg-white border border-gray-200 rounded-[2rem] p-5 shadow-sm">
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Review Nav</div>
      {navItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-xl border border-slate-200 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          {item.label}
        </a>
      ))}
    </div>
  </section>
);
