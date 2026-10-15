/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PlayView } from './views/PlayView';
import { GameModesView } from './views/GameModesView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { GameMode, SettingsState, DEFAULT_KEY_BINDINGS, KeyBindingsConfig } from './types/game';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('play');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameKey, setGameKey] = useState<number>(1);

  // Application Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    let savedRack: 'bottom' | 'left' | 'right' = 'left';
    let savedBindings: KeyBindingsConfig = { ...DEFAULT_KEY_BINDINGS };

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('quadrata_rack_position');
      if (stored === 'left' || stored === 'right' || stored === 'bottom') {
        savedRack = stored;
      }
      try {
        const storedBindings = localStorage.getItem('quadrata_keybindings');
        if (storedBindings) {
          savedBindings = { ...DEFAULT_KEY_BINDINGS, ...JSON.parse(storedBindings) };
        }
      } catch {
        // ignore parse errors
      }
    }
    return {
      theme: 'classic',
      superzoneStyle: 'high-contrast',
      burstParticles: false,
      boardShake: false,
      springDrag: true,
      sfxVolume: 80,
      ambientSound: 'silent',
      tapToPlace: false,
      ghostHologram: true,
      colorblindAssist: false,
      hapticEnabled: true,
      rackPosition: savedRack,
      keyBindings: savedBindings
    };
  });

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    if (newSettings.rackPosition && typeof localStorage !== 'undefined') {
      localStorage.setItem('quadrata_rack_position', newSettings.rackPosition);
    }
    if (newSettings.keyBindings && typeof localStorage !== 'undefined') {
      localStorage.setItem('quadrata_keybindings', JSON.stringify(newSettings.keyBindings));
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleNewGame = () => {
    setGameKey(k => k + 1);
    setCurrentTab('play');
  };

  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    setGameKey(k => k + 1);
    setCurrentTab('play');
  };

  const handleClearStats = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('quadrata_high_score');
    }
    handleNewGame();
    alert('Session statistics and cached local telemetry have been cleared.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#131315] text-[#e4e2e4] antialiased selection:bg-[#2997ff] selection:text-white">
      {/* Fixed Sticky Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewGame={handleNewGame}
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {currentTab === 'play' && (
          <PlayView
            key={gameKey}
            settings={settings}
            updateSettings={updateSettings}
            gameMode={gameMode}
            onSelectTab={setCurrentTab}
            onOpenModeSelector={() => setCurrentTab('game-modes')}
          />
        )}

        {currentTab === 'game-modes' && (
          <GameModesView
            onSelectMode={handleSelectMode}
            onSelectTab={setCurrentTab}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            updateSettings={updateSettings}
            onSelectTab={setCurrentTab}
            onClearStats={handleClearStats}
          />
        )}

        {currentTab === 'about' && (
          <AboutView onSelectTab={setCurrentTab} />
        )}
      </main>

      {/* California Minimal Footer */}
      <Footer onSelectTab={setCurrentTab} />
    </div>
  );
}
