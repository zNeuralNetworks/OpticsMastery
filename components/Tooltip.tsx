import React from 'react';

interface TooltipProps {
  term: string;
  definition: string;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ term, definition, className = "" }) => {
  return (
    <span className={`group relative inline-block cursor-help border-b border-dotted border-slate-500 hover:border-blue-400 hover:text-blue-100 transition-colors ${className}`}>
      {term}
      <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-slate-300 text-xs font-normal rounded-lg border border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-50 pointer-events-none text-center leading-relaxed backdrop-blur-xl">
        {definition}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-700"></span>
      </span>
    </span>
  );
};

export default Tooltip;