import React, { useState, useEffect } from 'react';
import { SettingsState, SuperzoneStyle, ThemeType, AmbientSound, DEFAULT_KEY_BINDINGS, ActionCommand, KeyBindingsConfig } from '../types/game';
import { sound } from '../services/sound';
import { ACTION_METADATA, formatKeyName, getEffectiveBindings } from '../services/keyBindings';

interface SettingsViewProps {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  onSelectTab: (tab: string) => void;
  onClearStats: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  updateSettings,
  onClearStats
}) => {
  const [saveStatus, setSaveStatus] = useState<string>('Sync Configuration');
  const [activeRebind, setActiveRebind] = useState<{
    command: ActionCommand;
    slot: 'primary' | 'secondary';
  } | null>(null);

  // Keyboard capture listener for rebinding
  useEffect(() => {
    if (!activeRebind) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape' && activeRebind.command !== 'pause') {
        setActiveRebind(null);
        return;
      }

      const capturedKey = e.key === ' ' ? 'Space' : e.key;
      const current = getEffectiveBindings(settings.keyBindings);
      const nextBindings: KeyBindingsConfig = {
        ...current,
        [activeRebind.command]: {
          ...current[activeRebind.command],
          [activeRebind.slot]: capturedKey
        }
      };

      updateSettings({ keyBindings: nextBindings });
      setActiveRebind(null);
      sound.playPlace();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [activeRebind, settings.keyBindings, updateSettings]);

  const themes: {
    id: ThemeType;
    label: string;
    sublabel: string;
    colors: string[];
    locked?: boolean;
    unlockReq?: string;
  }[] = [
    {
      id: 'classic',
      label: 'Royal Sapphire',
      sublabel: 'Standard',
      colors: ['#0066cc', '#2997ff', '#a3c9ff']
    },
    {
      id: 'obsidian',
      label: 'Titanium Obsidian',
      sublabel: 'Tactile',
      colors: ['#1d1d1f', '#39393b', '#8b919e']
    },
    {
      id: 'emerald',
      label: 'Emerald Glow',
      sublabel: 'Organic',
      colors: ['#054a36', '#30d158', '#8ef5a4']
    },
    {
      id: 'cyber',
      label: 'Cyber Radiant',
      sublabel: 'Synth',
      colors: ['#bf5af2', '#ff375f', '#ffd60a']
    },
    {
      id: 'parchment',
      label: 'Cupertino Parchment',
      sublabel: 'Light Mat',
      colors: ['#f5f5f7', '#e5e5ea', '#c7c7cc']
    },
    {
      id: 'chrome',
      label: 'Zen Slate Chrome',
      sublabel: 'Unlocks at Level 20',
      colors: ['#8e8e93', '#2c2c2e', '#48484a'],
      locked: true,
      unlockReq: 'Unlocks at Level 20'
    }
  ];

  const handleSync = () => {
    setSaveStatus('Saved to Engine');
    sound.playPlace();
    setTimeout(() => {
      setSaveStatus('Sync Configuration');
    }, 1800);
  };

  const handleRevert = () => {
    updateSettings({
      theme: 'classic',
      superzoneStyle: 'high-contrast',
      burstParticles: true,
      boardShake: false,
      springDrag: true,
      sfxVolume: 82,
      ambientSound: 'rain',
      tapToPlace: false,
      ghostHologram: true,
      colorblindAssist: true,
      hapticEnabled: true,
      keyBindings: DEFAULT_KEY_BINDINGS
    });
    sound.setVolume(82);
    sound.setAmbient('rain');
  };

  return (
    <div className="relative w-full overflow-hidden pb-20 bg-[#131315] text-[#e4e2e4]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#2997ff]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/12 w-80 h-80 rounded-full bg-[#5e5ce6]/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10">
        {/* Title Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-8 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#a3c9ff] text-[12px] uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2997ff] shadow-[0_0_8px_rgba(41,151,255,0.8)]"></span>
              <span>Hardware & Engine Preferences</span>
            </div>
            <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-tight">
              System & Matrix Preferences
            </h1>
            <p className="text-[14px] text-[#c1c6d5] max-w-xl">
              Calibrate visual acoustics, tactile spatial feedback, and keyboard ergonomics. Configured live to the Quadrata Metal 2.4 runtime.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRevert}
              type="button"
              className="px-4 py-2 rounded-full bg-[#2a2a2c] text-[#c1c6d5] hover:text-white text-[14px] font-semibold hover:bg-[#353437] transition-all active:scale-95 flex items-center gap-2 border border-white/5"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Revert Defaults</span>
            </button>
            <button
              onClick={handleSync}
              type="button"
              className={`px-5 py-2 rounded-full text-white text-[14px] font-semibold transition-all duration-150 active:scale-95 shadow-md flex items-center gap-2 ${
                saveStatus === 'Saved to Engine' ? 'bg-[#30d158]' : 'bg-[#0066cc] hover:bg-[#2997ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{saveStatus}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-8">
          {/* Main Controls (col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Themes & Finishes */}
            <section className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2a2a2c] flex items-center justify-center text-[#a3c9ff] border border-white/5">
                    <span className="material-symbols-outlined">palette</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Block Finishes & Themes</h2>
                    <p className="text-[13px] text-[#c1c6d5]">
                      Calibrated surface materials for high-stress polyomino recognition
                    </p>
                  </div>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full bg-[#252527] text-[#a3c9ff] font-medium border border-white/5">
                  5 Finishes
                </span>
              </div>

              {/* Theme Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {themes.map(t => {
                  const isSelected = settings.theme === t.id;
                  if (t.locked) {
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-[#252527]/60 flex flex-col justify-center items-center text-center border border-white/5 opacity-60 cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[#8b919e] text-[24px] mb-1">
                          lock
                        </span>
                        <span className="text-[13px] text-[#c1c6d5] font-medium">{t.label}</span>
                        <span className="text-[11px] text-[#a3c9ff]">{t.unlockReq}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateSettings({ theme: t.id })}
                      className={`relative p-3.5 rounded-2xl bg-[#272729] hover:bg-[#2a2a2c] transition-all text-left flex flex-col justify-between h-28 border ${
                        isSelected
                          ? 'ring-2 ring-[#2997ff] border-[#2997ff]/40 shadow-lg'
                          : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[14px] font-semibold text-white">{t.label}</span>
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-[#2997ff] text-white' : 'bg-transparent text-transparent'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-md shadow-sm border border-white/10"
                            style={{ backgroundColor: color }}
                          ></div>
                        ))}
                        <span className="text-[11px] text-[#c1c6d5] ml-1 font-medium">{t.sublabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 3x3 Superzone Demarcation */}
              <div className="pt-3 space-y-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[15px] font-semibold text-white block">
                      3x3 Superzone Demarcation
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Visual treatment for the nine core 3x3 macro boxes
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#252527] border border-white/5">
                  {(
                    [
                      { id: 'high-contrast', label: 'High Contrast' },
                      { id: 'subtle', label: 'Subtle Outline' },
                      { id: 'alternating', label: 'Alternating Hue' }
                    ] as const
                  ).map(opt => {
                    const isSuperSelected = settings.superzoneStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateSettings({ superzoneStyle: opt.id })}
                        className={`py-2 px-3 rounded-xl text-[13px] font-medium transition-all ${
                          isSuperSelected
                            ? 'bg-[#2a2a2c] text-white font-semibold shadow-sm border border-white/10'
                            : 'text-[#c1c6d5] hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 2. Physics & Haptics */}
            <section className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2a2a2c] flex items-center justify-center text-[#a3c9ff] border border-white/5">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Physics & Haptics</h2>
                    <p className="text-[13px] text-[#c1c6d5]">
                      Tactile dynamics during placement and clearing bursts
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Burst particles */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      Polyomino Burst Particles
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Emit micro-geometric fragments when lines or 3x3 sectors collapse
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.burstParticles}
                    onClick={() => updateSettings({ burstParticles: !settings.burstParticles })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.burstParticles ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.burstParticles ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                {/* Board Structural Shake */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      Board Structural Shake
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Transient 1.5px matrix vibration on multi-line super combos
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.boardShake}
                    onClick={() => updateSettings({ boardShake: !settings.boardShake })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.boardShake ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.boardShake ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                {/* Fluid Spring Drag */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      Fluid Spring Drag Kinetics
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      40px vertical clearance with spring-inertia release dynamics
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.springDrag}
                    onClick={() => updateSettings({ springDrag: !settings.springDrag })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.springDrag ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.springDrag ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Acoustics & Soundscape */}
            <section className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2a2a2c] flex items-center justify-center text-[#a3c9ff] border border-white/5">
                    <span className="material-symbols-outlined">volume_up</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Acoustics & Soundscape</h2>
                    <p className="text-[13px] text-[#c1c6d5]">
                      Spatial audio feedback and meditative ambient loops
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Block Placement Impact slider */}
                <div className="p-4 rounded-2xl bg-[#272729] space-y-2 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#a3c9ff] text-[20px]">
                        graphic_eq
                      </span>
                      <span className="text-[15px] font-semibold text-white">
                        Block Placement Impact
                      </span>
                    </div>
                    <span className="text-[13px] text-[#aac7ff] font-mono font-semibold">
                      {settings.sfxVolume}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sfxVolume}
                    onChange={e => {
                      const val = Number(e.target.value);
                      updateSettings({ sfxVolume: val });
                      sound.setVolume(val);
                    }}
                    className="w-full accent-[#2997ff] bg-[#353437] rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#c1c6d5]">
                    <span>Muted</span>
                    <span>Crystal Snap</span>
                    <span>Deep Resonance (Max)</span>
                  </div>
                </div>

                {/* Ambient Focus Soundscape */}
                <div className="p-4 rounded-2xl bg-[#272729] space-y-2 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#a3c9ff] text-[20px]">
                        headphones
                      </span>
                      <span className="text-[15px] font-semibold text-white">
                        Ambient Focus Soundscape
                      </span>
                    </div>
                    <span className="text-[12px] text-[#c1c6d5]">Continuous Binaural Loop</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {(
                      [
                        {
                          id: 'rain',
                          title: 'Glass Rain',
                          desc: 'Light precipitation',
                          icon: 'water_drop'
                        },
                        { id: 'synth', title: 'Deep Synth', desc: '432Hz Drone', icon: 'waves' },
                        {
                          id: 'silent',
                          title: 'Silent Void',
                          desc: 'Pure silence',
                          icon: 'volume_off'
                        }
                      ] as const
                    ).map(item => {
                      const isAmbientSelected = settings.ambientSound === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            updateSettings({ ambientSound: item.id });
                            sound.setAmbient(item.id);
                          }}
                          className={`p-3 rounded-2xl text-left flex items-center gap-3 transition-all border ${
                            isAmbientSelected
                              ? 'bg-[#2a2a2c] ring-1 ring-[#2997ff] border-[#2997ff]/40 shadow-sm'
                              : 'bg-[#252527] hover:bg-[#2a2a2c] border-white/5'
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              isAmbientSelected ? 'text-[#64d2ff]' : 'text-[#c1c6d5]'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <div>
                            <span className="text-[13px] text-white font-semibold block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-[#c1c6d5]">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Ergonomics & Accessibility */}
            <section className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2a2a2c] flex items-center justify-center text-[#a3c9ff] border border-white/5">
                    <span className="material-symbols-outlined">accessibility_new</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Ergonomics & Accessibility</h2>
                    <p className="text-[13px] text-[#c1c6d5]">
                      Placement heuristics and perceptual contrast adjustments
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Pickup Rack Placement on PC */}
                <div className="p-3.5 rounded-2xl bg-[#272729] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[15px] font-semibold text-white block">
                        Pickup Rack Dock Placement (PC Layout)
                      </span>
                      <span className="text-[13px] text-[#c1c6d5]">
                        Move tray to Left or Right side (displays vertically for optimal mouse ergonomics) or Bottom
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#252527] border border-white/5">
                    {(
                      [
                        { id: 'left', label: 'Left (Vertical)' },
                        { id: 'bottom', label: 'Bottom' },
                        { id: 'right', label: 'Right (Vertical)' }
                      ] as const
                    ).map(pos => {
                      const isRackSelected = settings.rackPosition === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => updateSettings({ rackPosition: pos.id })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                            isRackSelected
                              ? 'bg-[#2a2a2c] text-white shadow-sm border border-white/10'
                              : 'text-[#c1c6d5] hover:text-white'
                          }`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      Input Modality: Tap-to-Place
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Alternative to continuous dragging. Tap piece, then tap target sector.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.tapToPlace}
                    onClick={() => updateSettings({ tapToPlace: !settings.tapToPlace })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.tapToPlace ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.tapToPlace ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      Ghost Hologram Alignment
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Projects translucent preview footprint when hovering legal slots
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.ghostHologram}
                    onClick={() => updateSettings({ ghostHologram: !settings.ghostHologram })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.ghostHologram ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.ghostHologram ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#272729] border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-semibold text-white block">
                      High-Contrast Colorblind Assist
                    </span>
                    <span className="text-[13px] text-[#c1c6d5]">
                      Adds distinct geometric inner-glyph stamps to differentiating polyomino shapes
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.colorblindAssist}
                    onClick={() => updateSettings({ colorblindAssist: !settings.colorblindAssist })}
                    className={`w-12 h-7 rounded-full p-1 transition-colors relative flex items-center ${
                      settings.colorblindAssist ? 'bg-[#0066cc]' : 'bg-[#2a2a2c]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-150 ${
                        settings.colorblindAssist ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </section>

            {/* 5. Keyboard Architecture & Interactive Rebind Station */}
            <section className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2a2a2c] flex items-center justify-center text-[#a3c9ff] border border-white/5">
                    <span className="material-symbols-outlined">keyboard</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white">Keyboard Architecture & Custom Bindings</h2>
                    <p className="text-[13px] text-[#c1c6d5]">
                      Click any key to rebind. Supports Arrow Keys, WASD, and custom layout maps.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ keyBindings: DEFAULT_KEY_BINDINGS });
                    sound.playPlace();
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-xs font-semibold text-[#c1c6d5] hover:text-white flex items-center gap-1.5 transition-all self-start sm:self-auto border border-white/5"
                  title="Reset all bindings back to default scheme"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  <span>Reset Defaults</span>
                </button>
              </div>

              {activeRebind && (
                <div className="p-3 rounded-2xl bg-[#2997ff]/10 border border-[#2997ff]/40 flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] animate-ping"></span>
                    <span className="text-xs font-semibold text-white">
                      Listening for key press for: <span className="text-[#64d2ff]">{ACTION_METADATA.find(m => m.command === activeRebind.command)?.label} ({activeRebind.slot})</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRebind(null)}
                    className="text-xs text-[#c1c6d5] hover:text-white underline font-medium"
                  >
                    Cancel (Esc)
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[#c1c6d5] text-[11px] uppercase tracking-wider border-b border-white/5">
                      <th className="py-2.5 font-semibold">Action Command</th>
                      <th className="py-2.5 font-semibold">Primary Key</th>
                      <th className="py-2.5 font-semibold">Secondary Key</th>
                      <th className="py-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ACTION_METADATA.map(meta => {
                      const bindings = getEffectiveBindings(settings.keyBindings);
                      const currentPair = bindings[meta.command];
                      const isListeningPrimary = activeRebind?.command === meta.command && activeRebind.slot === 'primary';
                      const isListeningSecondary = activeRebind?.command === meta.command && activeRebind.slot === 'secondary';

                      return (
                        <tr key={meta.command} className="hover:bg-[#272729]/60 transition-colors">
                          <td className="py-3 pr-2">
                            <span className="text-white font-medium block text-[13px]">{meta.label}</span>
                            <span className="text-[11px] text-[#8b919e] block">{meta.description}</span>
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => setActiveRebind({ command: meta.command, slot: 'primary' })}
                              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all border ${
                                isListeningPrimary
                                  ? 'bg-[#2997ff] text-white ring-2 ring-[#64d2ff] shadow-lg animate-pulse'
                                  : 'bg-[#2a2a2c] hover:bg-[#353437] text-white hover:border-[#2997ff]/50 border-white/10'
                              }`}
                              title="Click to rebind primary key"
                            >
                              {isListeningPrimary ? 'Press key...' : formatKeyName(currentPair?.primary || '')}
                            </button>
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              onClick={() => setActiveRebind({ command: meta.command, slot: 'secondary' })}
                              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all border ${
                                isListeningSecondary
                                  ? 'bg-[#2997ff] text-white ring-2 ring-[#64d2ff] shadow-lg animate-pulse'
                                  : 'bg-[#252527] hover:bg-[#2a2a2c] text-[#c1c6d5] hover:text-white hover:border-[#2997ff]/50 border-white/5'
                              }`}
                              title="Click to rebind secondary key"
                            >
                              {isListeningSecondary ? 'Press key...' : formatKeyName(currentPair?.secondary || '')}
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-[#30d158] text-[11px] uppercase font-semibold bg-[#30d158]/10 px-2 py-0.5 rounded-full border border-[#30d158]/20">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Sticky Sidebar (col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Live Simulation HUD */}
            <div className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#a3c9ff] uppercase tracking-wider font-semibold">
                  Live Simulation HUD
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2997ff]/20 text-[#a3c9ff] font-mono font-semibold">
                  60 FPS
                </span>
              </div>

              {/* Simulation Matrix Well */}
              <div className="relative w-full aspect-square bg-[#252527] rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-inner border border-white/5">
                <div className="flex items-center justify-between text-[#c1c6d5] text-[12px]">
                  <span>
                    Score: <strong className="text-white">14,890</strong>
                  </span>
                  <span className="text-[#64d2ff] font-mono text-[11px] font-bold">STREAK x4</span>
                </div>

                {/* 9x9 Mini Simulator */}
                <div className="w-full max-w-[240px] mx-auto aspect-square grid grid-cols-9 gap-[2px] bg-[#0e0e10]/80 p-1.5 rounded-xl border border-white/5">
                  {Array.from({ length: 81 }).map((_, i) => {
                    const r = Math.floor(i / 9);
                    const c = i % 9;
                    const isPrefilled =
                      (r === 1 && c >= 3 && c <= 5) ||
                      (r === 4 && c >= 1 && c <= 3) ||
                      (r === 5 && c >= 6 && c <= 8) ||
                      (r === 2 && c === 4);

                    const isGhost = r === 4 && (c === 1 || c === 2 || c === 3);

                    return (
                      <div
                        key={i}
                        className={`rounded-xs transition-colors ${
                          isGhost
                            ? 'bg-[#2997ff]/30 ring-1 ring-[#2997ff] animate-pulse'
                            : isPrefilled
                            ? 'bg-[#2997ff]'
                            : 'bg-white/[0.04]'
                        }`}
                      ></div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[#c1c6d5] text-[10px]">
                  <span className="capitalize">Active: {settings.theme}</span>
                  <span className="text-[#a3c9ff]">Ghost Target: Valid</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#c1c6d5]">Profile State</span>
                  <span className="text-white font-semibold">Grandmaster Level 12</span>
                </div>
                <div className="w-full bg-[#272729] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#2997ff] h-full rounded-full" style={{ width: '68%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#c1c6d5]">
                  <span>Cloud Save Synced</span>
                  <span>4.8 KB Local State</span>
                </div>
              </div>
            </div>

            {/* Data Storage & Cache */}
            <div className="bg-[#1f1f21] rounded-3xl p-6 shadow-md space-y-4 border border-white/5">
              <h3 className="text-[18px] font-bold text-white">Data Storage & Cache</h3>
              <p className="text-[13px] leading-relaxed text-[#c1c6d5]">
                Quadrata stores board telemetry, streak metrics, and unlocked themes inside your browser's persistent IndexedDB layer.
              </p>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={onClearStats}
                  className="w-full py-2.5 px-4 rounded-full bg-[#93000a]/30 text-[#ffb4ab] hover:bg-[#93000a] hover:text-white text-[13px] font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>Clear Game Statistics</span>
                </button>
                <button
                  type="button"
                  onClick={handleRevert}
                  className="w-full py-2.5 px-4 rounded-full bg-[#2a2a2c] text-[#e4e2e4] hover:bg-[#353437] text-[13px] font-semibold transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 border border-white/5"
                >
                  <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                  <span>Factory Reset Engine</span>
                </button>
              </div>
            </div>

            {/* Zero Tracking Policy */}
            <div className="p-4 rounded-3xl bg-[#1b1b1d] flex items-start gap-3 border border-white/5">
              <span className="material-symbols-outlined text-[#a3c9ff] shrink-0 text-[20px]">
                verified_user
              </span>
              <div className="space-y-0.5">
                <span className="text-[13px] font-semibold text-white block">Zero Tracking Policy</span>
                <span className="text-[12px] text-[#c1c6d5] block leading-snug">
                  No third-party SDKs, telemetry beacons, or advertising cookies are integrated into the Quadrata engine runtime.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
