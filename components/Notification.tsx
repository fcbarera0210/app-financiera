import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext'; // Importamos el hook del tema

// Iconos para la notificación
const SuccessIcon = () => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill="white">
        <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </Svg>
);
const ErrorIcon = () => (
     <Svg height="20" width="20" viewBox="0 0 20 20" fill="white">
        <Path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </Svg>
);

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, visible, onHide }) => {
  const { colors } = useTheme(); // Usamos el hook para obtener los colores
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[
        styles.container, 
        { 
            transform: [{ translateY: slideAnim }],
            backgroundColor: type === 'success' ? colors.notification : colors.destructive
        }
    ]}>
      {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        marginLeft: 10,
        flex: 1,
    },
});

export default Notification;
