import { ActionCommand, KeyBindingPair, KeyBindingsConfig, DEFAULT_KEY_BINDINGS } from '../types/game';

export interface ActionMetadata {
  command: ActionCommand;
  label: string;
  category: 'navigation' | 'actions' | 'slots' | 'system';
  description: string;
}

export const ACTION_METADATA: ActionMetadata[] = [
  {
    command: 'moveUp',
    label: 'Move Target Up',
    category: 'navigation',
    description: 'Navigate matrix cursor target upward'
  },
  {
    command: 'moveDown',
    label: 'Move Target Down',
    category: 'navigation',
    description: 'Navigate matrix cursor target downward'
  },
  {
    command: 'moveLeft',
    label: 'Move Target Left',
    category: 'navigation',
    description: 'Navigate matrix cursor target to the left'
  },
  {
    command: 'moveRight',
    label: 'Move Target Right',
    category: 'navigation',
    description: 'Navigate matrix cursor target to the right'
  },
  {
    command: 'placePiece',
    label: 'Commit Snap Placement',
    category: 'actions',
    description: 'Drop and lock selected piece into active target sector'
  },
  {
    command: 'rotatePiece',
    label: 'Rotate Polyomino Piece',
    category: 'actions',
    description: 'Rotate currently selected piece clockwise 90 degrees'
  },
  {
    command: 'selectSlot1',
    label: 'Select Piece Slot 1',
    category: 'slots',
    description: 'Grab polyomino from pickup tray slot 1'
  },
  {
    command: 'selectSlot2',
    label: 'Select Piece Slot 2',
    category: 'slots',
    description: 'Grab polyomino from pickup tray slot 2'
  },
  {
    command: 'selectSlot3',
    label: 'Select Piece Slot 3',
    category: 'slots',
    description: 'Grab polyomino from pickup tray slot 3'
  },
  {
    command: 'undo',
    label: 'Undo Previous Placement',
    category: 'actions',
    description: 'Revert last move and restore consumed piece'
  },
  {
    command: 'restart',
    label: 'Instant Session Restart',
    category: 'system',
    description: 'Wipe current grid and deal a fresh tray of pieces'
  },
  {
    command: 'pause',
    label: 'Pause / Deselect',
    category: 'system',
    description: 'Deselect active piece or pause session'
  }
];

export const formatKeyName = (key: string): string => {
  if (!key) return 'Unbound';
  if (key === ' ' || key.toLowerCase() === 'space') return 'Space';
  if (key === 'ArrowUp') return '↑ Up';
  if (key === 'ArrowDown') return '↓ Down';
  if (key === 'ArrowLeft') return '← Left';
  if (key === 'ArrowRight') return '→ Right';
  if (key === 'Escape') return 'Esc';
  if (key === 'Enter') return 'Enter';
  if (key === 'Backspace') return 'Backspace';
  if (key === 'Tab') return 'Tab';
  if (key.length === 1) return key.toUpperCase();
  return key;
};

export const matchesKey = (e: KeyboardEvent, pair?: KeyBindingPair): boolean => {
  if (!pair) return false;
  const key = e.key;
  const code = e.code;

  const check = (target: string): boolean => {
    if (!target) return false;
    if (target.toLowerCase() === key.toLowerCase()) return true;
    if (target.toLowerCase() === code.toLowerCase()) return true;
    if ((target === ' ' || target.toLowerCase() === 'space') && (key === ' ' || code === 'Space')) return true;
    if (target.toLowerCase() === 'enter' && key === 'Enter') return true;
    if ((target.toLowerCase() === 'escape' || target.toLowerCase() === 'esc') && key === 'Escape') return true;
    if (target.toLowerCase() === 'arrowup' && key === 'ArrowUp') return true;
    if (target.toLowerCase() === 'arrowdown' && key === 'ArrowDown') return true;
    if (target.toLowerCase() === 'arrowleft' && key === 'ArrowLeft') return true;
    if (target.toLowerCase() === 'arrowright' && key === 'ArrowRight') return true;
    return false;
  };

  return check(pair.primary) || check(pair.secondary);
};

export const getEffectiveBindings = (custom?: KeyBindingsConfig): KeyBindingsConfig => {
  if (!custom) return DEFAULT_KEY_BINDINGS;
  return { ...DEFAULT_KEY_BINDINGS, ...custom };
};
