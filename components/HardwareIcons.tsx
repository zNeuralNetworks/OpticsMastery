
import React from 'react';

export const Arista7800R4: React.FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 120, height = 160 }) => (
  <svg viewBox="0 0 120 160" className={className} width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="110" height="150" rx="4" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
    <rect x="15" y="15" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="30" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="45" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="60" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="75" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="90" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="105" width="90" height="10" rx="1" fill="#334155" />
    <rect x="15" y="120" width="90" height="10" rx="1" fill="#334155" />
    {/* Fan Trays */}
    <rect x="15" y="135" width="25" height="15" rx="1" fill="#475569" />
    <rect x="47.5" y="135" width="25" height="15" rx="1" fill="#475569" />
    <rect x="80" y="135" width="25" height="15" rx="1" fill="#475569" />
    {/* Branding */}
    <text x="60" y="22" textAnchor="middle" fill="#94A3B8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">ARISTA</text>
  </svg>
);

export const Arista7060X6: React.FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 120, height = 30 }) => (
  <svg viewBox="0 0 120 30" className={className} width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="110" height="20" rx="2" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
    <rect x="10" y="10" width="10" height="10" rx="1" fill="#334155" />
    <rect x="25" y="10" width="80" height="10" rx="1" fill="#0F172A" />
    <circle cx="28" cy="15" r="1" fill="#10B981" />
    <circle cx="32" cy="15" r="1" fill="#10B981" />
    <circle cx="36" cy="15" r="1" fill="#10B981" />
    <text x="105" y="17" textAnchor="middle" fill="#94A3B8" fontSize="4" fontWeight="bold" fontFamily="sans-serif">7060</text>
  </svg>
);

export const GpuRack: React.FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 80, height = 120 }) => (
  <svg viewBox="0 0 80 120" className={className} width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="70" height="110" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <rect x="10" y="15" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="25" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="35" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="45" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="55" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="65" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="75" width="60" height="8" rx="1" fill="#1E293B" />
    <rect x="10" y="85" width="60" height="8" rx="1" fill="#1E293B" />
    {/* GPU Glow */}
    <rect x="15" y="17" width="4" height="4" rx="0.5" fill="#3B82F6" opacity="0.6" />
    <rect x="15" y="27" width="4" height="4" rx="0.5" fill="#3B82F6" opacity="0.6" />
    <rect x="15" y="37" width="4" height="4" rx="0.5" fill="#3B82F6" opacity="0.6" />
    <rect x="15" y="47" width="4" height="4" rx="0.5" fill="#3B82F6" opacity="0.6" />
  </svg>
);

export const StorageNode: React.FC<{ className?: string; width?: number; height?: number }> = ({ className, width = 40, height = 60 }) => (
  <svg viewBox="0 0 40 60" className={className} width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="56" rx="4" fill="#1E293B" stroke="#F97316" strokeWidth="2" />
    <rect x="6" y="8" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <rect x="6" y="16" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <rect x="6" y="24" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <rect x="6" y="32" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <rect x="6" y="40" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <rect x="6" y="48" width="28" height="4" rx="1" fill="#F97316" fillOpacity="0.3" />
    <circle cx="32" cy="10" r="1" fill="#F97316" />
    <circle cx="32" cy="18" r="1" fill="#F97316" />
    <circle cx="32" cy="26" r="1" fill="#F97316" />
    <circle cx="32" cy="34" r="1" fill="#F97316" />
    <circle cx="32" cy="42" r="1" fill="#F97316" />
    <circle cx="32" cy="50" r="1" fill="#F97316" />
  </svg>
);
