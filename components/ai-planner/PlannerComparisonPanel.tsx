import React from 'react';
import { PlannerChangeImpactRow, PlannerComparisonRow } from '../../features/ai-planner/types';

interface PlannerComparisonPanelProps {
  comparisonLabel?: string | null;
  comparisonRows: PlannerComparisonRow[];
  changeImpactRows: PlannerChangeImpactRow[];
  onClearComparison?: () => void;
}

const MetricTable: React.FC<{
  title: string;
  emptyState: string;
  rows: Array<{
    label: string;
    left: string | number;
    right: string | number;
    why: string;
  }>;
  leftLabel: string;
  rightLabel: string;
}> = ({ title, emptyState, rows, leftLabel, rightLabel }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{title}</div>
    {rows.length === 0 ? (
      <div className="text-sm text-slate-500 leading-6">{emptyState}</div>
    ) : (
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="border border-slate-100 rounded-2xl bg-white p-4">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">{row.label}</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{leftLabel}</div>
                <div className="text-sm font-black text-slate-900">{row.left}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{rightLabel}</div>
                <div className="text-sm font-black text-slate-900">{row.right}</div>
              </div>
            </div>
            <div className="text-xs leading-6 text-slate-600">{row.why}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const PlannerComparisonPanel: React.FC<PlannerComparisonPanelProps> = ({
  comparisonLabel,
  comparisonRows,
  changeImpactRows,
  onClearComparison,
}) => (
  <section id="planner-compare" className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Scenario Review</div>
        <h3 className="text-xl font-black text-slate-900">Compare and change impact</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Review the current design against the last modeled state and, optionally, a saved comparison snapshot.
        </p>
      </div>
      {comparisonLabel && onClearComparison && (
        <button
          type="button"
          onClick={onClearComparison}
          className="rounded-xl border border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          Clear Compare
        </button>
      )}
    </div>

    {comparisonLabel && (
      <div className="mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">
        Comparing current design against snapshot <span className="font-black text-slate-900">{comparisonLabel}</span>.
      </div>
    )}

    <div className="grid gap-6 2xl:grid-cols-2">
      <MetricTable
        title="Latest input change impact"
        emptyState="No prior in-session design state is available yet. Change a planner input to surface directional impact."
        rows={changeImpactRows.map((row) => ({
          label: row.label,
          left: row.current,
          right: row.previous,
          why: row.why,
        }))}
        leftLabel="Current"
        rightLabel="Previous"
      />
      <MetricTable
        title="Saved snapshot comparison"
        emptyState="Choose a saved snapshot to compare the current design against another scenario."
        rows={comparisonRows.map((row) => ({
          label: row.label,
          left: row.current,
          right: row.comparison,
          why: row.why,
        }))}
        leftLabel="Current"
        rightLabel="Comparison"
      />
    </div>
  </section>
);
