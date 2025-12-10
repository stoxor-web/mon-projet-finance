import React, { useState } from 'react';
import { Card } from '../components/Card';
import { RecurringItem, TransactionType, CategoryType } from '../types';
import { formatCurrency } from '../utils';
import { Repeat, Trash2 } from 'lucide-react';

interface RecurringViewProps {
  items: RecurringItem[];
  onAdd: (e: React.FormEvent, data: any) => void;
  onDelete: (id: string, collection: string) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({ items, onAdd, onDelete }) => {
  const [recurringForm, setRecurringForm] = useState({
    label: '', amount: '', type: 'expense' as TransactionType, category: 'needs' as CategoryType, durationMonths: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    onAdd(e, recurringForm);
    setRecurringForm({ ...recurringForm, label: '', amount: '', durationMonths: 0 });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-6 h-fit">
        <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><Repeat className="w-5 h-5"/> Programmer une récurrence</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button type="button" key={t} onClick={() => setRecurringForm({...recurringForm, type: t as any})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${recurringForm.type === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400') : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t === 'income' ? 'Revenu' : 'Dépense'}</button>
              ))}
            </div>
            <input type="text" placeholder="Libellé" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.label} onChange={e => setRecurringForm({...recurringForm, label: e.target.value})} />
            <input type="number" placeholder="Montant Mensuel" required step="0.01" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.amount} onChange={e => setRecurringForm({...recurringForm, amount: e.target.value})} />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Durée (Mois) - Vide pour illimité</label>
              <input type="number" placeholder="ex: 24" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.durationMonths === 0 ? '' : recurringForm.durationMonths} onChange={e => setRecurringForm({...recurringForm, durationMonths: parseInt(e.target.value) || 0})} />
            </div>
            {recurringForm.type === 'expense' && (
              <select className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={recurringForm.category} onChange={e => setRecurringForm({...recurringForm, category: e.target.value as any})}>
                <option value="needs">Besoins (50%)</option><option value="wants">Envies (30%)</option><option value="savings">Épargne (20%)</option>
              </select>
            )}
            <button className="w-full bg-slate-900 dark:bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors">Programmer</button>
        </form>
      </Card>
      <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 font-bold flex justify-between items-center dark:text-white">
          <span>Abonnements & Virements auto</span>
          <span className="text-xs bg-white dark:bg-slate-600 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{items.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}><Repeat className="w-4 h-4" /></div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{item.label}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 capitalize">{item.durationMonths === 0 ? "Illimité" : `${item.durationMonths} Mois restants`} • {item.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-bold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>{formatCurrency(item.amount)}/mois</span>
                <button onClick={() => onDelete(item.id, 'recurring')} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Arrêter"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Repeat className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune récurrence active.</p></div>}
        </div>
      </Card>
    </div>
  );
};
