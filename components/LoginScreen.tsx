import React, { useState } from 'react';
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

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, lastName: string, email: string, password: string) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister, showNotification }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
        if (isLogin) {
            if (!email || !password) {
                showNotification('Por favor, ingresa email y contraseña.');
                return;
            }
            onLogin(email, password);
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
        // Limpiar campos al cambiar de formulario
        setName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Control Financiero</Text>
                    <Text style={styles.subtitle}>{isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para empezar'}</Text>
                    
                    {!isLogin && (
                        <>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nombre"
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                style={styles.input}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Apellido"
                                placeholderTextColor="#999"
                            />
                        </>
                    )}
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Contraseña"
                        placeholderTextColor="#999"
                        secureTextEntry
                    />
                    {!isLogin && (
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirmar Contraseña"
                            placeholderTextColor="#999"
                            secureTextEntry
                        />
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Crear Cuenta'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleFormType} style={styles.switchButton}>
                        <Text style={styles.switchButtonText}>
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    innerContainer: {
        paddingHorizontal: 25,
    },
    title: {
        fontSize: 34,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 40,
        color: '#64748b',
    },
    input: {
        height: 50,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: 'white',
        fontSize: 16,
        color: '#1e293b',
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchButton: {
        marginTop: 20,
        padding: 10,
    },
    switchButtonText: {
        color: '#3b82f6',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default LoginScreen;
