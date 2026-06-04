import { Dimensions } from 'react-native';
import type { Tile } from './types';

export const GRID_SIZE = 3;
export const WIN_STATE: Tile[] = [1, 2, 3, 4, 5, 6, 7, 8, null];
export const SHUFFLE_MOVES = 150;
export const DRAG_COMPLETION_DISTANCE = 3;
export const TAP_DISTANCE = 5;
export const SWIPE_VELOCITY = 0.5;
export const TILE_GAP = 6;
export const GRID_PADDING = 8;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const GRID_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
export const TILE_SIZE = (GRID_WIDTH - GRID_PADDING * 2) / GRID_SIZE;
