import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveClearInfo,
  CellData,
  GameMode,
  Grid,
  PolyominoPiece,
  SettingsState,
  ActionCommand
} from '../types/game';
import {
  calculateGridClearPercentage,
  canPieceFitAnywhere,
  canPlaceShape,
  createEmptyGrid,
  createTacticalGrid,
  evaluateClears,
  findBestPlacementCoord,
  generateRackPieces,
  hasAnyLegalMove,
  placePieceOnGrid,
  rotateShape,
  zenExhale
} from '../services/puzzleEngine';
import { sound } from '../services/sound';
import {
  formatKeyName,
  getEffectiveBindings,
  matchesKey
} from '../services/keyBindings';

interface PlayViewProps {
  settings: SettingsState;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  gameMode: GameMode;
  onSelectTab: (tab: string) => void;
  onOpenModeSelector: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({
  settings,
  updateSettings,
  gameMode,
  onSelectTab,
  onOpenModeSelector
}) => {
  // Game Board State - starts from 0 and clean empty board (or tactical obstacles if tactical mode)
  const [grid, setGrid] = useState<Grid>(() =>
    gameMode === 'tactical' ? createTacticalGrid(settings.theme) : createEmptyGrid()
  );
  const [rack, setRack] = useState<(PolyominoPiece | null)[]>(() => generateRackPieces());
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);

  // Score & Streak Telemetry - Starts at 0!
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('quadrata_high_score');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [movesMade, setMovesMade] = useState<number>(0);

  // Timed Mode (Blast Rush)
  const [rushTimeLeft, setRushTimeLeft] = useState<number>(45.0);

