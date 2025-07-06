import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { NewTransaction } from '../types';
import ModalAgregarCategoria from './ModalAgregarCategoria';
import ModalSeleccionarCategoria from './ModalSeleccionarCategoria';

interface FormularioTransaccionProps {
  onAddTransaction: (transaction: NewTransaction) => Promise<void>;
  onAddNewCategory: (newCategory: string) => void;
  categories: string[];
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const FormularioTransaccion: React.FC<FormularioTransaccionProps> = ({ onAddTransaction, onAddNewCategory, categories, showNotification }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'ingreso' | 'gasto'>('gasto'); // <-- Gasto por defecto
    const [category, setCategory] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
    const [isSelectCategoryModalVisible, setSelectCategoryModalVisible] = useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const numericAmount = parseFloat(amount);
        if (!description || isNaN(numericAmount) || numericAmount <= 0) {
            showNotification('Por favor, completa todos los campos con valores válidos.');
            return;
        }
        if (type === 'gasto' && !category) {
            showNotification('Por favor, selecciona una categoría para el gasto.');
            return;
        }

        setIsSubmitting(true);
        await onAddTransaction({ 
            description, 
            amount: numericAmount, 
            type, 
            category: type === 'gasto' ? category.trim() : null 
        });
        setIsSubmitting(false);

        setDescription('');
        setAmount('');
        setCategory('');
        setType('gasto'); // <-- Resetear a gasto
    };

    const handleSaveNewCategory = (newCategory: string) => {
        onAddNewCategory(newCategory);
        setCategory(newCategory);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Añadir Movimiento</Text>
            
            <View style={styles.switchContainer}>
                <TouchableOpacity 
                    style={[styles.switchButton, type === 'gasto' ? styles.switchActiveGasto : styles.switchInactive]}
                    onPress={() => setType('gasto')}
                >
                    <Text style={[styles.switchText, type === 'gasto' && styles.switchActiveText]}>Gasto</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.switchButton, type === 'ingreso' ? styles.switchActiveIngreso : styles.switchInactive]}
                    onPress={() => setType('ingreso')}
                >
                    <Text style={[styles.switchText, type === 'ingreso' && styles.switchActiveText]}>Ingreso</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción (ej. Supermercado)"
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
            {type === 'gasto' && (
                <View style={styles.categoryRow}>
                    <TouchableOpacity style={[styles.input, styles.pickerInput]} onPress={() => setSelectCategoryModalVisible(true)}>
                        <Text style={[styles.pickerText, !category && styles.pickerPlaceholder]}>
                            {category || 'Selecciona una categoría'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setAddCategoryModalVisible(true)}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.buttonText}>Añadir</Text>
                )}
            </TouchableOpacity>

            <ModalSeleccionarCategoria 
                visible={isSelectCategoryModalVisible}
                categories={categories}
                onClose={() => setSelectCategoryModalVisible(false)}
                onSelect={setCategory}
            />

            <ModalAgregarCategoria 
                visible={isAddCategoryModalVisible}
                onClose={() => setAddCategoryModalVisible(false)}
                onSave={handleSaveNewCategory}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#1e293b',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: '#e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    switchButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
    },
    switchActiveIngreso: {
        backgroundColor: '#16a34a', // Verde
    },
    switchActiveGasto: {
        backgroundColor: '#ef4444', // Rojo
    },
    switchInactive: {
        backgroundColor: 'transparent',
    },
    switchText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    switchActiveText: {
        color: 'white',
    },
    input: {
        height: 50,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: '#f8fafc',
        fontSize: 16,
        color: '#1e293b',
    },
    pickerInput: {
        flex: 1,
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#1e293b',
    },
    pickerPlaceholder: {
        color: '#999',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        width: 50,
        height: 50,
        backgroundColor: '#16a34a',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        marginBottom: 16,
    },
    addButtonText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FormularioTransaccion;
