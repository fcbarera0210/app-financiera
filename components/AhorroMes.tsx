import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface AhorroMesProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
}

const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
};

const AhorroMes: React.FC<AhorroMesProps> = ({ monthlyIncome, monthlyExpenses, savingsGoal }) => {
  const { colors } = useTheme();

  // No mostrar el panel si el usuario no ha establecido una meta de ahorro.
  if (!savingsGoal || savingsGoal <= 0) {
    return null; 
  }

  const ahorroActual = monthlyIncome - monthlyExpenses;
  let progressPercent = 0;
  if (savingsGoal > 0) {
    progressPercent = Math.max(0, (ahorroActual / savingsGoal) * 100);
  }

  // Lógica para determinar el color y el mensaje de estado
  let progressBarColor = colors.destructive;
  let statusText = '¡Cuidado! Estás gastando más de lo planeado.';

  if (progressPercent >= 100) {
    progressBarColor = '#10B981'; // Verde éxito
    statusText = '¡Felicidades! Has cumplido tu meta de ahorro.';
  } else if (progressPercent >= 60) {
    progressBarColor = '#F59E0B'; // Naranjo advertencia
    statusText = '¡Vas por buen camino! Sigue así.';
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Meta de Ahorro Mensual</Text>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Ahorrado</Text>
          <Text style={[styles.amount, { color: colors.text }]}>{formatCurrency(ahorroActual)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Meta</Text>
          <Text style={[styles.amount, { color: colors.textSecondary }]}>{formatCurrency(savingsGoal)}</Text>
        </View>
        
        <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.progressBar, { width: `${Math.min(100, progressPercent)}%`, backgroundColor: progressBarColor }]} />
        </View>
        
        <Text style={[styles.statusText, { color: progressBarColor }]}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
  },
});

export default AhorroMes;
