
import React, { useMemo, useState } from 'react';
import { 
  Hexagon, 
  X, 
  Moon, 
  Sun, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Search as SearchIcon,
  Info,
  Settings2
} from 'lucide-react';
import { Page } from '../types';
import { MENU_ITEMS } from '../constants';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  featureFlags: Partial<Record<Page, boolean>>;
  onOpenAbout: () => void;
  onPrefetchPage?: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  featureFlags, 
  onOpenAbout,
  onPrefetchPage,
}) => {
  const { activePage, navigate } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');

  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'LEARN': true,
    'PRACTICE': true,
    'REFERENCE': true,
    'DESIGN': true,
  });





  const handlePageSelect = (page: Page) => {
    navigate(page);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 1. Filter items based on search query (Label or Description)
  const filteredMenuItems = useMemo(() => MENU_ITEMS.filter(item => {
    if (item.category === 'FOOTER') return false; 
    
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isVisible = featureFlags[item.id] !== false;
    return matchesSearch && isVisible;
  }), [featureFlags, searchQuery]);

  // 2. Group items into categories for rendering
    const categories = useMemo(() => filteredMenuItems.reduce((acc: Record<string, typeof MENU_ITEMS>, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {}), [filteredMenuItems]);

  const categoryOrder = ['LEARN', 'PRACTICE', 'REFERENCE', 'DESIGN'];
  const categoryLabels: Record<string, string> = {
    LEARN: 'Learn',
    PRACTICE: 'Practice',
    REFERENCE: 'Reference',
    DESIGN: 'Design',
  };
  const roadmapItem = MENU_ITEMS.find(item => item.id === Page.CONTENT_IMPROVEMENTS);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-72 
          bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 
          flex flex-col shadow-2xl lg:shadow-none
          transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:block
        `}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-gradient-to-r dark:from-blue-950/30 dark:to-transparent shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Hexagon className="text-white" size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-base tracking-tight leading-none uppercase">Optics</h1>
              <p className="aom-accent text-[10px] font-mono mt-1 tracking-wider uppercase">Master Engine</p>
            </div>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Quick Search */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input 
              type="text"
              placeholder="Search tools & resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg pl-9 pr-8 py-2.5 outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
          


          {categoryOrder.map(catName => {
            const items = categories[catName];
            // 3. Hide empty groups
            if (!items || items.length === 0) return null;

            const isExpanded = expandedCategories[catName];

            return (
              <div key={catName} className="space-y-1">
                <button 
                  onClick={() => toggleCategory(catName)}
                  className="w-full flex items-center justify-between px-3 py-2 micro-label hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {categoryLabels[catName] ?? catName}
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                
                {isExpanded && (
                  <div className="space-y-1">
                    {items.map((item) => {
                      const isActive = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageSelect(item.id)}
                          onMouseEnter={() => onPrefetchPage?.(item.id)}
                          onFocus={() => onPrefetchPage?.(item.id)}
                          className={`
                            w-full flex items-start space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-left border
                            ${isActive 
                              ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-100 shadow-sm' 
                              : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
                          `}
                        >
                          <item.icon 
                            size={18} 
                            className={`mt-0.5 transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                          />
                          <div>
                            <span className={`block text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                            <span className={`text-[9px] block mt-0.5 ${isActive ? 'text-blue-600/80 dark:text-blue-300' : 'text-slate-500 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-500'}`}>
                              {item.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Search Result Empty State */}
          {searchQuery && filteredMenuItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-slate-400 dark:text-slate-600 mb-2">
                <SearchIcon size={24} className="mx-auto opacity-20" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">No matches found</p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="px-3 py-2 micro-label">Workspace</div>
            <button
              onClick={() => handlePageSelect(Page.SETTINGS)}
              className={`
                w-full flex items-start space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-left border mt-1
                ${activePage === Page.SETTINGS
                  ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-100 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              <Settings2
                size={18}
                className={`mt-0.5 transition-colors duration-200 ${activePage === Page.SETTINGS ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
              />
              <div>
                <span className="block text-xs font-medium">Workspace Settings</span>
                <span className="text-[9px] block mt-0.5 opacity-70">Local visibility controls</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer & Toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
          
          <div className="space-y-1 mb-3">
              {/* Subtle Roadmap Link */}
              {roadmapItem && (
                <button 
                  onClick={() => handlePageSelect(Page.CONTENT_IMPROVEMENTS)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${activePage === Page.CONTENT_IMPROVEMENTS ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <Sparkles size={11} />
                  Platform Roadmap
                </button>
              )}

              {/* NEW: About Trigger */}
              <button 
                onClick={onOpenAbout}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Info size={11} />
                Engineering Philosophy
              </button>
          </div>

          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors mb-3 shadow-sm"
          >
            <span className="text-xs font-medium">Theme</span>
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Settings2 size={14} className="text-blue-600 dark:text-blue-400" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Workspace settings are local to this browser.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
