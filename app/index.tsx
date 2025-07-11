import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { G, Path, Svg } from 'react-native-svg';

// Importación de Firebase y sus servicios (modo compat)
import { auth, db, firebase } from '../firebaseConfig';
type User = firebase.User;

// --- Importamos TODOS nuestros componentes NATIVOS ---
import AhorroMes from '../components/AhorroMes';
import FormularioTransaccion from '../components/FormularioTransaccion';
import GastosChart from '../components/GastosChart';
import Historial from '../components/Historial';
import LoginScreen from '../components/LoginScreen';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalEditarTransaccion from '../components/ModalEditarTransaccion';
import ModalSaldoInicial from '../components/ModalSaldoInicial';
import Notification from '../components/Notification';
import RecordatoriosPanel from '../components/RecordatoriosPanel';
import SaldoPanel from '../components/SaldoPanel';
import { useTheme } from '../contexts/ThemeContext';

// Importación de los tipos que definimos
import { NewTransaction, Reminder, Transaction } from '../types';

// --- Icono de Configuración Rediseñado ---
const SettingsIcon = ({ color }: { color: string }) => (
    <Svg height="26" width="26" viewBox="0 0 867 864">
        <G fill={color}>
            <Path d="M433.39,863.26c-15.48,0-31.14,1.5-46.4-.3-35.62-4.22-61.69-34.9-61.93-70.93-.1-16.67-.12-33.33.08-50,0-3.39-.94-4.89-4.17-6.07-8-2.91-15.8-6.18-23.52-9.68-3-1.37-4.83-1.26-7.29,1.25q-17.46,17.88-35.37,35.32c-25.8,25.25-64,28.48-93.25,7.44-7.1-5.11-13.2-11.69-19.48-17.87-13.19-13-26.16-26.15-39.29-39.17C73,683.7,72.88,638.78,102.62,609.15c11.45-11.41,22.84-22.88,34.4-34.17,2.37-2.31,2.91-4,1.4-7.21a243.39,243.39,0,0,1-9.52-23c-1.36-3.87-3.29-4.83-7.18-4.78-16.5.23-33,.12-49.49.09a72.11,72.11,0,0,1-72-71.26q-.4-36.5,0-73c.4-40.19,32.4-71.71,72.54-71.74,16.67,0,33.33-.08,50,.06,3.09,0,4.6-.74,5.76-3.88,3-8.27,6.49-16.4,10.19-24.4,1.33-2.87.72-4.38-1.32-6.39-11.65-11.44-23.28-22.91-34.73-34.55-29.61-30.1-29.89-73.24-.48-103.36q25.14-25.76,51-50.83c28.88-28.07,73.48-27.6,102.08.82C267,113.25,278.85,125,290.55,136.84c2.11,2.14,3.71,2.43,6.47,1.19q12-5.42,24.41-10.12c2.82-1.08,3.69-2.44,3.67-5.4-.15-16.33-.14-32.66-.06-49,.16-35.82,22.6-63.91,57.52-71.87A65,65,0,0,1,396.4.1C420.9,0,445.4,0,469.89,0a72.09,72.09,0,0,1,71.88,71.41q.22,25.24,0,50.49c0,3.33.84,4.94,4.1,6.14,8,2.91,15.8,6.18,23.52,9.68,3,1.38,4.83,1.26,7.29-1.25,11.53-11.79,23.28-23.37,35-34.94,29.39-28.93,73.7-28.9,103.12.13q26.13,25.8,52,51.86c25.66,25.8,26.44,69.74,1.25,97.17-12.28,13.37-25.49,25.87-38.44,38.6-2.28,2.24-2.59,3.83-1.23,6.76q5.22,11.32,9.51,23.06c1.33,3.62,2.9,5.09,7.06,5,16.32-.31,32.66-.13,49-.12,40.62,0,72.71,31.94,72.82,72.53q.11,35.74,0,71.49c-.11,39.6-32.39,71.9-71.86,72-17,0-34,.07-51-.06-2.91,0-4.3.78-5.4,3.65-3.27,8.54-7.11,16.86-10.41,25.38a5.62,5.62,0,0,0,.95,4.91Q745.83,591,763,607.82c31.21,30.64,31.55,75,.7,105.9q-24,24.06-48.14,48c-30.2,29.92-74.41,30-104.62.12-11.37-11.24-22.73-22.51-33.89-34-2.68-2.76-4.74-2.94-8.13-1.36-7.54,3.51-15.25,6.69-23,9.53-3.27,1.19-4.15,2.77-4.11,6.11q.27,24.5.06,49c-.32,35.53-23,63.64-57.53,71.38A66.68,66.68,0,0,1,470.89,864c-12.5.2-25,.07-37.5.07Zm-281-659.65a45.86,45.86,0,0,1,4.19,3.27q26.41,26.25,52.76,52.57c12.73,12.71,15,29.74,6,45.27a256.27,256.27,0,0,0-26.51,63.85c-4.53,17.07-18.23,27.42-36,27.45q-37.25.06-74.49,0H72.9v72h5.82q37,0,74,0c18,0,31.57,10.51,36.18,27.8a256.31,256.31,0,0,0,25.39,61.68c10.55,18.41,8.47,33.83-6.58,48.79q-15.06,15-30.13,30l-24.3,24.1,51.42,51.94a27.26,27.26,0,0,1,2.84-4.05q26.31-26.35,52.72-52.6c13-12.92,29.83-15.08,45.69-6a260.33,260.33,0,0,0,61.57,25.65c20.41,5.53,29.92,18.11,29.93,39.18q0,35.75,0,71.5v5.58h72.18v-5.89c0-24,.4-48-.19-72-.48-19.67,12.15-34.18,29.68-38.49a228.23,228.23,0,0,0,60.71-25c16.92-9.9,33.51-7.78,47.35,6s27.85,27.75,41.73,41.68c4.68,4.7,9.19,9.56,13.55,14.12l51.15-51.67c-1.24-1.17-2.85-2.59-4.37-4.1q-25.5-25.4-51-50.82c-14-14-16-30-6-47.23a252.19,252.19,0,0,0,25.52-61.62C682.67,478.35,696,468,714.94,468h79.25V396h-5.7q-37,0-74,0c-18.28,0-32-10.38-36.61-28a254.69,254.69,0,0,0-26.12-63c-9.44-16.34-6.93-33.23,6.53-46.38s26.65-26.6,40.08-39.79c5.31-5.21,10.94-10.1,15.77-14.53l-51.79-52.34q-26.76,27.06-53.66,54.29c-15.27,15.48-30.77,17.78-49.54,7.1-19.19-10.92-39.33-19.66-60.78-24.89-16.29-4-29.26-18.18-28.86-37.5.51-24.49.08-49,.06-73.49V72.29H397.44V78.4c0,24.17.06,48.33,0,72.5,0,19.26-10.28,32.6-28.81,37.53a256.27,256.27,0,0,0-62.95,26.15c-15.65,9.06-32.35,6.77-45.27-6q-15-14.73-29.73-29.66c-8.87-9-17.61-18.06-26.55-27.24Z"/>
            <Path d="M613.88,431.86c.65,98.94-81.46,182.66-185.13,180.15C332.4,609.68,251.56,530.65,253,429.45c1.36-100,84.11-180.07,185.47-177.36C537.37,254.74,614.16,335.87,613.88,431.86Zm-288.65-3.54A108,108,0,0,0,427.1,539.86c59.61,3.8,111.19-42.33,114.52-101.87,3.31-59.06-42.24-110.34-101.62-113.77A108.08,108.08,0,0,0,325.23,428.32Z"/>
        </G>
    </Svg>
);

