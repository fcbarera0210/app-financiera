import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from '../types';

// --- Iconos ---
const CheckIcon = ({ color }: { color: string }) => (
    <Svg height="20" width="20" viewBox="0 0 20 20" fill={color}>
        <Path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </Svg>
);

interface RecordatoriosPanelProps {
  reminders: Reminder[];
  displayDate: Date;
  onTogglePress: (reminderId: string) => void; // <-- Prop modificada
  loadingReminder: string | null;
}

const RecordatoriosPanel: React.FC<RecordatoriosPanelProps> = ({ reminders, displayDate, onTogglePress, loadingReminder }) => {
  const { colors } = useTheme();

  const pendingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthYear = `${displayDate.getFullYear()}-${String(displayDate.getMonth() + 1).padStart(2, '0')}`;

    return reminders
      .map(reminder => {
        const isCompleted = reminder.completedMonths?.includes(monthYear) || false;
        const reminderDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), reminder.dayOfMonth);
        const diffTime = reminderDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: 'overdue' | 'warning' | 'pending' = 'pending';
        if (!isCompleted && diffDays < 0) status = 'overdue';
        else if (!isCompleted && diffDays <= 5) status = 'warning';

        return { ...reminder, isCompleted, status };
      })
      .filter(r => !r.isCompleted);
  }, [reminders, displayDate]);

  if (pendingReminders.length === 0) {
    return null;
  }

  const getStatusColor = (status: 'overdue' | 'warning' | 'pending') => {
      if (status === 'overdue') return colors.destructive;
      if (status === 'warning') return '#F59E0B';
      return colors.textSecondary;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Recordatorios Pendientes</Text>
      {pendingReminders.map(reminder => {
          const color = getStatusColor(reminder.status);
          return (
            <View key={reminder.id} style={[styles.reminderItem, { borderLeftColor: color }]}>
                <View style={styles.infoContainer}>
                    <Text style={[styles.reminderName, { color: colors.text }]}>{reminder.name}</Text>
                    <Text style={[styles.reminderDetails, { color: colors.textSecondary }]}>Vence el día {reminder.dayOfMonth}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.checkButton, { borderColor: color }]} 
                    onPress={() => onTogglePress(reminder.id)} // <-- Llama a la nueva función
                    disabled={loadingReminder === reminder.id}
                >
                    {loadingReminder === reminder.id ? <ActivityIndicator size="small" color={color} /> : <CheckIcon color={color} />}
                </TouchableOpacity>
            </View>
          )
      })}
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
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 15,
    borderLeftWidth: 4,
    marginBottom: 10,
  },
  infoContainer: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderDetails: {
    fontSize: 14,
    marginTop: 2,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  }
});

export default RecordatoriosPanel;
