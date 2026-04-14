
import React from 'react';
import { Page } from '../types';
import { MENU_ITEMS } from '../constants';
import { Settings2, Eye, EyeOff, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  featureFlags: Partial<Record<Page, boolean>>;
  toggleFeature: (page: Page) => void;
  onReset: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ featureFlags, toggleFeature, onReset }) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col gap-2 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Settings2 className="text-blue-600 dark:text-blue-400" />
                Workspace Settings
            </h2>
            <button 
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
                <RotateCcw size={16} /> Reset Visibility
            </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
            Manage local workspace visibility for workbench tools on this browser only. These controls are convenience settings, not an authorization boundary.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Feature Visibility Control</h3>
              <p className="text-xs text-slate-500 mt-1">Toggle switches to show or hide modules from the main sidebar.</p>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MENU_ITEMS.map((item) => {
                  const isVisible = featureFlags[item.id as Page] !== false; // Default to true if undefined
                  return (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${isVisible ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className={`font-medium ${isVisible ? 'text-slate-900 dark:text-white' : 'text-slate-500 line-through'}`}>{item.label}</h4>
                                    {!isVisible && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">Hidden</span>}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isVisible}
                                onChange={() => toggleFeature(item.id as Page)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-slate-500 dark:text-slate-400 min-w-[3rem]">
                                {isVisible ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><Eye size={14}/> On</span> : <span className="flex items-center gap-1 text-slate-400"><EyeOff size={14}/> Off</span>}
                            </span>
                        </label>
                    </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

export default AdminPanel;
