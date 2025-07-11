export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category: string | null;
  date: string; // ISO String
}

// Omite el 'id' para crear nuevas transacciones, ya que lo genera Firestore.
export type NewTransaction = Omit<Transaction, 'id'>;

// --- TIPO DE RECORDATORIO ACTUALIZADO ---
export interface Reminder {
  id: string;
  name: string; // ej. "Pago de Luz"
  type: 'ingreso' | 'gasto';
  category: string | null; // Solo si es de tipo 'gasto'
  dayOfMonth: number; // El día del mes para el recordatorio (1-31)
  completedMonths?: string[]; // Array para guardar meses completados, ej: ["2025-06", "2025-07"]
}

export type NewReminder = Omit<Reminder, 'id'>;
