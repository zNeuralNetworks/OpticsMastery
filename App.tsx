
import React, { Suspense, lazy, memo, useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import LearnSection from './components/LearnSection';
import { Page, LearnPageTab, AppNavigationParams, PlannerTopologySeed } from './types';
import { Menu } from 'lucide-react';
import { useNavigation } from './context/NavigationContext';
import { useLocalAppSettings } from './hooks/useLocalAppSettings';

const BreakoutVisualizer = lazy(() => import('./components/BreakoutVisualizer'));
const OpticsCatalog = lazy(() => import('./components/OpticsCatalog'));
const TopologyLab = lazy(() =>
  import('./components/TopologyLab').then((module) => ({ default: module.TopologyLab }))
);
const ContentImprovements = lazy(() => import('./components/ContentImprovements'));
const SmartCompatibility = lazy(() => import('./components/SmartCompatibility'));
const MigrationWizard = lazy(() => import('./components/MigrationWizard'));
const BOMBuilder = lazy(() => import('./components/BOMBuilder'));
const GlobalSearch = lazy(() => import('./components/GlobalSearch'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const InteractiveDatasheet = lazy(() => import('./components/InteractiveDatasheet'));
const SuggestionsFooter = lazy(() => import('./components/SuggestionsFooter'));
const EngineeringBacklog = lazy(() => import('./components/EngineeringBacklog'));
const LinkBudgetCalculator = lazy(() => import('./components/LinkBudgetCalculator'));
const PowerLevelInterpreter = lazy(() => import('./components/PowerLevelInterpreter'));
const SignalIntegritySandbox = lazy(() => import('./components/SignalIntegritySandbox'));
const FormFactorExplorer = lazy(() => import('./components/FormFactorExplorer'));
const AIClusterPlanner = lazy(() => import('./components/AIClusterPlanner'));
const SmartMatrix = lazy(() => import('./components/SmartMatrix'));
const AboutModal = lazy(() => import('./components/AboutModal'));

const pagePreloaders: Partial<Record<Page, () => Promise<unknown>>> = {
  [Page.CATALOG]: () => import('./components/OpticsCatalog'),
  [Page.VISUALIZER]: () => import('./components/BreakoutVisualizer'),
  [Page.TOPOLOGY]: () => import('./components/TopologyLab'),
  [Page.SMART_MATRIX]: () => import('./components/SmartMatrix'),
  [Page.BOM_BUILDER]: () => import('./components/BOMBuilder'),
  [Page.COMPATIBILITY_EXPLAINER]: () => import('./components/SmartCompatibility'),
  [Page.MIGRATION_WIZARD]: () => import('./components/MigrationWizard'),
  [Page.LINK_BUDGET]: () => import('./components/LinkBudgetCalculator'),
  [Page.DBM_INTERPRETER]: () => import('./components/PowerLevelInterpreter'),
  [Page.SIGNAL_INTEGRITY]: () => import('./components/SignalIntegritySandbox'),
  [Page.FORM_FACTOR_EXPLORER]: () => import('./components/FormFactorExplorer'),
  [Page.AI_PLANNER]: () => import('./components/AIClusterPlanner'),
  [Page.CONTENT_IMPROVEMENTS]: () => import('./components/ContentImprovements'),
  [Page.INTERACTIVE_DATASHEETS]: () => import('./components/InteractiveDatasheet'),
  [Page.SETTINGS]: () => import('./components/AdminPanel'),
};

const PageFallback = memo(function PageFallback() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-slate-900">
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
        <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
      </div>
    </div>
  );
});

interface RoutedContentProps {
  activePage: Page;
  activeLearnTab: LearnPageTab;
  onLearnTabChange: (tab: LearnPageTab) => void;
  onNavigate: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
  selectedDatasheetSku: string | null;
  selectedDatasheetSource: string | null;
  linkBudgetParams: { budget?: number; fiberType?: 'SMF' | 'MMF' } | null;
  plannerTopologySeed: PlannerTopologySeed | null;
  featureVisibility: Partial<Record<Page, boolean>>;
  toggleFeatureVisibility: (page: Page) => void;
  resetFeatureVisibility: () => void;
}

const RoutedContent = memo(function RoutedContent({
  activePage,
  activeLearnTab,
  onLearnTabChange,
  onNavigate,
  selectedDatasheetSku,
  selectedDatasheetSource,
  linkBudgetParams,
  plannerTopologySeed,
  featureVisibility,
  toggleFeatureVisibility,
  resetFeatureVisibility,
}: RoutedContentProps) {
  switch (activePage) {
    case Page.LEARN:
      return <LearnSection activeTab={activeLearnTab} onTabChange={onLearnTabChange} />;
    case Page.TOPOLOGY:
      return <TopologyLab onNavigate={onNavigate} initialPlannerSeed={plannerTopologySeed} />;
    case Page.CATALOG:
      return <OpticsCatalog onNavigate={onNavigate} />;
    case Page.VISUALIZER:
      return <BreakoutVisualizer />;
    case Page.SMART_MATRIX:
      return <SmartMatrix />;
    case Page.BOM_BUILDER:
      return <BOMBuilder />;
    case Page.COMPATIBILITY_EXPLAINER:
      return <SmartCompatibility onNavigate={onNavigate} />;
    case Page.MIGRATION_WIZARD:
      return <MigrationWizard />;
    case Page.LINK_BUDGET:
      return <LinkBudgetCalculator initialParams={linkBudgetParams} />;
    case Page.DBM_INTERPRETER:
      return <PowerLevelInterpreter />;
    case Page.SIGNAL_INTEGRITY:
      return <SignalIntegritySandbox />;
    case Page.FORM_FACTOR_EXPLORER:
      return <FormFactorExplorer />;
    case Page.AI_PLANNER:
      return <AIClusterPlanner onNavigate={onNavigate} />;
    case Page.CONTENT_IMPROVEMENTS:
      return <ContentImprovements />;
    case Page.INTERACTIVE_DATASHEETS:
      return <InteractiveDatasheet initialSku={selectedDatasheetSku} initialSourceFeature={selectedDatasheetSource} />;
    case Page.SETTINGS:
      return <AdminPanel featureFlags={featureVisibility} toggleFeature={toggleFeatureVisibility} onReset={resetFeatureVisibility} />;
    default:
      return <LearnSection activeTab={activeLearnTab} onTabChange={onLearnTabChange} />;
  }
});

const App: React.FC = () => {
  const { activePage, navigate } = useNavigation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBacklogOpen, setIsBacklogOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activeLearnTab, setActiveLearnTab] = useState<LearnPageTab>('STRATEGY');
  const [selectedDatasheetSku, setSelectedDatasheetSku] = useState<string | null>(null);
  const [selectedDatasheetSource, setSelectedDatasheetSource] = useState<string | null>(null);
  const [linkBudgetParams, setLinkBudgetParams] = useState<{ budget?: number; fiberType?: 'SMF' | 'MMF' } | null>(null);
  const [plannerTopologySeed, setPlannerTopologySeed] = useState<PlannerTopologySeed | null>(null);
  const {
    featureVisibility,
    toggleFeatureVisibility,
    resetFeatureVisibility,
  } = useLocalAppSettings();

  // Handle Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const preloadPage = useCallback((page: Page) => {
    pagePreloaders[page]?.();
  }, []);

  const handleNavigate = useCallback((page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => {
    preloadPage(page);
    navigate(page);
    if (subTab) {
      setActiveLearnTab(subTab);
    }
    if (sku) {
      setSelectedDatasheetSku(sku);
      setSelectedDatasheetSource(params?.plannerDatasheetSeed?.source ?? null);
    } else if (page !== Page.INTERACTIVE_DATASHEETS) {
      setSelectedDatasheetSku(null);
      setSelectedDatasheetSource(null);
    }
    if (page === Page.LINK_BUDGET && params) {
      setLinkBudgetParams(params);
    } else if (page !== Page.LINK_BUDGET) {
      setLinkBudgetParams(null);
    }
    if (page === Page.TOPOLOGY) {
      setPlannerTopologySeed(params?.plannerTopologySeed ?? null);
    } else {
      setPlannerTopologySeed(null);
    }
  }, [navigate, preloadPage]);

  const footer = useMemo(
    () => (
      <Suspense fallback={null}>
        <SuggestionsFooter onOpenBacklog={() => setIsBacklogOpen(true)} />
      </Suspense>
    ),
    []
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 antialiased">
        {isSearchOpen && (
          <Suspense fallback={null}>
            <GlobalSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={handleNavigate}
            />
          </Suspense>
        )}

        {isBacklogOpen && (
          <Suspense fallback={null}>
            <EngineeringBacklog
              isOpen={isBacklogOpen}
              onClose={() => setIsBacklogOpen(false)}
            />
          </Suspense>
        )}

        {isAboutOpen && (
          <Suspense fallback={null}>
            <AboutModal
              isOpen={isAboutOpen}
              onClose={() => setIsAboutOpen(false)}
            />
          </Suspense>
        )}

        <Sidebar 
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          featureFlags={featureVisibility}
          onOpenAbout={() => setIsAboutOpen(true)}
          onPrefetchPage={preloadPage}
        />

        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-100 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
          {/* Mobile Header */}
          <div className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shrink-0">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 -ml-2"
              >
                <Menu size={24} />
              </button>
              <span className="ml-4 font-bold text-slate-900 dark:text-white tracking-tight uppercase">Optics Master</span>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xs font-mono">⌘K</span>
            </button>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="max-w-[1800px] mx-auto p-4 md:p-8 lg:p-10 pb-20">
                  <Suspense fallback={<PageFallback />}>
                    <RoutedContent
                      activePage={activePage}
                      activeLearnTab={activeLearnTab}
                      onLearnTabChange={setActiveLearnTab}
                      onNavigate={handleNavigate}
                      selectedDatasheetSku={selectedDatasheetSku}
                      selectedDatasheetSource={selectedDatasheetSource}
                      linkBudgetParams={linkBudgetParams}
                      plannerTopologySeed={plannerTopologySeed}
                      featureVisibility={featureVisibility}
                      toggleFeatureVisibility={toggleFeatureVisibility}
                      resetFeatureVisibility={resetFeatureVisibility}
                    />
                  </Suspense>
                  {footer}
              </div>
          </main>
        </div>
      </div>
  );
};

export default App;
