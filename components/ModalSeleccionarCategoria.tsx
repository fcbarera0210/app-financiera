import React from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema

interface ModalSeleccionarCategoriaProps {
  visible: boolean;
  categories: string[];
  onClose: () => void;
  onSelect: (category: string) => void;
}

const ModalSeleccionarCategoria: React.FC<ModalSeleccionarCategoriaProps> = ({ visible, categories, onClose, onSelect }) => {
  const { colors } = useTheme(); // Usamos el hook para obtener los colores

  const handleSelect = (category: string) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Selecciona una Categoría</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.primary }]}>Cerrar</Text>
            </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.itemContainer, { borderBottomColor: colors.border }]} onPress={() => handleSelect(item)}>
              <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay categorías. Añade una nueva.</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemContainer: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    itemText: {
        fontSize: 18,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});

export default ModalSeleccionarCategoria;
