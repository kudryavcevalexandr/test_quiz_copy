import { useMemo, useState } from 'react';
import type { Tile } from './types';
import { areAdjacent, findEmptyIndex, isWinningState, shuffleTiles } from './utils';

export const usePuzzleState = () => {
  const [tiles, setTiles] = useState<Tile[]>(shuffleTiles);
  const isSolved = useMemo(() => isWinningState(tiles), [tiles]);

  const moveTile = (tileIndex: number) => {
    setTiles((prev: Tile[]) => {
      const emptyIndex = findEmptyIndex(prev);

      if (!areAdjacent(tileIndex, emptyIndex)) {
        return prev;
      }

      const updated = [...prev];
      updated[emptyIndex] = prev[tileIndex];
      updated[tileIndex] = null;

      return updated;
    });
  };

  const reset = () => {
    setTiles(shuffleTiles());
  };

  return { tiles, isSolved, moveTile, reset };
};
