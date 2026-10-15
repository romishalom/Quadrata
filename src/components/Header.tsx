import React from 'react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onNewGame: () => void;
  gameModeLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewGame,
}) => {
  const navTabs = [
    { id: 'play', label: 'Play' },
    { id: 'game-modes', label: 'Game Modes' },
    { id: 'about', label: 'About' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/85 backdrop-blur-2xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
      {/* Top Navigation Row */}
      <div className="h-11 w-full px-4 sm:px-6 md:px-10 mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <button
          onClick={() => onSelectTab('play')}
          className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
        >
          <img
            alt="Quadrata Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1VTz8_nJnXiX_6pEdVr8eJIDmRRz1FZoNcKxHgu2UyDLysBHpYlPI_KwyUUwiS3_mfo6MHd1_pxO8D9p3E6xQL-VlqIQ8Fh1JIz3lO9zoHWUCUDuhit2bxeY2r9aY0rJ02JraQTQAnylmiLmVHjvEq8pfKhj-ywQSHSlEMHHJJ8doUipT74aKuiK-H8k2capvW-eyJC-r-1U5J9hsnQKSvN-Ek9kJaBJM8jnNF8BmIVpZjyqdy6CYkGMyI"
          />
          <span className="text-[15px] leading-[18px] tracking-tight font-semibold text-[#e4e2e4]">
            Quadrata
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#1b1b1d]/70 px-1 py-1 rounded-full border border-white/5">
          {navTabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1 text-[13px] font-medium rounded-full transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2a2a2c] text-white font-semibold shadow-sm'
                    : 'text-[#c1c6d5] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Quick New Game Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewGame}
            type="button"
            className="px-4 py-1 rounded-full bg-[#0066cc] text-white text-[13px] font-semibold hover:bg-[#2997ff] transition-all duration-150 active:scale-95 shadow-[0_2px_8px_rgba(0,102,204,0.3)] whitespace-nowrap"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Sub-Header HUD Bar */}
      <div className="h-9 w-full px-4 sm:px-6 md:px-10 mx-auto bg-[#0e0e10]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-between text-xs text-[#c1c6d5]">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse"></span>
          <span className="font-medium tracking-wide">Grid Session active</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#8b919e]">
          <span>Sudoku 9x9 Engine</span>
          <span>•</span>
          <span>v2.4.0</span>
        </div>
      </div>
    </header>
  );
};
