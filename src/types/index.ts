export type TransactionType = 'income' | 'expense';
export type CategoryType = 'needs' | 'wants' | 'savings' | 'salary';

export interface Transaction {
  id: number;
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: {
    needs: number;
    wants: number;
    savings: number;
  };
}
