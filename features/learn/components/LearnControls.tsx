
import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Microscope, 
  Zap, 
  ExternalLink, 
  Stethoscope, 
  Target, 
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  ADVANCED_NOTES, 
  FAILURE_SYMPTOMS, 
  CONTEXTUAL_ACTIONS, 
  formatConceptNote
} from '../../../data/knowledgeBase';
import { Page } from '../../../types';

// --- Types ---
interface ActionProps { conceptId: string; title: string; level: string; }
interface PanelProps { conceptId: string; }
interface ToolProps { actionKey: keyof typeof CONTEXTUAL_ACTIONS; onNavigate?: (page: Page) => void; }
interface ImpactProps { text: string; onNavigate?: (page: Page) => void; }

const TOOL_PAGE_MAP: Record<string, Page> = {
  'Architecture Lab': Page.TOPOLOGY,
  'Compatibility Matrix': Page.SMART_MATRIX,
  'Part Finder': Page.CATALOG,
  'Link Budget Calc': Page.LINK_BUDGET,
  'Migration Wizard': Page.MIGRATION_WIZARD,
  'Cable Configurator': Page.VISUALIZER
};

// --- Components ---

export const CopyNoteAction: React.FC<ActionProps> = ({ conceptId, title, level }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = formatConceptNote(conceptId, level, title);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group/copy"
    >
      {copied ? (
        <><Check size={12} className="text-green-500" /> <span className="text-green-600 dark:text-green-400">Copied</span></>
      ) : (
        <><Copy size={12} className="opacity-50 group-hover/copy:opacity-100" /> <span>Copy as note</span></>
      )}
    </button>
  );
};

export const AdvancedNotesPanel: React.FC<PanelProps> = ({ conceptId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const notes = ADVANCED_NOTES[conceptId];
  if (!notes) return null;

  return (
    <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
          <Microscope size={14} className="text-blue-500 opacity-70" /> Advanced notes
        </span>
        {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
          <ul className="space-y-2">
            {notes.map((note, i) => (
              <li key={i} className="text-[13px] text-slate-600 dark:text-slate-400 flex items-start gap-2 leading-relaxed font-medium">
                <span className="mt-2 w-1 h-1 rounded-full bg-blue-500/30 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const ContextualToolAction: React.FC<ToolProps> = ({ actionKey, onNavigate }) => {
  const action = CONTEXTUAL_ACTIONS[actionKey];
  if (!action) return null;

  const targetPage = Page[action.pageKey as keyof typeof Page];
  const isAvailable = !!targetPage;

  return (
    <button
      onClick={() => isAvailable && onNavigate?.(targetPage)}
      disabled={!isAvailable}
      title={!isAvailable ? "Tool not enabled" : `Run ${action.label}`}
      className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-sm border
        ${isAvailable 
          ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 hover:shadow-md active:scale-95' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'}
      `}
    >
      <Zap size={12} className={isAvailable ? 'text-blue-200' : 'text-slate-300'} />
      {action.label}
      {isAvailable && <ExternalLink size={10} className="ml-1 opacity-50" />}
    </button>
  );
};

export const FailureSymptomCallout: React.FC<PanelProps> = ({ conceptId }) => {
  const symptoms = FAILURE_SYMPTOMS[conceptId];
  if (!symptoms) return null;

  return (
    <div className="mt-6 p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl">
      <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-widest">
        <Stethoscope size={14} /> If this breaks, you'll typically see:
      </div>
      <ul className="space-y-1">
        {symptoms.map((s, i) => (
          <li key={i} className="text-[13px] text-red-800 dark:text-red-300/80 flex items-start gap-2 italic leading-relaxed">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400 dark:bg-red-600 shrink-0" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ImpactCallout: React.FC<ImpactProps> = ({ text, onNavigate }) => {
  const parts = text.split("USED IN:");
  const prose = parts[0];
  const toolPart = parts[1];

  return (
    <div className="mt-8 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 px-5 py-4 rounded-r-xl flex items-start gap-4 shadow-sm border border-blue-100 dark:border-blue-900/30">
      <Target size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed italic">
          {prose}
        </p>
        {toolPart && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Related Tool:</span>
            {toolPart.split(",").map(t => {
              const name = t.trim();
              const page = TOOL_PAGE_MAP[name];
              if (page && onNavigate) {
                return (
                  <button 
                    key={name}
                    onClick={() => onNavigate(page)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-black uppercase transition-all border border-blue-600/20 group/tool"
                  >
                    <ArrowRight size={10} className="group-hover/tool:translate-x-0.5 transition-transform" />
                    {name}
                  </button>
                );
              }
              return (
                <span key={name} className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 italic opacity-60">
                  {name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const TransitionDivider: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-8 flex justify-center">
    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 shadow-sm">
      <ArrowUpRight size={14} className="text-blue-500 opacity-70" />
      <p className="text-[13px] font-semibold tracking-wide uppercase">{text}</p>
    </div>
  </div>
);
