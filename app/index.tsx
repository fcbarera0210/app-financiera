import Constants from 'expo-constants'; // <-- Importamos Constants
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Importación de Firebase y sus servicios
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// --- Importamos TODOS nuestros componentes NATIVOS ---
import FormularioTransaccion from '../components/FormularioTransaccion';
import Historial from '../components/Historial';
import LoginScreen from '../components/LoginScreen';
import ModalConfirmacion from '../components/ModalConfirmacion';
import ModalEditarTransaccion from '../components/ModalEditarTransaccion';
import ModalSaldoInicial from '../components/ModalSaldoInicial';
import Notification from '../components/Notification';
import SaldoPanel from '../components/SaldoPanel';

// Importación de los tipos que definimos
import { NewTransaction, Transaction } from '../types';

interface UserProfile {
  name: string;
  lastName: string;
  email: string;
}

// --- Componente Principal de la App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [notification, setNotification] = useState({ message: '', type: 'error' as 'success' | 'error', visible: false });
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Listeners y Lógica de Autenticación ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCategories([]);
      return;
    }

    const qTransactions = query(collection(db, "users", user.uid, "transactions"));
    const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
      const userTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        userTransactions.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    const categoriesDocRef = doc(db, "users", user.uid, "data", "categories");
    const unsubscribeCategories = onSnapshot(categoriesDocRef, (doc) => {
        if (doc.exists()) {
            setCategories(doc.data().list.sort());
        } else {
            setCategories([]);
        }
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
    setNotification({ message, type, visible: true });
  };
  
  const handleLogin = async (email: string, password: string) => {
    Keyboard.dismiss();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      showNotification('Email o contraseña incorrectos.');
    }
  };

  const handleRegister = async (name: string, lastName: string, email: string, password: string) => {
    Keyboard.dismiss();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      await setDoc(doc(db, "users", newUser.uid), { name, lastName, email });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') showNotification('Este email ya está registrado.');
      else if (error.code === 'auth/weak-password') showNotification('La contraseña debe tener al menos 6 caracteres.');
      else showNotification('Ocurrió un error al registrar la cuenta.');
    }
  };

  const handleLogout = () => signOut(auth);

  // --- Lógica de Transacciones y Categorías (sin cambios) ---
  const handleAddNewCategory = async (newCategory: string) => {
    if (!user || !newCategory) return;
    const categoriesDocRef = doc(db, "users", user.uid, "data", "categories");
    try {
        const docSnap = await getDoc(categoriesDocRef);
        if (docSnap.exists()) {
            await updateDoc(categoriesDocRef, { list: arrayUnion(newCategory) });
        } else {
            await setDoc(categoriesDocRef, { list: [newCategory] });
        }
        showNotification("Categoría añadida", "success");
    } catch(error) {
        showNotification("Error al guardar la categoría.");
        console.error(error);
    }
  };

  const handleAddTransaction = async (newTx: NewTransaction) => {
    if (!user) return;
    Keyboard.dismiss();
    try {
      if (newTx.type === 'gasto' && newTx.category && !categories.includes(newTx.category)) {
        await handleAddNewCategory(newTx.category);
      }
      await addDoc(collection(db, "users", user.uid, "transactions"), { ...newTx, date: new Date().toISOString() });
    } catch (error) { 
      showNotification("No se pudo guardar el movimiento."); 
      console.error(error);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
  };

  const executeDelete = async () => {
    if (!user || !transactionToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "transactions", transactionToDelete));
      showNotification("Movimiento eliminado", "success");
    } catch (error) { 
      showNotification("Error al eliminar el movimiento.");
      console.error("Error en Firebase al eliminar:", error);
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
      await updateDoc(doc(db, "users", user.uid, "transactions", id), dataToUpdate);
      setEditingTransaction(null);
      showNotification('Movimiento actualizado', 'success');
    } catch (error) { 
      showNotification("Error al actualizar.");
      console.error(error);
    }
  };

  const handleSetInitialBalance = async (amount: number) => {
    if (!user) return;
    const initialTx: NewTransaction = { description: 'Saldo Inicial', amount, type: 'ingreso', category: null };
    await handleAddTransaction(initialTx);
  };

  // --- CÁLCULOS MEMOIZADOS (sin cambios) ---
  const { balance, monthlyIncome, monthlyExpenses } = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = t.amount || 0;
      acc.balance += t.type === 'ingreso' ? amount : -amount;
      const txDate = new Date(t.date);
      if (txDate.getMonth() === new Date().getMonth() && txDate.getFullYear() === new Date().getFullYear()) {
        if (t.type === 'ingreso') acc.monthlyIncome += amount;
        else acc.monthlyExpenses += amount;
      }
      return acc;
    }, { balance: 0, monthlyIncome: 0, monthlyExpenses: 0 });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'todos') return transactions;
    return transactions.filter(t => t.category === activeFilter);
  }, [transactions, activeFilter]);

  // --- Renderizado ---
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {user ? (
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View style={styles.innerContainer}>
              <View style={styles.header}>
                <Text style={styles.welcomeText}>Hola, {userProfile?.name || user.email?.split('@')[0]}</Text>
                <Button title="Salir" onPress={handleLogout} color="#ef4444" />
              </View>
              
              <SaldoPanel balance={balance} monthlyIncome={monthlyIncome} monthlyExpenses={monthlyExpenses} />
              <FormularioTransaccion 
                onAddTransaction={handleAddTransaction} 
                onAddNewCategory={handleAddNewCategory}
                categories={categories}
                showNotification={showNotification} 
              />
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
            visible={user !== null && transactions.length === 0}
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
            message="¿Estás seguro de que quieres eliminar esta transacción? Esta acción no se puede deshacer."
            onCancel={() => setTransactionToDelete(null)}
            onConfirm={executeDelete}
            confirmText="Eliminar"
            isConfirming={isDeleting}
          />
        </>
      ) : (
        <LoginScreen onLogin={handleLogin} onRegister={handleRegister} showNotification={showNotification} />
      )}
      <Notification 
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
      {/* --- ETIQUETA DE VERSIÓN --- */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v{Constants.expoConfig?.version}</Text>
      </View>
    </SafeAreaView>
  );
}

// --- Estilos para React Native ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  scrollView: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f7' },
  innerContainer: { flexGrow: 1, padding: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcomeText: { fontSize: 26, fontWeight: 'bold', color: '#1e293b' },
  versionContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
