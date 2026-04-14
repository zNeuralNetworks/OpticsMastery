
import React from 'react';
import { 
  HelpCircle, 
  Zap, 
  Thermometer, 
  Terminal, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { OPTICS_FAQ_KNOWLEDGE, ARISTA_800G_OPTICS } from '../data/opticsFAQ';

const OpticsFAQ: React.FC = () => {
  return (
    <div className="space-y-12 animate-fade-in pb-24">
      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
          <HelpCircle size={14} /> Knowledge Base / FAQ
        </div>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tightest leading-extra-tight uppercase">
          800G Optics FAQ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed-plus max-w-3xl">
          Consolidated engineering guidance for 800G transceivers, cables, and form factors.
        </p>
      </div>

      {/* Quick Stats / Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-500/20 space-y-4">
          <div className="p-3 bg-blue-600 rounded-2xl w-fit text-white shadow-lg shadow-blue-600/20">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Power Consumption</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {OPTICS_FAQ_KNOWLEDGE.power.note} Maximum draw is <span className="font-bold text-blue-600 dark:text-blue-400">{OPTICS_FAQ_KNOWLEDGE.power.max}</span>.
          </p>
        </div>

        <div className="p-8 bg-orange-50 dark:bg-orange-900/20 rounded-[2rem] border border-orange-100 dark:border-orange-500/20 space-y-4">
          <div className="p-3 bg-orange-600 rounded-2xl w-fit text-white shadow-lg shadow-orange-600/20">
            <Thermometer size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Thermal Advantage</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            {OPTICS_FAQ_KNOWLEDGE.thermal.osfp_vs_qsfpdd} {OPTICS_FAQ_KNOWLEDGE.thermal.advantage}
          </p>
        </div>

        <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-white/5 space-y-4">
          <div className="p-3 bg-slate-900 dark:bg-white rounded-2xl w-fit text-white dark:text-slate-900 shadow-lg">
            <Terminal size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">CLI Configuration</h3>
          <div className="space-y-2">
            {Object.entries(OPTICS_FAQ_KNOWLEDGE.cli).map(([mode, cmd]) => (
              <div key={mode} className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mode}</span>
                <code className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/30 px-2 py-1 rounded mt-1">
                  {cmd}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suffix Decoder */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Suffix Decoder</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(OPTICS_FAQ_KNOWLEDGE.suffixes).map(([key, val]) => (
            <div key={key} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 text-center group hover:border-blue-500/30 transition-all">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">{key}</div>
              <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 800G Product Matrix */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">800G Product Matrix</h2>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-6"></div>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-white/5">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Part Number</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reach</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiber</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Connector</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {ARISTA_800G_OPTICS.map((optic) => (
                <tr key={optic.partNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-6">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{optic.partNumber}</div>
                    {optic.altPartNumber && (
                      <div className="text-[10px] text-slate-400 mt-1">Alt: {optic.altPartNumber}</div>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                      optic.type === 'TRANSCEIVER' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      optic.type === 'DAC' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {optic.type}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">{optic.reach}</td>
                  <td className="p-6 text-sm font-medium text-slate-600 dark:text-slate-400">{optic.fiberType}</td>
                  <td className="p-6 text-sm font-mono text-slate-600 dark:text-slate-400">{optic.connector}</td>
                  <td className="p-6">
                    <div className="max-w-xs space-y-1">
                      {optic.interopNotes?.map((note, i) => (
                        <div key={i} className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed flex items-start gap-2">
                          <ChevronRight size={12} className="mt-0.5 shrink-0 text-blue-500" />
                          {note}
                        </div>
                      )) || <span className="text-slate-300 dark:text-slate-700">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* External Resources */}
      <div className="p-10 bg-slate-900 dark:bg-white rounded-[2.5rem] text-white dark:text-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-3xl font-black uppercase tracking-tightest">Need more detail?</h3>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Access the full transceivers and cables datasheet.</p>
        </div>
        <a 
          href="https://www.arista.com/en/products/transceivers-cables" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 group"
        >
          Official Datasheet <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default OpticsFAQ;
