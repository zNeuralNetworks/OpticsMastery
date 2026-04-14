import React from 'react';
import { CheckCircle2, FileSpreadsheet, ShoppingCart, Table } from 'lucide-react';
import { PlannerBomLine, PlannerBomSection, PlannerHardwarePacket } from '../../features/ai-planner/types';

interface PlannerBomSummaryProps {
  bomLines: PlannerBomLine[];
  bomSections: PlannerBomSection[];
  hardwarePacket: PlannerHardwarePacket;
  showSuccess: boolean;
  onAddToBOM: () => void;
  onOpenBOM?: () => void;
  onExportBomCsv: () => void;
  onExportWorkbook?: () => void;
}

export const PlannerBomSummary: React.FC<PlannerBomSummaryProps> = ({
  bomLines,
  bomSections,
  hardwarePacket,
  showSuccess,
  onAddToBOM,
  onOpenBOM,
  onExportBomCsv,
  onExportWorkbook,
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
            <ShoppingCart size={18} className="text-blue-600" />
            Planner BOM Summary
          </h3>
          <p className="text-[11px] text-gray-500 mt-2">Review deterministic versus assumption-driven quantities before adding the set to the project BOM.</p>
        </div>
        <div className="text-[10px] text-gray-400 uppercase tracking-widest">{bomLines.length} lines</div>
</div>

<div className="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
  <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
    <div className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-2">Hardware packet narrative</div>
    <div className="text-xs text-slate-700 leading-6">{hardwarePacket.modularBreakdownNarrative}</div>
  </div>
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Confidence tags</div>
    <ul className="space-y-2 text-xs text-slate-700">
      {hardwarePacket.confidenceTags.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
</div>

<div className="space-y-6 mb-6">
        {bomSections.map((section) => (
          <div key={section.title}>
            <div className="mb-3">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{section.title}</div>
              <div className="text-[11px] text-slate-500 mt-1">{section.description}</div>
            </div>
            <div className="space-y-3">
              {section.lines.map((line) => (
                <div key={line.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        {line.category} · {line.role}
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-mono">{line.sku}</div>
                      <div className="text-xs text-slate-500 mt-1">{line.description}</div>
                      {line.note && <div className="text-[11px] text-slate-500 mt-2">{line.note}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 font-mono">{line.quantity}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest ${line.quantitySource === 'deterministic' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {line.quantitySource}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

<div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Component role summary</div>
  <ul className="space-y-2 text-xs text-slate-700">
    {hardwarePacket.componentRoleSummary.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
</div>

<div className="flex items-center justify-between gap-4">
        <div className="text-[11px] text-slate-500">
          Assumed quantities reflect endpoint optics or media families that still need customer-specific validation.
        </div>
        <div className="flex items-center gap-4">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 text-xs font-black uppercase tracking-widest">
              <CheckCircle2 size={16} /> Added to BOM
            </div>
          )}
          {onExportWorkbook && (
            <button
              onClick={onExportWorkbook}
              className="inline-flex items-center gap-2 px-6 py-4 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-800 transition-all"
            >
              <FileSpreadsheet size={16} />
              Export Workbook
            </button>
          )}
          <button
            onClick={onExportBomCsv}
            className="inline-flex items-center gap-2 px-6 py-4 border border-slate-200 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-700 transition-all"
          >
            <Table size={16} />
            Export BOM CSV
          </button>
          {onOpenBOM && (
            <button
              onClick={onOpenBOM}
              className="px-6 py-4 border border-slate-200 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-700 transition-all"
            >
              Open in BOM Builder
            </button>
          )}
          <button
            onClick={onAddToBOM}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            Add Planner BOM
          </button>
        </div>
      </div>
    </section>
  );
};
