import { ActiveClearInfo, CellData, Grid, PolyominoPiece, ThemeType } from '../types/game';

/**
 * Shape definitions for polyomino pieces:
 * 1 represents filled block, 0 represents empty space in the bounding box.
 */
interface PieceTemplate {
  name: string;
  shape: number[][];
  colorClass: string;
  symbol: string;
}

export const PIECE_TEMPLATES: PieceTemplate[] = [
  // 1-Block (Monomino)
  {
    name: 'Single Monomino',
    shape: [[1]],
    colorClass: 'from-[#64d2ff] to-[#2997ff]',
    symbol: '●'
  },
  // 2-Block (Dominoes)
  {
    name: 'Domino-H (2x1)',
    shape: [[1, 1]],
    colorClass: 'from-[#2997ff] to-[#0066cc]',
    symbol: '■'
  },
  {
    name: 'Domino-V (1x2)',
    shape: [[1], [1]],
    colorClass: 'from-[#2997ff] to-[#0066cc]',
    symbol: '■'
  },
  // 3-Block (Triominoes)
  {
    name: 'I-Bar (3x1)',
    shape: [[1, 1, 1]],
    colorClass: 'from-[#2997ff] to-[#5e5ce6]',
    symbol: '▲'
  },
  {
    name: 'I-Bar (1x3)',
    shape: [[1], [1], [1]],
    colorClass: 'from-[#2997ff] to-[#5e5ce6]',
    symbol: '▲'
  },
  {
    name: 'Corner Tri (2x2)',
    shape: [
      [1, 0],
      [1, 1]
    ],
    colorClass: 'from-[#64d2ff] to-[#2997ff]',
    symbol: '◆'
  },
  {
    name: 'Corner Tri-R (2x2)',
    shape: [
      [0, 1],
      [1, 1]
    ],
    colorClass: 'from-[#64d2ff] to-[#2997ff]',
    symbol: '◆'
  },
  // 4-Block (Tetrominoes)
  {
    name: 'I-Bar (4x1)',
    shape: [[1, 1, 1, 1]],
    colorClass: 'from-[#5e5ce6] to-[#004882]',
    symbol: '▲'
  },
  {
    name: 'I-Bar (1x4)',
    shape: [[1], [1], [1], [1]],
    colorClass: 'from-[#5e5ce6] to-[#004882]',
    symbol: '▲'
  },
  {
    name: 'Square O-Block (2x2)',
    shape: [
      [1, 1],
      [1, 1]
    ],
    colorClass: 'from-[#2997ff] to-[#0066cc]',
    symbol: '■'
  },
  {
    name: 'Corner L-4',
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 0]
    ],
    colorClass: 'from-[#64d2ff] to-[#2193fb]',
    symbol: 'L'
  },
  {
    name: 'Corner L-4 Inverted',
    shape: [
      [0, 0, 1],
      [0, 0, 1],
      [0, 1, 1]
    ],
    colorClass: 'from-[#64d2ff] to-[#2193fb]',
    symbol: '⅃'
  },
  {
    name: 'T-Tetromino',
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    colorClass: 'from-[#2193fb] to-[#5e5ce6]',
    symbol: 'T'
  },
  {
    name: 'Z-Tetromino',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    colorClass: 'from-[#5e5ce6] to-[#2997ff]',
    symbol: 'Z'
  },
  // 5-Block (Pentaminoes)
  {
    name: 'I-Bar (5x1)',
    shape: [[1, 1, 1, 1, 1]],
    colorClass: 'from-[#5e5ce6] to-[#0066ce]',
    symbol: '▲'
  },
  {
    name: 'I-Bar (1x5)',
    shape: [[1], [1], [1], [1], [1]],
    colorClass: 'from-[#5e5ce6] to-[#0066ce]',
    symbol: '▲'
  },
  {
    name: 'Plus Cross (3x3)',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    colorClass: 'from-[#64d2ff] to-[#5e5ce6]',
    symbol: '✚'
  },
  {
    name: 'Big L-Block (3x3)',
    shape: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1]
    ],
    colorClass: 'from-[#2997ff] to-[#0066cc]',
    symbol: 'L'
  },
  // 3x3 Cube
  {
    name: '3x3 Cube',
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    colorClass: 'from-[#2997ff] to-[#005cba]',
    symbol: '▧'
  },
  // 2x3 & 3x2 Rectangles
  {
    name: 'Rect 2x3',
    shape: [
      [1, 1, 1],
      [1, 1, 1]
    ],
    colorClass: 'from-[#2193fb] to-[#0066cc]',
    symbol: '▭'
  },
  {
    name: 'Rect 3x2',
    shape: [
      [1, 1],
      [1, 1],
      [1, 1]
    ],
    colorClass: 'from-[#2193fb] to-[#0066cc]',
    symbol: '▯'
  }
];

