export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category: string | null;
  date: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'date'>;
