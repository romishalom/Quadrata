import React from 'react';

interface AboutViewProps {
  onSelectTab: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onSelectTab }) => {
  return (
    <div className="relative w-full overflow-hidden bg-[#131315] text-[#e4e2e4] py-12 px-4 sm:px-6 md:px-10">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2a2a2c] text-[#a3c9ff] text-[11px] font-semibold uppercase tracking-wider border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#2997ff]"></span>
            <span>California Minimal • Architecture Note</span>
          </div>
          <h1 className="text-[36px] sm:text-[46px] font-bold text-white tracking-tight">
            The Geometry of Quadrata
          </h1>
          <p className="text-[16px] text-[#c1c6d5] max-w-2xl mx-auto leading-relaxed">
            Quadrata was conceived as an architectural study in spatial contemplation. Grounded in volcanic glass and tuned for absolute focus, it merges polyomino placement with 9x9 Sudoku constraints.
          </p>
        </div>

        {/* SECTION: GEOMETRY OF SCORING (Moved from Game Modes) */}
        <section className="bg-[#1b1b1d] rounded-3xl p-6 sm:p-10 border border-white/5 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[12px] text-[#a3c9ff] uppercase tracking-widest block mb-1 font-semibold">
              Geometry of Scoring
            </span>
            <h2 className="text-[28px] sm:text-[34px] font-bold text-white mb-2">
              Simultaneous Clear Multipliers
            </h2>
            <p className="text-[14px] text-[#c1c6d5]">
              True mastery lies in the compounding confluence of rows, columns, and 3×3 Sudoku sectors completed with a single stone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Linear Clearing */}
            <div className="bg-[#1f1f21] p-6 rounded-3xl flex flex-col items-center text-center border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#aac7ff] mb-4 text-[20px] font-bold">
                1
              </div>
              <h4 className="text-[18px] font-bold text-white mb-1">The Linear Axis</h4>
              <span className="text-[12px] text-[#2997ff] font-semibold mb-4">
                9 Continuous Tiles (100 pts)
              </span>

              {/* Graphic Matrix Mini */}
              <div className="w-36 h-36 bg-[#252527] p-2 rounded-xl grid grid-cols-5 gap-1 mb-4 shadow-inner border border-white/5">
                {Array.from({ length: 25 }).map((_, i) => {
                  const isCross = i % 5 === 2 || Math.floor(i / 5) === 2;
                  const isCenter = i === 12;
                  return (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        isCenter
                          ? 'bg-white shadow-[0_0_8px_#ffffff]'
                          : isCross
                          ? 'bg-[#2997ff]'
                          : 'bg-[#353437]'
                      }`}
                    ></div>
                  );
                })}
              </div>
              <p className="text-[13px] text-[#c1c6d5] leading-relaxed">
                Full horizontal row or vertical column completion triggers instant evaporation and opens spatial breathing room.
              </p>
            </div>

            {/* Step 2: The Sudoku Quadrant */}
            <div className="bg-[#1f1f21] p-6 rounded-3xl flex flex-col items-center text-center border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#64d2ff] mb-4 text-[20px] font-bold">
                2
              </div>
              <h4 className="text-[18px] font-bold text-white mb-1">The Sudoku Sector</h4>
              <span className="text-[12px] text-[#64d2ff] font-semibold mb-4">
                3×3 Bounded Box (300 pts)
              </span>

              {/* Graphic Matrix Mini */}
              <div className="w-36 h-36 bg-[#252527] p-2.5 rounded-xl grid grid-cols-3 gap-1.5 mb-4 shadow-inner border border-white/5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      i === 4 ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-[#64d2ff]'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-[13px] text-[#c1c6d5] leading-relaxed">
                Filling any designated 3×3 perimeter clears all nine blocks simultaneously, releasing a bell-like acoustic chime.
              </p>
            </div>

            {/* Step 3: Dual Multiplier */}
            <div className="bg-[#1f1f21] p-6 rounded-3xl flex flex-col items-center text-center border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2c] flex items-center justify-center text-[#5e5ce6] mb-4 text-[20px] font-bold">
                3
              </div>
              <h4 className="text-[18px] font-bold text-white mb-1">Confluent Cascade</h4>
              <span className="text-[12px] text-[#5e5ce6] font-semibold mb-4">
                Row + Box Dual (1,200 pts)
              </span>

              {/* Graphic Multiplier Mini */}
              <div className="w-36 h-36 bg-[#252527] p-3 rounded-xl flex flex-col items-center justify-center mb-4 shadow-inner border border-white/5">
                <span className="text-[40px] leading-none text-white font-bold tracking-tight">
                  4.8×
                </span>
                <span className="text-[10px] text-[#5e5ce6] uppercase tracking-wider font-semibold mt-1">
                  Multiplier Active
                </span>
                <div className="flex gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-[#2997ff]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#64d2ff]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#5e5ce6]"></span>
                </div>
              </div>
              <p className="text-[13px] text-[#c1c6d5] leading-relaxed">
                When a single piece resolves both a linear line and a 3×3 square, the engine initiates exponential streak multipliers.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: ENGINEERING PHILOSOPHY (Moved from Game Modes) */}
        <section className="rounded-3xl bg-[#252527] p-6 sm:p-10 md:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/5">
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0066cc]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-xl z-10">
            <span className="text-[12px] text-[#2997ff] uppercase tracking-widest block mb-2 font-semibold">
              Engineering Philosophy
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-bold text-white mb-4">
              Milled from Anodized Aluminum. Rendered at 120Hz ProMotion.
            </h2>
            <p className="text-[15px] leading-relaxed text-[#c1c6d5] mb-6">
              Quadrata was forged with tactile physical tolerances. Drag physics replicate the authentic mass and micro-friction of polished stone across slate, tuned for meditative fingertip intuition.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#1f1f21]/70 backdrop-blur-md border border-white/5">
                <span className="text-[24px] text-white font-bold block mb-1">0.0 ms</span>
                <span className="text-[10px] text-[#c1c6d5] uppercase font-medium">Input Lag to Drop</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#1f1f21]/70 backdrop-blur-md border border-white/5">
                <span className="text-[24px] text-white font-bold block mb-1">Metal 3</span>
                <span className="text-[10px] text-[#c1c6d5] uppercase font-medium">Hardware Accelerated</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onSelectTab('play')}
                className="px-6 py-3 rounded-full bg-[#aac7ff] text-[#002f65] text-[15px] font-semibold hover:bg-[#a3c9ff] transition-all active:scale-95 shadow-md"
              >
                Launch Game
              </button>
            </div>
          </div>

          {/* Tactile Visual Display (Polyomino Gallery Card) */}
          <div className="w-full lg:w-96 rounded-2xl bg-[#2a2a2c]/60 backdrop-blur-2xl p-6 shadow-2xl relative z-10 border border-white/10">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <span className="text-[12px] text-white uppercase tracking-wider font-semibold">
                Haptic Tray Dock
              </span>
              <span className="text-[11px] text-[#a3c9ff] font-semibold">Slot Cleared</span>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#1b1b1d] flex items-center justify-between border border-white/5">
                <span className="text-[13px] text-[#c1c6d5]">L-Tetromino</span>
                <div className="flex flex-col gap-1 items-end">
                  <div className="w-4 h-4 rounded-xs bg-[#2997ff]"></div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-xs bg-[#2997ff]"></div>
                    <div className="w-4 h-4 rounded-xs bg-[#2997ff]"></div>
                    <div className="w-4 h-4 rounded-xs bg-[#2997ff]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1b1b1d] flex items-center justify-between border border-white/5">
                <span className="text-[13px] text-[#c1c6d5]">3x3 Big Square</span>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-xs bg-[#2193fb]"></div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1b1b1d] flex items-center justify-between border border-white/5">
                <span className="text-[13px] text-[#c1c6d5]">Single Monomino</span>
                <div className="w-6 h-6 rounded-xs bg-[#64d2ff] shadow-[0_0_12px_rgba(100,210,255,0.4)]"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Return Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => onSelectTab('play')}
            className="px-8 py-3.5 rounded-full bg-[#0066cc] hover:bg-[#2997ff] text-white font-semibold text-[15px] transition-all active:scale-95 shadow-lg"
          >
            Return to 9x9 Board
          </button>
        </div>
      </div>
    </div>
  );
};