  // Dragging & Fluent Placement State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedPieceIndex, setDraggedPieceIndex] = useState<number | null>(null);
  const [dragPointerPos, setDragPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [grabOffset, setGrabOffset] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [estimatedPlacement, setEstimatedPlacement] = useState<{
    targetR: number;
    targetC: number;
    isValid: boolean;
  } | null>(null);

  // Keyboard navigation & cursor state (Arrows / WASD support)
  const [keyboardCursor, setKeyboardCursor] = useState<{ r: number; c: number }>({ r: 4, c: 4 });
  const [isKeyboardNavActive, setIsKeyboardNavActive] = useState<boolean>(false);

  // History state for Undo
  const [history, setHistory] = useState<{
    grid: Grid;
    rack: (PolyominoPiece | null)[];
    score: number;
    streak: number;
  } | null>(null);

  // Flash animations for cleared cells
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [isBoardShaking, setIsBoardShaking] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Sound & Haptic status toast feedback
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(prev => (prev === msg ? null : prev));
    }, 1800);
  };

  // Timed Blast Rush mode countdown
  useEffect(() => {
    if (gameMode !== 'rush' || isGameOver || isPaused) return;
    const interval = setInterval(() => {
      setRushTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(interval);
          setIsGameOver(true);
          sound.playGameOver();
          sound.triggerHaptic('heavy', settings.hapticEnabled);
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameMode, isGameOver, isPaused, settings.hapticEnabled]);

  // Sync ambient sound
  useEffect(() => {
    sound.setAmbient(settings.ambientSound);
  }, [settings.ambientSound]);

  // Effective keybindings from settings
  const bindings = getEffectiveBindings(settings.keyBindings);

  // Move matrix cursor (Arrows / WASD)
  const moveCursor = useCallback(
    (deltaR: number, deltaC: number) => {
      setIsKeyboardNavActive(true);
      setKeyboardCursor(prev => {
        const nextR = Math.max(0, Math.min(8, prev.r + deltaR));
        const nextC = Math.max(0, Math.min(8, prev.c + deltaC));
        sound.playPlace();
        sound.triggerHaptic('light', settings.hapticEnabled);
        return { r: nextR, c: nextC };
      });
    },
    [settings.hapticEnabled]
  );

  // Synchronize ghost preview whenever keyboard cursor or active piece changes
  useEffect(() => {
    if (isDragging) return;
    if (selectedPieceIndex !== null && rack[selectedPieceIndex] && isKeyboardNavActive) {
      const piece = rack[selectedPieceIndex]!;
      const bestCoord = findBestPlacementCoord(
        grid,
        piece.shape,
        keyboardCursor.r,
        keyboardCursor.c,
        0,
        0
      );
      setEstimatedPlacement(bestCoord);
    }
  }, [keyboardCursor, selectedPieceIndex, rack, grid, isDragging, isKeyboardNavActive]);

  // Comprehensive Keyboard Controls Listener (includes full Arrow & WASD matrix control + Rebinding)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if typing in an actual text field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // 1. Matrix Navigation: Up, Down, Left, Right (Arrows / WASD / Custom)
      if (matchesKey(e, bindings.moveUp)) {
        e.preventDefault();
        moveCursor(-1, 0);
        return;
      }
      if (matchesKey(e, bindings.moveDown)) {
        e.preventDefault();
        moveCursor(1, 0);
        return;
      }
      if (matchesKey(e, bindings.moveLeft)) {
        e.preventDefault();
        moveCursor(0, -1);
        return;
      }
      if (matchesKey(e, bindings.moveRight)) {
        e.preventDefault();
        moveCursor(0, 1);
        return;
      }

      // 2. Select Piece Slots (1, 2, 3 / Custom)
      if (matchesKey(e, bindings.selectSlot1)) {
        e.preventDefault();
        if (rack[0]) {
          setSelectedPieceIndex(0);
          setIsKeyboardNavActive(true);
          sound.playPlace();
        }
        return;
      }
      if (matchesKey(e, bindings.selectSlot2)) {
        e.preventDefault();
        if (rack[1]) {
          setSelectedPieceIndex(1);
          setIsKeyboardNavActive(true);
          sound.playPlace();
        }
        return;
      }
      if (matchesKey(e, bindings.selectSlot3)) {
        e.preventDefault();
        if (rack[2]) {
          setSelectedPieceIndex(2);
          setIsKeyboardNavActive(true);
          sound.playPlace();
        }
        return;
      }

      // 3. Rotate Piece
      if (matchesKey(e, bindings.rotatePiece)) {
        e.preventDefault();
        handleRotateActivePiece();
        return;
      }

      // 4. Place / Commit Piece on Grid
      if (matchesKey(e, bindings.placePiece)) {
        e.preventDefault();
        if (selectedPieceIndex !== null && rack[selectedPieceIndex]) {
          if (estimatedPlacement && estimatedPlacement.isValid) {
            handlePlacePiece(selectedPieceIndex, estimatedPlacement.targetR, estimatedPlacement.targetC);
            setSelectedPieceIndex(null);
            setEstimatedPlacement(null);
          } else {
            showNotification('Cannot place piece here — slot obstructed or out of bounds');
            sound.triggerHaptic('heavy', settings.hapticEnabled);
          }
        } else {
          showNotification('Select a piece first (Keys 1, 2, or 3)');
        }
        return;
      }

      // 5. Undo Move
      if (matchesKey(e, bindings.undo)) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // 6. Restart Game
      if (matchesKey(e, bindings.restart)) {
        e.preventDefault();
        handleRestartGame();
        return;
      }

      // 7. Pause or Deselect Piece
      if (matchesKey(e, bindings.pause)) {
        e.preventDefault();
        if (selectedPieceIndex !== null) {
          setSelectedPieceIndex(null);
          setEstimatedPlacement(null);
          showNotification('Piece Deselected');
        } else {
          setIsPaused(p => !p);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    rack,
    selectedPieceIndex,
    grid,
    bindings,
    moveCursor,
    estimatedPlacement,
    settings.hapticEnabled,
    settings.keyBindings
  ]);

  // Active piece being hovered or dragged
  const activePiece =
    draggedPieceIndex !== null
      ? rack[draggedPieceIndex]
      : selectedPieceIndex !== null
      ? rack[selectedPieceIndex]
      : null;

  // Window-level pointer listeners for butter-smooth dragging
  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      setDragPointerPos({ x: e.clientX, y: e.clientY });

      if (boardRef.current && draggedPieceIndex !== null && rack[draggedPieceIndex]) {
        const rect = boardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate cursor cell position relative to 9x9 board
        const cellSize = rect.width / 9;
        const cursorCol = Math.floor(x / cellSize);
        const cursorRow = Math.floor(y / cellSize);

        // Expand hover boundaries slightly so edge dropping is fluent
        if (x >= -cellSize && x <= rect.width + cellSize && y >= -cellSize && y <= rect.height + cellSize) {
          const boundedR = Math.max(0, Math.min(8, cursorRow));
          const boundedC = Math.max(0, Math.min(8, cursorCol));

          const bestCoord = findBestPlacementCoord(
            grid,
            rack[draggedPieceIndex]!.shape,
            boundedR,
            boundedC,
            grabOffset.r,
            grabOffset.c
          );
          setEstimatedPlacement(bestCoord);
          return;
        }
      }
      setEstimatedPlacement(null);
    };

    const onPointerUp = () => {
      if (draggedPieceIndex !== null && estimatedPlacement && estimatedPlacement.isValid) {
        handlePlacePiece(draggedPieceIndex, estimatedPlacement.targetR, estimatedPlacement.targetC);
      }
      setIsDragging(false);
      setDraggedPieceIndex(null);
      setDragPointerPos(null);
      setEstimatedPlacement(null);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isDragging, draggedPieceIndex, rack, grid, grabOffset, estimatedPlacement]);

  // Perform Piece Placement
  const handlePlacePiece = (pieceIdx: number, targetRow: number, targetCol: number) => {
    const piece = rack[pieceIdx];
    if (!piece) return;

    if (!canPlaceShape(grid, piece.shape, targetRow, targetCol)) {
      return;
    }

    // Save history for Undo
    setHistory({
      grid: grid.map(r => [...r]),
      rack: [...rack],
      score,
      streak
    });

    // Sound and haptic feedback
    sound.playPlace();
    sound.triggerHaptic('light', settings.hapticEnabled);

    // 1. Place on grid
    const placedGrid = placePieceOnGrid(grid, piece, targetRow, targetCol, settings.theme);
    const newMoves = movesMade + 1;
    setMovesMade(newMoves);

    // Points for piece placement
    const piecePoints = piece.blockCount * 10;
    let newScore = score + piecePoints;

    // 2. Consume piece from rack
    const newRack = [...rack];
    newRack[pieceIdx] = null;
    setSelectedPieceIndex(null);
    setDraggedPieceIndex(null);
    setIsDragging(false);
    setEstimatedPlacement(null);

    // 3. Evaluate Clears
    const clearResult = evaluateClears(placedGrid, streak);

    if (clearResult.clearInfo && clearResult.clearInfo.totalClearedCells > 0) {
      const { scoreGained, multiplier: clearMult, rows, cols, boxes, isMegablast } = clearResult.clearInfo;
      newScore += scoreGained;
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMultiplier(clearMult);

      // Add time bonus in Rush mode
      if (gameMode === 'rush') {
        setRushTimeLeft(t => Number((t + 5.0 * (rows.length + cols.length + boxes.length)).toFixed(1)));
      }

      // Sound chime & strong haptic vibration
      sound.playClear(newStreak, rows.length + cols.length + boxes.length);
      sound.triggerHaptic(isMegablast ? 'heavy' : 'medium', settings.hapticEnabled);

      // Particle / Confetti feedback
      if (settings.burstParticles && (isMegablast || boxes.length > 0)) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#2997ff', '#64d2ff', '#5e5ce6', '#ffffff']
        });
      }

      // Board shake feedback
      if (settings.boardShake && isMegablast) {
        setIsBoardShaking(true);
        setTimeout(() => setIsBoardShaking(false), 240);
      }

      // Track clearing animation
      const clearingKeys = new Set<string>();
      clearResult.clearedCellCoords.forEach(([r, c]) => clearingKeys.add(`${r},${c}`));
      setClearingCells(clearingKeys);

      // Apply cleared grid after quick flash
      setTimeout(() => {
        setGrid(clearResult.clearedGrid);
        setClearingCells(new Set());
      }, 160);
    } else {
      setStreak(0);
      setMultiplier(1.0);
      setGrid(placedGrid);
    }

    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('quadrata_high_score', newScore.toString());
      }
    }

    // Check if rack is empty -> replenish with 3 new pieces
    let finalRack = newRack;
    if (newRack.every(p => p === null)) {
      finalRack = generateRackPieces();
      setRack(finalRack);
    } else {
      setRack(newRack);
    }

    // 4. Game Over Check
    const effectiveGrid = clearResult.clearInfo ? clearResult.clearedGrid : placedGrid;
    const canContinue = hasAnyLegalMove(effectiveGrid, finalRack);

    if (!canContinue) {
      if (gameMode === 'zen') {
        setTimeout(() => {
          const { newGrid } = zenExhale(effectiveGrid);
          setGrid(newGrid);
          sound.playClear(1, 1);
          sound.triggerHaptic('medium', settings.hapticEnabled);
          showNotification('Zen Sanctuary: Board exhaled and reorganized');
        }, 500);
      } else {
        setTimeout(() => {
          setIsGameOver(true);
          sound.playGameOver();
          sound.triggerHaptic('heavy', settings.hapticEnabled);
        }, 300);
      }
    }
  };

  // Drag start on rack piece
  const handlePointerDownPiece = (e: React.PointerEvent, index: number) => {
    if (!rack[index]) return;
    const piece = rack[index]!;

    // Find center cell of the piece shape for intuitive center grabbing
    const shapeRows = piece.shape.length;
    const shapeCols = piece.shape[0].length;
    const centerR = Math.floor(shapeRows / 2);
    const centerC = Math.floor(shapeCols / 2);

    setGrabOffset({ r: centerR, c: centerC });
    setDraggedPieceIndex(index);
    setSelectedPieceIndex(index);
    setIsDragging(true);
    setDragPointerPos({ x: e.clientX, y: e.clientY });
  };

  // Tap-to-place on cell click
  const handleCellClick = (r: number, c: number) => {
    if (selectedPieceIndex !== null && rack[selectedPieceIndex]) {
      const piece = rack[selectedPieceIndex]!;
      // Find optimal anchor starting from (r, c)
      const best = findBestPlacementCoord(grid, piece.shape, r, c, 0, 0);
      if (best && best.isValid) {
        handlePlacePiece(selectedPieceIndex, best.targetR, best.targetC);
      }
    }
  };

  // Rotate selected piece or first available piece
  const handleRotateActivePiece = () => {
    const targetIdx =
      selectedPieceIndex !== null && rack[selectedPieceIndex]
        ? selectedPieceIndex
        : rack.findIndex(p => p !== null);
    if (targetIdx === -1 || !rack[targetIdx]) return;

    sound.playRotate();
    sound.triggerHaptic('light', settings.hapticEnabled);
    const piece = rack[targetIdx]!;
    const rotated = rotateShape(piece.shape);
    const updatedPiece: PolyominoPiece = {
      ...piece,
      shape: rotated
    };

    const newRack = [...rack];
    newRack[targetIdx] = updatedPiece;
    setRack(newRack);

    if (isKeyboardNavActive) {
      const best = findBestPlacementCoord(grid, rotated, keyboardCursor.r, keyboardCursor.c, 0, 0);
      setEstimatedPlacement(best);
    }
  };

  const handleUndo = () => {
    if (!history) return;
    sound.playRotate();
    sound.triggerHaptic('medium', settings.hapticEnabled);
    setGrid(history.grid);
    setRack(history.rack);
    setScore(history.score);
    setStreak(history.streak);
    setHistory(null);
    setIsGameOver(false);
    showNotification('Move Undone');
  };

  // New Game / Reset
  const handleRestartGame = () => {
    setGrid(gameMode === 'tactical' ? createTacticalGrid(settings.theme) : createEmptyGrid());
    setRack(generateRackPieces());
    setScore(0);
    setStreak(0);
    setMultiplier(1.0);
    setMovesMade(0);
    setRushTimeLeft(45.0);
    setIsGameOver(false);
    setIsPaused(false);
    setHistory(null);
    setSelectedPieceIndex(null);
    sound.triggerHaptic('medium', settings.hapticEnabled);
    showNotification('New Game Started (0 pts)');
  };

  // Active theme block styling
  const getCellThemeClass = (cell: CellData) => {
    if (cell.isObstacle) {
      return 'bg-gradient-to-br from-[#48484a] to-[#1c1c1e] text-white border border-white/20 shadow-inner';
    }
    switch (settings.theme) {
      case 'obsidian':
        return 'bg-gradient-to-br from-[#39393b] to-[#1d1d1f] border border-white/10 text-white';
      case 'emerald':
        return 'bg-gradient-to-br from-[#30d158] to-[#054a36] text-white shadow-sm';
      case 'cyber':
        return 'bg-gradient-to-br from-[#bf5af2] via-[#ff375f] to-[#ffd60a] text-black shadow-md';
      case 'parchment':
        return 'bg-gradient-to-br from-[#f5f5f7] to-[#c7c7cc] text-[#1d1d1f] shadow-sm';
      case 'chrome':
        return 'bg-gradient-to-br from-[#8e8e93] to-[#2c2c2e] text-white border border-white/20';
      case 'classic':
      default:
        return `bg-gradient-to-br ${cell.colorClass} shadow-sm`;
    }
  };

  const gridClearPercent = calculateGridClearPercentage(grid);

  return (
    <div className="relative w-full overflow-hidden bg-[#131315] px-4 sm:px-6 md:px-10 py-6 flex flex-col items-center">
      {/* Ambient background glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#2997ff]/10 blur-[130px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-10 right-1/4 w-[480px] h-[240px] bg-[#5e5ce6]/10 blur-[140px] pointer-events-none rounded-full"></div>

      {/* Floating toast notification */}
      {statusNotification && (
        <div className="fixed top-24 z-50 px-4 py-2 rounded-full bg-[#1f1f21] border border-white/10 text-white text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2997ff] animate-ping"></span>
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Main Centered Playing Stage - adapts width on PC when rack is positioned on left or right */}
      {(() => {
        const isSideRack = settings.rackPosition === 'left' || settings.rackPosition === 'right';

        return (
          <div
            className={`relative w-full ${
              isSideRack ? 'max-w-[540px] md:max-w-[760px] lg:max-w-[820px]' : 'max-w-[540px]'
            } flex flex-col items-center gap-4 transition-all duration-300`}
          >
            {/* UNIFIED HUD: Prominent Score Display Directly On Top of the Board */}
            <div className="w-full bg-[#1b1b1d] rounded-3xl p-5 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2997ff]/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Top Score Row */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-[#c1c6d5] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2997ff] animate-pulse"></span>
                    Active Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[44px] sm:text-[50px] leading-none text-white font-bold tracking-tighter tabular-nums">
                      {score.toLocaleString()}
                    </span>
                    <span className="text-[14px] text-[#a3c9ff] font-semibold">pts</span>
                  </div>
                </div>

                {/* High Score Capsule */}
                <div className="bg-[#272729] rounded-2xl px-3.5 py-2 flex flex-col items-end border border-white/5">
                  <span className="text-[10px] text-[#c1c6d5] uppercase font-semibold">Best Record</span>
                  <span className="text-[18px] text-[#aac7ff] font-bold tabular-nums">
                    {highScore.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Sub-HUD Metrics: Streak Resonance, Moves Made, Occupancy */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-center">
                <div className="bg-[#1f1f21] rounded-xl p-2 border border-white/5">
                  <span className="text-[10px] text-[#c1c6d5] uppercase block font-medium">Streak</span>
                  <span className="text-[15px] text-[#64d2ff] font-bold">
                    {streak > 0 ? `x${streak} Combo` : 'Ready'}
                  </span>
                </div>

                <div className="bg-[#1f1f21] rounded-xl p-2 border border-white/5">
                  <span className="text-[10px] text-[#c1c6d5] uppercase block font-medium">Moves</span>
                  <span className="text-[15px] text-white font-bold tabular-nums">{movesMade}</span>
                </div>

                <div className="bg-[#1f1f21] rounded-xl p-2 border border-white/5">
                  <span className="text-[10px] text-[#c1c6d5] uppercase block font-medium">
                    {gameMode === 'rush' ? 'Time Left' : 'Occupancy'}
                  </span>
                  <span className="text-[15px] text-[#a3c9ff] font-bold tabular-nums">
                    {gameMode === 'rush' ? `${rushTimeLeft.toFixed(1)}s` : `${gridClearPercent}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* GAME ARENA: Holds 9x9 Board and Pickup Rack (side-by-side on PC if left/right selected) */}
            <div
              className={`w-full flex ${
                isSideRack
                  ? 'flex-col md:flex-row gap-4 items-stretch justify-center'
                  : 'flex-col gap-4 items-center'
              }`}
            >
              {/* 9x9 Precision Sunken Grid Board */}
              <div
                className={`relative w-full aspect-square ${
                  isSideRack ? 'md:flex-1 md:max-w-[560px]' : ''
                } p-3 sm:p-4 rounded-3xl bg-[#252527] shadow-2xl flex items-center justify-center select-none border border-white/10 ${
                  isBoardShaking ? 'animate-board-shake' : ''
                } order-1 ${settings.rackPosition === 'left' ? 'md:order-2' : 'md:order-1'}`}
                style={{ touchAction: 'none' }}
              >
                {/* Outer Chassis Accent Ring */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none"></div>

                {/* 9x9 Matrix Container: composed of 9 macro quadrants (3x3 each) */}
                <div
                  ref={boardRef}
                  id="game-grid"
                  className={`w-full h-full grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 p-1 bg-[#0e0e10]/90 rounded-2xl border border-white/5 ${
                    settings.superzoneStyle === 'high-contrast' ? 'ring-1 ring-white/10' : ''
                  }`}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(quadrantIdx => {
                    const quadRow = Math.floor(quadrantIdx / 3);
                    const quadCol = quadrantIdx % 3;
                    const isCenter = quadrantIdx === 4;
                    const isAlternating = (quadRow + quadCol) % 2 === 0;

                    const quadBg =
                      settings.superzoneStyle === 'alternating'
                        ? isAlternating
                          ? 'bg-[#272729]/70'
                          : 'bg-[#1b1b1d]/70'
                        : isCenter
                        ? 'bg-[#272729]/90 shadow-inner'
                        : quadrantIdx % 2 === 0
                        ? 'bg-[#272729]/60'
                        : 'bg-[#272729]/40';

                    return (
                      <div
                        key={quadrantIdx}
                        className={`grid grid-cols-3 grid-rows-3 gap-1 p-1 rounded-xl border border-white/5 transition-all ${quadBg}`}
                      >
                        {[0, 1, 2].map(localR =>
                          [0, 1, 2].map(localC => {
                            const r = quadRow * 3 + localR;
                            const c = quadCol * 3 + localC;
                            const cell = grid[r][c];
                            const cellKey = `${r},${c}`;
                            const isClearing = clearingCells.has(cellKey);

                            // Ghost preview calculation
                            let isGhost = false;
                            let isInvalidGhost = false;

                            if (activePiece && estimatedPlacement) {
                              const { targetR, targetC, isValid } = estimatedPlacement;
                              const pieceR = r - targetR;
                              const pieceC = c - targetC;

                              if (
                                pieceR >= 0 &&
                                pieceR < activePiece.shape.length &&
                                pieceC >= 0 &&
                                pieceC < activePiece.shape[0].length &&
                                activePiece.shape[pieceR][pieceC] === 1
                              ) {
                                if (isValid) {
                                  isGhost = true;
                                } else {
                                  isInvalidGhost = true;
                                }
                              }
                            }

                            const isKeyboardTarget = isKeyboardNavActive && keyboardCursor.r === r && keyboardCursor.c === c;

                            return (
                              <button
                                key={cellKey}
                                type="button"
                                onClick={() => handleCellClick(r, c)}
                                className={`aspect-square rounded-sm relative flex items-center justify-center transition-all duration-150 ${
                                  isClearing
                                    ? 'animate-cell-clear bg-[#64d2ff]'
                                    : cell
                                    ? getCellThemeClass(cell)
                                    : isGhost
                                    ? 'bg-[#2997ff]/35 ring-1 ring-[#2997ff] animate-pulse shadow-[0_0_10px_rgba(41,151,255,0.6)]'
                                    : isInvalidGhost
                                    ? 'bg-red-500/25 ring-1 ring-red-500/40'
                                    : isKeyboardTarget
                                    ? 'bg-white/[0.1] ring-2 ring-[#64d2ff] ring-offset-1 ring-offset-[#0e0e10] z-20 shadow-[0_0_10px_rgba(100,210,255,0.85)]'
                                    : 'bg-white/[0.04] hover:bg-white/[0.08]'
                                }`}
                                aria-label={`Cell ${r + 1},${c + 1}`}
                              >
                                {cell && settings.colorblindAssist && (
                                  <span className="text-[10px] font-bold opacity-80 select-none">
                                    {cell.symbol}
                                  </span>
                                )}
                                {isKeyboardTarget && !cell && !isGhost && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#64d2ff] shadow-[0_0_6px_#64d2ff] animate-ping pointer-events-none"></span>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Piece Pickup Rack (Adapts to Vertical Shelf on PC when Left or Right is chosen) */}
              <div
                className={`w-full ${
                  isSideRack ? 'md:w-[175px] lg:w-[200px] shrink-0' : 'w-full'
                } bg-[#1b1b1d] rounded-3xl p-3.5 sm:p-4 shadow-xl border border-white/5 flex flex-col justify-between order-2 ${
                  settings.rackPosition === 'left' ? 'md:order-1' : 'md:order-2'
                }`}
              >
                {/* Rack Header */}
                <div className="flex items-center justify-between pb-2 px-1 border-b border-white/5">
                  <span className="text-[11px] text-[#c1c6d5] uppercase tracking-wider font-semibold">
                    Pickup Rack
                  </span>
                  <span className="text-[10px] text-[#a3c9ff] font-medium bg-[#252527] px-2 py-0.5 rounded-full border border-white/5">
                    {isSideRack ? 'Vertical' : 'Horizontal'}
                  </span>
                </div>

                {/* Rack Polyomino Slots - Displays vertically stacked on PC when left/right is selected */}
                <div
                  className={
                    isSideRack
                      ? 'grid grid-cols-3 md:flex md:flex-col gap-2.5 md:flex-1 md:justify-between mt-2.5'
                      : 'grid grid-cols-3 gap-3 mt-2.5'
                  }
                >
                  {rack.map((piece, idx) => {
                    const slotCmd = `selectSlot${idx + 1}` as ActionCommand;
                    const boundKey = formatKeyName(bindings[slotCmd]?.primary || (idx + 1).toString());

                    if (!piece) {
                      return (
                        <div
                          key={idx}
                          className={`${
                            isSideRack ? 'h-24 md:h-[130px] lg:h-[140px] md:flex-1' : 'h-28'
                          } rounded-2xl bg-[#1f1f21]/40 border border-dashed border-white/10 flex flex-col items-center justify-center text-[#8b919e] text-xs`}
                        >
                          <span className="text-[11px] opacity-40">Slot Empty</span>
                        </div>
                      );
                    }

                    const isSelected = selectedPieceIndex === idx;
                    const canFit = canPieceFitAnywhere(grid, piece.shape);

                    return (
                      <div
                        key={piece.id}
                        onPointerDown={e => handlePointerDownPiece(e, idx)}
                        onClick={() => setSelectedPieceIndex(isSelected ? null : idx)}
                        className={`group relative flex flex-col items-center justify-center rounded-2xl transition-all select-none cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? 'bg-[#2a2a2c] ring-2 ring-[#2997ff] border-[#2997ff]/40 shadow-lg'
                            : 'bg-[#1f1f21] hover:bg-[#2a2a2c] border-white/5'
                        } ${!canFit ? 'opacity-35 grayscale-[0.5]' : ''} ${
                          isSideRack ? 'h-24 md:h-[130px] lg:h-[140px] md:flex-1' : 'h-28'
                        }`}
                        style={{ touchAction: 'none' }}
                        title={`${piece.name} (Key: ${boundKey})`}
                      >
                        {/* Quick keyboard shortcut badge with active rebind display */}
                        <span className="absolute top-2 left-2 text-[10px] font-mono font-bold text-[#8b919e] bg-[#141416]/80 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
                          {boundKey}
                        </span>

                        {/* Miniature Piece Render */}
                        <div
                          className="grid gap-1 p-1.5 transition-transform duration-200 group-hover:scale-110 pointer-events-none"
                          style={{
                            gridTemplateColumns: `repeat(${piece.shape[0].length}, minmax(0, 1fr))`
                          }}
                        >
                          {piece.shape.map((row, r) =>
                            row.map((val, c) => (
                              <div
                                key={`${r}-${c}`}
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs ${
                                  val === 1
                                    ? `bg-gradient-to-br ${piece.colorClass} shadow-sm`
                                    : 'opacity-0'
                                }`}
                              ></div>
                            ))
                          )}
                        </div>

                        <span className="absolute bottom-1.5 text-[10px] text-[#c1c6d5] opacity-80 truncate max-w-[85%] font-medium pointer-events-none">
                          {piece.name}
                        </span>

                        {/* Inline quick rotate icon */}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPieceIndex(idx);
                            handleRotateActivePiece();
                          }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2a2a2c] hover:bg-[#2997ff] hover:text-white text-[#c1c6d5] flex items-center justify-center transition-all"
                          title="Rotate Piece (Space)"
                        >
                          <span className="material-symbols-outlined text-[13px]">rotate_right</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FUNCTIONAL TACTILE HUD FOOTER STRIP */}
            <div className="w-full bg-[#0e0e10]/90 backdrop-blur-xl rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-3 border border-white/5">
              {/* Top Row: Audio, Vibration, and Soundscape Toggles + Mode Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Audio Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const muted = sound.toggleMute();
                      updateSettings({ sfxVolume: muted ? 0 : 82 });
                      if (!muted) {
                        sound.playPlace();
                      }
                      showNotification(muted ? 'Audio Muted' : 'Audio Unmuted (82%)');
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-90 border border-white/5 ${
                      sound.getMuted()
                        ? 'bg-[#2a2a2c] text-[#8b919e]'
                        : 'bg-[#2997ff]/20 text-[#a3c9ff] border-[#2997ff]/30'
                    }`}
                    title={sound.getMuted() ? 'Audio Muted (Click to Unmute)' : 'Audio Active'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {sound.getMuted() ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>

                  {/* Functional Vibration / Haptic Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.hapticEnabled;
                      updateSettings({ hapticEnabled: nextState });
                      if (nextState) {
                        sound.triggerHaptic('medium', true);
                        showNotification('Haptic Vibration: Enabled');
                      } else {
                        showNotification('Haptic Vibration: Disabled');
                      }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-90 border border-white/5 ${
                      settings.hapticEnabled
                        ? 'bg-[#2997ff]/20 text-[#a3c9ff] border-[#2997ff]/30'
                        : 'bg-[#2a2a2c] text-[#8b919e]'
                    }`}
                    title="Haptic Engine Vibration (Placement & Clears)"
                  >
                    <span className="material-symbols-outlined text-[18px]">vibration</span>
                  </button>

                  {/* Colorblind Assist Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.colorblindAssist;
                      updateSettings({ colorblindAssist: nextState });
                      showNotification(
                        nextState ? 'Colorblind Symbols: Active' : 'Colorblind Symbols: Hidden'
                      );
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-90 border border-white/5 ${
                      settings.colorblindAssist
                        ? 'bg-[#2997ff]/20 text-[#a3c9ff] border-[#2997ff]/30'
                        : 'bg-[#2a2a2c] text-[#8b919e]'
                    }`}
                    title="Colorblind Geometric Inner-Glyphs"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>

                  {/* Ambient Sound Cycle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextAmbient =
                        settings.ambientSound === 'rain'
                          ? 'synth'
                          : settings.ambientSound === 'synth'
                          ? 'silent'
                          : 'rain';
                      updateSettings({ ambientSound: nextAmbient });
                      sound.setAmbient(nextAmbient);
                      showNotification(
                        `Soundscape: ${
                          nextAmbient === 'rain'
                            ? 'Glass Rain'
                            : nextAmbient === 'synth'
                            ? 'Deep Synth'
                            : 'Silent'
                        }`
                      );
                    }}
                    className="px-2.5 py-1 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-xs text-[#c1c6d5] flex items-center gap-1.5 transition-colors border border-white/5"
                    title="Click to cycle ambient focus soundscapes"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#64d2ff]">
                      headphones
                    </span>
                    <span className="capitalize font-medium">{settings.ambientSound}</span>
                  </button>
                </div>

                {/* Active Mode Pill Button */}
                <button
                  onClick={onOpenModeSelector}
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b1b1d] hover:bg-[#2a2a2c] border border-white/10 transition-colors ml-auto"
                >
                  <span className="w-2 h-2 rounded-full bg-[#64d2ff]"></span>
                  <span className="text-[13px] text-white font-semibold">
                    {gameMode === 'classic'
                      ? 'Classic 9x9'
                      : gameMode === 'rush'
                      ? 'Blast Rush'
                      : gameMode === 'tactical'
                      ? 'Tactical Matrix'
                      : 'Zen Sanctuary'}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#c1c6d5]">
                    expand_more
                  </span>
                </button>
              </div>

              {/* Bottom Row: Rack Placement Chooser below the sound & haptics toggles, in the same box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-white/5">
                <div className="flex items-center gap-2 text-[#c1c6d5] text-xs font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-[#64d2ff]">
                    view_sidebar
                  </span>
                  <span>Pickup Rack Placement:</span>
                </div>

                {/* 3-option Segmented Chooser: Left, Bottom, Right */}
                <div className="flex items-center p-1 bg-[#1b1b1d] rounded-xl border border-white/5 gap-1 w-full sm:w-auto sm:min-w-[280px]">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ rackPosition: 'left' });
                      showNotification('Rack Docked: Left (Vertical on PC)');
                    }}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      settings.rackPosition === 'left'
                        ? 'bg-[#2997ff] text-white shadow-sm'
                        : 'text-[#8b919e] hover:text-[#e4e2e4]'
                    }`}
                    title="Dock rack to Left of board (Vertical on PC)"
                  >
                    <span className="material-symbols-outlined text-[15px]">align_horizontal_left</span>
                    <span>Left</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ rackPosition: 'bottom' });
                      showNotification('Rack Docked: Bottom (Horizontal)');
                    }}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      settings.rackPosition === 'bottom'
                        ? 'bg-[#2997ff] text-white shadow-sm'
                        : 'text-[#8b919e] hover:text-[#e4e2e4]'
                    }`}
                    title="Dock rack under board (Horizontal)"
                  >
                    <span className="material-symbols-outlined text-[15px]">vertical_align_bottom</span>
                    <span>Bottom</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ rackPosition: 'right' });
                      showNotification('Rack Docked: Right (Vertical on PC)');
                    }}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      settings.rackPosition === 'right'
                        ? 'bg-[#2997ff] text-white shadow-sm'
                        : 'text-[#8b919e] hover:text-[#e4e2e4]'
                    }`}
                    title="Dock rack to Right of board (Vertical on PC)"
                  >
                    <span>Right</span>
                    <span className="material-symbols-outlined text-[15px]">align_horizontal_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Dragged Polyomino (Follows finger/mouse smoothly with thumb clearance) */}
      {isDragging && draggedPieceIndex !== null && dragPointerPos && rack[draggedPieceIndex] && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-16 scale-110 drop-shadow-2xl transition-transform"
          style={{
            left: `${dragPointerPos.x}px`,
            top: `${dragPointerPos.y}px`
          }}
        >
          <div
            className="grid gap-1 p-2 rounded-xl bg-[#1b1b1d]/90 backdrop-blur-md shadow-2xl border border-white/20"
            style={{
              gridTemplateColumns: `repeat(${rack[draggedPieceIndex]!.shape[0].length}, minmax(0, 1fr))`
            }}
          >
            {rack[draggedPieceIndex]!.shape.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-6 h-6 rounded-sm ${
                    val === 1
                      ? `bg-gradient-to-br ${rack[draggedPieceIndex]!.colorClass} shadow-md`
                      : 'opacity-0'
                  }`}
                ></div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1f1f21] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#93000a]/20 border border-red-500/30 flex items-center justify-center text-[#ffb4ab] mb-4">
              <span className="material-symbols-outlined text-[32px]">grid_off</span>
            </div>

            <h3 className="text-[26px] font-bold text-white mb-1">Grid Locked</h3>
            <p className="text-[13px] text-[#c1c6d5] mb-6">
              No remaining piece can fit onto the 9x9 field.
            </p>

            <div className="w-full bg-[#131315] rounded-2xl p-4 mb-6 border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#c1c6d5]">Final Score</span>
                <span className="text-white font-bold text-lg tabular-nums">
                  {score.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#c1c6d5]">Best Record</span>
                <span className="text-[#a3c9ff] font-semibold tabular-nums">
                  {highScore.toLocaleString()} pts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#c1c6d5]">Moves Completed</span>
                <span className="text-white font-medium">{movesMade}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleRestartGame}
                type="button"
                className="w-full py-3.5 rounded-full bg-[#0066cc] hover:bg-[#2997ff] text-white font-semibold text-base transition-all active:scale-95 shadow-lg"
              >
                Play Again
              </button>
              {history && (
                <button
                  onClick={handleUndo}
                  type="button"
                  className="w-full py-2.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-[#e4e2e4] font-medium text-sm transition-all"
                >
                  Undo Last Move
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#1f1f21] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <h3 className="text-[24px] font-bold text-white mb-2">Session Paused</h3>
            <p className="text-[13px] text-[#c1c6d5] mb-6">Board state is preserved.</p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => setIsPaused(false)}
                type="button"
                className="w-full py-3 rounded-full bg-[#0066cc] text-white font-semibold text-sm hover:bg-[#2997ff] transition-all"
              >
                Resume
              </button>
              <button
                onClick={handleRestartGame}
                type="button"
                className="w-full py-2.5 rounded-full bg-[#2a2a2c] hover:bg-[#353437] text-[#e4e2e4] text-sm"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
