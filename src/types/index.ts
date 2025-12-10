export type TransactionType = 'income' | 'expense';
export type CategoryType = 'needs' | 'wants' | 'savings' | 'salary';

export interface Transaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
}

export interface RecurringItem {
  id: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
  frequency: 'monthly';
  startDate: string;
  durationMonths: number;
  lastGenerated: string;
}
