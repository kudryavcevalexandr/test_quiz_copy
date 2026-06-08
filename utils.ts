import {
  DRAG_COMPLETION_DISTANCE,
  ITEM_STEP,
  LIST_PADDING,
  SWIPE_VELOCITY,
  TAP_DISTANCE,
} from './constants';
import type { DragGesture, Tile } from './types';

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getCoordinates = (index: number) => ({
  x: LIST_PADDING,
  y: LIST_PADDING + index * ITEM_STEP,
});

export const getDirectionalDrag = (gesture: DragGesture) => ({
  x: 0,
  y: gesture.dy,
});

export const getDropIndex = (
  currentIndex: number,
  gesture: DragGesture,
  itemCount: number,
): number => {
  let offsetSlots = Math.round(gesture.dy / ITEM_STEP);

  if (offsetSlots === 0 && Math.abs(gesture.vy) > SWIPE_VELOCITY) {
    offsetSlots = gesture.vy > 0 ? 1 : -1;
  }

  return clamp(currentIndex + offsetSlots, 0, itemCount - 1);
};

export const shouldCompleteMove = (gesture: DragGesture): boolean => {
  const isTap = Math.abs(gesture.dx) < TAP_DISTANCE && Math.abs(gesture.dy) < TAP_DISTANCE;

  if (isTap) {
    return false;
  }

  return (
    Math.abs(gesture.dy) > ITEM_STEP / DRAG_COMPLETION_DISTANCE ||
    Math.abs(gesture.vy) > SWIPE_VELOCITY
  );
};

export const reorderTiles = (
  tiles: Tile[],
  fromIndex: number,
  toIndex: number,
): Tile[] => {
  if (fromIndex === toIndex) {
    return tiles;
  }

  const updated = [...tiles];
  const [movedTile] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, movedTile);

  return updated;
};
