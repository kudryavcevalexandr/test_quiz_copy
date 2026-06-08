import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATALOG_CATEGORIES, getListHeight } from './constants';
import { DraggableTile } from './DraggableTile';
import { styles } from './styles';
import type { CatalogBlock, CatalogCategory, Tile } from './types';
import { usePuzzleState } from './usePuzzleState';

export default function App() {
  const { tiles, moveTile, addBlock } = usePuzzleState();
  const [isCatalogVisible, setCatalogVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);

  const closeCatalog = () => {
    setCatalogVisible(false);
    setSelectedCategory(null);
  };

  const handleAddBlock = (block: CatalogBlock) => {
    addBlock(block);
    closeCatalog();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Список блоков</Text>
      <Text style={styles.subtitle}>
        Удерживайте блок, чтобы изменить его позицию, или прокручивайте список
      </Text>

      <ScrollView
        style={styles.blockScroll}
        contentContainerStyle={styles.blockScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Добавьте первый элемент из каталога</Text>
          </View>
        ) : (
          <View style={[styles.grid, { height: getListHeight(tiles.length) }]}>
            {tiles.map((tile: Tile, index: number) => (
              <DraggableTile
                key={tile.instanceId}
                tile={tile}
                index={index}
                moveTile={moveTile}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={() => setCatalogVisible(true)}>
        <Text style={styles.buttonText}>Добавить элемент</Text>
      </TouchableOpacity>

      <Modal
        visible={isCatalogVisible}
        animationType="slide"
        transparent
        onRequestClose={closeCatalog}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              {selectedCategory ? (
                <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                  <Text style={styles.modalHeaderAction}>Назад</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.modalHeaderPlaceholder} />
              )}
              <Text style={styles.modalTitle}>
                {selectedCategory?.name ?? 'Каталог категорий'}
              </Text>
              <TouchableOpacity onPress={closeCatalog}>
                <Text style={styles.modalHeaderAction}>Закрыть</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.catalogList}>
              {selectedCategory
                ? selectedCategory.blocks.map((block) => (
                    <TouchableOpacity
                      key={block.id}
                      style={styles.catalogItem}
                      onPress={() => handleAddBlock(block)}
                    >
                      <Text style={styles.catalogItemText}>{block.name}</Text>
                      <Text style={styles.catalogItemArrow}>＋</Text>
                    </TouchableOpacity>
                  ))
                : CATALOG_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.catalogItem}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={styles.catalogItemText}>{category.name}</Text>
                      <Text style={styles.catalogItemArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
