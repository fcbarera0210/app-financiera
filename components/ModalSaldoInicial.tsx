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

interface ModalSaldoInicialProps {
  visible: boolean;
  onSave: (amount: number) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ModalSaldoInicial: React.FC<ModalSaldoInicialProps> = ({ visible, onSave, showNotification }) => {
  const [initialAmount, setInitialAmount] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(initialAmount);
    if (!isNaN(amount) && amount >= 0) {
      onSave(amount);
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
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Configuración Inicial</Text>
                    <Text style={styles.modalText}>Establece un saldo inicial para comenzar a registrar tus movimientos.</Text>
                    
                    <TextInput
                        style={styles.input}
                        value={initialAmount}
                        onChangeText={setInitialAmount}
                        placeholder="Ej: 50000"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        autoFocus={true}
                    />
                    
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Guardar y Empezar</Text>
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
        backgroundColor: 'white',
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
        color: '#1e293b',
    },
    modalText: {
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 25,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ModalSaldoInicial;
