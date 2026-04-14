import React from 'react';

export const SvgStrategyWheel: React.FC = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full max-w-[300px] mx-auto drop-shadow-2xl">
    <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
    <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
    <g className="animate-spin-slow origin-center">
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line key={angle} x1="200" y1="200" x2={200 + 180 * Math.cos(angle * Math.PI / 180)} y2={200 + 180 * Math.sin(angle * Math.PI / 180)} stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
      ))}
    </g>
    <circle cx="200" cy="200" r="60" className="fill-blue-600 shadow-lg" />
    <text x="200" y="205" textAnchor="middle" className="fill-white font-black text-[12px] uppercase tracking-widest">Strategy</text>
  </svg>
);

export const SvgSignalModulation: React.FC = () => (
  <svg viewBox="0 0 400 150" className="w-full h-24">
    <path d="M 0 75 Q 25 25 50 75 T 100 75 T 150 75 T 200 75" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
    <path d="M 200 75 L 220 25 L 240 125 L 260 25 L 280 125 L 300 25" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" />
    <text x="50" y="140" className="text-[10px] fill-slate-400 font-bold uppercase tracking-widest">NRZ (Binary)</text>
    <text x="250" y="140" className="text-[10px] fill-slate-400 font-bold uppercase tracking-widest">PAM4 (Multi-Level)</text>
  </svg>
);

export const SvgFiberCore: React.FC = () => (
  <svg viewBox="0 0 400 120" className="w-full h-24">
    <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
    <circle cx="60" cy="60" r="8" className="fill-blue-500" />
    <circle cx="240" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
    <circle cx="240" cy="60" r="25" className="fill-indigo-500/30 text-indigo-500" stroke="currentColor" strokeWidth="1" />
    <text x="60" y="115" textAnchor="middle" className="text-[9px] fill-slate-500 font-black uppercase tracking-widest">Single-Mode (9µm)</text>
    <text x="240" y="115" textAnchor="middle" className="text-[9px] fill-slate-500 font-black uppercase tracking-widest">Multi-Mode (50µm)</text>
  </svg>
);

export const SvgPolarityLogic: React.FC = () => (
  <svg viewBox="0 0 400 100" className="w-full h-16">
    <rect x="20" y="40" width="100" height="20" rx="4" className="fill-slate-200 dark:fill-slate-800" />
    <rect x="280" y="40" width="100" height="20" rx="4" className="fill-slate-200 dark:fill-slate-800" />
    <path d="M 120 45 L 280 55 M 120 55 L 280 45" stroke="currentColor" strokeWidth="1" className="text-blue-500" strokeDasharray="4 2" />
    <text x="200" y="30" textAnchor="middle" className="text-[10px] fill-blue-500 font-black uppercase tracking-widest">Type B (Flipped)</text>
  </svg>
);

export const SvgLaneConcept: React.FC = () => (
  <svg viewBox="0 0 400 120" className="w-full h-24">
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x="50" y={20 + i * 22} width="300" height="12" rx="6" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1" />
    ))}
    <text x="200" y="115" textAnchor="middle" className="text-[10px] fill-slate-500 font-black uppercase tracking-widest">4-Lane Parallel Interface (e.g. SR4/DR4)</text>
  </svg>
);

export const SvgBreakoutDiagram: React.FC = () => (
  <svg viewBox="0 0 400 150" className="w-full h-32">
    <rect x="20" y="50" width="60" height="50" rx="8" className="fill-slate-900" />
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        <path d={`M 80 75 L 200 ${30 + i * 30}`} stroke="currentColor" strokeWidth="1" className="text-blue-500/40" />
        <rect x="200" y={20 + i * 30} width="40" height="20" rx="4" className="fill-blue-600" />
      </g>
    ))}
    <text x="50" y="125" textAnchor="middle" className="text-[9px] fill-slate-500 font-bold uppercase tracking-widest">400G Port</text>
    <text x="220" y="145" textAnchor="middle" className="text-[9px] fill-slate-500 font-bold uppercase tracking-widest">4x 100G Breakout</text>
  </svg>
);

export const SvgDomRange: React.FC = () => (
  <svg viewBox="0 0 400 100" className="w-full h-16">
    <rect x="20" y="40" width="360" height="20" rx="10" className="fill-slate-100 dark:fill-slate-800" />
    <rect x="100" y="40" width="200" height="20" rx="0" className="fill-green-500/20" />
    <line x1="200" y1="30" x2="200" y2="70" stroke="currentColor" strokeWidth="2" className="text-blue-600" />
    <text x="200" y="25" textAnchor="middle" className="text-[10px] fill-blue-600 font-black uppercase tracking-widest">Optimal RX Power</text>
    <text x="60" y="75" textAnchor="middle" className="text-[9px] fill-red-500 font-bold uppercase">Low Alarm</text>
    <text x="340" y="75" textAnchor="middle" className="text-[9px] fill-red-500 font-bold uppercase">High Alarm</text>
  </svg>
);
