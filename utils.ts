import {
  DRAG_COMPLETION_DISTANCE,
  GRID_PADDING,
  GRID_SIZE,
  SHUFFLE_MOVES,
  SWIPE_VELOCITY,
  TAP_DISTANCE,
  TILE_GAP,
  TILE_SIZE,
  WIN_STATE,
} from './constants';
import type { DragGesture, Tile } from './types';

export const findEmptyIndex = (tiles: Tile[]): number =>
  tiles.findIndex((tile) => tile === null);

export const areAdjacent = (from: number, to: number): boolean => {
  const fromRow = Math.floor(from / GRID_SIZE);
  const fromCol = from % GRID_SIZE;
  const toRow = Math.floor(to / GRID_SIZE);
  const toCol = to % GRID_SIZE;

  return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
};

export const isWinningState = (tiles: Tile[]): boolean =>
  tiles.every((value, index) => value === WIN_STATE[index]);

export const getValidMoves = (tiles: Tile[]): number[] => {
  const emptyIndex = findEmptyIndex(tiles);

  return tiles.reduce<number[]>((moves, _tile, index) => {
    if (areAdjacent(index, emptyIndex)) {
      moves.push(index);
    }

    return moves;
  }, []);
};

// Make random valid moves from the winning state so every shuffle is solvable.
export const shuffleTiles = (): Tile[] => {
  let shuffled: Tile[] = [...WIN_STATE];

  do {
    shuffled = [...WIN_STATE];

    for (let i = 0; i < SHUFFLE_MOVES; i += 1) {
      const emptyIndex = findEmptyIndex(shuffled);
      const validMoves = getValidMoves(shuffled);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];

      [shuffled[emptyIndex], shuffled[randomMove]] = [
        shuffled[randomMove],
        shuffled[emptyIndex],
      ];
    }
  } while (isWinningState(shuffled));

  return shuffled;
};

export const getCoordinates = (index: number) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  return {
    x: GRID_PADDING + col * TILE_SIZE + TILE_GAP / 2,
    y: GRID_PADDING + row * TILE_SIZE + TILE_GAP / 2,
  };
};

export const getDirectionalDrag = (
  currentIndex: number,
  emptyIndex: number,
  gesture: DragGesture,
) => {
  const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
  const emptyCol = emptyIndex % GRID_SIZE;
  const currentRow = Math.floor(currentIndex / GRID_SIZE);
  const currentCol = currentIndex % GRID_SIZE;

  if (currentRow === emptyRow && Math.abs(currentCol - emptyCol) === 1) {
    const maxDx = (emptyCol - currentCol) * TILE_SIZE;
    const dx = maxDx > 0
      ? Math.min(Math.max(gesture.dx, 0), maxDx)
      : Math.max(Math.min(gesture.dx, 0), maxDx);

    return { dx, dy: 0 };
  }

  if (currentCol === emptyCol && Math.abs(currentRow - emptyRow) === 1) {
    const maxDy = (emptyRow - currentRow) * TILE_SIZE;
    const dy = maxDy > 0
      ? Math.min(Math.max(gesture.dy, 0), maxDy)
      : Math.max(Math.min(gesture.dy, 0), maxDy);

    return { dx: 0, dy };
  }

  return { dx: 0, dy: 0 };
};

export const shouldCompleteMove = (
  currentIndex: number,
  emptyIndex: number,
  gesture: DragGesture,
): boolean => {
  const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
  const emptyCol = emptyIndex % GRID_SIZE;
  const currentRow = Math.floor(currentIndex / GRID_SIZE);
  const currentCol = currentIndex % GRID_SIZE;
  const isTap = Math.abs(gesture.dx) < TAP_DISTANCE && Math.abs(gesture.dy) < TAP_DISTANCE;

  if (isTap) {
    return true;
  }

  if (currentRow === emptyRow && Math.abs(currentCol - emptyCol) === 1) {
    const direction = emptyCol - currentCol;

    return (
      Math.abs(gesture.dx) > TILE_SIZE / DRAG_COMPLETION_DISTANCE ||
      gesture.vx * direction > SWIPE_VELOCITY
    );
  }

  if (currentCol === emptyCol && Math.abs(currentRow - emptyRow) === 1) {
    const direction = emptyRow - currentRow;

    return (
      Math.abs(gesture.dy) > TILE_SIZE / DRAG_COMPLETION_DISTANCE ||
      gesture.vy * direction > SWIPE_VELOCITY
    );
  }

  return false;
};
