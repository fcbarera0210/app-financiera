import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import ModalSeleccionarCategoria from './ModalSeleccionarCategoria';

interface ModalEditarTransaccionProps {
  visible: boolean;
  transaction: Transaction;
  onSave: (transaction: Transaction) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ModalEditarTransaccion: React.FC<ModalEditarTransaccionProps> = ({ visible, transaction, onSave, onCancel, categories, showNotification }) => {
    const { colors } = useTheme();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSelectCategoryModalVisible, setSelectCategoryModalVisible] = useState(false);
    
    useEffect(() => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setCategory(transaction.category || '');
            setDate(new Date(transaction.date));
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
            date: date.toISOString(),
        });
        setIsSaving(false);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
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
                    <View style={[styles.modalView, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Movimiento</Text>
                        
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descripción"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="Monto"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={[styles.input, styles.pickerInput, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setShowDatePicker(true)}>
                            <Text style={[styles.pickerText, { color: colors.text }]}>
                                {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        {transaction.type === 'gasto' && (
                             <TouchableOpacity style={[styles.input, styles.pickerInput, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setSelectCategoryModalVisible(true)}>
                                <Text style={[styles.pickerText, !category && { color: colors.textSecondary }]}>
                                    {category || 'Selecciona una categoría'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]} onPress={onCancel} disabled={isSaving}>
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSaving}>
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
        marginBottom: 16,
        fontSize: 16,
    },
    pickerInput: {
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
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
    buttonDisabled: {
        opacity: 0.5,
    }
});

export default ModalEditarTransaccion;
