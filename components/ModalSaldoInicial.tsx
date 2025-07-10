import React, { useState } from 'react';
import {
    ActivityIndicator,
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

interface ModalSaldoInicialProps {
  visible: boolean;
  onSave: (amount: number) => Promise<void>;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ModalSaldoInicial: React.FC<ModalSaldoInicialProps> = ({ visible, onSave, showNotification }) => {
  const { colors } = useTheme(); // Usamos el hook para obtener los colores
  const [initialAmount, setInitialAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (isSaving) return;

    const amount = parseFloat(initialAmount);
    if (!isNaN(amount) && amount >= 0) {
      setIsSaving(true);
      await onSave(amount);
      // No es necesario setIsSaving(false) porque el modal se desmonta
    } else {
      showNotification('Por favor, ingresa un monto válido.');
    }
  };

  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Configuración Inicial</Text>
                    <Text style={[styles.modalText, { color: colors.textSecondary }]}>Establece un saldo inicial para comenzar a registrar tus movimientos.</Text>
                    
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                        value={initialAmount}
                        onChangeText={setInitialAmount}
                        placeholder="Ej: 50000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        autoFocus={true}
                    />
                    
                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Guardar y Empezar</Text>
                        )}
                    </TouchableOpacity>
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
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
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
        textAlign: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ModalSaldoInicial;
