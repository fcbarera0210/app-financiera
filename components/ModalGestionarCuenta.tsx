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
import { Account, NewAccount } from '../types';

// Opciones predefinidas
const ACCOUNT_TYPES = ['Efectivo', 'Tarjeta', 'Ahorros'];
const ACCOUNT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (account: NewAccount | Account) => void;
  existingAccount: Account | null;
  isSaving: boolean;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const formatNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseFormattedNumber = (value: string) => {
    return value.replace(/\./g, '');
};

const ModalGestionarCuenta: React.FC<Props> = ({ visible, onClose, onSave, existingAccount, isSaving, showNotification }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [type, setType] = useState<'Efectivo' | 'Tarjeta' | 'Ahorros'>('Efectivo');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);

  useEffect(() => {
    if (visible) {
      if (existingAccount) {
        setName(existingAccount.name);
        setInitialBalance(formatNumber(String(existingAccount.balance)));
        setType(existingAccount.type || 'Efectivo');
        setColor(existingAccount.color || ACCOUNT_COLORS[0]);
      } else {
        // Reset form for a new account
        setName('');
        setInitialBalance('');
        setType('Efectivo');
        setColor(ACCOUNT_COLORS[0]);
      }
    }
  }, [existingAccount, visible]);

  const handleSave = () => {
    Keyboard.dismiss();
    const balanceValue = parseFloat(parseFormattedNumber(initialBalance));

    if (!name.trim()) {
      showNotification('Por favor, ingresa un nombre para la cuenta.');
      return;
    }
    if (isNaN(balanceValue)) {
      showNotification('Por favor, ingresa un saldo válido.');
      return;
    }

    const accountData = {
      name: name.trim(),
      type,
      color,
    };

    if (existingAccount) {
      onSave({ ...accountData, id: existingAccount.id, balance: balanceValue });
    } else {
      onSave({ ...accountData, initialBalance: balanceValue });
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {existingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </Text>
            
            <ScrollView style={{width: '100%'}} showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre de la Cuenta</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej: Billetera, Banco Principal"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>{existingAccount ? 'Saldo Actual' : 'Saldo Inicial'}</Text>
                 <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    value={initialBalance}
                    onChangeText={(text) => setInitialBalance(formatNumber(text))}
                    placeholder="Ej: 100.000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                />

                <Text style={[styles.inputLabel, { color: colors.text }]}>Tipo de Cuenta</Text>
                <View style={styles.optionsContainer}>
                    {ACCOUNT_TYPES.map(accType => (
                        <TouchableOpacity 
                            key={accType}
                            style={[styles.typeButton, { backgroundColor: colors.background, borderColor: type === accType ? colors.primary : colors.border }, type === accType && styles.typeButtonSelected]}
                            onPress={() => setType(accType as any)}
                        >
                            <Text style={[styles.typeButtonText, { color: type === accType ? colors.primary : colors.textSecondary }]}>{accType}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.text }]}>Color de la Cuenta</Text>
                <View style={styles.optionsContainer}>
                    {ACCOUNT_COLORS.map(c => (
                        <TouchableOpacity
                            key={c}
                            style={[styles.colorButton, { backgroundColor: c, borderColor: color === c ? colors.primary : 'transparent' }]}
                            onPress={() => setColor(c)}
                        />
                    ))}
                </View>
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
        maxHeight: '85%',
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
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        flexWrap: 'wrap'
    },
    typeButton: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 2,
        margin: 4,
    },
    typeButtonSelected: {
        borderWidth: 2,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    colorButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 3,
        margin: 6,
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

export default ModalGestionarCuenta;