import React, { useState } from 'react';
import { 
  Wallet, 
  BarChart3, 
  PlusCircle, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Trash2,
  DollarSign
} from 'lucide-react';

import { Card } from './components/Layout/Card';
import { SimplePieChart } from './components/Charts/SimplePieChart';
import { useFinance } from './hooks/useFinance';
import { formatCurrency } from './utils/format';
import { CategoryType, TransactionType } from './types';

// Petit composant interne pour les icônes de catégorie
const CategoryIcon = ({ category }: { category: string }) => {
  if (category === 'needs') return <Wallet className="w-5 h-5" />;
  if (category === 'wants') return <TrendingUp className="w-5 h-5" />;
  if (category === 'savings') return <Target className="w-5 h-5" />;
  return <DollarSign className="w-5 h-5" />;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { transactions, addTransaction, deleteTransaction, stats } = useFinance();

  // État du formulaire
  const [formData, setFormData] = useState({
    label: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType,
    category: 'needs' as CategoryType
  });

  // Gestionnaire de soumission du formulaire
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.amount) return;

    addTransaction({
      label: formData.label,
      amount: parseFloat(formData.amount),
      date: formData.date,
      type: formData.type,
      category: formData.category
    });

    // Reset partiel du formulaire
    setFormData({ ...formData, label: '', amount: '' });
  };

  // Données préparées pour le graphique
  const pieData = [
    { name: 'Besoins (50%)', value: stats.expensesByCategory.needs, color: '#3b82f6', target: 0.5 },
    { name: 'Envies (30%)', value: stats.expensesByCategory.wants, color: '#a855f7', target: 0.3 },
    { name: 'Épargne (20%)', value: stats.expensesByCategory.savings, color: '#22c55e', target: 0.2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              FinanceFlow
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Méthode 50/30/20
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* NAVIGATION */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
            { id: 'transactions', icon: PlusCircle, label: 'Transactions' },
            { id: 'analysis', icon: Target, label: 'Analyse 50/30/20' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- VUE 1 : DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Solde Actuel</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(stats.balance)}</h3>
                  </div>
                  <Wallet className="w-8 h-8 text-blue-200 opacity-50" />
                </div>
                <div className="text-blue-100 text-xs">Net après dépenses</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Revenus Totaux</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalIncome)}</h3>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Dépenses Totales</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalExpenses)}</h3>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Graphique */}
              <Card className="p-6 lg:col-span-1">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Répartition</h3>
                <SimplePieChart data={pieData} />
                <div className="mt-6 space-y-3">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Transactions récentes */}
              <Card className="p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Activités Récentes</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-blue-600 text-sm hover:underline font-medium">Voir tout</button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{t.label}</p>
                          <p className="text-xs text-slate-400">{t.date} • <span className="capitalize">{t.category === 'needs' ? 'Besoin' : t.category === 'wants' ? 'Envie' : t.category === 'savings' ? 'Épargne' : 'Salaire'}</span></p>
                        </div>
                      </div>
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <p>Aucune transaction pour le moment.</p>
                      <button onClick={() => setActiveTab('transactions')} className="text-blue-600 text-sm mt-2 font-medium">Commencer</button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- VUE 2 : TRANSACTIONS --- */}
        {activeTab === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulaire Ajout */}
            <Card className="p-6 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Nouvelle Opération
              </h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
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

                {/* Catégorie (seulement pour dépenses) */}
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
            </Card>

            {/* Liste complète */}
            <Card className="p-0 lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
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
                        onClick={() => deleteTransaction(t.id)}
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
            </Card>
          </div>
        )}

        {/* --- VUE 3 : ANALYSE --- */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800">Analyse de Budget</h3>
                <p className="text-slate-500 text-sm mt-1">Objectifs basés sur vos revenus ({formatCurrency(stats.totalIncome)})</p>
              </div>

              <div className="space-y-8">
                {pieData.map((category, idx) => {
                  const idealAmount = stats.totalIncome * category.target;
                  const percentage = stats.totalIncome > 0 ? (category.value / stats.totalIncome) * 100 : 0;
                  const isOverBudget = category.value > idealAmount;

                  return (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-white shadow-sm`} style={{ backgroundColor: category.color }}>
                             <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-base">{category.name}</span>
                            <span className="text-xs text-slate-500">Cible recommandée : {formatCurrency(idealAmount)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                            {formatCurrency(category.value)}
                          </span>
                          <span className="text-xs text-slate-500 block font-medium">{percentage.toFixed(1)}% des revenus</span>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative mt-3">
                        {/* Marqueur de l'objectif (petite ligne noire) */}
                        <div 
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10 opacity-30" 
                          style={{ left: `${category.target * 100}%` }}
                        ></div>
                        
                        {/* Barre remplie */}
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${isOverBudget ? 'opacity-90' : ''}`}
                          style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: category.color
                          }}
                        ></div>
                      </div>
                      
                      {/* Message d'alerte */}
                      {isOverBudget && (
                        <p className="text-xs text-rose-600 mt-2 flex items-center gap-1 font-medium bg-rose-50 p-2 rounded-lg inline-block">
                          <TrendingUp className="w-3 h-3" />
                          Attention : Dépassement de {formatCurrency(category.value - idealAmount)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2 text-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500"></div> Besoins (50%)
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">Charges fixes indispensables : Loyer, électricité, nourriture, assurances, transport pour le travail.</p>
              </div>
              <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-900 mb-2 text-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-purple-500"></div> Envies (30%)
                </h4>
                <p className="text-xs text-purple-700 leading-relaxed">Loisirs et confort : Restaurants, shopping, abonnements (Netflix), sorties, vacances.</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-2 text-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Épargne (20%)
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">Investissement futur : Épargne de précaution, remboursement de dettes, investissement.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
