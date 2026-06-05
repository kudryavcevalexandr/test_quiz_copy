import { useMemo, useState } from 'react';
import type { DragGesture, Tile } from './types';
import { getDropIndex, isWinningState, reorderTiles, shuffleTiles } from './utils';

export const usePuzzleState = () => {
  const [tiles, setTiles] = useState<Tile[]>(shuffleTiles);
  const isSolved = useMemo(() => isWinningState(tiles), [tiles]);

  const moveTile = (tileIndex: number, gesture: DragGesture) => {
    setTiles((prev: Tile[]) => {
      const dropIndex = getDropIndex(tileIndex, gesture, prev.length);

      return reorderTiles(prev, tileIndex, dropIndex);
    });
  };

  const reset = () => {
    setTiles(shuffleTiles());
  };

  return { tiles, isSolved, moveTile, reset };
};
