import React from 'react';

export const SvgSmfMmfDiagram: React.FC = () => (
  <svg viewBox="0 0 400 120" className="w-full h-auto font-sans">
    <rect x="10" y="10" width="380" height="40" rx="4" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
    <text x="20" y="25" className="text-[10px] fill-slate-500 font-bold uppercase">Multimode (MMF)</text>
    <path d="M 10 30 L 50 15 L 120 45 L 200 15 L 280 45 L 350 15 L 390 30" fill="none" className="stroke-blue-500" strokeWidth="2" />
    <path d="M 10 30 L 80 45 L 150 15 L 230 45 L 310 15 L 390 30" fill="none" className="stroke-blue-400 opacity-30" strokeWidth="1" strokeDasharray="4 2" />
    
    <rect x="10" y="70" width="380" height="40" rx="4" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
    <text x="20" y="85" className="text-[10px] fill-slate-500 font-bold uppercase">Singlemode (SMF)</text>
    <line x1="10" y1="90" x2="390" y2="90" className="stroke-yellow-500" strokeWidth="2" />
    <circle cx="200" cy="90" r="2" className="fill-yellow-600 animate-pulse" />
  </svg>
);

export const SvgReachScale: React.FC = () => (
  <svg viewBox="0 0 400 80" className="w-full h-auto font-sans select-none pointer-events-none">
    {/* Horizontal Axis */}
    <line x1="20" y1="50" x2="380" y2="50" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
    
    {/* Ticks and Labels */}
    {[
      { x: 30, l: "SR", d: "≈ 100m", c: "fill-blue-500" },
      { x: 100, l: "DR", d: "≈ 500m", c: "fill-yellow-600 dark:fill-yellow-500" },
      { x: 220, l: "LR", d: "≈ 10km", c: "fill-orange-500" },
      { x: 360, l: "ZR", d: "≈ 80km+", c: "fill-purple-500" }
    ].map((m, i) => (
      <g key={i}>
        {/* Tick Mark */}
        <line x1={m.x} y1="45" x2={m.x} y2="55" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" />
        
        {/* Reach Type Label */}
        <text x={m.x} y="30" textAnchor="middle" className={`text-[11px] font-black uppercase tracking-tighter ${m.c}`}>
          {m.l}
        </text>
        
        {/* Distance Value */}
        <text x={m.x} y="72" textAnchor="middle" className="text-[10px] font-mono font-bold fill-slate-500 dark:fill-slate-400">
          {m.d}
        </text>
      </g>
    ))}

    {/* Logarithmic sense indicator (Visual Only) */}
    <path d="M 20 50 L 15 50" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
    <path d="M 380 50 L 385 50" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
  </svg>
);

export const SvgConnectorPolish: React.FC = () => (
  <svg viewBox="0 0 400 80" className="w-full h-auto font-sans">
    {/* UPC Side */}
    <g transform="translate(80, 40)">
      <rect x="-40" y="-10" width="40" height="20" className="fill-blue-600" />
      <path d="M 0 -10 L 5 -10 L 5 10 L 0 10 Z" className="fill-slate-300 dark:fill-slate-600" />
      <text x="-20" y="25" textAnchor="middle" className="text-[10px] font-bold fill-blue-600 uppercase">UPC (Flat)</text>
    </g>
    {/* APC Side */}
    <g transform="translate(320, 40)">
      <rect x="-40" y="-10" width="40" height="20" className="fill-green-600" />
      <path d="M 0 -10 L 5 -12 L 5 8 L 0 10 Z" className="fill-slate-300 dark:fill-slate-600" />
      <text x="-20" y="25" textAnchor="middle" className="text-[10px] font-bold fill-green-600 uppercase">APC (Angled)</text>
    </g>
    <text x="200" y="45" textAnchor="middle" className="text-[10px] fill-red-500 font-black">DO NOT MATE</text>
  </svg>
);

export const SvgPolarityLogic: React.FC = () => (
  <svg viewBox="0 0 400 80" className="w-full h-auto font-sans">
    <text x="20" y="15" className="text-[9px] font-bold fill-slate-500 uppercase tracking-widest">Type B (Flipped)</text>
    <g transform="translate(50, 30)">
      {[0, 10, 20].map(y => (
        <g key={y}>
          <circle cx="0" cy={y} r="3" className="fill-blue-500" />
          <path d={`M 5 ${y} L 295 ${20 - y}`} fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1" />
          <circle cx="300" cy={20 - y} r="3" className="fill-blue-500" />
        </g>
      ))}
    </g>
  </svg>
);

