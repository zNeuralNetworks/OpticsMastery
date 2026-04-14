
import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Info, ClipboardCheck } from 'lucide-react';

interface DecisionOutputProps {
  title: string;
  recommended: string[];
  notRecommended: string[];
  assumptions: string[];
  nextChecks: string[];
  notes?: string;
}

const DecisionOutput: React.FC<DecisionOutputProps> = ({
  title,
  recommended,
  notRecommended,
  assumptions,
  nextChecks,
  notes
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = [
      `--- ${title.toUpperCase()} ---`,
      '',
      'RECOMMENDED:',
      ...recommended.map(item => `- ${item}`),
      '',
      notRecommended.length > 0 ? 'DO NOT USE:' : '',
      ...notRecommended.map(item => `- ${item}`),
      notRecommended.length > 0 ? '' : '',
      'ASSUMPTIONS:',
      ...assumptions.map(item => `- ${item}`),
      '',
      'NEXT CHECKS:',
      ...nextChecks.map(item => `- ${item}`),
      '',
      notes ? `NOTES: ${notes}` : ''
    ].filter(line => line !== null).join('\n').trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden mt-6 animate-slide-up shadow-inner decision-surface">
      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <ClipboardCheck size={14} /> Engineering Recommendation
        </h4>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all shadow-sm"
        >
          {copied ? (
            <><Check size={12} className="text-green-500" /> Copied</>
          ) : (
            <><Copy size={12} /> Copy Plain Text</>
          )}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {recommended.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase mb-2 block tracking-widest">Recommended Configuration</span>
            <ul className="space-y-2">
              {recommended.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 flex items-start gap-2 font-medium">
                  <span className="text-green-500 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {notRecommended.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase mb-2 block tracking-widest">Constraints / Risks</span>
            <ul className="space-y-2">
              {notRecommended.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 flex items-start gap-2 font-medium">
                  <span className="text-red-500 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-white/5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Assumptions</span>
            <ul className="space-y-2">
              {assumptions.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex items-start gap-2 font-medium">
                  <Info size={12} className="mt-1 shrink-0 opacity-60" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Verification Steps</span>
            <ul className="space-y-2">
              {nextChecks.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex items-start gap-2 font-medium">
                  <AlertCircle size={12} className="mt-1 shrink-0 opacity-60" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {notes && (
          <div className="pt-4 border-t border-slate-200 dark:border-white/5 text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
            <strong className="not-italic font-bold text-slate-400 uppercase text-[10px] tracking-widest mr-2">Designer Note:</strong> {notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionOutput;
