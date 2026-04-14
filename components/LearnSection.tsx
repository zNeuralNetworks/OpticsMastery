
import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { 
  Box, 
  Terminal, 
  Waves, 
  Network,
  Palette,
  Hash,
  ArrowRightLeft,
  Search,
  ArrowRight,
  X,
  ChevronRight,
  Command,
  Zap,
  Ruler,
  Cpu,
  ArrowUpRight,
  Grid3X3,
  Rotate3d,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { LearnPageTab, Page } from '../types';
import { 
  CONCEPT_DEFINITIONS, 
  KB_KEYWORDS, 
  CONCEPT_TAB_MAP 
} from '../data/knowledgeBase';
import { useNavigation } from '../context/NavigationContext';

const StrategyModule = lazy(() =>
  import('../features/learn/modules/submodules/StrategyModule').then((module) => ({ default: module.StrategyModule }))
);
const SignalingModule = lazy(() =>
  import('../features/learn/modules/submodules/SignalingModule').then((module) => ({ default: module.SignalingModule }))
);
const ConnectivityModule = lazy(() =>
  import('../features/learn/modules/submodules/ConnectivityModule').then((module) => ({ default: module.ConnectivityModule }))
);
const HardwareModule = lazy(() =>
  import('../features/learn/modules/submodules/HardwareModule').then((module) => ({ default: module.HardwareModule }))
);
const OperationsModule = lazy(() =>
  import('../features/learn/modules/submodules/OperationsModule').then((module) => ({ default: module.OperationsModule }))
);
const UpgradesModule = lazy(() =>
  import('../features/learn/modules/submodules/UpgradesModule').then((module) => ({ default: module.UpgradesModule }))
);
const ProjectModule = lazy(() =>
  import('../features/learn/modules/submodules/ProjectModule').then((module) => ({ default: module.ProjectModule }))
);
const OpticsFAQ = lazy(() => import('./OpticsFAQ'));

const lessonFallback = (
  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-slate-900">
    <div className="mb-4 h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    <div className="mb-8 h-8 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    <div className="space-y-4">
      <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      <div className="h-40 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70" />
    </div>
  </div>
);

interface LearnSectionProps {
  activeTab: LearnPageTab;
  onTabChange: (tab: LearnPageTab) => void;
}

const LearnSection: React.FC<LearnSectionProps> = ({ activeTab, onTabChange }) => {
  const { navigate } = useNavigation();
  const [view, setView] = useState<'LANDING' | 'ARTICLE' | 'SEARCH'>('LANDING');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync activeTab with view
  useEffect(() => {
    if (activeTab && view === 'LANDING') {
      setView('ARTICLE');
    }
  }, [activeTab]);

  const chapters: { id: LearnPageTab; label: string; icon: React.ElementType; desc: string; level: 'Basics' | 'Intermediate' | 'Advanced'; phase: string }[] = [
    // Phase 1: Physical Foundations
    { id: 'CONNECTIVITY', label: 'Media & Cabling', icon: Hash, desc: 'Foundations: Fiber & Safety', level: 'Basics', phase: 'Phase 1: Physical Foundations' },
    { id: 'HARDWARE', label: 'Optics Hardware', icon: Box, desc: 'Form Factors & Cages', level: 'Basics', phase: 'Phase 1: Physical Foundations' },
    
    // Phase 2: Signal & Operations
    { id: 'SIGNALING', label: 'Signal Logic', icon: Waves, desc: 'Signaling: PAM4 & FEC', level: 'Intermediate', phase: 'Phase 2: Signal & Operations' },
    { id: 'OPERATIONS', label: 'Engineering Ops', icon: Terminal, desc: 'Ops: CLI & Debugging', level: 'Intermediate', phase: 'Phase 2: Signal & Operations' },
    
    // Phase 3: Architecture & Evolution
    { id: 'STRATEGY', label: 'Fabric Strategy', icon: Network, desc: 'Design: AI & Over-sub', level: 'Intermediate', phase: 'Phase 3: Architecture & Evolution' },
    { id: 'UPGRADES', label: 'Migration Path', icon: ArrowRightLeft, desc: 'Transition: 100G to 800G', level: 'Advanced', phase: 'Phase 3: Architecture & Evolution' },
    { id: 'OPTICS_FAQ', label: '800G FAQ', icon: HelpCircle, desc: 'Knowledge Base: 800G Specifics', level: 'Basics', phase: 'Phase 3: Architecture & Evolution' },
    
    // Meta
    { id: 'PROJECT', label: 'Architecture DNA', icon: Palette, desc: 'Meta: App Principles', level: 'Basics', phase: 'Meta' }
  ];

  const phases = ['Phase 1: Physical Foundations', 'Phase 2: Signal & Operations', 'Phase 3: Architecture & Evolution'];

  const guidedPath: Array<{
    id: LearnPageTab;
    stage: string;
    title: string;
    why: string;
    unlocks: string;
  }> = [
    {
      id: 'CONNECTIVITY',
      stage: 'Start Here',
      title: 'Media, reach, connector safety, and polarity',
      why: 'This is the minimum foundation for understanding why a link works, fails, or damages hardware.',
      unlocks: 'Unlocks physical link validation and link-budget reasoning.',
    },
    {
      id: 'SIGNALING',
      stage: 'Then Learn',
      title: 'NRZ, PAM4, and FEC behavior',
      why: 'This builds the signal-layer model behind 100G, 400G, and 800G link behavior.',
      unlocks: 'Unlocks breakout, link validation, and high-speed troubleshooting.',
    },
    {
      id: 'HARDWARE',
      stage: 'Then Learn',
      title: 'Form factors, lanes, and breakout mapping',
      why: 'This connects physical cages and lane counts to real switch and host attachment choices.',
      unlocks: 'Unlocks guided part selection and breakout decisions.',
    },
    {
      id: 'OPERATIONS',
      stage: 'Apply',
      title: 'Telemetry, failure symptoms, and debug flow',
      why: 'This turns static optics knowledge into operational troubleshooting skill.',
      unlocks: 'Unlocks field diagnosis and validation workflows.',
    },
    {
      id: 'STRATEGY',
      stage: 'Transfer',
      title: 'Fabric strategy and architecture reasoning',
      why: 'This shows how optics and signaling decisions affect topology, oversubscription, and AI fabrics.',
      unlocks: 'Unlocks topology lab and AI cluster design decisions.',
    },
  ];

  const practiceTools = [
    {
      title: 'Link Validation',
      description: 'Test whether two interfaces can actually form a valid link and see the engineering reasons.',
      cta: 'Validate Link',
      action: () => navigate(Page.COMPATIBILITY_EXPLAINER),
    },
    {
      title: 'Link Budget Calculator',
      description: 'Turn reach and loss concepts into a real physical-layer validation step.',
      cta: 'Run Budget',
      action: () => navigate(Page.LINK_BUDGET),
    },
    {
      title: 'Topology Lab',
      description: 'See how optics and fabric choices change architecture and BOM outcomes.',
      cta: 'Open Lab',
      action: () => navigate(Page.TOPOLOGY),
    },
  ];

  const referenceTools = [
    {
      title: 'Part Finder',
      description: 'Use after you understand the concept and need a concrete part family.',
      cta: 'Open Catalog',
      action: () => navigate(Page.CATALOG),
    },
    {
      title: 'Interactive Datasheets',
      description: 'Use when you need detailed product facts, not first-time concept explanation.',
      cta: 'Inspect Parts',
      action: () => navigate(Page.INTERACTIVE_DATASHEETS),
    },
    {
      title: 'AI Cluster Planner',
      description: 'Use once optics, fabric, and validation concepts are clear enough to support architecture design.',
      cta: 'Open Planner',
      action: () => navigate(Page.AI_PLANNER),
    },
  ];

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    
    return Object.keys(CONCEPT_DEFINITIONS).filter(id => {
      const titleMatch = id.toLowerCase().replace('_', ' ').includes(q);
      const defMatch = CONCEPT_DEFINITIONS[id].toLowerCase().includes(q);
      const keywordMatch = KB_KEYWORDS[id]?.some(k => k.toLowerCase().includes(q));
      return titleMatch || defMatch || keywordMatch;
    }).map(id => ({
      id,
      title: id.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      tab: CONCEPT_TAB_MAP[id] as LearnPageTab,
      desc: CONCEPT_DEFINITIONS[id]
    }));
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      setView('SEARCH');
    } else if (activeTab && view !== 'ARTICLE') {
      // If we have an active tab but no search, we might be in an article
    }
  }, [searchQuery]);

  const handleTopicClick = (tab: LearnPageTab) => {
    onTabChange(tab);
    setView('ARTICLE');
    setSearchQuery('');
  };

  const renderLanding = () => (
    <div className="max-w-4xl mx-auto space-y-16 py-10">
      {/* Hero Search */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tightest leading-extra-tight uppercase">
            Knowledge Base
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed-plus">
            Search validated optics configurations and engineering logic.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
          <input 
            ref={searchInputRef}
            type="text"
            placeholder="Search concepts (e.g. PAM4, Breakout, SMF)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl pl-16 pr-20 py-5 text-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xl dark:shadow-none placeholder:text-slate-400"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
            <Command size={14} />
            <span className="text-xs font-bold font-mono">K</span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        <button 
          onClick={() => handleTopicClick('UPGRADES')}
          className="bento-item bento-item-large bg-blue-600 dark:bg-blue-600 text-white shadow-xl shadow-blue-600/20 group relative overflow-hidden border-none"
        >
          <ArrowRightLeft className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700" size={320} />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <div className="p-4 bg-white/20 rounded-3xl w-fit backdrop-blur-md shadow-inner"><Zap size={32} /></div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black uppercase tracking-tightest leading-extra-tight">Migration<br/>Paths</h3>
                <p className="text-blue-100 text-lg font-medium leading-relaxed-plus max-w-md">Interactive Migration Wizard for 100G to 800G transitions. Plan your next-gen fabric evolution.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10">
              Advanced Track <ArrowUpRight size={16} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => handleTopicClick('HARDWARE')}
          className="bento-item group"
        >
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl w-fit text-indigo-600 group-hover:scale-110 transition-transform"><Cpu size={28} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tightest leading-extra-tight">Breakout Logic</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed-plus font-medium">SFP Matrix & Cage breakout mapping. Visualizing high-density port configurations.</p>
            </div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
              Explore Hardware <ChevronRight size={12} />
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate(Page.LINK_BUDGET)}
          className="bento-item group"
        >
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl w-fit text-emerald-600 group-hover:scale-110 transition-transform"><Ruler size={28} /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tightest leading-extra-tight">Link Budget</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed-plus font-medium">Calculate total signal attenuation across links. Ensure error-free physical layer performance.</p>
            </div>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              Run Calculator <ChevronRight size={12} />
            </div>
          </div>
        </button>
      </div>

      {/* Interactive Reference Tools */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="micro-label">Interactive Reference Tools</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate(Page.FORM_FACTOR_EXPLORER)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                <Rotate3d size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">3D Explorer</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
              Rotate and inspect physical transceiver architecture from SFP to OSFP.
            </p>
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
              Launch 3D <ArrowUpRight size={12} />
            </div>
          </button>

          <button 
            onClick={() => navigate(Page.SMART_MATRIX)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                <Grid3X3 size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Smart Matrix</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
              A fast reference for physical fit, signaling fit, and supported form-factor pairings.
            </p>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
              View Matrix <ArrowUpRight size={12} />
            </div>
          </button>

          <button 
            onClick={() => navigate(Page.COMPATIBILITY_EXPLAINER)}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-xl transition-all text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Link Validation Lab</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
              Detailed physical and signaling validation. Understand the engineering reasons behind each result.
            </p>
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              Validate Link <ArrowUpRight size={12} />
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="micro-label">Recommended Learning Path</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {guidedPath.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleTopicClick(step.id)}
              className="group rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-500/30 hover:shadow-lg dark:border-white/5 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                      {index + 1}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      {step.stage}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tightest leading-extra-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed-plus text-slate-600 dark:text-slate-400">
                    {step.why}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 lg:w-[320px]">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    What This Unlocks
                  </div>
                  <div className="leading-relaxed">{step.unlocks}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="micro-label">Practice What You Learned</h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
          </div>
          <div className="space-y-4">
            {practiceTools.map((tool) => (
              <button
                key={tool.title}
                onClick={tool.action}
                className="group w-full rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-blue-500/30 hover:shadow-lg dark:border-white/5 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {tool.title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-950 dark:text-slate-400 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300">
                    {tool.cta}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="micro-label">Reference After You Understand</h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
          </div>
          <div className="space-y-4">
            {referenceTools.map((tool) => (
              <button
                key={tool.title}
                onClick={tool.action}
                className="group w-full rounded-3xl border border-slate-200 bg-white p-6 text-left transition-all hover:border-slate-400/30 hover:shadow-lg dark:border-white/5 dark:bg-slate-900"
              >
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                    Reference Surface
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{tool.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                    {tool.description}
                  </p>
                  <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {tool.cta}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Phase */}
      <div className="space-y-12">
        {phases.map((phase) => (
          <div key={phase} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="micro-label">{phase}</h2>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chapters.filter(c => c.phase === phase).map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => handleTopicClick(chapter.id)}
                  className="flex items-center gap-5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors">
                    <chapter.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{chapter.label}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">{chapter.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Meta Section */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {chapters.filter(c => c.phase === 'Meta').map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => handleTopicClick(chapter.id)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-slate-500 hover:text-blue-500 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <chapter.icon size={14} />
                {chapter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="max-w-4xl mx-auto space-y-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSearchQuery('')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tightest leading-extra-tight">
              Search Results
            </h2>
            <p className="micro-label mt-1">Found {searchResults?.length || 0} matches for "{searchQuery}"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {searchResults?.map(res => (
          <button 
            key={res.id}
            onClick={() => handleTopicClick(res.tab)}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-500/30 transition-all text-left group"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="micro-label bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                  {res.tab}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tightest leading-extra-tight">{res.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed-plus max-w-2xl">{res.desc}</p>
            </div>
            <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
              <ArrowRight size={24} />
            </div>
          </button>
        ))}

        {searchResults?.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-full w-fit mx-auto shadow-sm">
              <Search size={32} className="text-slate-300" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-slate-900 dark:text-white">No matches found</p>
              <p className="text-sm text-slate-500">Try searching for "PAM4", "FEC", or "OSFP".</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderArticle = () => {
    const chapter = chapters.find(c => c.id === activeTab);
    if (!chapter) return null;

    return (
      <div className="max-w-6xl mx-auto py-6 animate-fade-in space-y-8">
        {/* Command Center: Horizontal Navigation Rail */}
        <div className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('LANDING')}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest shrink-0"
              >
                <ArrowRight className="rotate-180" size={14} /> Knowledge Base
              </button>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>
              <nav className="flex items-center gap-1">
                {chapters.filter(c => c.phase !== 'Meta').map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleTopicClick(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === c.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <c.icon size={14} className={activeTab === c.id ? 'opacity-100' : 'opacity-50'} />
                    {c.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0">
              <button 
                onClick={() => navigate(Page.CATALOG)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-tight hover:scale-105 transition-transform"
              >
                <Search size={12} /> Part Finder
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {/* Article Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {chapter.level}
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {chapter.label}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
                {chapter.label}
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {chapter.desc}
              </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <Suspense fallback={lessonFallback}>
                {activeTab === 'STRATEGY' && <StrategyModule onNavigate={navigate} />}
                {activeTab === 'SIGNALING' && <SignalingModule onNavigate={navigate} />}
                {activeTab === 'CONNECTIVITY' && <ConnectivityModule onNavigate={navigate} />}
                {activeTab === 'HARDWARE' && <HardwareModule onNavigate={navigate} />}
                {activeTab === 'OPERATIONS' && <OperationsModule onNavigate={navigate} />}
                {activeTab === 'UPGRADES' && <UpgradesModule onNavigate={navigate} />}
                {activeTab === 'PROJECT' && <ProjectModule onNavigate={navigate} />}
                {activeTab === 'OPTICS_FAQ' && <OpticsFAQ />}
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div key={view + (activeTab || '')} className="animate-fade-in">
        {view === 'LANDING' && renderLanding()}
        {view === 'SEARCH' && renderSearch()}
        {view === 'ARTICLE' && renderArticle()}
      </div>
    </div>
  );
};

export default LearnSection;
