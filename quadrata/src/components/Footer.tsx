import React from 'react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-[#0e0e10] py-6 shadow-[0_-1px_12px_rgba(0,0,0,0.3)] border-t border-white/5 mt-auto">
      <div className="w-full px-4 sm:px-6 md:px-10 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <span className="text-[11px] text-[#c1c6d5] tracking-wider uppercase font-medium">
            © 2025 Quadrata Engine. California Minimal.
          </span>
          <span className="hidden md:inline text-[#c1c6d5] text-[11px]">•</span>
          <span className="text-[11px] text-[#8b919e]">v2.4.0 Metal Core</span>
        </div>

        {/* Center Keyboard Shortcuts Guide */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[12px] text-[#c1c6d5]">
          <span className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2c] text-white text-[10px] font-mono border border-white/10">
              Arrows / WASD
            </kbd>
            <span>Move</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2c] text-white text-[10px] font-mono border border-white/10">
              1–3
            </kbd>
            <span>Select</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2c] text-white text-[10px] font-mono border border-white/10">
              Enter
            </kbd>
            <span>Place</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2c] text-white text-[10px] font-mono border border-white/10">
              Space
            </kbd>
            <span>Rotate</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a2c] text-white text-[10px] font-mono border border-white/10">
              Z
            </kbd>
            <span>Undo</span>
          </span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4 text-[13px]">
          <button
            onClick={() => onSelectTab('about')}
            className="text-[#c1c6d5] hover:text-white transition-colors"
          >
            Philosophy & Scoring
          </button>
          <button
            onClick={() => onSelectTab('game-modes')}
            className="text-[#c1c6d5] hover:text-white transition-colors"
          >
            Modes
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className="text-[#c1c6d5] hover:text-white transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </footer>
  );
};
