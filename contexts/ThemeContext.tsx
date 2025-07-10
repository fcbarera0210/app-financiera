import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Definimos los colores para cada tema
const lightColors = {
  background: '#f0f4f7',
  card: 'white',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#cbd5e1',
  primary: '#3b82f6',
  notification: '#22c55e',
  destructive: '#ef4444',
};

const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#60a5fa',
  notification: '#4ade80',
  destructive: '#f87171',
};

// Creamos el tipo para nuestro contexto
interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: typeof lightColors;
  toggleTheme: () => void;
}

// Creamos el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Creamos el Proveedor del Tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme || 'light');

  // Cargar la preferencia del usuario al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('app-theme');
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      }
    };
    loadTheme();
  }, []);

  // Función para cambiar el tema y guardarlo
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('app-theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema fácilmente en cualquier componente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
