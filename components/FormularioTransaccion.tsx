import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema
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
    const { colors } = useTheme(); // Usamos el hook para obtener los colores
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'ingreso' | 'gasto'>('gasto');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
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
            category: type === 'gasto' ? category.trim() : null,
            date: date.toISOString()
        });
        setIsSubmitting(false);

        setDescription('');
        setAmount('');
        setCategory('');
        setType('gasto');
        setDate(new Date());
    };

    const handleSaveNewCategory = (newCategory: string) => {
        onAddNewCategory(newCategory);
        setCategory(newCategory);
    };
    
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Añadir Movimiento</Text>
            
            <View style={[styles.switchContainer, { backgroundColor: colors.background }]}>
                <TouchableOpacity 
                    style={[styles.switchButton, type === 'gasto' ? styles.switchActiveGasto : styles.switchInactive]}
                    onPress={() => setType('gasto')}
                >
                    <Text style={[styles.switchText, { color: colors.textSecondary }, type === 'gasto' && styles.switchActiveText]}>Gasto</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.switchButton, type === 'ingreso' ? styles.switchActiveIngreso : styles.switchInactive]}
                    onPress={() => setType('ingreso')}
                >
                    <Text style={[styles.switchText, { color: colors.textSecondary }, type === 'ingreso' && styles.switchActiveText]}>Ingreso</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción (ej. Supermercado)"
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
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
            
            {type === 'gasto' && (
                <View style={styles.categoryRow}>
                    <TouchableOpacity style={[styles.input, styles.pickerInput, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setSelectCategoryModalVisible(true)}>
                        <Text style={[styles.pickerText, !category && { color: colors.textSecondary }]}>
                            {category || 'Selecciona una categoría'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setAddCategoryModalVisible(true)}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Añadir</Text>}
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
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    switchButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
    },
    switchActiveIngreso: {
        backgroundColor: '#16a34a',
    },
    switchActiveGasto: {
        backgroundColor: '#ef4444',
    },
    switchInactive: {
        backgroundColor: 'transparent',
    },
    switchText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    switchActiveText: {
        color: 'white',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        fontSize: 16,
    },
    pickerInput: {
        flex: 1,
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
    },
    pickerPlaceholder: {},
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
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
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

export default FormularioTransaccion;
