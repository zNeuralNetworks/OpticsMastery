import React from 'react';
import { Compass, SearchCheck } from 'lucide-react';
import { PlannerModel } from '../../features/ai-planner/types';

interface PlannerDiscoveryPanelProps {
  model: PlannerModel;
}

export const PlannerDiscoveryPanel: React.FC<PlannerDiscoveryPanelProps> = ({ model }) => {
  return (
    <section className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Customer discovery</div>
          <h3 className="text-xl font-black text-slate-900">Questions that improve the design</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            These keep the planner grounded in real workload, storage, facilities, and operational constraints before the design gets socialized.
          </p>
        </div>
        <Compass className="text-indigo-600" size={22} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {model.view.discoveryQuestions.map((group) => (
          <div key={group.category} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              <SearchCheck size={14} /> {group.category}
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {group.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
