import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema

// Iconos para el Checkbox
const CheckboxBase = ({ borderColor }: { borderColor: string }) => (
    <View style={[styles.checkboxBase, { borderColor }]} />
);
const CheckboxChecked = ({ backgroundColor }: { backgroundColor: string }) => (
    <View style={[styles.checkboxBase, { backgroundColor, borderColor: backgroundColor }]}>
        <Svg height="14" width="14" viewBox="0 0 20 20" fill="white">
            <Path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </Svg>
    </View>
);

interface LoginScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onRegister: (name: string, lastName: string, email: string, password: string) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  savedEmail?: string;
  savedPassword?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister, showNotification, savedEmail, savedPassword }) => {
    const { colors } = useTheme(); // Usamos el hook para obtener los colores
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(savedEmail || '');
    const [password, setPassword] = useState(savedPassword || '');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(!!savedEmail);

    useEffect(() => {
        setEmail(savedEmail || '');
        setPassword(savedPassword || '');
        setRememberMe(!!savedEmail);
    }, [savedEmail, savedPassword]);

    const handleSubmit = () => {
        if (isLogin) {
            if (!email || !password) {
                showNotification('Por favor, ingresa email y contraseña.');
                return;
            }
            onLogin(email, password, rememberMe);
        } else {
            if (!name || !lastName || !email || !password || !confirmPassword) {
                showNotification('Por favor, completa todos los campos.');
                return;
            }
            if (password.length < 6) {
                showNotification('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden.');
                return;
            }
            onRegister(name, lastName, email, password);
        }
    };

    const toggleFormType = () => {
        setIsLogin(!isLogin);
        setName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>Control Financiero</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para empezar'}</Text>
                    
                    {!isLogin && (
                        <>
                            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor={colors.textSecondary} />
                            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={lastName} onChangeText={setLastName} placeholder="Apellido" placeholderTextColor={colors.textSecondary} />
                        </>
                    )}
                    <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textSecondary} autoCapitalize="none" keyboardType="email-address" />
                    <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor={colors.textSecondary} secureTextEntry />
                    {!isLogin && (
                        <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar Contraseña" placeholderTextColor={colors.textSecondary} secureTextEntry />
                    )}

                    {isLogin && (
                        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                            {rememberMe ? <CheckboxChecked backgroundColor={colors.primary} /> : <CheckboxBase borderColor={colors.border} />}
                            <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>Recordar credenciales</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Crear Cuenta'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleFormType} style={styles.switchButton}>
                        <Text style={[styles.switchButtonText, { color: colors.primary }]}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    innerContainer: { paddingHorizontal: 25 },
    title: { fontSize: 34, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
    input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 16, fontSize: 16 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
    checkboxBase: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderRadius: 4 },
    checkboxChecked: {},
    checkboxLabel: { marginLeft: 10, fontSize: 16 },
    button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    switchButton: { marginTop: 20, padding: 10 },
    switchButtonText: { textAlign: 'center', fontWeight: '600', fontSize: 15 },
});

export default LoginScreen;
