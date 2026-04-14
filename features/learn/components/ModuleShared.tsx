import React from 'react';
import { Info, ArrowRight, Copy, Check, AlertCircle } from 'lucide-react';

import { Page } from '../../../types';
import {
  ADVANCED_NOTES,
  CONTEXTUAL_ACTIONS,
  FAILURE_SYMPTOMS,
  LEARNING_GUIDES,
  formatConceptNote,
} from '../../../data/knowledgeBase';

export interface ModuleProps {
  onNavigate: (page: Page) => void;
}

export const ImpactCallout: React.FC<{ text: string; onNavigate: (page: Page) => void }> = ({ text, onNavigate }) => (
  <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex gap-5 items-start group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
      <Info size={20} />
    </div>
    <div className="space-y-3">
      <p className="text-[13px] text-blue-900 dark:text-blue-200 leading-relaxed font-semibold tracking-tight">
        {text}
      </p>
      <button 
        onClick={() => onNavigate(Page.CATALOG)}
        className="flex items-center gap-2 text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:gap-3 transition-all"
      >
        Explore Catalog <ArrowRight size={14} />
      </button>
    </div>
  </div>
);

export const TransitionDivider: React.FC<{ text: string }> = ({ text }) => (
  <div className="relative py-12">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
    </div>
    <div className="relative flex justify-center">
      <span className="bg-slate-50 dark:bg-slate-950 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] aom-mono">
        {text}
      </span>
    </div>
  </div>
);

const PAGE_KEY_TO_PAGE: Record<string, Page> = {
  LINK_BUDGET: Page.LINK_BUDGET,
  DBM_INTERPRETER: Page.DBM_INTERPRETER,
  COMPATIBILITY_EXPLAINER: Page.COMPATIBILITY_EXPLAINER,
  VISUALIZER: Page.VISUALIZER,
  FORM_FACTOR_EXPLORER: Page.FORM_FACTOR_EXPLORER,
  TOPOLOGY: Page.TOPOLOGY,
  CATALOG: Page.CATALOG,
};

export const LessonIntroCard: React.FC<{
  title: string;
  summary: string;
  goals: string[];
  nextAction?: string;
}> = ({ title, summary, goals, nextAction }) => (
  <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-slate-900 dark:bg-none">
    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">Lesson Frame</div>
    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">{summary}</p>
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {goals.map((goal) => (
        <div key={goal} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {goal}
        </div>
      ))}
    </div>
    {nextAction ? (
      <div className="mt-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Next: {nextAction}
      </div>
    ) : null}
  </div>
);

export const CopyNoteAction: React.FC<{ conceptId: string; title: string; level: string }> = ({ conceptId, title, level }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatConceptNote(conceptId, level, title));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn('Failed to copy learning note', error);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-all group"
    >
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{level}</span>
      <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-400 group-hover:text-slate-600" />}
    </button>
  );
};

export const FailureSymptomCallout: React.FC<{ conceptId: string }> = ({ conceptId }) => {
  const symptoms = FAILURE_SYMPTOMS[conceptId] ?? [];

  if (symptoms.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-xl flex gap-4 items-start">
      <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-2">
        <span className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest">If this breaks, expect</span>
        <ul className="space-y-1">
          {symptoms.slice(0, 3).map((symptom) => (
            <li key={symptom} className="text-[12px] text-amber-900 dark:text-amber-200 leading-relaxed font-medium italic">
              {symptom}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const AdvancedNotesPanel: React.FC<{ conceptId: string }> = ({ conceptId }) => {
  const notes = ADVANCED_NOTES[conceptId] ?? [];

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 p-6 bg-slate-900 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <h5 className="text-[11px] font-black text-white uppercase tracking-[0.2em] aom-mono">Advanced Engineering Notes</h5>
      </div>
      <ul className="space-y-3">
        {notes.map((note) => (
          <li key={note} className="text-[13px] text-slate-400 leading-relaxed font-medium">
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const FieldNotes: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <div className="mt-8 p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-800/30 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
      <AlertCircle size={80} className="text-amber-600" />
    </div>
    <div className="relative z-10 space-y-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-black text-[10px] uppercase tracking-[0.2em]">
        <AlertCircle size={14} /> Field Notes & Gotchas
      </div>
      <h5 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h5>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
        "{content}"
      </p>
    </div>
  </div>
);

export const ContextualToolAction: React.FC<{ actionKey: string; onNavigate: (page: Page) => void }> = ({ actionKey, onNavigate }) => {
  const action = CONTEXTUAL_ACTIONS[actionKey as keyof typeof CONTEXTUAL_ACTIONS];
  const page = action ? PAGE_KEY_TO_PAGE[action.pageKey] : Page.CATALOG;
  const guide = LEARNING_GUIDES[actionKey];

  return (
    <button 
      onClick={() => onNavigate(page)}
      className="w-full mt-6 p-4 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl flex items-center justify-between group transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <ArrowRight size={18} />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Try This Next</div>
          <div className="text-[13px] text-white font-bold">{action?.label ?? 'Open Related Tool'}</div>
          {guide?.nextStep ? (
            <div className="mt-1 text-[11px] text-slate-400">{guide.nextStep}</div>
          ) : null}
        </div>
      </div>
      <ArrowRight size={20} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </button>
  );
};
