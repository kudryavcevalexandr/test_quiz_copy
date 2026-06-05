import { Dimensions } from 'react-native';

export const ITEM_COUNT = 8;
export const WIN_STATE: number[] = Array.from({ length: ITEM_COUNT }, (_, index) => index + 1);
export const TILE_GAP = 8;
export const LIST_PADDING = 8;
export const ITEM_HEIGHT = 60;
export const DRAG_COMPLETION_DISTANCE = 3;
export const TAP_DISTANCE = 5;
export const SWIPE_VELOCITY = 0.5;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const LIST_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
export const ITEM_WIDTH = LIST_WIDTH - LIST_PADDING * 2;
export const ITEM_STEP = ITEM_HEIGHT + TILE_GAP;
export const LIST_HEIGHT = LIST_PADDING * 2 + ITEM_COUNT * ITEM_HEIGHT + (ITEM_COUNT - 1) * TILE_GAP;
