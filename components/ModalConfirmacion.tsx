import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema

interface ModalConfirmacionProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isConfirming = false,
}) => {
  const { colors } = useTheme(); // Usamos el hook para obtener los colores

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.modalText, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
              onPress={onCancel}
              disabled={isConfirming}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: colors.destructive }, isConfirming && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  confirmButton: {
    marginLeft: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ModalConfirmacion;
