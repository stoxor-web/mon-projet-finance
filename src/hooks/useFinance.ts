import { useState, useEffect, useMemo } from 'react';
import { Transaction, FinanceStats } from '../types';

export const useFinance = () => {
  // Chargement initial
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Actions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Calculs (Statistiques)
  const stats: FinanceStats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        // @ts-ignore (si tu n'as pas défini toutes les clés initiales)
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, { needs: 0, wants: 0, savings: 0 });

    return { 
      totalIncome, 
      totalExpenses, 
      balance: totalIncome - totalExpenses, 
      expensesByCategory 
    };
  }, [transactions]);

  return { transactions, addTransaction, deleteTransaction, stats };
};
