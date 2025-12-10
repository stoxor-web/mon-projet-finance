import React, { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc 
} from "firebase/firestore";
import { 
  Wallet, BarChart3, PlusCircle, Target, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Trash2, LogOut, User as UserIcon, 
  Calendar, Filter, AlertCircle, Moon, Sun, Mail, Lock, Repeat, Workflow,
  Github, Twitter, Linkedin, Instagram
} from 'lucide-react';

// --- 1. CONFIGURATION & SERVICES ---
const firebaseConfig = {
  apiKey: "AIzaSyAAKdOZCiJ9uGqmgmdoqp_-IioTScFsU0I",
  authDomain: "financeflowbystoxor.firebaseapp.com",
  projectId: "financeflowbystoxor",
  storageBucket: "financeflowbystoxor.firebasestorage.app",
  messagingSenderId: "43977997722",
  appId: "1:43977997722:web:d055af7410b66567538e23"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- 2. TYPES & UTILS ---
type TransactionType = 'income' | 'expense';
type CategoryType = 'needs' | 'wants' | 'savings' | 'salary';

interface Transaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  category: CategoryType;
}

interface RecurringItem {
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

const categoryLabels: Record<string, string> = {
  needs: 'Besoins',
  wants: 'Envies',
  savings: 'Épargne',
  salary: 'Salaire'
};

const getDisplayCategory = (type: TransactionType, category: string) => {
  if (type === 'income') return 'Revenu';
  return categoryLabels[category] || category;
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

// --- 3. COMPOSANTS UI ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

const Footer = () => (
  <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 mt-12 transition-colors duration-300">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Produit</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">Fonctionnalités</span></li>
            <li><span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">Tarifs</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Légal</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">Confidentialité</span></li>
            <li><span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">CGU</span></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">STOXOR</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Gestion financière intelligente.</p>
          <div className="flex gap-4">
            <Github className="w-5 h-5 text-slate-400 hover:text-blue-600 cursor-pointer" />
            <Twitter className="w-5 h-5 text-slate-400 hover:text-blue-600 cursor-pointer" />
            <Linkedin className="w-5 h-5 text-slate-400 hover:text-blue-600 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-700 pt-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Finance Flow by STOXOR. Fait avec ❤️ à Paris.
      </div>
    </div>
  </footer>
);

// --- 4. COMPOSANT LOGIN ---
const LoginScreen = ({ onGoogle, onGuest }: { onGoogle: () => void, onGuest: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') setError("Email invalide.");
      else if (err.code === 'auth/invalid-credential') setError("Identifiants incorrects.");
      else if (err.code === 'auth/weak-password') setError("Mot de passe trop court.");
      else setError("Erreur de connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="text-center mb-8">
        <div className="bg-blue-600 p-3 rounded-xl w-fit mx-auto mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Finance Flow by STOXOR</h1>
      </div>
      
      <Card className="p-8 max-w-sm w-full space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isSignUp ? "Créer un compte" : "Bienvenue"}</h2>
          <p className="text-sm text-slate-400">Identifiez-vous pour continuer</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {error && <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
          <div className="space-y-3">
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input type="email" placeholder="Email" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input type="password" placeholder="Mot de passe" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">{isSignUp ? "S'inscrire" : "Se connecter"}</button>
        </form>

        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-800 px-2 text-slate-400">Ou continuer avec</span></div></div>

        <div className="space-y-3">
          <button onClick={onGoogle} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
             Google
          </button>
          <button onClick={onGuest} className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
            <UserIcon className="w-4 h-4" /> Mode Invité
          </button>
        </div>
        <div className="text-center mt-4"><button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{isSignUp ? "J'ai déjà un compte" : "Pas de compte ? S'inscrire"}</button></div>
      </Card>
      
      <div className="mt-12 w-full max-w-sm text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Finance Flow by STOXOR</p>
      </div>
    </div>
  );
};

// --- 5. SOUS-COMPOSANTS DES VUES ---

// Vue: TABLEAU DE BORD
const DashboardView = ({ stats, balance, pieData, filterLabel, isDarkMode, pendingRecurringCount, onGenerateRecurring }: any) => (
  <div className="space-y-6">
    {pendingRecurringCount > 0 && (
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300"><Repeat className="w-5 h-5"/></div>
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Opérations automatiques</h4>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">Vous avez {pendingRecurringCount} opérations en attente.</p>
          </div>
        </div>
        <button onClick={onGenerateRecurring} className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors">Générer</button>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 !bg-blue-600 !dark:bg-blue-700 text-white border-none">
        <p className="text-blue-100 text-sm">Solde ({filterLabel})</p>
        <h3 className="text-3xl font-bold mt-1">{formatCurrency(balance)}</h3>
      </Card>
      <Card className="p-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Revenus</p>
        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(stats.totalIncome)}</h3>
      </Card>
      <Card className="p-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Dépenses</p>
        <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(stats.totalExpenses)}</h3>
      </Card>
    </div>
    
    <Card className="p-6 flex flex-col md:flex-row items-center justify-around gap-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            {pieData.reduce((acc: any, item: any, i: number) => {
              const total = stats.totalIncome || 1; const val = item.value; const angle = (val / total) * 360;
              const x1 = 50 + 50 * Math.cos(Math.PI * acc.currentAngle / 180); const y1 = 50 + 50 * Math.sin(Math.PI * acc.currentAngle / 180);
              const x2 = 50 + 50 * Math.cos(Math.PI * (acc.currentAngle + angle) / 180); const y2 = 50 + 50 * Math.sin(Math.PI * (acc.currentAngle + angle) / 180);
              const d = `M50,50 L${x1},${y1} A50,50 0 ${angle > 180 ? 1 : 0},1 ${x2},${y2} Z`;
              if (val > 0) acc.elements.push(<path key={i} d={d} fill={item.color} />);
              acc.currentAngle += angle;
              return acc;
            }, { currentAngle: 0, elements: [] }).elements}
            <circle cx="50" cy="50" r="30" fill={isDarkMode ? "#1e293b" : "white"} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-xs text-slate-400">Dépenses</span>
            <span className="font-bold dark:text-white">{formatCurrency(stats.totalExpenses)}</span>
          </div>
        </div>
        <div className="space-y-3 w-full md:w-auto">
          {pieData.map((d: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-8 text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div><span className="dark:text-slate-300">{d.name}</span></div>
              <span className="font-bold dark:text-white">{formatCurrency(d.value)}</span>
            </div>
          ))}
        </div>
    </Card>
  </div>
);

// Vue: TRANSACTIONS
const TransactionsView = ({ transactions, onAdd, onDelete, filterLabel }: any) => {
  const [formData, setFormData] = useState({ label: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'expense' as TransactionType, category: 'needs' as CategoryType });
  const handleSubmit = (e: React.FormEvent) => { onAdd(e, formData); setFormData({ ...formData, label: '', amount: '' }); };

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
            <input type="text" placeholder="Libellé" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
            <input type="number" placeholder="Montant" required step="0.01" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
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
          {transactions.map((t: Transaction) => (
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
                <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Calendar className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune transaction trouvée.</p></div>}
        </div>
      </Card>
    </div>
  );
};

// Vue: RÉCURRENT
const RecurringView = ({ items, onAdd, onDelete }: any) => {
  const [form, setForm] = useState({ label: '', amount: '', type: 'expense', category: 'needs', durationMonths: 0 });
  const handleSubmit = (e: React.FormEvent) => { onAdd(e, form); setForm({ ...form, label: '', amount: '', durationMonths: 0 }); };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="p-6 h-fit">
        <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><Repeat className="w-5 h-5"/> Programmer une récurrence</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button type="button" key={t} onClick={() => setForm({...form, type: t})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.type === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400') : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t === 'income' ? 'Revenu' : 'Dépense'}</button>
              ))}
            </div>
            <input type="text" placeholder="Libellé" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={form.label} onChange={e => setForm({...form, label: e.target.value})} />
            <input type="number" placeholder="Montant Mensuel" required step="0.01" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Durée (Mois) - Vide pour illimité</label>
              <input type="number" placeholder="ex: 24" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white" value={form.durationMonths === 0 ? '' : form.durationMonths} onChange={e => setForm({...form, durationMonths: parseInt(e.target.value) || 0})} />
            </div>
            {form.type === 'expense' && (
              <select className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
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
          {items.map((item: RecurringItem) => (
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
                <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Arrêter"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Repeat className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune récurrence active.</p></div>}
        </div>
      </Card>
    </div>
  );
};

// Vue: ANALYSE
const AnalysisView = ({ stats, pieData, filterLabel }: any) => (
  <div className="space-y-6">
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Analyse 50/30/20</h3>
        <span className="text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{filterLabel}</span>
      </div>
      <div className="space-y-6">
        {pieData.map((cat: any, i: number) => {
          const totalIncome = stats.totalIncome || 1; const targetAmount = totalIncome * cat.target;
          const percent = totalIncome > 0 ? (cat.value / totalIncome) * 100 : 0; const isOver = cat.value > targetAmount;
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1"><span className="font-medium dark:text-slate-200">{cat.name}</span><span className={isOver ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-600 dark:text-slate-400"}>{formatCurrency(cat.value)} / {formatCurrency(targetAmount)}</span></div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10" style={{left: `${cat.target * 100}%`}}></div>
                <div className="h-full rounded-full transition-all duration-500" style={{width: `${Math.min(percent, 100)}%`, backgroundColor: cat.color}}></div>
              </div>
              {isOver ? <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Budget dépassé de {formatCurrency(cat.value - targetAmount)}</p> : <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{percent.toFixed(1)}% des revenus (Cible : {cat.target * 100}%)</p>}
            </div>
          )
        })}
      </div>
    </Card>
  </div>
);

// Vue: FLUX (SANKEY)
const FlowView = ({ transactions, filterLabel, isDarkMode }: any) => {
  const prepareSankeyData = () => {
    const data: any[] = [["De", "À", "Montant"]];
    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
    if (totalIncome === 0) return null;
    const expensesByCat = transactions.filter((t: any) => t.type === 'expense').reduce((acc: any, t: any) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, { needs: 0, wants: 0, savings: 0 });
    if (expensesByCat.needs > 0) data.push(["Revenus", "Besoins (50%)", expensesByCat.needs]);
    if (expensesByCat.wants > 0) data.push(["Revenus", "Envies (30%)", expensesByCat.wants]);
    if (expensesByCat.savings > 0) data.push(["Revenus", "Épargne (20%)", expensesByCat.savings]);
    const remaining = totalIncome - (expensesByCat.needs + expensesByCat.wants + expensesByCat.savings);
    if (remaining > 0) data.push(["Revenus", "Solde Restant", remaining]);
    const expensesByLabelAndCat = transactions.filter((t: any) => t.type === 'expense').reduce((acc: any, t: any) => { const key = `${t.category}-${t.label}`; if (!acc[key
