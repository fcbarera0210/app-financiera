export interface Account {
  id: string;
  name: string;
  balance: number;
  color?: string; // <-- CAMPO AÑADIDO (opcional por ahora)
  type?: 'Efectivo' | 'Tarjeta' | 'Ahorros'; // <-- CAMPO AÑADIDO (opcional por ahora)
}

export type NewAccount = Omit<Account, 'id' | 'balance'> & {
  initialBalance: number;
};

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category: string | null;
  date: string; // ISO String
}

export type NewTransaction = Omit<Transaction, 'id'>;

export interface Reminder {
  id: string;
  accountId: string;
  name: string;
  type: 'ingreso' | 'gasto';
  category: string | null;
  dayOfMonth: number;
  completedMonths?: string[];
}

export type NewReminder = Omit<Reminder, 'id'>;