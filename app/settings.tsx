import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import ModalCambiarContrasena from '../components/ModalCambiarContrasena';
import Notification from '../components/Notification';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../firebaseConfig';

const BackIcon = ({ color }: { color: string }) => (
    <Svg height="24" width="24" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </Svg>
);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, toggleTheme } = useTheme();
  
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name);
          setLastName(userData.lastName);
          setEmail(userData.email);
        }
      }
    };
    fetchUserData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ message, type, visible: true });
  };

  const handleSaveChanges = async () => {
    if (!name.trim() || !lastName.trim()) {
      showNotification('El nombre y el apellido no pueden estar vacíos.', 'error');
      return;
    }
    if (auth.currentUser) {
      setIsSaving(true);
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          name: name.trim(),
          lastName: lastName.trim()
        });
        router.push({ pathname: '/', params: { notificationMessage: 'Perfil actualizado con éxito' } });
      } catch (error) {
        showNotification('Error al actualizar el perfil.', 'error');
        console.error("Error updating document: ", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
        <View style={{ width: 40 }} /> 
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Editar Perfil</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} value={name} onChangeText={setName} />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Apellido</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} value={lastName} onChangeText={setLastName} />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <TextInput style={[styles.input, styles.disabledInput, { backgroundColor: colors.background, color: colors.textSecondary }]} value={email} editable={false} />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>El email no se puede modificar.</Text>
            
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} 
              onPress={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Seguridad</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => setIsPasswordModalVisible(true)}>
                    <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Apariencia</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Modo Oscuro</Text>
              <Switch
                trackColor={{ false: "#767577", true: colors.primary }}
                thumbColor={isDarkMode ? colors.primary : "#f4f3f4"}
                onValueChange={toggleTheme}
                value={isDarkMode}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <ModalCambiarContrasena 
        visible={isPasswordModalVisible}
        onClose={() => setIsPasswordModalVisible(false)}
        onSuccess={() => {
            showNotification('Contraseña actualizada con éxito', 'success');
        }}
      />
      
      <Notification 
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  disabledInput: {
      opacity: 0.7,
  },
  helperText: {
      fontSize: 12,
      marginTop: -15,
      marginBottom: 20,
  },
  button: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  rowLabel: {
    fontSize: 16,
  }
});
