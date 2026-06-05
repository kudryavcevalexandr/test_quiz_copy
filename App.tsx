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
      <Text style={styles.title}>Список блоков</Text>
      <Text style={styles.subtitle}>Перетащите полоски вертикально и соберите порядок</Text>

      <View style={styles.grid}>
        {tiles.map((tile: Tile, index: number) => (
          <DraggableTile
            key={`tile-${tile}`}
            tile={tile}
            index={index}
            moveTile={moveTile}
            isSolved={isSolved}
          />
        ))}
      </View>

      {isSolved && <Text style={styles.winText}>Готово! Вы собрали порядок 🎉</Text>}

      <TouchableOpacity style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>Перемешать заново</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
