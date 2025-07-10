export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  category: string | null;
  date: string; // ISO String
}

// NewTransaction ahora incluye la fecha, porque la provee el cliente.
// Solo se omite el 'id', que lo genera Firestore.
export type NewTransaction = Omit<Transaction, 'id'>;
