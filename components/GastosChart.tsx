import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Transaction } from '../types';
import CustomPieChart from './CustomPieChart';

interface GastosChartProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) amount = 0;
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(amount);
};

const GastosChart: React.FC<GastosChartProps> = ({ transactions }) => {
  const { colors } = useTheme();
  const [selectedSliceIndex, setSelectedSliceIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const gastos = transactions.filter(t => t.type === 'gasto' && t.category);
    
    if (gastos.length === 0) {
      return { data: [], legend: [] };
    }

    const gastosPorCategoria = gastos.reduce((acc, t) => {
      const key = t.category!;
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {} as { [key: string]: number });

    const totalGastos = Object.values(gastosPorCategoria).reduce((sum, val) => sum + val, 0);
    
    const palette = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

    const legend = Object.entries(gastosPorCategoria)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount], index) => ({
        category,
        amount,
        color: palette[index % palette.length],
        percent: totalGastos > 0 ? (amount / totalGastos) * 100 : 0,
      }));
    
    const dataForChart = legend.map(item => ({
        value: item.amount,
        color: item.color
    }));

    return { data: dataForChart, legend };
  }, [transactions]);

  const handleSlicePress = (index: number) => {
    setSelectedSliceIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const selectedData = selectedSliceIndex !== null ? chartData.legend[selectedSliceIndex] : null;

  if (chartData.data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Análisis de Gastos del Mes</Text>
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay gastos este mes para mostrar en el gráfico.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Análisis de Gastos del Mes</Text>
      <View style={styles.chartRow}>
        <TouchableOpacity style={styles.chartContainer} onPress={() => setSelectedSliceIndex(null)} activeOpacity={1}>
          <CustomPieChart
            data={chartData.data}
            size={140}
            strokeWidth={22}
            onSlicePress={handleSlicePress}
            selectedSliceIndex={selectedSliceIndex}
          />
          <View style={styles.chartCenterInfo}>
            {selectedData ? (
                <>
                    <Text style={[styles.centerCategory, { color: selectedData.color }]} numberOfLines={1} ellipsizeMode="tail">{selectedData.category}</Text>
                    <Text style={[styles.centerAmount, { color: colors.text }]}>{formatCurrency(selectedData.amount)}</Text>
                </>
            ) : (
                <Text style={[styles.centerTotalLabel, { color: colors.textSecondary }]}>Total Gastos</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.legendContainer}>
          {chartData.legend.map((item, index) => {
            // --- CORRECCIÓN DE LÓGICA AQUÍ ---
            const isSelected = selectedSliceIndex === index;
            const isAnySelected = selectedSliceIndex !== null;
            const legendColor = isAnySelected && !isSelected ? '#d1d5db' : item.color;
            const textColor = isAnySelected && !isSelected ? colors.textSecondary : colors.text;

            return (
              <TouchableOpacity key={item.category} style={styles.legendItem} onPress={() => handleSlicePress(index)}>
                <View style={[styles.legendDot, { backgroundColor: legendColor }]} />
                <Text style={[styles.legendText, { color: textColor }]} numberOfLines={1}>{item.category}</Text>
                <Text style={[styles.legendPercent, { color: textColor }]}>{item.percent.toFixed(1)}%</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  chartContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartCenterInfo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
  },
  centerCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerAmount: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  centerTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  legendContainer: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GastosChart;
