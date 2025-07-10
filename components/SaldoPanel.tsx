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

interface SaldoPanelProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

const SaldoPanel: React.FC<SaldoPanelProps> = ({ balance, monthlyIncome, monthlyExpenses }) => {
    const { colors } = useTheme(); // Usamos el hook para obtener los colores

    return (
        <LinearGradient
            // Los colores del degradado se mantienen para un look consistente
            colors={['#4A90E2', '#357ABD']}
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
        color: '#90ee90', // Verde claro se ve bien en ambos modos
    },
    expense: {
        color: '#f08080', // Coral claro se ve bien en ambos modos
    },
});

export default SaldoPanel;
