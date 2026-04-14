
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowRight, X, Cpu } from 'lucide-react';
import { Page, LearnPageTab, AppNavigationParams } from '../types';
import { SEARCH_ITEMS, SearchItem } from '../data/searchIndex';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, subTab?: LearnPageTab, sku?: string, params?: AppNavigationParams) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [plannerSnapshotItems, setPlannerSnapshotItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      try {
        const saved = localStorage.getItem('ai_planner_snapshots');
        const parsed = saved ? JSON.parse(saved) : [];
        const items: SearchItem[] = parsed.map((snapshot: { id: string; name: string; state: { selectedGpuId: string; gpuCount: number; fabricProfileId: string; scope: string } }) => ({
          id: `planner-snapshot-${snapshot.id}`,
          title: `Planner Snapshot: ${snapshot.name}`,
          description: `${snapshot.state.selectedGpuId} · ${snapshot.state.gpuCount} GPUs · ${snapshot.state.fabricProfileId} · ${snapshot.state.scope}`,
          type: 'TOOL',
          icon: Cpu,
          page: Page.AI_PLANNER,
          params: {
            plannerSnapshotRef: snapshot.id,
          },
        }));
        setPlannerSnapshotItems(items);
      } catch (error) {
        console.warn('Failed to load AI planner snapshots for search:', error);
        setPlannerSnapshotItems([]);
      }
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const allItems = [...plannerSnapshotItems, ...SEARCH_ITEMS];
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [plannerSnapshotItems, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
        e.preventDefault();
      if (filteredItems[selectedIndex]) {
        const item = filteredItems[selectedIndex];
        onNavigate(item.page, item.subTab, undefined, item.params);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in ring-1 ring-black/5 dark:ring-white/10">
        
        {/* Input Header */}
        <div className="flex items-center px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="text-slate-400 mr-3" size={20} />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search resources, tools, or topics..." 
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-lg"
          />
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">ESC</span>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={18}/></button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.page, item.subTab, undefined, item.params);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex 
                    ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/30' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-md mr-4 ${index === selectedIndex ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${index === selectedIndex ? 'text-blue-700 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {index === selectedIndex && (
                    <ArrowRight size={16} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
          <div className="flex gap-4">
            <span><strong className="text-slate-600 dark:text-slate-400">↑↓</strong> to navigate</span>
            <span><strong className="text-slate-600 dark:text-slate-400">↵</strong> to select</span>
          </div>
          <span>Optics Master</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
