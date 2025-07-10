import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

// Importación de Firebase y sus servicios (modo compat)
import { auth, db, firebase } from '../firebaseConfig';
type User = firebase.User;

// --- Importamos TODOS nuestros componentes NATIVOS ---
import FormularioTransaccion from '../components/FormularioTransaccion';
import Historial from '../components/Historial';
import LoginScreen from '../components/LoginScreen';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalEditarTransaccion from '../components/ModalEditarTransaccion';
import ModalSaldoInicial from '../components/ModalSaldoInicial';
import Notification from '../components/Notification';
import SaldoPanel from '../components/SaldoPanel';
import { useTheme } from '../contexts/ThemeContext';

// Importación de los tipos que definimos
import { NewTransaction, Transaction } from '../types';

// --- Icono para el botón de configuración ---
const SettingsIcon = ({ color }: { color: string }) => (
    <Svg height="26" width="26" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </Svg>
);

interface UserProfile {
  name: string;
  lastName: string;
  email: string;
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
  const [authLoading, setAuthLoading] = useState(true);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false); // <-- NUEVO ESTADO
  const [activeFilter, setActiveFilter] = useState('todos');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [savedCredentials, setSavedCredentials] = useState<{email: string, pass: string} | null>(null);

  useEffect(() => {
    const loadCredentials = async () => {
        const email = await AsyncStorage.getItem('savedEmail');
        const pass = await AsyncStorage.getItem('savedPassword');
        if (email && pass) {
            setSavedCredentials({ email, pass });
        }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setAuthLoading(false);
        setIsInitialDataLoaded(true); // Si no hay usuario, no hay datos que cargar
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      return;
    }

    const unsubscribeTransactions = db.collection("users").doc(user.uid).collection("transactions")
      .onSnapshot((snapshot) => {
        const userTransactions: Transaction[] = [];
        snapshot.forEach((doc) => userTransactions.push({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsInitialDataLoaded(true); // <-- Marcamos que los datos iniciales ya cargaron
      });

    const unsubscribeCategories = db.collection("users").doc(user.uid).collection("data").doc("categories")
      .onSnapshot((doc) => {
        if (doc.exists) setCategories(doc.data()?.list.sort() || []);
        else setCategories([]);
      });
      
    const unsubscribeProfile = db.collection("users").doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
            setUserProfile(doc.data() as UserProfile);
        }
        setAuthLoading(false); // <-- Movemos el fin de la carga de auth aquí
      });

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
      unsubscribeProfile();
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
    if (!user) return Promise.resolve();
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

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
  };

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
    if (!user) return Promise.resolve();
    if (updatedTx.type === 'gasto' && updatedTx.category && !categories.includes(updatedTx.category)) {
        await handleAddNewCategory(updatedTx.category);
    }
    const { id, ...dataToUpdate } = updatedTx;
    try {
      await db.collection("users").doc(user.uid).collection("transactions").doc(id).update(dataToUpdate);
      setEditingTransaction(null);
    } catch (error) { 
      showNotification("Error al actualizar.");
    }
  };

  const handleSetInitialBalance = async (amount: number) => {
    if (!user) return;
    const initialTx: NewTransaction = { description: 'Saldo Inicial', amount, type: 'ingreso', category: null, date: new Date().toISOString() };
    await handleAddTransaction(initialTx);
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

  if (authLoading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {user ? (
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                <Text style={[styles.welcomeText, { color: colors.text }]}>Hola, {userProfile?.name || user.email?.split('@')[0]}</Text>
                <View style={styles.headerActions}>
                    <Link href="/settings" asChild>
                        <TouchableOpacity style={styles.iconButton}>
                            <SettingsIcon color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Link>
                    <Button title="Salir" onPress={handleLogout} color={colors.destructive} />
                </View>
              </View>
              
              <SaldoPanel balance={balance} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} />
              <FormularioTransaccion 
                onAddTransaction={handleAddTransaction} 
                onAddNewCategory={handleAddNewCategory}
                categories={categories}
                showNotification={showNotification} 
              />
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

              <Historial 
                transactions={filteredTransactions}
                categories={categories}
                onDelete={handleDeleteTransaction}
                onEdit={setEditingTransaction}
                onFilter={setActiveFilter}
                activeFilter={activeFilter}
              />
            </View>
          </ScrollView>
          
          <ModalSaldoInicial
            visible={!isInitialDataLoaded && !authLoading && user !== null && transactions.length === 0}
            onSave={handleSetInitialBalance}
            showNotification={showNotification}
          />

          {editingTransaction && (
            <ModalEditarTransaccion
              visible={!!editingTransaction}
              transaction={editingTransaction}
              onSave={handleUpdateTransaction}
              onCancel={() => setEditingTransaction(null)}
              categories={categories}
              showNotification={showNotification}
            />
          )}

          <ModalConfirmacion 
            visible={!!transactionToDelete}
            title="Eliminar Movimiento"
            message="¿Estás seguro de que quieres eliminar esta transacción?"
            onCancel={() => setTransactionToDelete(null)}
            onConfirm={executeDelete}
            confirmText="Eliminar"
            isConfirming={isDeleting}
          />
        </>
      ) : (
        <LoginScreen 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            showNotification={showNotification}
            savedEmail={savedCredentials?.email}
            savedPassword={savedCredentials?.pass}
        />
      )}
      <Notification 
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
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
  innerContainer: { flexGrow: 1, padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 15, },
  iconButton: { padding: 5, },
  welcomeText: { fontSize: 26, fontWeight: 'bold' },
  versionContainer: { position: 'absolute', bottom: 10, width: '100%', alignItems: 'center', },
  versionText: { fontSize: 12, },
  monthNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10, borderRadius: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, },
  monthText: { fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', paddingVertical: 15, },
  arrowButton: { padding: 10, },
  arrowText: { fontSize: 24, fontWeight: 'bold', },
});
