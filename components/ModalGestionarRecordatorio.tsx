import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { NewReminder, Reminder } from '../types';
import ModalSeleccionarCategoria from './ModalSeleccionarCategoria';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (reminder: NewReminder | Reminder) => void;
  existingReminder: Reminder | null;
  categories: string[];
}

const ModalGestionarRecordatorio: React.FC<Props> = ({ visible, onClose, onSave, existingReminder, categories }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<'ingreso' | 'gasto'>('gasto');
  const [category, setCategory] = useState<string | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    if (existingReminder) {
      setName(existingReminder.name);
      setType(existingReminder.type);
      setCategory(existingReminder.category);
      setDayOfMonth(String(existingReminder.dayOfMonth));
    } else {
      // Reset form for new reminder
      setName('');
      setType('gasto');
      setCategory(null);
      setDayOfMonth('');
    }
  }, [existingReminder, visible]);

  const handleSave = () => {
    Keyboard.dismiss();
    const day = parseInt(dayOfMonth, 10);
    if (!name.trim()) {
      alert('Por favor, ingresa un nombre para el recordatorio.');
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      alert('Por favor, ingresa un día del mes válido (1-31).');
      return;
    }
    if (type === 'gasto' && !category) {
      alert('Por favor, selecciona una categoría para el gasto.');
      return;
    }

    setIsSaving(true);
    const reminderData = {
      name: name.trim(),
      type,
      category: type === 'gasto' ? category : null,
      dayOfMonth: day,
    };

    if (existingReminder) {
      onSave({ ...reminderData, id: existingReminder.id });
    } else {
      onSave(reminderData);
    }
    
    // El onClose y el setIsSaving(false) se manejan en el componente padre
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {existingReminder ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
            </Text>
            
            <ScrollView style={{width: '100%'}}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre del Recordatorio</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej: Pago de Internet"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>Tipo de Movimiento</Text>
                <View style={[styles.switchContainer, { backgroundColor: colors.background }]}>
                    <TouchableOpacity 
                        style={[styles.switchButton, type === 'gasto' ? styles.switchActiveGasto : {}]}
                        onPress={() => setType('gasto')}>
                        <Text style={[styles.switchText, { color: colors.textSecondary }, type === 'gasto' && styles.switchActiveText]}>Gasto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.switchButton, type === 'ingreso' ? styles.switchActiveIngreso : {}]}
                        onPress={() => setType('ingreso')}>
                        <Text style={[styles.switchText, { color: colors.textSecondary }, type === 'ingreso' && styles.switchActiveText]}>Ingreso</Text>
                    </TouchableOpacity>
                </View>

                {type === 'gasto' && (
                    <>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Categoría</Text>
                        <TouchableOpacity style={[styles.input, styles.pickerInput, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setCategoryModalVisible(true)}>
                            <Text style={[styles.pickerText, { color: colors.text }, !category && { color: colors.textSecondary }]}>
                                {category || 'Selecciona una categoría'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                <Text style={[styles.inputLabel, { color: colors.text }]}>Día del Mes del Recordatorio</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={dayOfMonth}
                    onChangeText={setDayOfMonth}
                    placeholder="Ej: 15"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={2}
                />
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]} onPress={onClose} disabled={isSaving}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} onPress={handleSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      <ModalSeleccionarCategoria 
        visible={isCategoryModalVisible}
        categories={categories}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={(cat) => {
            setCategory(cat);
            setCategoryModalVisible(false);
        }}
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
        maxHeight: '80%',
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
    inputLabel: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
        alignSelf: 'flex-start'
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
    pickerInput: {
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        width: '100%',
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
    switchText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    switchActiveText: {
        color: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#e2e8f0'
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

export default ModalGestionarRecordatorio;
