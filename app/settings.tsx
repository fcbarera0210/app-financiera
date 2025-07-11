import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import ModalCambiarContrasena from '../components/ModalCambiarContrasena';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalGestionarRecordatorio from '../components/ModalGestionarRecordatorio';
import Notification from '../components/Notification';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db, firebase } from '../firebaseConfig';
import { NewReminder, Reminder } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Iconos ---
const BackIcon = ({ color }: { color: string }) => (
    <Svg height="24" width="24" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </Svg>
);
const EditIcon = ({ color }: { color: string }) => (
    <Svg height="18" width="18" viewBox="0 0 20 20" fill={color}>
        <Path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <Path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </Svg>
);
const DeleteIcon = ({ color }: { color: string }) => (
    <Svg height="18" width="18" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </Svg>
);
const ChevronDownIcon = ({ rotation, color }: { rotation: Animated.AnimatedInterpolation<number>, color: string }) => (
    <Animated.View style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] }) }] }}>
        <Svg height="20" width="20" viewBox="0 0 20 20" fill={color}>
            <Path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </Svg>
    </Animated.View>
);

// --- Funciones de Formato ---
const formatNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseFormattedNumber = (value: string) => {
    return value.replace(/\./g, '');
};

// --- Sub-componente para cada recordatorio ---
const ReminderItem = ({ reminder, isExpanded, onToggleExpand, onEdit, onDelete, onToggleCompletion }: any) => {
    const { colors } = useTheme();
    const rotation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(rotation, {
            toValue: isExpanded ? 1 : 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [isExpanded]);

    const renderHistory = () => {
        const months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return date;
        });

        return (
            <View style={styles.historyContainer}>
                {months.map(date => {
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const isCompleted = reminder.completedMonths?.includes(monthYear) || false;
                    return (
                        <View key={monthYear} style={[styles.row, { minHeight: 40, paddingVertical: 5 }]}>
                            <Text style={[styles.rowLabel, { color: colors.text }]}>{date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: colors.primary }}
                                thumbColor={isCompleted ? colors.primary : "#f4f3f4"}
                                onValueChange={(newValue) => onToggleCompletion(reminder.id, monthYear, newValue)}
                                value={isCompleted}
                            />
                        </View>
                    )
                })}
            </View>
        )
    }

    return (
        <View style={[styles.reminderWrapper, { borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.reminderItem} onPress={onToggleExpand} activeOpacity={0.7}>
                <View style={{flex: 1}}>
                    <Text style={[styles.reminderName, { color: colors.text }]}>{reminder.name}</Text>
                    <Text style={[styles.reminderDetails, { color: colors.textSecondary }]}>Día {reminder.dayOfMonth} de cada mes</Text>
                </View>
                <View style={styles.reminderActions}>
                    <TouchableOpacity onPress={onEdit} style={{ padding: 5 }}>
                        <EditIcon color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ padding: 5, marginLeft: 10 }} onPress={onDelete}>
                        <DeleteIcon color={colors.destructive} />
                    </TouchableOpacity>
                    <ChevronDownIcon rotation={rotation} color={colors.textSecondary} />
                </View>
            </TouchableOpacity>
            {isExpanded && renderHistory()}
        </View>
    )
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, colors, toggleTheme } = useTheme();
  
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [isSavingsGoalEnabled, setIsSavingsGoalEnabled] = useState(false);
  
  const [initialData, setInitialData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });
  const [categories, setCategories] = useState<string[]>([]);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null);

  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // --- CORRECCIÓN: Se añade la declaración de isDarkMode ---
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const data = {
            name: userData.name,
            lastName: userData.lastName,
            email: userData.email,
            isSavingsGoalEnabled: userData.isSavingsGoalEnabled || false,
            savingsGoal: String(userData.savingsGoal || ''),
            theme: theme,
          };
          setInitialData(data);
          setName(data.name);
          setLastName(data.lastName);
          setEmail(data.email);
          setIsSavingsGoalEnabled(data.isSavingsGoalEnabled);
          setSavingsGoal(formatNumber(data.savingsGoal));
        }
      });

      const remindersColRef = collection(db, "users", auth.currentUser.uid, "reminders");
      const unsubscribeReminders = onSnapshot(remindersColRef, (snapshot) => {
          const remindersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
          setReminders(remindersList.sort((a, b) => a.dayOfMonth - b.dayOfMonth));
      });

      const categoriesDocRef = doc(db, "users", auth.currentUser.uid, "data", "categories");
      const unsubscribeCategories = onSnapshot(categoriesDocRef, (doc) => {
        if (doc.exists()) setCategories(doc.data().list.sort());
        else setCategories([]);
      });

      return () => {
        unsubscribeProfile();
        unsubscribeReminders();
        unsubscribeCategories();
      };
    }
  }, []);

  useEffect(() => {
    if (initialData) {
      const currentData = { name, lastName, savingsGoal, isSavingsGoalEnabled, theme };
      const changed = JSON.stringify(currentData) !== JSON.stringify({
        name: initialData.name,
        lastName: initialData.lastName,
        savingsGoal: formatNumber(initialData.savingsGoal),
        isSavingsGoalEnabled: initialData.isSavingsGoalEnabled,
        theme: initialData.theme
      });
      setHasChanges(changed);
    }
  }, [name, lastName, savingsGoal, isSavingsGoalEnabled, theme, initialData]);

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
    const numericGoal = parseFloat(parseFormattedNumber(savingsGoal));
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
        await AsyncStorage.setItem('app-theme', theme);
        setHasChanges(false);
        showNotification('Configuración guardada con éxito', 'success');
      } catch (error) {
        showNotification('Error al guardar la configuración.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveReminder = async (reminderData: NewReminder | Reminder) => {
    if (auth.currentUser) {
        const remindersColRef = collection(db, "users", auth.currentUser.uid, "reminders");
        try {
            if ('id' in reminderData) {
                const { id, ...dataToUpdate } = reminderData;
                const reminderDocRef = doc(db, "users", auth.currentUser.uid, "reminders", id);
                await updateDoc(reminderDocRef, dataToUpdate as any);
                showNotification('Recordatorio actualizado.', 'success');
            } else {
                await addDoc(remindersColRef, reminderData);
                showNotification('Recordatorio añadido.', 'success');
            }
        } catch (error) {
            showNotification('Error al guardar el recordatorio.', 'error');
        } finally {
            setIsReminderModalVisible(false);
            setEditingReminder(null);
        }
    }
  };

  const executeDeleteReminder = async () => {
    if (auth.currentUser && reminderToDelete) {
        const reminderDocRef = doc(db, "users", auth.currentUser.uid, "reminders", reminderToDelete.id);
        await deleteDoc(reminderDocRef);
        showNotification('Recordatorio eliminado.', 'success');
        setReminderToDelete(null);
    }
  };

  const handleToggleReminderCompletion = async (reminderId: string, monthYear: string, isCompleted: boolean) => {
    if (!auth.currentUser) return;
    const reminderRef = doc(db, "users", auth.currentUser.uid, "reminders", reminderId);
    try {
        const operation = isCompleted 
            ? firebase.firestore.FieldValue.arrayUnion(monthYear)
            : firebase.firestore.FieldValue.arrayRemove(monthYear);
        await updateDoc(reminderRef, { completedMonths: operation });
    } catch (error) {
        showNotification("Error al actualizar el estado.", "error");
    }
  };

  const toggleExpandReminder = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedReminderId(prevId => prevId === id ? null : id);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 10, paddingBottom: 15 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BackIcon color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
        <View style={{width: 40}} />
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
          </View>
        </View>

        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recordatorios</Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                {reminders.map(reminder => (
                    <ReminderItem 
                        key={reminder.id}
                        reminder={reminder}
                        isExpanded={expandedReminderId === reminder.id}
                        onToggleExpand={() => toggleExpandReminder(reminder.id)}
                        onEdit={() => { setEditingReminder(reminder); setIsReminderModalVisible(true); }}
                        onDelete={() => setReminderToDelete(reminder)}
                        onToggleCompletion={handleToggleReminderCompletion}
                    />
                ))}
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, marginTop: reminders.length > 0 ? 20 : 0 }]} onPress={() => { setEditingReminder(null); setIsReminderModalVisible(true); }}>
                    <Text style={styles.buttonText}>Añadir Recordatorio</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Metas</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Activar Meta de Ahorro</Text>
                <Switch trackColor={{ false: "#767577", true: colors.primary }} thumbColor={isSavingsGoalEnabled ? colors.primary : "#f4f3f4"} onValueChange={setIsSavingsGoalEnabled} value={isSavingsGoalEnabled}/>
            </View>
            {isSavingsGoalEnabled && (
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, marginTop: 20 }]} 
                    value={savingsGoal} 
                    onChangeText={(text) => setSavingsGoal(formatNumber(text))}
                    placeholder="Meta de Ahorro Mensual"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                />
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
              <Switch trackColor={{ false: "#767577", true: colors.primary }} thumbColor={isDarkMode ? colors.primary : "#f4f3f4"} onValueChange={toggleTheme} value={isDarkMode}/>
            </View>
          </View>
        </View>
      </ScrollView>

      <Animated.View style={[styles.floatingButtonContainer, { opacity: buttonOpacity, bottom: insets.bottom + 20 }]}>
          <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }, isSaving && styles.buttonDisabled]} 
              onPress={handleSaveChanges}
              disabled={isSaving || !hasChanges}
          >
              {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Guardar Cambios</Text>}
          </TouchableOpacity>
      </Animated.View>

      <ModalCambiarContrasena visible={isPasswordModalVisible} onClose={() => setIsPasswordModalVisible(false)} onSuccess={() => { showNotification('Contraseña actualizada con éxito', 'success'); }}/>
      <ModalGestionarRecordatorio visible={isReminderModalVisible} onClose={() => { setIsReminderModalVisible(false); setEditingReminder(null); }} onSave={handleSaveReminder} existingReminder={editingReminder} categories={categories} />
      <ModalConfirmacion visible={!!reminderToDelete} onCancel={() => setReminderToDelete(null)} onConfirm={executeDeleteReminder} title="Eliminar Recordatorio" message={`¿Estás seguro de que quieres eliminar el recordatorio "${reminderToDelete?.name}"?`} confirmText="Eliminar" />
      <Notification message={notification.message} type={notification.type} visible={notification.visible} onHide={() => setNotification(prev => ({ ...prev, visible: false }))}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, borderBottomWidth: 1, },
  backButton: { padding: 5, },
  title: { fontSize: 22, fontWeight: 'bold', },
  content: { padding: 20, paddingBottom: 120, },
  section: { marginBottom: 30, },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, paddingHorizontal: 5, },
  card: { borderRadius: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, },
  inputLabel: { fontSize: 16, marginBottom: 5, fontWeight: '500', },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20, fontSize: 16, },
  disabledInput: { opacity: 0.7, },
  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', },
  buttonDisabled: { opacity: 0.5, },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 50, },
  rowLabel: { fontSize: 16, },
  reminderWrapper: { borderBottomWidth: 1, },
  reminderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, },
  reminderName: { fontSize: 16, fontWeight: '500' },
  reminderDetails: { fontSize: 14, marginTop: 2 },
  reminderActions: { flexDirection: 'row', alignItems: 'center', gap: 5, },
  historyContainer: { paddingTop: 10, marginTop: 10, },
  floatingButtonContainer: { position: 'absolute', left: 20, right: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10, }
});
