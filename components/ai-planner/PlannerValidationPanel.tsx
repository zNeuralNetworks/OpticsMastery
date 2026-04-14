import React from 'react';
import { CheckSquare, HelpCircle } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerValidationPanelProps {
  model: PlannerModel;
}

export const PlannerValidationPanel: React.FC<PlannerValidationPanelProps> = ({ model }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Validation and assumptions</div>
          <h3 className="text-xl font-black text-slate-900">What still needs to be proven</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This keeps the live planner honest about what is directional, what is known, and what still needs customer validation.
          </p>
        </div>
        <CheckSquare className="text-purple-600" size={22} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="space-y-3">
          {model.view.validationChecklist.map((step, index) => (
            <div key={step} className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="h-[30px] w-[30px] rounded-full border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700">
                {index + 1}
              </div>
              <div className="text-xs text-slate-700">{step}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {model.view.assumptionMap.map((assumption) => (
            <div key={assumption.label} className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
                <HelpCircle size={14} /> {assumption.label}
              </div>
              <div className="text-xs text-slate-700">{assumption.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