export function createEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null));
}

/**
 * Creates tactical mode grid with strategic obstacle blocks
 */
export function createTacticalGrid(theme: ThemeType): Grid {
  const g = createEmptyGrid();
  const obstaclePositions: [number, number][] = [
    [1, 1], [1, 7],
    [4, 4],
    [7, 1], [7, 7]
  ];

  obstaclePositions.forEach(([r, c]) => {
    g[r][c] = {
      id: generateId(),
      colorClass: 'from-[#8b919e] to-[#353437]',
      themeStyle: theme,
      symbol: '◆',
      placedAt: Date.now(),
      isObstacle: true
    };
  });

  return g;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function instantiatePiece(template: PieceTemplate): PolyominoPiece {
  let blockCount = 0;
  for (const row of template.shape) {
    for (const val of row) {
      if (val === 1) blockCount++;
    }
  }

  return {
    id: generateId(),
    name: template.name,
    shape: template.shape.map(r => [...r]),
    colorClass: template.colorClass,
    symbol: template.symbol,
    blockCount
  };
}

/**
 * Generates 3 pieces for the pickup rack.
 * Balances piece difficulty so players get viable configurations.
 */
export function generateRackPieces(): PolyominoPiece[] {
  const small = PIECE_TEMPLATES.filter(p => p.shape.flat().filter(v => v === 1).length <= 3);
  const medium = PIECE_TEMPLATES.filter(p => {
    const c = p.shape.flat().filter(v => v === 1).length;
    return c === 4;
  });
  const large = PIECE_TEMPLATES.filter(p => p.shape.flat().filter(v => v === 1).length >= 5);

  const pickSmall = small[Math.floor(Math.random() * small.length)];
  const pickMedium = medium[Math.floor(Math.random() * medium.length)];
  const pool = [...medium, ...large, ...small];
  const pickRandom = pool[Math.floor(Math.random() * pool.length)];

  const selected = [pickSmall, pickMedium, pickRandom];
  selected.sort(() => Math.random() - 0.5);

  return selected.map(instantiatePiece);
}

/**
 * Rotate a piece 90 degrees clockwise
 */
export function rotateShape(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }

  return result;
}

/**
 * Check if a shape can fit at (startRow, startCol) on the 9x9 grid
 */
export function canPlaceShape(grid: Grid, shape: number[][], startRow: number, startCol: number): boolean {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  // Out of bounds check
  if (startRow < 0 || startCol < 0 || startRow + shapeRows > 9 || startCol + shapeCols > 9) {
    return false;
  }

  for (let r = 0; r < shapeRows; r++) {
    for (let c = 0; c < shapeCols; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;
        if (grid[boardRow][boardCol] !== null) {
          return false; // Cell already filled
        }
      }
    }
  }

  return true;
}

/**
 * Advanced placement estimation:
 * Given a piece shape, a cursor coordinate on the board, and the relative grab offset,
 * calculates the ideal top-left coordinate `[startR, startC]` where the piece will drop.
 * Clamps to board bounds and checks neighboring offsets for magnetic fluent snap.
 */
