import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema

interface ModalAgregarCategoriaProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newCategory: string) => void;
}

const ModalAgregarCategoria: React.FC<ModalAgregarCategoriaProps> = ({ visible, onClose, onSave }) => {
  const { colors } = useTheme(); // Usamos el hook para obtener los colores
  const [newCategory, setNewCategory] = useState('');

  const handleSave = () => {
    if (newCategory.trim()) {
      onSave(newCategory.trim());
      setNewCategory('');
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Nueva Categoría</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Nombre de la categoría"
              placeholderTextColor={colors.textSecondary}
              autoFocus={true}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]} onPress={onClose}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalView: {
        width: '90%',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 10,
    },
    cancelButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        marginLeft: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ModalAgregarCategoria;
