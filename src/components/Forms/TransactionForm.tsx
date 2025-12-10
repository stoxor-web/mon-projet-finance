import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Transaction, TransactionType, CategoryType } from '../../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType,
    category: 'needs' as CategoryType
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.amount) return;

    onAdd({
      label: formData.label,
      amount: parseFloat(formData.amount),
      date: formData.date,
      type: formData.type,
      category: formData.category
    });

    setFormData(prev => ({ ...prev, label: '', amount: '' }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        Nouvelle Opération
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélecteur Type */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Type de transaction</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'expense'})}
              className={`py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              Dépense
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, type: 'income'})}
              className={`py-2 text-sm font-medium rounded-md transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              Revenu
            </button>
          </div>
        </div>

        {/* Champs Texte */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Libellé</label>
          <input
            type="text"
            required
            placeholder={formData.type === 'income' ? "Ex: Salaire, Vente..." : "Ex: Loyer, Courses..."}
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            value={formData.label}
            onChange={e => setFormData({...formData, label: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Montant (€)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        {/* Catégorie */}
        {formData.type === 'expense' && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie (Méthode 50/30/20)</label>
            <select
              className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white transition-all cursor-pointer"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as CategoryType})}
            >
              <option value="needs">Besoins (50%) - Nécessaire</option>
              <option value="wants">Envies (30%) - Loisirs</option>
              <option value="savings">Épargne (20%) - Futur</option>
            </select>
          </div>
        )}

        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95">
          <PlusCircle className="w-4 h-4" />
          Ajouter la transaction
        </button>
      </form>
    </div>
  );
};