interface UserProfile {
  name: string;
  lastName: string;
  email: string;
  savingsGoal?: number;
  isSavingsGoalEnabled?: boolean;
}

// --- Componente Principal de la App ---
export default function AppScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { theme, colors } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [savedCredentials, setSavedCredentials] = useState<{email: string, pass: string} | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reminderToComplete, setReminderToComplete] = useState<string | null>(null); // <-- NUEVO ESTADO

  // --- Listeners y Lógica de Autenticación ---
  useEffect(() => {
    const loadCredentials = async () => {
        const email = await AsyncStorage.getItem('savedEmail');
        const pass = await AsyncStorage.getItem('savedPassword');
        if (email && pass) setSavedCredentials({ email, pass });
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
        setIsInitialDataLoaded(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      setReminders([]);
      return;
    }

    const unsubTransactions = db.collection("users").doc(user.uid).collection("transactions").onSnapshot((snapshot) => {
      const userTransactions: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsInitialDataLoaded(true);
    });

    const unsubCategories = db.collection("users").doc(user.uid).collection("data").doc("categories").onSnapshot((doc) => {
      if (doc.exists) setCategories(doc.data()?.list.sort() || []);
      else setCategories([]);
    });
      
    const unsubProfile = db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) setUserProfile(doc.data() as UserProfile);
      setLoading(false);
    });

    const unsubReminders = db.collection("users").doc(user.uid).collection("reminders").onSnapshot((snapshot) => {
        const userReminders: Reminder[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
        setReminders(userReminders);
    });

    return () => {
      unsubTransactions();
      unsubCategories();
      unsubProfile();
      unsubReminders();
    };
  }, [user]);

  useEffect(() => {
    if (params.notificationMessage) {
        showNotification(params.notificationMessage as string, 'success');
    }
  }, [params.notificationMessage]);

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ message, type, visible: true });
  };
  
  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    Keyboard.dismiss();
    try {
      await auth.signInWithEmailAndPassword(email, password);
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (error: any) {
      showNotification('Email o contraseña incorrectos.');
    }
  };

  const handleRegister = async (name: string, lastName: string, email: string, password: string) => {
    Keyboard.dismiss();
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const newUser = userCredential.user;
      if (newUser) {
        await db.collection("users").doc(newUser.uid).set({ name, lastName, email });
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') showNotification('Este email ya está registrado.');
      else if (error.code === 'auth/weak-password') showNotification('La contraseña debe tener al menos 6 caracteres.');
      else showNotification('Ocurrió un error al registrar la cuenta.');
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await auth.signOut();
  };

  const handleAddNewCategory = async (newCategory: string) => {
    if (!user || !newCategory) return;
    const categoriesDocRef = db.collection("users").doc(user.uid).collection("data").doc("categories");
    try {
        const docSnap = await categoriesDocRef.get();
        if (docSnap.exists) {
            await categoriesDocRef.update({ list: firebase.firestore.FieldValue.arrayUnion(newCategory) });
        } else {
            await categoriesDocRef.set({ list: [newCategory] });
        }
        showNotification("Categoría añadida", "success");
    } catch(error) {
        showNotification("Error al guardar la categoría.");
    }
  };

  const handleAddTransaction = async (newTx: NewTransaction) => {
    if (!user) return;
    Keyboard.dismiss();
    try {
      if (newTx.type === 'gasto' && newTx.category && !categories.includes(newTx.category)) {
        await handleAddNewCategory(newTx.category);
      }
      await db.collection("users").doc(user.uid).collection("transactions").add(newTx);
    } catch (error) { 
      showNotification("No se pudo guardar el movimiento."); 
    }
  };

  const handleDeleteTransaction = (id: string) => setTransactionToDelete(id);

  const executeDelete = async () => {
    if (!user || !transactionToDelete) return;
    setIsDeleting(true);
    try {
      await db.collection("users").doc(user.uid).collection("transactions").doc(transactionToDelete).delete();
      showNotification("Movimiento eliminado", "success");
    } catch (error) { 
      showNotification("Error al eliminar el movimiento.");
    } finally {
      setIsDeleting(false);
      setTransactionToDelete(null);
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    if (!user) return;
    if (updatedTx.type === 'gasto' && updatedTx.category && !categories.includes(updatedTx.category)) {
        await handleAddNewCategory(updatedTx.category);
    }
    const { id, ...dataToUpdate } = updatedTx;
    try {
      await db.collection("users").doc(user.uid).collection("transactions").doc(id).update(dataToUpdate);
      setEditingTransaction(null);
      showNotification('Movimiento actualizado', 'success');
    } catch (error) { 
      showNotification("Error al actualizar.");
    }
  };

  const handleSetInitialBalance = async (amount: number) => {
    if (!user) return;
    const initialTx: NewTransaction = { description: 'Saldo Inicial', amount, type: 'ingreso', category: null, date: new Date().toISOString() };
    await handleAddTransaction(initialTx);
  };
  
  const handleToggleReminder = async () => {
    if (!user || !reminderToComplete) return;
    
    const monthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;
    const reminderRef = db.collection("users").doc(user.uid).collection("reminders").doc(reminderToComplete);
    
    try {
        await reminderRef.update({ completedMonths: firebase.firestore.FieldValue.arrayUnion(monthYear) });
    } catch (error) {
        showNotification("Error al actualizar el recordatorio.", "error");
    } finally {
        setReminderToComplete(null);
    }
  };

  const changeMonth = (increment: number) => {
    setDisplayDate(currentDate => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + increment);
        return newDate;
    });
  };

  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    const currentMonth = displayDate.getMonth();
    const currentYear = displayDate.getFullYear();
    const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'ingreso' ? t.amount : -t.amount), 0);
    const { income, expenses } = transactions.reduce((acc, t) => {
      const txDate = new Date(t.date);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        if (t.type === 'ingreso') acc.income += t.amount;
        else acc.expenses += t.amount;
      }
      return acc;
    }, { income: 0, expenses: 0 });
    return { balance: totalBalance, monthlyIncome: income, monthlyExpenses: expenses };
  }, [transactions, displayDate]);

  const transactionsForMonth = useMemo(() => {
    const currentMonth = displayDate.getMonth();
    const currentYear = displayDate.getFullYear();
    return transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });
  }, [transactions, displayDate]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'todos') return transactionsForMonth;
    return transactionsForMonth.filter(t => t.category === activeFilter);
  }, [transactionsForMonth, activeFilter]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {user ? (
        <>
          <View style={[styles.header, { paddingTop: insets.top + 10, paddingBottom: 15, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Hola, {userProfile?.name || user.email?.split('@')[0]}</Text>
            <View style={styles.headerActions}>
                <Link href="/settings" asChild>
                    <TouchableOpacity style={styles.iconButton}>
                        <SettingsIcon color={colors.textSecondary} />
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.destructive }]} onPress={() => setShowLogoutModal(true)}>
                    <Text style={styles.logoutButtonText}>Salir</Text>
                </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
              <SaldoPanel balance={balance} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} />
              
              <View style={[styles.monthNavigator, { backgroundColor: colors.card }]}>
                  <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
                      <Text style={[styles.arrowText, { color: colors.primary }]}>{"<"}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.monthText, { color: colors.text }]}>
                      {displayDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
                      <Text style={[styles.arrowText, { color: colors.primary }]}>{">"}</Text>
                  </TouchableOpacity>
              </View>

              <RecordatoriosPanel 
                reminders={reminders}
                displayDate={displayDate}
                onTogglePress={(reminderId) => setReminderToComplete(reminderId)}
                loadingReminder={null} // Se manejará en el futuro si es necesario
              />

              <FormularioTransaccion 
                onAddTransaction={handleAddTransaction} 
                onAddNewCategory={handleAddNewCategory}
                categories={categories}
                showNotification={showNotification} 
              />
              
              <GastosChart transactions={transactionsForMonth} />
              <AhorroMes 
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                savingsGoal={userProfile?.savingsGoal || 0}
              />
              <Historial 
                transactions={filteredTransactions}
                categories={categories}
                onDelete={handleDeleteTransaction}
                onEdit={setEditingTransaction}
                onFilter={setActiveFilter}
                activeFilter={activeFilter}
              />
          </ScrollView>
          
          <ModalSaldoInicial visible={!isInitialDataLoaded && !loading && user !== null && transactions.length === 0} onSave={handleSetInitialBalance} showNotification={showNotification} />
          {editingTransaction && <ModalEditarTransaccion visible={!!editingTransaction} transaction={editingTransaction} onSave={handleUpdateTransaction} onCancel={() => setEditingTransaction(null)} categories={categories} showNotification={showNotification} />}
          <ModalConfirmacion visible={!!transactionToDelete} title="Eliminar Movimiento" message="¿Estás seguro de que quieres eliminar esta transacción?" onCancel={() => setTransactionToDelete(null)} onConfirm={executeDelete} confirmText="Eliminar" isConfirming={isDeleting} />
          <ModalConfirmacion visible={showLogoutModal} title="Cerrar Sesión" message="¿Estás seguro de que quieres cerrar tu sesión?" onCancel={() => setShowLogoutModal(false)} onConfirm={handleLogout} confirmText="Salir" />
          <ModalConfirmacion visible={!!reminderToComplete} title="Confirmar Acción" message="¿Estás seguro de que quieres marcar este recordatorio como completado?" onCancel={() => setReminderToComplete(null)} onConfirm={handleToggleReminder} confirmText="Confirmar" />
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} onRegister={handleRegister} showNotification={showNotification} savedEmail={savedCredentials?.email} savedPassword={savedCredentials?.pass} />
      )}
      <Notification message={notification.message} type={notification.type} visible={notification.visible} onHide={() => setNotification(prev => ({ ...prev, visible: false }))} />
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>v{Constants.expoConfig?.version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  innerContainer: { padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 15, },
  iconButton: { padding: 5, },
  welcomeText: { fontSize: 26, fontWeight: 'bold' },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, },
  logoutButtonText: { color: 'white', fontWeight: '600', },
  versionContainer: { position: 'absolute', bottom: 10, width: '100%', alignItems: 'center', },
  versionText: { fontSize: 12, },
  monthNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  monthText: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', paddingVertical: 15, },
  arrowButton: { padding: 10, },
  arrowText: { fontSize: 24, fontWeight: 'bold', },
});
