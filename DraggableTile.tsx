import React, { useEffect, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Text,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { TILE_GAP, TILE_SIZE } from './constants';
import { styles } from './styles';
import type { Tile } from './types';
import {
  areAdjacent,
  findEmptyIndex,
  getCoordinates,
  getDirectionalDrag,
  shouldCompleteMove,
} from './utils';

interface DraggableTileProps {
  tile: number;
  index: number;
  tiles: Tile[];
  moveTile: (index: number) => void;
  isSolved: boolean;
}

export const DraggableTile = ({ tile, index, tiles, moveTile, isSolved }: DraggableTileProps) => {
  const pan = useRef(new Animated.ValueXY(getCoordinates(index))).current;
  const indexRef = useRef(index);
  const tilesRef = useRef(tiles);
  const isSolvedRef = useRef(isSolved);

  useEffect(() => {
    indexRef.current = index;
    tilesRef.current = tiles;
    isSolvedRef.current = isSolved;
  }, [index, tiles, isSolved]);

  useEffect(() => {
    Animated.spring(pan, {
      toValue: getCoordinates(index),
      useNativeDriver: true,
      bounciness: 2,
      speed: 20,
    }).start();
  }, [index, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        if (isSolvedRef.current) {
          return false;
        }

        return areAdjacent(indexRef.current, findEmptyIndex(tilesRef.current));
      },
      onMoveShouldSetPanResponder: () => {
        if (isSolvedRef.current) {
          return false;
        }

        return areAdjacent(indexRef.current, findEmptyIndex(tilesRef.current));
      },
      onPanResponderGrant: () => {
        pan.stopAnimation(() => {
          pan.extractOffset();
        });
      },
      onPanResponderMove: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        const currentIndex = indexRef.current;
        const emptyIndex = findEmptyIndex(tilesRef.current);
        const { dx, dy } = getDirectionalDrag(currentIndex, emptyIndex, gesture);

        pan.setValue({ x: dx, y: dy });
      },
      onPanResponderRelease: (
        _event: GestureResponderEvent,
        gesture: PanResponderGestureState,
      ) => {
        pan.flattenOffset();

        const currentIndex = indexRef.current;
        const emptyIndex = findEmptyIndex(tilesRef.current);

        if (shouldCompleteMove(currentIndex, emptyIndex, gesture)) {
          moveTile(currentIndex);
          return;
        }

        Animated.spring(pan, {
          toValue: getCoordinates(currentIndex),
          useNativeDriver: true,
          bounciness: 4,
          speed: 16,
        }).start();
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        Animated.spring(pan, {
          toValue: getCoordinates(indexRef.current),
          useNativeDriver: true,
          bounciness: 4,
          speed: 16,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tile,
        {
          width: TILE_SIZE - TILE_GAP,
          height: TILE_SIZE - TILE_GAP,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <Text style={styles.tileText}>{tile}</Text>
    </Animated.View>
  );
};