export function findBestPlacementCoord(
  grid: Grid,
  shape: number[][],
  cursorRow: number,
  cursorCol: number,
  grabOffsetR: number = 0,
  grabOffsetC: number = 0
): { targetR: number; targetC: number; isValid: boolean } | null {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  // Candidate top-left based on grab offset
  let targetR = cursorRow - grabOffsetR;
  let targetC = cursorCol - grabOffsetC;

  // Clamp candidate so piece stays entirely within the 9x9 boundaries
  targetR = Math.max(0, Math.min(9 - shapeRows, targetR));
  targetC = Math.max(0, Math.min(9 - shapeCols, targetC));

  // Check if clamped position is valid
  if (canPlaceShape(grid, shape, targetR, targetC)) {
    return { targetR, targetC, isValid: true };
  }

  // If directly clamped position isn't valid, search small neighboring radii (1 step)
  // to magnetic-snap into the nearest legal cell
  const deltas = [
    [0, 0], [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  for (const [dr, dc] of deltas) {
    const testR = targetR + dr;
    const testC = targetC + dc;
    if (
      testR >= 0 &&
      testC >= 0 &&
      testR + shapeRows <= 9 &&
      testC + shapeCols <= 9 &&
      canPlaceShape(grid, shape, testR, testC)
    ) {
      return { targetR: testR, targetC: testC, isValid: true };
    }
  }

  // Still return the clamped position (with isValid: false) so ghost preview can show occupied conflict
  return { targetR, targetC, isValid: false };
}

/**
 * Check if a piece can fit anywhere on the 9x9 grid
 */
export function canPieceFitAnywhere(grid: Grid, shape: number[][]): boolean {
  const shapeRows = shape.length;
  const shapeCols = shape[0].length;

  for (let r = 0; r <= 9 - shapeRows; r++) {
    for (let c = 0; c <= 9 - shapeCols; c++) {
      if (canPlaceShape(grid, shape, r, c)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if ANY of the remaining pieces in the tray have at least one legal move
 */
export function hasAnyLegalMove(grid: Grid, rack: (PolyominoPiece | null)[]): boolean {
  const remainingPieces = rack.filter((p): p is PolyominoPiece => p !== null);
  if (remainingPieces.length === 0) return true;

  for (const piece of remainingPieces) {
    if (canPieceFitAnywhere(grid, piece.shape)) {
      return true;
    }
  }
  return false;
}

/**
 * Place a piece onto the grid and return the new grid.
 */
export function placePieceOnGrid(
  grid: Grid,
  piece: PolyominoPiece,
  startRow: number,
  startCol: number,
  theme: ThemeType
): Grid {
  const newGrid = grid.map(row => [...row]);
  const now = Date.now();

  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] === 1) {
        newGrid[startRow + r][startCol + c] = {
          id: generateId(),
          colorClass: piece.colorClass,
          themeStyle: theme,
          symbol: piece.symbol,
          placedAt: now
        };
      }
    }
  }

  return newGrid;
}

/**
 * Evaluate the board for completed rows, columns, and 3x3 sub-quadrants.
 */
export function evaluateClears(grid: Grid, currentStreak: number = 0): {
  clearedGrid: Grid;
  clearedCellCoords: [number, number][];
  clearInfo: ActiveClearInfo | null;
} {
  const fullRows: number[] = [];
  const fullCols: number[] = [];
  const fullBoxes: number[] = [];

  // 1. Check all 9 horizontal rows
  for (let r = 0; r < 9; r++) {
    let isRowFull = true;
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === null) {
        isRowFull = false;
        break;
      }
    }
    if (isRowFull) fullRows.push(r);
  }

  // 2. Check all 9 vertical columns
  for (let c = 0; c < 9; c++) {
    let isColFull = true;
    for (let r = 0; r < 9; r++) {
      if (grid[r][c] === null) {
        isColFull = false;
        break;
      }
    }
    if (isColFull) fullCols.push(c);
  }

  // 3. Check all nine 3x3 sub-quadrants
  for (let boxIdx = 0; boxIdx < 9; boxIdx++) {
    const startR = Math.floor(boxIdx / 3) * 3;
    const startC = (boxIdx % 3) * 3;

    let isBoxFull = true;
    for (let r = startR; r < startR + 3; r++) {
      for (let c = startC; c < startC + 3; c++) {
        if (grid[r][c] === null) {
          isBoxFull = false;
          break;
        }
      }
      if (!isBoxFull) break;
    }

    if (isBoxFull) fullBoxes.push(boxIdx);
  }

  const totalLinesAndBoxes = fullRows.length + fullCols.length + fullBoxes.length;

  if (totalLinesAndBoxes === 0) {
    return {
      clearedGrid: grid,
      clearedCellCoords: [],
      clearInfo: null
    };
  }

  const cellsToClear = new Set<string>();

  for (const r of fullRows) {
    for (let c = 0; c < 9; c++) {
      cellsToClear.add(`${r},${c}`);
    }
  }

  for (const c of fullCols) {
    for (let r = 0; r < 9; r++) {
      cellsToClear.add(`${r},${c}`);
    }
  }

  for (const boxIdx of fullBoxes) {
    const startR = Math.floor(boxIdx / 3) * 3;
    const startC = (boxIdx % 3) * 3;
    for (let r = startR; r < startR + 3; r++) {
      for (let c = startC; c < startC + 3; c++) {
        cellsToClear.add(`${r},${c}`);
      }
    }
  }

  const clearedCellCoords: [number, number][] = Array.from(cellsToClear).map(s => {
    const [r, c] = s.split(',').map(Number);
    return [r, c];
  });

  const basePoints = (fullRows.length + fullCols.length) * 100 + fullBoxes.length * 300;

  let simultaneousMult = 1.0;
  if (totalLinesAndBoxes === 2) simultaneousMult = 2.4;
  else if (totalLinesAndBoxes === 3) simultaneousMult = 3.6;
  else if (totalLinesAndBoxes === 4) simultaneousMult = 4.8;
  else if (totalLinesAndBoxes >= 5) simultaneousMult = 6.0;

  const streakBonus = 1.0 + Math.min(6, currentStreak) * 0.4;
  const finalMultiplier = Number((simultaneousMult * streakBonus).toFixed(1));
  const scoreGained = Math.round(basePoints * finalMultiplier);

  const clearedGrid = grid.map(row => [...row]);
  for (const [r, c] of clearedCellCoords) {
    clearedGrid[r][c] = null;
  }

  return {
    clearedGrid,
    clearedCellCoords,
    clearInfo: {
      rows: fullRows,
      cols: fullCols,
      boxes: fullBoxes,
      totalClearedCells: clearedCellCoords.length,
      scoreGained,
      multiplier: finalMultiplier,
      isMegablast: totalLinesAndBoxes >= 3
    }
  };
}

export function calculateGridClearPercentage(grid: Grid): number {
  let filled = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== null) filled++;
    }
  }
  return Math.round((filled / 81) * 100);
}

/**
 * Zen Exhale / Reorganize: clears the busiest quadrant when stuck
 */
export function zenExhale(grid: Grid): { newGrid: Grid; clearedBoxIdx: number } {
  let maxFilled = -1;
  let bestBox = 4;

  for (let boxIdx = 0; boxIdx < 9; boxIdx++) {
    const startR = Math.floor(boxIdx / 3) * 3;
    const startC = (boxIdx % 3) * 3;
    let count = 0;
    for (let r = startR; r < startR + 3; r++) {
      for (let c = startC; c < startC + 3; c++) {
        if (grid[r][c] !== null) count++;
      }
    }
    if (count > maxFilled) {
      maxFilled = count;
      bestBox = boxIdx;
    }
  }

  const newGrid = grid.map(row => [...row]);
  const startR = Math.floor(bestBox / 3) * 3;
  const startC = (bestBox % 3) * 3;
  for (let r = startR; r < startR + 3; r++) {
    for (let c = startC; c < startC + 3; c++) {
      newGrid[r][c] = null;
    }
  }

  return { newGrid, clearedBoxIdx: bestBox };
}
