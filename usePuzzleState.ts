import { useCallback, useRef, useState } from 'react';
import type { CatalogBlock, DragGesture, Tile } from './types';
import { getDropIndex, reorderTiles } from './utils';

export const usePuzzleState = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const nextInstanceId = useRef(0);

  const moveTile = useCallback((tileIndex: number, gesture: DragGesture) => {
    setTiles((prev: Tile[]) => {
      const dropIndex = getDropIndex(tileIndex, gesture, prev.length);

      return reorderTiles(prev, tileIndex, dropIndex);
    });
  }, []);

  const addBlock = useCallback((block: CatalogBlock) => {
    nextInstanceId.current += 1;
    setTiles((prev: Tile[]) => [
      ...prev,
      { ...block, instanceId: `${block.id}-${nextInstanceId.current}` },
    ]);
  }, []);

  return { tiles, moveTile, addBlock };
};
