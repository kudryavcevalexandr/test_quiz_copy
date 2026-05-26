import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Tile = number | null;

const GRID_SIZE = 3;
const WIN_STATE: Tile[] = [1, 2, 3, 4, 5, 6, 7, 8, null];

const shuffleTiles = (): Tile[] => {
  const arr: Tile[] = [...WIN_STATE];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

const findEmptyIndex = (tiles: Tile[]): number => tiles.findIndex((tile) => tile === null);

const areAdjacent = (from: number, to: number): boolean => {
  const fromRow = Math.floor(from / GRID_SIZE);
  const fromCol = from % GRID_SIZE;
  const toRow = Math.floor(to / GRID_SIZE);
  const toCol = to % GRID_SIZE;

  return Math.abs(fromRow - toRow) + Math.abs(fromCol - toCol) === 1;
};

export default function App() {
  const [tiles, setTiles] = useState<Tile[]>(shuffleTiles);

  const isSolved = useMemo(
    () => tiles.every((value, index) => value === WIN_STATE[index]),
    [tiles],
  );

  const moveTile = (tileIndex: number) => {
    setTiles((prev) => {
      const emptyIndex = findEmptyIndex(prev);

      if (!areAdjacent(tileIndex, emptyIndex)) {
        return prev;
      }

      const next = [...prev];
      [next[tileIndex], next[emptyIndex]] = [next[emptyIndex], next[tileIndex]];
      return next;
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
        {tiles.map((tile, index) => {
          const isEmpty = tile === null;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.tile, isEmpty && styles.emptyTile]}
              onPress={() => moveTile(index)}
              disabled={isEmpty}
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
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#dce3ef',
    borderRadius: 16,
    padding: 8,
    gap: 8,
  },
  tile: {
    width: 89.33,
    height: 89.33,
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
