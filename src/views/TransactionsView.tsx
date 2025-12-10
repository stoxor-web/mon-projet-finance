import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Transaction, TransactionType, CategoryType } from '../types';
import { formatCurrency, getDisplayCategory } from '../utils';
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  onAdd: (e: React.FormEvent, data: any) => void;
  onDelete: (id: string, collection: string) => void;
  filterLabel: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onAdd, onDelete, filterLabel }) => {
  const [formData, setFormData] = useState({
    label: '', amount: '', date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType, category: 'needs' as CategoryType
  });

  const handleSubmit = (e: React.FormEvent) => {
    onAdd(e, formData);
    setFormData({ ...formData, label: '', amount: '' });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-6 h-fit sticky top-24">
        <h3 className="font-bold mb-4 dark:text-white">Nouvelle Opération</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button type="button" key={t} onClick={() => setFormData({...formData, type: t as any})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.type === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400') : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t === 'income' ? 'Revenu' : 'Dépense'}</button>
              ))}
            </div>
            <input type="text" placeholder="Libellé" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
            <input type="number" placeholder="Montant" required step="0.01" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            <input type="date" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white dark:scheme-dark" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            {formData.type === 'expense' && (
              <select className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                <option value="needs">Besoins (50%)</option><option value="wants">Envies (30%)</option><option value="savings">Épargne (20%)</option>
              </select>
            )}
            <button className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors">Ajouter</button>
        </form>
      </Card>

      <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 font-bold flex justify-between items-center dark:text-white">
          <span>Historique ({filterLabel})</span>
          <span className="text-xs bg-white dark:bg-slate-600 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{transactions.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {transactions.map(t => (
            <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{t.label}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 capitalize">{t.date} • {getDisplayCategory(t.type, t.category)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                <button onClick={() => onDelete(t.id, 'transactions')} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Calendar className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune transaction trouvée.</p></div>}
        </div>
      </Card>
    </div>
  );
};
