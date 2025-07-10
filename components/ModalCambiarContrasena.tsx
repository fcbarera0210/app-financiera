import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
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
import { useTheme } from '../contexts/ThemeContext';
import { auth } from '../firebaseConfig';
import Notification from './Notification'; // Importamos Notification aquí

interface ModalCambiarContrasenaProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // Prop para notificar al padre del éxito
}

const ModalCambiarContrasena: React.FC<ModalCambiarContrasenaProps> = ({ visible, onClose, onSuccess }) => {
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ message, type, visible: true });
  };

  const handlePasswordChange = async () => {
    Keyboard.dismiss();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showNotification('Por favor, completa todos los campos.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showNotification('La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification('Las nuevas contraseñas no coinciden.', 'error');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      showNotification('No se pudo identificar al usuario.', 'error');
      return;
    }

    setIsChanging(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      onSuccess(); // Llama a la función del padre para notificar el éxito
      onClose(); // Cierra el modal
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showNotification('La contraseña actual es incorrecta.', 'error');
      } else {
        showNotification('Ocurrió un error al cambiar la contraseña.', 'error');
        console.error(error);
      }
    } finally {
      setIsChanging(false);
      // No limpiamos los campos en caso de error para que el usuario pueda corregir
    }
  };

  const handleClose = () => {
    // Limpiar campos al cerrar el modal
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    onClose();
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Contraseña Actual"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva Contraseña"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="Confirmar Nueva Contraseña"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]} onPress={handleClose} disabled={isChanging}>
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }, isChanging && styles.buttonDisabled]} onPress={handlePasswordChange} disabled={isChanging}>
                {isChanging ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Actualizar</Text>}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Notificación que vive dentro del modal */}
          <Notification 
            message={notification.message}
            type={notification.type}
            visible={notification.visible}
            onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
          />
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
    marginBottom: 16,
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

export default ModalCambiarContrasena;
