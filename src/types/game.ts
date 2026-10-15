export type GameMode = 'classic' | 'rush' | 'tactical' | 'zen';

export type ThemeType = 'classic' | 'obsidian' | 'emerald' | 'cyber' | 'parchment' | 'chrome';

export type SuperzoneStyle = 'high-contrast' | 'subtle' | 'alternating';

export type AmbientSound = 'rain' | 'synth' | 'silent';

export interface CellData {
  id: string;
  colorClass: string;
  themeStyle: ThemeType;
  symbol: string;
  placedAt: number;
  isObstacle?: boolean;
}

export type Grid = (CellData | null)[][]; // 9x9

export interface PolyominoPiece {
  id: string;
  name: string;
  shape: number[][]; // 2D array of 0 and 1
  colorClass: string;
  symbol: string;
  blockCount: number;
}

export type ActionCommand =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'placePiece'
  | 'rotatePiece'
  | 'selectSlot1'
  | 'selectSlot2'
  | 'selectSlot3'
  | 'undo'
  | 'restart'
  | 'pause';

export interface KeyBindingPair {
  primary: string;
  secondary: string;
}

export type KeyBindingsConfig = Record<ActionCommand, KeyBindingPair>;

export const DEFAULT_KEY_BINDINGS: KeyBindingsConfig = {
  moveUp: { primary: 'ArrowUp', secondary: 'w' },
  moveDown: { primary: 'ArrowDown', secondary: 's' },
  moveLeft: { primary: 'ArrowLeft', secondary: 'a' },
  moveRight: { primary: 'ArrowRight', secondary: 'd' },
  placePiece: { primary: 'Enter', secondary: 'f' },
  rotatePiece: { primary: ' ', secondary: 'e' },
  selectSlot1: { primary: '1', secondary: 'j' },
  selectSlot2: { primary: '2', secondary: 'k' },
  selectSlot3: { primary: '3', secondary: 'l' },
  undo: { primary: 'z', secondary: 'u' },
  restart: { primary: 'r', secondary: 'x' },
  pause: { primary: 'Escape', secondary: 'p' },
};

export interface SettingsState {
  theme: ThemeType;
  superzoneStyle: SuperzoneStyle;
  burstParticles: boolean;
  boardShake: boolean;
  springDrag: boolean;
  sfxVolume: number; // 0 - 100
  ambientSound: AmbientSound;
  tapToPlace: boolean;
  ghostHologram: boolean;
  colorblindAssist: boolean;
  hapticEnabled: boolean;
  rackPosition: 'bottom' | 'left' | 'right';
  keyBindings: KeyBindingsConfig;
}

export interface ActiveClearInfo {
  rows: number[];
  cols: number[];
  boxes: number[];
  totalClearedCells: number;
  scoreGained: number;
  multiplier: number;
  isMegablast: boolean;
}
