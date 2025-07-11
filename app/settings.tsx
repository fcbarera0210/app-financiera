import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated // Importamos Animated para el botón
  ,
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
  
  // Estados para los valores actuales del formulario
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [isSavingsGoalEnabled, setIsSavingsGoalEnabled] = useState(false);
  
  // Estado para almacenar los datos iniciales y detectar cambios
  const [initialData, setInitialData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Otros estados
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });

  // Animación para el botón flotante
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Cargar datos iniciales del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const data = {
            name: userData.name,
            lastName: userData.lastName,
            email: userData.email,
            isSavingsGoalEnabled: userData.isSavingsGoalEnabled || false,
            savingsGoal: String(userData.savingsGoal || ''),
            theme: theme,
          };
          // Guardamos los datos iniciales y establecemos los estados actuales
          setInitialData(data);
          setName(data.name);
          setLastName(data.lastName);
          setEmail(data.email);
          setIsSavingsGoalEnabled(data.isSavingsGoalEnabled);
          setSavingsGoal(data.savingsGoal);
        }
      }
    };
    fetchUserData();
  }, []);

  // Detectar si hay cambios en el formulario
  useEffect(() => {
    if (initialData) {
      const currentData = { name, lastName, savingsGoal, isSavingsGoalEnabled, theme };
      const changed = JSON.stringify(currentData) !== JSON.stringify({
        name: initialData.name,
        lastName: initialData.lastName,
        savingsGoal: initialData.savingsGoal,
        isSavingsGoalEnabled: initialData.isSavingsGoalEnabled,
        theme: initialData.theme
      });
      setHasChanges(changed);
    }
  }, [name, lastName, savingsGoal, isSavingsGoalEnabled, theme, initialData]);

  // Animar la aparición/desaparición del botón
  useEffect(() => {
    Animated.timing(buttonOpacity, {
      toValue: hasChanges ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [hasChanges]);

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ message, type, visible: true });
  };

  const handleSaveChanges = async () => {
    if (!name.trim() || !lastName.trim()) {
      showNotification('El nombre y el apellido no pueden estar vacíos.', 'error');
      return;
    }
    const numericGoal = parseFloat(savingsGoal);
    if (isSavingsGoalEnabled && (isNaN(numericGoal) || numericGoal <= 0)) {
        showNotification('La meta de ahorro debe ser un número mayor a cero.', 'error');
        return;
    }

    if (auth.currentUser) {
      setIsSaving(true);
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          name: name.trim(),
          lastName: lastName.trim(),
          isSavingsGoalEnabled: isSavingsGoalEnabled,
          savingsGoal: isSavingsGoalEnabled ? numericGoal : 0
        });
        // Guardar el tema también si cambió
        await AsyncStorage.setItem('app-theme', theme);
        router.push({ pathname: '/', params: { notificationMessage: 'Configuración guardada con éxito' } });
      } catch (error) {
        showNotification('Error al guardar la configuración.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top }]}>
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
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Metas</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Activar Meta de Ahorro</Text>
                <Switch
                    trackColor={{ false: "#767577", true: colors.primary }}
                    thumbColor={isSavingsGoalEnabled ? colors.primary : "#f4f3f4"}
                    onValueChange={() => setIsSavingsGoalEnabled(previousState => !previousState)}
                    value={isSavingsGoalEnabled}
                />
            </View>
            {isSavingsGoalEnabled && (
                <>
                    <View style={{height: 20}}/>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Meta de Ahorro Mensual</Text>
                    <TextInput 
                        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                        value={savingsGoal} 
                        onChangeText={setSavingsGoal}
                        placeholder="Ej: 200000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />
                </>
            )}
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
                thumbColor={theme === 'dark' ? colors.primary : "#f4f3f4"}
                onValueChange={toggleTheme}
                value={theme === 'dark'}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- BOTÓN FLOTANTE --- */}
      <Animated.View style={[styles.floatingButtonContainer, { opacity: buttonOpacity, bottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} 
              onPress={handleSaveChanges}
              disabled={isSaving}
          >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
          </TouchableOpacity>
      </Animated.View>

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
    paddingBottom: 10,
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
    paddingBottom: 100, // Espacio para el botón flotante
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
  },
  floatingButtonContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  }
});
