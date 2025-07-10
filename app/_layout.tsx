import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext'; // <-- Importamos nuestro proveedor

export default function RootLayout() {
  return (
    // Envolvemos todo en el ThemeProvider
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack>
          {/* Pantalla principal */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          
          {/* Nueva pantalla de configuración */}
          <Stack.Screen 
            name="settings" 
            options={{ 
              headerShown: false,
              // Usamos 'fullScreenModal' para una transición más nativa en iOS
              presentation: 'fullScreenModal' 
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
