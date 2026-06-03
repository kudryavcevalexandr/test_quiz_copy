import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  type LayoutAnimationConfig,
  UIManager,
  TouchableOpacity,
  View,
} from 'react-native';

type Tile = number | null;

const GRID_SIZE = 3;
const WIN_STATE: Tile[] = [1, 2, 3, 4, 5, 6, 7, 8, null];
const SHUFFLE_MOVES = 150;
const TILE_MOVE_ANIMATION: LayoutAnimationConfig = {
  duration: 260,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.75,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};
const SHUFFLE_ANIMATION: LayoutAnimationConfig = {
  duration: 320,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

export default function App() {
  const [tiles, setTiles] = useState<Tile[]>(shuffleTiles);

  const isSolved = useMemo(() => isWinningState(tiles), [tiles]);

  const moveTile = (tileIndex: number) => {
    setTiles((prev: Tile[]) => {
      const emptyIndex = findEmptyIndex(prev);

      if (!areAdjacent(tileIndex, emptyIndex)) {
        return prev;
      }

      LayoutAnimation.configureNext(TILE_MOVE_ANIMATION);

      const updated = [...prev];
      updated[emptyIndex] = prev[tileIndex];
      updated[tileIndex] = null;

      return updated;
    });
  };

  const reset = () => {
    LayoutAnimation.configureNext(SHUFFLE_ANIMATION);
    setTiles(shuffleTiles());
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Пятнашки 3x3</Text>
      <Text style={styles.subtitle}>Разложите квадратные блоки по порядку</Text>

      <View style={styles.grid}>
        {tiles.map((tile: Tile, index: number) => {
          const isEmpty = tile === null;

          return (
            <TouchableOpacity
              key={tile === null ? 'empty-tile' : `tile-${tile}`}
              style={[styles.tile, isEmpty && styles.emptyTile]}
              onPress={() => moveTile(index)}
              disabled={isEmpty || isSolved}
            >
              {!isEmpty && <Text style={styles.tileText}>{tile}</Text>}
            </TouchableOpacity>
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

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
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#dce3ef',
    borderRadius: 16,
    padding: 8,
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  tile: {
    width: '31.5%',
    height: '31.5%',
    borderRadius: 12,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTile: {
    backgroundColor: '#cfd8dc',
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