export const SvgNrzPam4: React.FC = () => (
  <svg viewBox="0 0 800 240" className="w-full h-auto font-sans">
    <line x1="400" y1="20" x2="400" y2="200" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
    <g transform="translate(40, 20)">
      <text x="0" y="10" className="text-[14px] fill-slate-400 font-bold uppercase tracking-widest">NRZ (Binary)</text>
      <path d="M 60 150 L 120 150 L 120 30 L 210 30 L 210 150 L 300 150" fill="none" className="stroke-slate-600 dark:stroke-slate-300" strokeWidth="4" strokeLinejoin="round" />
      <text x="140" y="200" className="text-[13px] fill-slate-400 uppercase font-bold">1 Bit per Symbol</text>
    </g>
    <g transform="translate(440, 20)">
      <text x="0" y="10" className="text-[14px] fill-blue-500 font-bold uppercase tracking-widest">PAM4 (4-Level)</text>
      <path d="M 60 150 L 110 150 L 110 30 L 170 30 L 170 110 L 230 110 L 230 70 L 290 70" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinejoin="round" />
      <text x="120" y="200" className="text-[13px] fill-blue-50 uppercase font-bold">2 Bits per Symbol</text>
    </g>
  </svg>
);

export const SvgLaneConcept: React.FC = () => (
  <svg viewBox="0 0 400 160" className="w-full h-auto font-sans">
    <g transform="translate(10, 20)">
      <rect width="100" height="30" rx="2" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
      <text x="5" y="-5" className="text-[9px] fill-slate-400 font-bold">SFP (1-Lane)</text>
      <line x1="10" y1="15" x2="90" y2="15" className="stroke-blue-500" strokeWidth="3" />
    </g>
    <g transform="translate(140, 20)">
      <rect width="120" height="60" rx="2" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
      <text x="5" y="-5" className="text-[9px] fill-slate-400 font-bold">QSFP (4-Lane)</text>
      {[10, 22, 34, 46].map((y, i) => (
        <line key={i} x1="10" y1={y+2} x2="110" y2={y+2} className="stroke-indigo-500" strokeWidth="2" />
      ))}
    </g>
    <g transform="translate(290, 20)">
      <rect width="100" height="120" rx="2" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
      <text x="5" y="-5" className="text-[9px] fill-slate-400 font-bold uppercase">OSFP (8-Lane)</text>
      {[10, 22, 34, 46, 58, 70, 82, 94].map((y, i) => (
        <line key={i} x1="10" y1={y+10} x2="90" y2={y+10} className="stroke-fuchsia-500" strokeWidth="2" />
      ))}
    </g>
  </svg>
);

export const SvgBudgetArithmetic: React.FC = () => (
  <svg viewBox="0 0 400 80" className="w-full h-auto font-sans">
    <rect x="20" y="30" width="360" height="20" rx="4" className="fill-slate-200 dark:fill-slate-800" />
    <rect x="20" y="30" width="280" height="20" rx="4" className="fill-blue-500/20 stroke-blue-500" />
    <text x="160" y="44" textAnchor="middle" className="text-[9px] font-bold fill-blue-600 dark:fill-blue-400">Optical Budget (Tx Power)</text>
    <path d="M 300 30 L 300 50" className="stroke-red-500" strokeWidth="2" strokeDasharray="2 2" />
    <text x="340" y="44" textAnchor="middle" className="text-[9px] font-bold fill-red-500">Loss (Connectors/Fiber)</text>
    <text x="200" y="70" textAnchor="middle" className="text-[10px] font-black fill-slate-500 uppercase tracking-tighter">Result: Rx Power Level</text>
  </svg>
);

export const SvgBreakoutDiagram: React.FC = () => (
  <svg viewBox="0 0 400 100" className="w-full h-auto font-sans">
    <rect x="10" y="40" width="60" height="20" rx="2" className="fill-blue-600" />
    <text x="40" y="53" textAnchor="middle" className="text-[9px] fill-white font-bold">400G Port</text>
    {[10, 30, 50, 70].map((y, i) => (
      <g key={i}>
        <path d={`M 70 50 L 250 ${y+10}`} fill="none" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1" />
        <rect x="250" y={y+2} width="50" height="16" rx="2" className="fill-slate-200 dark:fill-slate-800" />
        <text x="275" y={y+13} textAnchor="middle" className="text-[8px] font-bold fill-slate-600 dark:fill-slate-400">100G Host</text>
      </g>
    ))}
  </svg>
);

export const SvgDomRange: React.FC = () => (
  <svg viewBox="0 0 400 60" className="w-full h-auto font-sans">
    <rect x="20" y="30" width="360" height="12" rx="6" className="fill-slate-200 dark:fill-slate-800" />
    <rect x="120" y="30" width="160" height="12" rx="0" className="fill-green-500/40" />
    <rect x="280" y="30" width="60" height="12" rx="0" className="fill-yellow-500/40" />
    <rect x="340" y="30" width="40" height="12" rx="6" className="fill-red-500/40" />
    <text x="200" y="25" textAnchor="middle" className="text-[9px] font-bold fill-green-600">Optimal Range</text>
    <text x="360" y="25" textAnchor="middle" className="text-[9px] font-bold fill-red-600">Critical Low</text>
    <circle cx="200" cy="36" r="4" className="fill-white stroke-slate-400" />
  </svg>
);