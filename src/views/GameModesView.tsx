import React, { useState } from 'react';
import { GameMode } from '../types/game';

interface GameModesViewProps {
  onSelectMode: (mode: GameMode) => void;
  onSelectTab: (tab: string) => void;
}

export const GameModesView: React.FC<GameModesViewProps> = ({
  onSelectMode,
  onSelectTab
}) => {
  // Mini board preview coordinate patterns
  const [boardCoords, setBoardCoords] = useState<[number, number][]>([
    [0, 0], [0, 1], [0, 2],
    [1, 0], [1, 1],
    [4, 4], [4, 5], [5, 4], [5, 5],
    [6, 2], [7, 2], [8, 2],
    [6, 7], [7, 7], [8, 7], [8, 8],
    [2, 6], [2, 7]
  ]);

  const ghostCoords: [number, number][] = [
    [3, 0], [3, 1], [3, 2]
  ];

  const handleToggleSimCell = (r: number, c: number) => {
    setBoardCoords(prev => {
      const exists = prev.some(([fr, fc]) => fr === r && fc === c);
      if (exists) {
        return prev.filter(([fr, fc]) => !(fr === r && fc === c));
      } else {
        return [...prev, [r, c]];
      }
    });
  };

  const isFilled = (r: number, c: number) => boardCoords.some(([fr, fc]) => fr === r && fc === c);
  const isGhost = (r: number, c: number) => ghostCoords.some(([gr, gc]) => gr === r && gc === c);

  return (
    <div className="relative w-full overflow-hidden bg-[#131315] text-[#e4e2e4]">
      {/* Ambient Background Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#0066cc]/20 via-[#2997ff]/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-96 -left-48 w-96 h-96 bg-[#5e5ce6]/10 blur-3xl pointer-events-none -z-10"></div>

      {/* HERO SECTION */}
      <section className="w-full px-4 sm:px-6 md:px-10 pt-10 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2a2a2c]/70 backdrop-blur-md shadow-sm mb-6 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-[#2997ff] animate-pulse"></span>
          <span className="text-[12px] font-semibold text-[#a3c9ff] uppercase tracking-widest">
            Version 2.4 Metal Core
          </span>
          <span className="text-[#c1c6d5] text-[10px]">•</span>
          <span className="text-[12px] text-[#c1c6d5] font-medium">Architectural 9x9 Engine</span>
        </div>

        {/* Grand Statement */}
        <h1 className="text-[36px] sm:text-[48px] md:text-[68px] leading-[42px] sm:leading-[54px] md:leading-[74px] tracking-tight md:tracking-[-0.035em] text-white max-w-4xl font-bold mb-4">
          Pure Logic.{' '}
          <span className="bg-gradient-to-r from-[#2997ff] via-[#a3c9ff] to-[#64d2ff] bg-clip-text text-transparent">
            Fluid Motion.
          </span>
        </h1>

        <p className="text-[16px] md:text-[21px] leading-[24px] md:leading-[30px] text-[#c1c6d5] max-w-2xl mx-auto mb-8 font-normal">
          The timeless spatial meditation of polyomino placement meets precision engineered 9×9 Sudoku mechanics. Grounded in volcanic glass, tuned for absolute focus.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={() => onSelectMode('classic')}
            className="px-8 py-3.5 rounded-full bg-[#0066cc] text-white text-[15px] font-semibold hover:bg-[#2997ff] transition-all duration-200 active:scale-95 shadow-[0_12px_28px_rgba(0,102,204,0.35)] flex items-center gap-2 group"
          >
            <span>Play Classic Now</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>

          <a
            href="#modes"
            className="px-6 py-3.5 rounded-full bg-[#2a2a2c]/80 hover:bg-[#353437] text-[#e4e2e4] text-[15px] font-semibold backdrop-blur-xl transition-all duration-200 active:scale-95 flex items-center gap-2 border border-white/5"
          >
            <span>Explore 4 Modes</span>
            <span className="material-symbols-outlined text-[18px] text-[#c1c6d5]">expand_more</span>
          </a>
        </div>

        {/* 3D Board Showcase Stage */}
        <div className="relative w-full max-w-3xl mx-auto p-4 md:p-6 rounded-3xl bg-[#0e0e10]/80 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] border border-white/10">
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#353437]"></span>
              <span className="ml-2 text-[10px] text-[#c1c6d5] tracking-wider uppercase font-medium">
                Live Canvas Simulation
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px]">
              <span className="text-[#c1c6d5]">
                Tap cells to test patterns
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#2997ff]/15 text-[#2997ff] text-[10px] font-semibold uppercase">
                Interactive
              </span>
            </div>
          </div>

          {/* 9x9 Architectural Matrix */}
          <div className="relative aspect-square w-full max-w-[460px] mx-auto p-3 rounded-2xl bg-[#252527] shadow-inner border border-white/5">
            <div className="grid grid-cols-9 grid-rows-9 gap-[2px] h-full w-full">
              {Array.from({ length: 9 }).map((_, r) =>
                Array.from({ length: 9 }).map((_, c) => {
                  const filled = isFilled(r, c);
                  const ghost = isGhost(r, c);

                  const isQuadrantBorderRight = c === 2 || c === 5 ? 'mr-[2px]' : '';
                  const isQuadrantBorderBottom = r === 2 || r === 5 ? 'mb-[2px]' : '';

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleToggleSimCell(r, c)}
                      className={`rounded-sm transition-all duration-300 ${isQuadrantBorderRight} ${isQuadrantBorderBottom} ${
                        filled
                          ? 'bg-gradient-to-br from-[#2997ff] to-[#0066cc] shadow-sm'
                          : ghost
                          ? 'bg-[#2997ff]/25 ring-1 ring-[#2997ff] animate-pulse'
                          : 'bg-white/[0.04] hover:bg-white/[0.08]'
                      }`}
                      title={`Cell (${r},${c})`}
                    />
                  );
                })
              )}
            </div>

            {/* Floating Acrylic Polyomino */}
            <div className="absolute -bottom-6 -right-4 sm:-right-8 bg-[#2a2a2c]/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center gap-1.5 pointer-events-none transform rotate-3 border border-white/10">
              <span className="text-[10px] text-[#a3c9ff] tracking-widest uppercase font-semibold">
                Tri-Corner Polyomino
              </span>
              <div className="grid grid-cols-2 gap-1 w-12 h-12">
                <div className="rounded-sm bg-gradient-to-br from-[#2997ff] to-[#0066cc]"></div>
                <div className="rounded-sm bg-gradient-to-br from-[#2997ff] to-[#0066cc]"></div>
                <div className="rounded-sm bg-gradient-to-br from-[#2997ff] to-[#0066cc]"></div>
                <div className="rounded-sm bg-white/5"></div>
              </div>
              <span className="text-[9px] text-[#c1c6d5]">Drag to Subgrid [2,2]</span>
            </div>

            {/* Floating Straight Tetromino */}
            <div className="absolute -top-4 -left-4 sm:-left-6 bg-[#2a2a2c]/95 backdrop-blur-xl p-2.5 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] hidden sm:flex flex-col items-center gap-1 pointer-events-none transform -rotate-6 border border-white/10">
              <span className="text-[10px] text-[#64d2ff] tracking-wider uppercase font-semibold">
                Straight-4 Bar
              </span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#64d2ff]"></div>
                <div className="w-4 h-4 rounded-sm bg-[#64d2ff]"></div>
                <div className="w-4 h-4 rounded-sm bg-[#64d2ff]"></div>
                <div className="w-4 h-4 rounded-sm bg-[#64d2ff]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE 4 GAME MODES */}
      <section className="w-full px-4 sm:px-6 md:px-10 py-16 max-w-7xl mx-auto" id="modes">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[12px] text-[#2997ff] uppercase tracking-widest block mb-1 font-semibold">
              Championship Disciplines
            </span>
            <h2 className="text-[32px] sm:text-[38px] leading-tight font-bold text-white">
              Four States of Play.
            </h2>
          </div>
          <p className="text-[14px] text-[#c1c6d5] max-w-md">
            Each mode calibrates spatial challenge, temporal urgency, and sensory feedback into an architecturally distinct arena.
          </p>
        </div>

        {/* Bento Grid for Game Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode 1: Classic 9x9 Sudoku Blocks */}
          <div className="group relative rounded-3xl bg-[#1f1f21] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-lg border border-white/5 transition-all duration-300 hover:shadow-2xl hover:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2997ff]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#2997ff]/15 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#2a2a2c] text-[#aac7ff] text-[10px] font-semibold uppercase tracking-wider border border-white/5">
                  Infinite • Rank Standard
                </span>
                <div className="w-10 h-10 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#aac7ff] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">grid_4x4</span>
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-white mb-2">Classic 9x9 Sudoku Blocks</h3>
              <p className="text-[15px] leading-relaxed text-[#c1c6d5] mb-6">
                Unrestricted contemplative logic. Construct and clear vertical columns, horizontal rows, or distinct 3×3 quadrant cells with no ticking clock.
              </p>
            </div>

            {/* Visual Showcase Graphic */}
            <div className="relative w-full h-40 rounded-2xl bg-[#252527] p-4 flex items-center justify-around overflow-hidden mb-6 border border-white/5">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#c1c6d5] uppercase font-semibold">Row Clear</span>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-sm bg-[#2997ff] animate-pulse"></div>
                  <div className="w-6 h-6 rounded-sm bg-[#2997ff]"></div>
                  <div className="w-6 h-6 rounded-sm bg-[#2997ff]"></div>
                  <div className="w-6 h-6 rounded-sm bg-[#2997ff] animate-pulse"></div>
                </div>
              </div>
              <span className="text-[#a3c9ff] text-[20px] font-bold">+</span>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-[#c1c6d5] uppercase font-semibold">3x3 Subgrid</span>
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-5 h-5 rounded-sm bg-[#2193fb]"></div>
                  <div className="w-5 h-5 rounded-sm bg-[#2193fb]"></div>
                  <div className="w-5 h-5 rounded-sm bg-[#2193fb]"></div>
                  <div className="w-5 h-5 rounded-sm bg-[#2193fb]"></div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#2a2a2c] text-center border border-white/5">
                <span className="text-[10px] text-[#aac7ff] uppercase block font-semibold">
                  Multiplier
                </span>
                <span className="text-[24px] font-bold text-white">2.4×</span>
              </div>
            </div>

            <div className="flex items-center justify-between z-10 pt-1">
              <span className="text-[13px] text-[#c1c6d5]">Default competitive ruleset</span>
              <button
                onClick={() => onSelectMode('classic')}
                className="px-5 py-2.5 rounded-full bg-[#0066cc] text-white text-[14px] font-semibold hover:bg-[#2997ff] transition-all active:scale-95 shadow-md"
              >
                Launch Classic
              </button>
            </div>
          </div>

          {/* Mode 2: Blast Rush */}
          <div className="group relative rounded-3xl bg-[#1f1f21] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-lg border border-white/5 transition-all duration-300 hover:shadow-2xl hover:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffb4ab]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ffb4ab]/15 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#93000a]/40 text-[#ffb4ab] text-[10px] font-semibold uppercase tracking-wider border border-red-500/20">
                  Timed Dynamic • Fast Surge
                </span>
                <div className="w-10 h-10 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#ffb4ab] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-white mb-2">Blast Rush</h3>
              <p className="text-[15px] leading-relaxed text-[#c1c6d5] mb-6">
                Time dilates with every clearing chain. 45-second ticking clock with +5.0s added on every line or quadrant explosion.
              </p>
            </div>

            {/* Rush Graphic Showcase */}
            <div className="relative w-full h-40 rounded-2xl bg-[#252527] p-4 flex flex-col justify-center overflow-hidden mb-6 border border-white/5">
              <div className="flex items-center justify-between mb-2 text-[12px]">
                <span className="text-[#ffb4ab] flex items-center gap-1 font-mono font-semibold">
                  <span className="material-symbols-outlined text-[16px]">alarm</span> 00:45.0 Start
                </span>
                <span className="text-[#64d2ff] font-semibold">+5.0s per Clear</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#353437] overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-[#5e5ce6] via-[#2997ff] to-[#ffb4ab] w-[75%] rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-around text-[10px] text-[#c1c6d5]">
                <span>
                  TIMED URGENCY: <strong className="text-white text-[12px]">Fast Surge</strong>
                </span>
                <span>
                  CHAIN BONUS: <strong className="text-[#ffb4ab] text-[12px]">Continuous</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between z-10 pt-1">
              <span className="text-[13px] text-[#c1c6d5]">High adrenaline match</span>
              <button
                onClick={() => onSelectMode('rush')}
                className="px-5 py-2.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-white text-[14px] font-semibold transition-all active:scale-95 border border-white/5"
              >
                Enter Blast Rush
              </button>
            </div>
          </div>

          {/* Mode 3: Tactical Matrix (NEW MODE replacing Daily Journey) */}
          <div className="group relative rounded-3xl bg-[#1f1f21] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-lg border border-white/5 transition-all duration-300 hover:shadow-2xl hover:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#64d2ff]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#64d2ff]/15 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#2a2a2c] text-[#64d2ff] text-[10px] font-semibold uppercase tracking-wider border border-white/5">
                  Tactical • Obstacle Matrix
                </span>
                <div className="w-10 h-10 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#64d2ff] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-white mb-2">Tactical Matrix</h3>
              <p className="text-[15px] leading-relaxed text-[#c1c6d5] mb-6">
                Starts with strategic fixed obsidian obstacle stones. Clear obstacle blocks by completing surrounding lines or their 3x3 sector to achieve total board mastery.
              </p>
            </div>

            {/* Tactical Graphic Showcase */}
            <div className="relative w-full h-40 rounded-2xl bg-[#252527] p-4 flex flex-col justify-center items-center overflow-hidden mb-6 border border-white/5">
              <div className="grid grid-cols-5 gap-1.5 p-2 bg-[#1b1b1d] rounded-xl border border-white/5">
                <div className="w-5 h-5 rounded-xs bg-[#48484a]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#2997ff]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#48484a]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#2997ff]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#64d2ff]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#2997ff]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#48484a]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#2997ff]"></div>
                <div className="w-5 h-5 rounded-xs bg-white/[0.04]"></div>
                <div className="w-5 h-5 rounded-xs bg-[#48484a]"></div>
              </div>
              <span className="text-[11px] text-[#c1c6d5] mt-2">
                5 Fixed Obsidian Pillars • Clear to Win
              </span>
            </div>

            <div className="flex items-center justify-between z-10 pt-1">
              <span className="text-[13px] text-[#c1c6d5]">Strategic spatial puzzle</span>
              <button
                onClick={() => onSelectMode('tactical')}
                className="px-5 py-2.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-white text-[14px] font-semibold transition-all active:scale-95 border border-white/5"
              >
                Play Tactical Matrix
              </button>
            </div>
          </div>

          {/* Mode 4: Zen Meditation */}
          <div className="group relative rounded-3xl bg-[#1f1f21] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-lg border border-white/5 transition-all duration-300 hover:shadow-2xl hover:border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#5e5ce6]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#5e5ce6]/15 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#2a2a2c] text-[#5e5ce6] text-[10px] font-semibold uppercase tracking-wider border border-white/5">
                  Infinite • Zero Fail State
                </span>
                <div className="w-10 h-10 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#5e5ce6] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">spa</span>
                </div>
              </div>
              <h3 className="text-[22px] font-bold text-white mb-2">Zen Sanctuary</h3>
              <p className="text-[15px] leading-relaxed text-[#c1c6d5] mb-6">
                No game over screens. When no moves remain, the board gently exhales and reorganizes. Paired with procedural pentatonic glass synthesizer tones.
              </p>
            </div>

            {/* Ambient Audio Wave Graphic */}
            <div className="relative w-full h-40 rounded-2xl bg-[#252527] p-4 flex flex-col justify-center items-center overflow-hidden mb-6 border border-white/5">
              <div className="flex items-end gap-2 h-14 mb-2">
                <div className="w-1.5 h-6 rounded-full bg-[#5e5ce6]/70 animate-pulse"></div>
                <div className="w-1.5 h-12 rounded-full bg-[#5e5ce6]"></div>
                <div className="w-1.5 h-14 rounded-full bg-[#a3c9ff]"></div>
                <div className="w-1.5 h-9 rounded-full bg-[#5e5ce6]"></div>
                <div className="w-1.5 h-13 rounded-full bg-[#2997ff] animate-pulse"></div>
                <div className="w-1.5 h-7 rounded-full bg-[#5e5ce6]/70"></div>
                <div className="w-1.5 h-10 rounded-full bg-[#a3c9ff]"></div>
              </div>
              <span className="text-[12px] font-semibold text-[#a3c9ff]">
                Acoustic Harmonics
              </span>
              <span className="text-[10px] text-[#c1c6d5]">Procedural browser Web Audio synthesis</span>
            </div>

            <div className="flex items-center justify-between z-10 pt-1">
              <span className="text-[13px] text-[#c1c6d5]">Zero fail state</span>
              <button
                onClick={() => onSelectMode('zen')}
                className="px-5 py-2.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-white text-[14px] font-semibold transition-all active:scale-95 border border-white/5"
              >
                Enter Sanctuary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL */}
      <section className="w-full px-4 sm:px-6 md:px-10 py-16 text-center max-w-4xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#aac7ff] mx-auto mb-4 shadow-lg border border-white/5">
          <span className="material-symbols-outlined text-[32px]">play_shapes</span>
        </div>
        <h2 className="text-[32px] sm:text-[38px] font-bold text-white mb-2">
          Your Clean Slate Awaits.
        </h2>
        <p className="text-[15px] text-[#c1c6d5] max-w-xl mx-auto mb-8">
          Experience zero ads, zero synthetic delays, and absolute mathematical purity.
        </p>
        <button
          onClick={() => onSelectMode('classic')}
          className="px-10 py-4 rounded-full bg-[#0066cc] text-white text-[15px] font-semibold hover:bg-[#2997ff] transition-all active:scale-95 shadow-[0_12px_28px_rgba(0,102,204,0.4)]"
        >
          Begin 9x9 Session
        </button>
      </section>
    </div>
  );
};
