import React from 'react';
import { Wallet, TrendingUp, Target, DollarSign, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/format';

// Petit composant interne pour les icônes
const CategoryIcon = ({ category }: { category: string }) => {
  if (category === 'needs') return <Wallet className="w-5 h-5" />;
  if (category === 'wants') return <TrendingUp className="w-5 h-5" />;
  if (category === 'savings') return <Target className="w-5 h-5" />;
  return <DollarSign className="w-5 h-5" />;
};

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, onDelete }) => {
  return (
    <div className="flex flex-col h-[500px]">
       <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
         <h3 className="font-bold text-slate-800">Historique des opérations</h3>
         <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full">{transactions.length}</span>
       </div>
       <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
         {transactions.map(t => (
           <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                 {t.type === 'income' ? <DollarSign className="w-5 h-5" /> : <CategoryIcon category={t.category} />}
               </div>
               <div>
                 <p className="font-medium text-slate-800">{t.label}</p>
                 <div className="flex gap-2 text-xs text-slate-400">
                    <span>{t.date}</span>
                    <span>•</span>
                    <span className="capitalize">{t.category === 'needs' ? 'Besoin' : t.category === 'wants' ? 'Envie' : t.category === 'savings' ? 'Épargne' : 'Revenu'}</span>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                 {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
               </span>
               <button 
                onClick={() => onDelete(t.id)}
                className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
                title="Supprimer"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
           </div>
         ))}
         {transactions.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-slate-400">
             <p>Aucune donnée.</p>
           </div>
         )}
       </div>
    </div>
  );
};
