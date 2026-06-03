import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';

type Tile = number | null;

const GRID_SIZE = 3;
const WIN_STATE: Tile[] = [1, 2, 3, 4, 5, 6, 7, 8, null];
const SHUFFLE_MOVES = 150;
const DRAG_COMPLETION_DISTANCE = 3;
const TAP_DISTANCE = 5;
const SWIPE_VELOCITY = 0.5;
const TILE_GAP = 6;
const GRID_PADDING = 8;

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);
const TILE_SIZE = (GRID_WIDTH - GRID_PADDING * 2) / GRID_SIZE;

const findEmptyIndex = (tiles: Tile[]): number => tiles.findIndex((tile) => tile === null);

const areAdjacent = (from: number, to: number): boolean => {
  const fromRow = Math.floor(from / GRID_SIZE);
  const fromCol = from % GRID_SIZE;
  const toRow = Math.floor(to / GRID_SIZE);
  const toCol = to % GRID_SIZE;

  return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
};

const isWinningState = (tiles: Tile[]): boolean =>
  tiles.every((value, index) => value === WIN_STATE[index]);

const getValidMoves = (tiles: Tile[]): number[] => {
  const emptyIndex = findEmptyIndex(tiles);

  return tiles.reduce<number[]>((moves, _tile, index) => {
    if (areAdjacent(index, emptyIndex)) {
      moves.push(index);
    }

    return moves;
  }, []);
};

// Make random valid moves from the winning state so every shuffle is solvable.
const shuffleTiles = (): Tile[] => {
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

const getCoordinates = (index: number) => {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  return {
    x: GRID_PADDING + col * TILE_SIZE + TILE_GAP / 2,
    y: GRID_PADDING + row * TILE_SIZE + TILE_GAP / 2,
  };
};

const getDirectionalDrag = (
  currentIndex: number,
  emptyIndex: number,
  gesture: PanResponderGestureState,
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

const shouldCompleteMove = (
  currentIndex: number,
  emptyIndex: number,
  gesture: PanResponderGestureState,
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

interface DraggableTileProps {
  tile: number;
  index: number;
  tiles: Tile[];
  moveTile: (index: number) => void;
  isSolved: boolean;
}

const DraggableTile = ({ tile, index, tiles, moveTile, isSolved }: DraggableTileProps) => {
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

export default function App() {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Пятнашки 3x3</Text>
      <Text style={styles.subtitle}>Разложите квадратные блоки по порядку</Text>

      <View style={styles.grid}>
        {tiles.map((tile: Tile, index: number) => {
          if (tile === null) {
            return null;
          }

          return (
            <DraggableTile
              key={`tile-${tile}`}
              tile={tile}
              index={index}
              tiles={tiles}
              moveTile={moveTile}
              isSolved={isSolved}
            />
          );
        })}
      </View>

      {isSolved && <Text style={styles.winText}>Готово! Вы собрали порядок 🎉</Text>}

      <TouchableOpacity style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>Перемешать заново</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6fb',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263238',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    color: '#607d8b',
    textAlign: 'center',
  },
  grid: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
    backgroundColor: '#dce3ef',
    borderRadius: 16,
    padding: GRID_PADDING,
  },
  tile: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  winText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
  button: {
    marginTop: 26,
    backgroundColor: '#009688',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
