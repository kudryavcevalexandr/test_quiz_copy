import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { DraggableTile } from './DraggableTile';
import { styles } from './styles';
import type { Tile } from './types';
import { usePuzzleState } from './usePuzzleState';

export default function App() {
  const { tiles, isSolved, moveTile, reset } = usePuzzleState();

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
