import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) {
        amount = 0;
    }
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
};

// Esta función toma un color hexadecimal y lo oscurece en un porcentaje
const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;

    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
};


interface SaldoPanelProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  color: string;
}

const SaldoPanel: React.FC<SaldoPanelProps> = ({ balance, monthlyIncome, monthlyExpenses, color }) => {
    const { colors } = useTheme();

    const gradientColor = color || colors.primary;
    // --- CORRECCIÓN APLICADA AQUÍ ---
    // Especificamos explícitamente el tipo como una tupla de dos strings.
    const gradientColors: [string, string] = [gradientColor, darkenColor(gradientColor, 10)];


    return (
        <LinearGradient
            colors={gradientColors}
            style={styles.container}
        >
            <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Saldo Actual</Text>
                <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            </View>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Ingresos (Mes)</Text>
                    <Text style={[styles.summaryAmount, styles.income]}>{formatCurrency(monthlyIncome)}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Gastos (Mes)</Text>
                    <Text style={[styles.summaryAmount, styles.expense]}>{formatCurrency(monthlyExpenses)}</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    balanceContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    balanceLabel: {
        fontSize: 18,
        color: 'white',
        opacity: 0.8,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 15,
        borderRadius: 15,
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 5,
    },
    income: {
        color: '#90ee90', 
    },
    expense: {
        color: '#f08080',
    },
});

export default SaldoPanel;