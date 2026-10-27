import React from 'react';

export const CircuitHeroIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Background glow orb */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-purple-600/30 rounded-3xl blur-2xl -z-10 animate-electric-pulse" />

      {/* Main Glassmorphic Hardware Card */}
      <div className="relative rounded-2xl border border-blue-500/30 bg-slate-900/85 backdrop-blur-xl p-6 shadow-2xl shadow-blue-900/30 overflow-hidden">
        {/* Top tech header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-blue-300 ml-2 tracking-wider">EC_SYS::POWER_DIAGNOSTICS_v4.2</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            OPTIMIZED -38.4%
          </span>
        </div>

        {/* Center SVG Circuit & Energy Flow diagram */}
        <div className="py-4">
          <svg viewBox="0 0 420 220" className="w-full h-auto text-blue-400 select-none">
            <defs>
              <linearGradient id="bluePurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
              <linearGradient id="pulseGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid subtle lines */}
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#smallGrid)" opacity="0.6" />

            {/* Circuit Bus Bars */}
            <path d="M 40 110 L 100 110 L 130 60 L 220 60 L 250 110 L 380 110" fill="none" stroke="#334155" strokeWidth="3" />
            <path d="M 100 110 L 130 160 L 220 160 L 250 110" fill="none" stroke="#334155" strokeWidth="3" />
            
            {/* Active Neon Paths */}
            <path d="M 40 110 L 100 110 L 130 60 L 220 60 L 250 110 L 380 110" fill="none" stroke="url(#bluePurple)" strokeWidth="2.5" strokeDasharray="8 6" filter="url(#glow)">
              <animate attributeName="stroke-dashoffset" values="50;0" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M 100 110 L 130 160 L 220 160 L 250 110" fill="none" stroke="url(#pulseGlow)" strokeWidth="2" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;40" dur="3s" repeatCount="indefinite" />
            </path>

            {/* Power Source Node (Grid) */}
            <g transform="translate(40, 110)">
              <circle r="18" fill="#0F172A" stroke="#3B82F6" strokeWidth="2.5" />
              <path d="M -4 -8 L 4 0 L -2 2 L 4 10" fill="none" stroke="#60A5FA" strokeWidth="2" />
              <text x="0" y="30" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">Main Grid</text>
            </g>

            {/* Microprocessor Core / Audit Node */}
            <g transform="translate(175, 60)">
              <rect x="-30" y="-22" width="60" height="44" rx="8" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" />
              <text x="0" y="-3" textAnchor="middle" fill="#E0E7FF" fontSize="11" fontWeight="bold">SMART VFD</text>
              <text x="0" y="11" textAnchor="middle" fill="#A5B4FC" fontSize="9">98.2% Eff.</text>
              {/* Micro pins */}
              <line x1="-30" y1="-10" x2="-35" y2="-10" stroke="#818CF8" strokeWidth="2" />
              <line x1="-30" y1="0" x2="-35" y2="0" stroke="#818CF8" strokeWidth="2" />
              <line x1="-30" y1="10" x2="-35" y2="10" stroke="#818CF8" strokeWidth="2" />
              <line x1="30" y1="-10" x2="35" y2="-10" stroke="#818CF8" strokeWidth="2" />
              <line x1="30" y1="0" x2="35" y2="0" stroke="#818CF8" strokeWidth="2" />
              <line x1="30" y1="10" x2="35" y2="10" stroke="#818CF8" strokeWidth="2" />
            </g>

            {/* Capacitor Bank / Power Factor Node */}
            <g transform="translate(175, 160)">
              <rect x="-26" y="-18" width="52" height="36" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.8" />
              <text x="0" y="-2" textAnchor="middle" fill="#67E8F9" fontSize="10" fontWeight="600">CAP BANK</text>
              <text x="0" y="11" textAnchor="middle" fill="#22D3EE" fontSize="8.5">PF = 0.99</text>
            </g>

            {/* Load Output Node */}
            <g transform="translate(380, 110)">
              <circle r="18" fill="#0F172A" stroke="#A855F7" strokeWidth="2.5" />
              <circle r="10" fill="#7C3AED" opacity="0.3" />
              <path d="M -5 -5 L 5 5 M -5 5 L 5 -5" stroke="#C084FC" strokeWidth="2" />
              <text x="0" y="30" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">Consolidated</text>
            </g>

            {/* Dynamic pulsating indicator dots */}
            <circle cx="100" cy="110" r="4" fill="#60A5FA" filter="url(#glow)" />
            <circle cx="250" cy="110" r="4" fill="#C084FC" filter="url(#glow)" />
          </svg>
        </div>

        {/* Real-time telemetry metrics below */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
            <span className="block text-xs text-slate-400">Harmonics (THD)</span>
            <span className="text-base font-bold text-cyan-400 font-mono">1.8%</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Safe Limit</span>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
            <span className="block text-xs text-slate-400">Power Factor</span>
            <span className="text-base font-bold text-indigo-400 font-mono">0.992</span>
            <span className="text-[10px] text-emerald-400 block font-medium">Near Unity</span>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
            <span className="block text-xs text-slate-400">Peak Load Saved</span>
            <span className="text-base font-bold text-purple-400 font-mono">42 kW</span>
            <span className="text-[10px] text-emerald-400 block font-medium">-38% Bill Cut</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnergyMeterGraphic: React.FC<{ percentage?: number; className?: string }> = ({
  percentage = 74,
  className = ''
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#meterGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * percentage) / 100}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold font-heading text-white">{percentage}%</span>
          <span className="text-[10px] uppercase font-semibold text-blue-300 tracking-wider">Efficiency</span>
        </div>
      </div>
    </div>
  );
};
