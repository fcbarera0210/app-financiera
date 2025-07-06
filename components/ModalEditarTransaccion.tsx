import React, { useEffect, useState } from 'react';
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
import { Transaction } from '../types';
import ModalSeleccionarCategoria from './ModalSeleccionarCategoria';

interface ModalEditarTransaccionProps {
  visible: boolean;
  transaction: Transaction;
  onSave: (transaction: Transaction) => Promise<void>; // Cambiado a Promise
  onCancel: () => void;
  categories: string[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ModalEditarTransaccion: React.FC<ModalEditarTransaccionProps> = ({ visible, transaction, onSave, onCancel, categories, showNotification }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false); // Estado de carga
    const [isSelectCategoryModalVisible, setSelectCategoryModalVisible] = useState(false);
    
    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setCategory(transaction.category || '');
        }
    }, [transaction]);

    const handleSubmit = async () => {
        if (isSaving) return;

        const numericAmount = parseFloat(amount);
        if (!description || isNaN(numericAmount) || numericAmount <= 0) {
            showNotification('Por favor, completa todos los campos con valores válidos.');
            return;
        }
        if (transaction.type === 'gasto' && !category) {
            showNotification('Por favor, selecciona una categoría para el gasto.');
            return;
        }

        setIsSaving(true);
        await onSave({
            ...transaction,
            description,
            amount: numericAmount,
            category: transaction.type === 'gasto' ? category.trim() : null,
        });
        setIsSaving(false);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Editar Movimiento</Text>
                        
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripción"
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Monto"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                        />
                        {transaction.type === 'gasto' && (
                             <TouchableOpacity style={[styles.input, styles.pickerInput]} onPress={() => setSelectCategoryModalVisible(true)}>
                                <Text style={[styles.pickerText, !category && styles.pickerPlaceholder]}>
                                    {category || 'Selecciona una categoría'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            <ModalSeleccionarCategoria 
                visible={isSelectCategoryModalVisible}
                categories={categories}
                onClose={() => setSelectCategoryModalVisible(false)}
                onSelect={setCategory}
            />
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
        marginBottom: 25,
        color: '#1e293b',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: '#f8fafc',
        fontSize: 16,
    },
    pickerInput: {
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#1e293b',
    },
    pickerPlaceholder: {
        color: '#999',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e2e8f0',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#475569',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        marginLeft: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    }
});

export default ModalEditarTransaccion;
