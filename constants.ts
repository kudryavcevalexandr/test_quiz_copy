import { Dimensions } from 'react-native';
import type { CatalogCategory } from './types';

export const CATALOG_CATEGORIES: CatalogCategory[] = Array.from(
  { length: 10 },
  (_, categoryIndex) => {
    const categoryNumber = categoryIndex + 1;

    return {
      id: `category-${categoryNumber}`,
      name: `Категория ${categoryNumber}`,
      blocks: Array.from({ length: 10 }, (_, blockIndex) => {
        const blockNumber = blockIndex + 1;

        return {
          id: `category-${categoryNumber}-block-${blockNumber}`,
          name: `Блок ${categoryNumber}.${blockNumber}`,
        };
      }),
    };
  },
);

export const TILE_GAP = 8;
export const LIST_PADDING = 8;
export const ITEM_HEIGHT = 60;
export const DRAG_COMPLETION_DISTANCE = 3;
export const TAP_DISTANCE = 5;
export const SWIPE_VELOCITY = 0.5;
export const LONG_PRESS_DELAY = 350;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const LIST_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
export const ITEM_WIDTH = LIST_WIDTH - LIST_PADDING * 2;
export const ITEM_STEP = ITEM_HEIGHT + TILE_GAP;

export const getListHeight = (itemCount: number) =>
  LIST_PADDING * 2 + itemCount * ITEM_HEIGHT + Math.max(0, itemCount - 1) * TILE_GAP;
