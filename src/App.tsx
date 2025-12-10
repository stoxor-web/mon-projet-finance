import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously, 
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
  orderBy 
} from "firebase/firestore";
import { 
  Wallet, BarChart3, PlusCircle, Target, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Trash2, LogOut, User as UserIcon, Calendar, Filter, AlertCircle
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
  const firebaseConfig = {
    apiKey: "AIzaSyCy5hc12pARoVFOxuFHBeQaWxSfQKbSkq0",
    authDomain: "financeflow-11a6a.firebaseapp.com",
    projectId: "financeflow-11a6a",
    storageBucket: "financeflow-11a6a.firebasestorage.app",
    messagingSenderId: "840695020676",
    appId: "1:840695020676:web:ff3c57720b44cd5ea916d1"
  };

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- TYPES & UTILS ---
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

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// --- ECRAN DE CONNEXION ---
const LoginScreen = ({ onGoogle, onGuest }: { onGoogle: () => void, onGuest: () => void }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div className="text-center mb-8">
      <div className="bg-blue-600 p-3 rounded-xl w-fit mx-auto mb-4 shadow-lg shadow-blue-200">
        <Wallet className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Finance Flow by STOXOR</h1>
      <p className="text-slate-500">Gérez vos finances avec l'outil développé par STOXOR</p>
    </div>
    
    <Card className="p-8 max-w-sm w-full text-center space-y-4">
      <div className="space-y-2 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Bienvenue</h2>
        <p className="text-sm text-slate-400">Choisissez une méthode de connexion</p>
        <p className="text-sm text-slate-400">Le mode invité ne sauvegarde pas les données</p>
        <p className="text-sm text-slate-400">La connexion google sauvegarde vos données</p>
      </div>

      <button 
        onClick={onGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </button>

      <button 
        onClick={onGuest}
        className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-lg transition-all"
      >
        <UserIcon className="w-5 h-5" />
        Continuer en Invité
      </button>
    </Card>
    <p className="mt-8 text-xs text-slate-400">Vos données sont privées et sécurisées.</p>
  </div>
);

// --- APP PRINCIPALE ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Pour afficher les erreurs de base de données
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // --- NOUVEAUX ÉTATS POUR LE FILTRE ---
  const [filterType, setFilterType] = useState<'month' | 'year' | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // "YYYY-MM"
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString()); // "YYYY"

  const [formData, setFormData] = useState({
    label: '', amount: '', date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType, category: 'needs' as CategoryType
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTransactions([]); 
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "transactions"), 
      orderBy("date", "desc")
    );

    // Ajout d'un gestionnaire d'erreur ici
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      setTransactions(docs);
      setErrorMsg(null); // Tout va bien
    }, (error) => {
      console.error("Erreur Firestore:", error);
      setErrorMsg("Impossible d'accéder à la base de données. Vérifiez les 'Règles' dans la console Firebase.");
    });
    
    return () => unsubscribe();
  }, [user]);

  // Actions
  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error(error); }
  };
  const handleGuestLogin = async () => {
    try { await signInAnonymously(auth); } catch (error) { console.error(error); }
  };
  const handleLogout = () => signOut(auth);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.label || !formData.amount) return;

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        label: formData.label,
        amount: parseFloat(formData.amount),
        date: formData.date,
        type: formData.type,
        category: formData.category,
        createdAt: new Date()
      });
      setFormData({ ...formData, label: '', amount: '' });
      if (window.innerWidth < 768) setActiveTab('transactions');
    } catch (err) {
      console.error("Erreur ajout:", err);
      alert("Erreur d'écriture. Vérifiez vos droits d'accès sur Firebase.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Supprimer ?")) {
      await deleteDoc(doc(db, "users", user.uid, "transactions", id));
    }
  };

  // --- LOGIQUE DE FILTRAGE AVANCÉE ---
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'year') return t.date.startsWith(currentYear);
    return t.date.startsWith(currentMonth);
  });

  // Calculs sur la base filtrée
  const stats = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'income') acc.totalIncome += t.amount;
    else {
      acc.totalExpenses += t.amount;
      // @ts-ignore
      acc.expensesByCategory[t.category] = (acc.expensesByCategory[t.category] || 0) + t.amount;
    }
    return acc;
  }, { totalIncome: 0, totalExpenses: 0, expensesByCategory: { needs: 0, wants: 0, savings: 0 } });

  const balance = stats.totalIncome - stats.totalExpenses;
  const pieData = [
    { name: 'Besoins (50%)', value: stats.expensesByCategory.needs || 0, color: '#3b82f6', target: 0.5 },
    { name: 'Envies (30%)', value: stats.expensesByCategory.wants || 0, color: '#a855f7', target: 0.3 },
    { name: 'Épargne (20%)', value: stats.expensesByCategory.savings || 0, color: '#22c55e', target: 0.2 },
  ];

  const getFilterLabel = () => {
    if (filterType === 'all') return "Global";
    if (filterType === 'year') return currentYear;
    return currentMonth;
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;
  if (!user) return <LoginScreen onGoogle={handleGoogleLogin} onGuest={handleGuestLogin} />;

  const displayName = user.isAnonymous ? "Invité" : (user.displayName?.split(' ')[0] || "Utilisateur");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">
                  Finance Flow
                </h1>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  {user.isAnonymous && <UserIcon className="w-3 h-3" />}
                  Bonjour, {displayName}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="md:hidden p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* BARRE DE FILTRE UNIFIÉE */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            
            {/* Choix du mode */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent border-none outline-none text-slate-700 font-bold text-sm cursor-pointer"
            >
              <option value="month">Mois</option>
              <option value="year">Année</option>
              <option value="all">Tout</option>
            </select>

            {/* Input dynamique selon le mode */}
            {filterType === 'month' && (
              <>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <input 
                  type="month" 
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 font-medium text-sm w-full md:w-auto cursor-pointer"
                />
              </>
            )}

            {filterType === 'year' && (
              <>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                <input 
                  type="number" 
                  min="2020" max="2030"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 font-medium text-sm w-16 cursor-pointer"
                />
              </>
            )}
          </div>

          <button onClick={handleLogout} className="hidden md:block p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Se déconnecter">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Message d'erreur visible si les règles Firebase bloquent */}
      {errorMsg && (
        <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-700 p-4 m-4" role="alert">
          <p className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Erreur de configuration</p>
          <p>{errorMsg}</p>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
            { id: 'transactions', icon: PlusCircle, label: 'Transactions' },
            { id: 'analysis', icon: Target, label: 'Analyse' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-blue-600 text-white border-none">
                <p className="text-blue-100 text-sm">Solde ({getFilterLabel()})</p>
                <h3 className="text-3xl font-bold mt-1">{formatCurrency(balance)}</h3>
              </Card>
              <Card className="p-6">
                <p className="text-slate-500 text-sm">Revenus</p>
                <h3 className="text-2xl font-bold text-emerald-600">+{formatCurrency(stats.totalIncome)}</h3>
              </Card>
              <Card className="p-6">
                <p className="text-slate-500 text-sm">Dépenses</p>
                <h3 className="text-2xl font-bold text-rose-600">-{formatCurrency(stats.totalExpenses)}</h3>
              </Card>
            </div>
            
            <Card className="p-6 flex flex-col md:flex-row items-center justify-around gap-8">
               <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {pieData.reduce((acc: any, item, i) => {
                      const total = stats.totalIncome || 1; 
                      const val = item.value;
                      const angle = (val / total) * 360;
                      const x1 = 50 + 50 * Math.cos(Math.PI * acc.currentAngle / 180);
                      const y1 = 50 + 50 * Math.sin(Math.PI * acc.currentAngle / 180);
                      const x2 = 50 + 50 * Math.cos(Math.PI * (acc.currentAngle + angle) / 180);
                      const y2 = 50 + 50 * Math.sin(Math.PI * (acc.currentAngle + angle) / 180);
                      const d = `M50,50 L${x1},${y1} A50,50 0 ${angle > 180 ? 1 : 0},1 ${x2},${y2} Z`;
                      if (val > 0) acc.elements.push(<path key={i} d={d} fill={item.color} />);
                      acc.currentAngle += angle;
                      return acc;
                    }, { currentAngle: 0, elements: [] }).elements}
                    <circle cx="50" cy="50" r="30" fill="white" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs text-slate-400">Dépenses</span>
                    <span className="font-bold">{formatCurrency(stats.totalExpenses)}</span>
                  </div>
               </div>
               <div className="space-y-3 w-full md:w-auto">
                 {pieData.map((d, i) => (
                   <div key={i} className="flex items-center justify-between gap-8 text-sm">
                     <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                       <span>{d.name}</span>
                     </div>
                     <span className="font-bold">{formatCurrency(d.value)}</span>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        )}

        {/* --- TRANSACTIONS --- */}
        {activeTab === 'transactions' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 h-fit sticky top-24">
              <h3 className="font-bold mb-4">Nouvelle Opération</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                 <div className="flex gap-2">
                    {['expense', 'income'].map(t => (
                      <button type="button" key={t} onClick={() => setFormData({...formData, type: t as any})}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${formData.type === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700') : 'border-slate-200 text-slate-500'}`}>
                        {t === 'income' ? 'Revenu' : 'Dépense'}
                      </button>
                    ))}
                 </div>
                 <input type="text" placeholder="Libellé" required className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                   value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                 <input type="number" placeholder="Montant" required step="0.01" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                   value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                 <input type="date" required className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                   value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                 
                 {formData.type === 'expense' && (
                   <select className="w-full p-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" 
                     value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                     <option value="needs">Besoins (50%)</option>
                     <option value="wants">Envies (30%)</option>
                     <option value="savings">Épargne (20%)</option>
                   </select>
                 )}
                 <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">Ajouter</button>
              </form>
            </Card>

            <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold flex justify-between items-center">
                <span>Historique ({getFilterLabel()})</span>
                <span className="text-xs bg-white px-2 py-1 rounded border border-slate-200">{filteredTransactions.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="p-4 flex justify-between items-center hover:bg-slate-50 group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{t.label}</div>
                        <div className="text-xs text-slate-400 capitalize">{t.date} • {t.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                     <Calendar className="w-8 h-8 text-slate-200" />
                     <p>Aucune transaction trouvée.</p>
                   </div>
                )}
              </div>
            </Card>
          </div>
        )}
        
        {/* --- ANALYSE --- */}
        {activeTab === 'analysis' && (
           <div className="space-y-6">
             <Card className="p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg text-slate-800">Analyse 50/30/20</h3>
                 <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{getFilterLabel()}</span>
               </div>
               
               <div className="space-y-6">
                  {pieData.map((cat, i) => {
                    const totalIncome = stats.totalIncome || 1; 
                    const targetAmount = totalIncome * cat.target;
                    const percent = totalIncome > 0 ? (cat.value / totalIncome) * 100 : 0;
                    const isOver = cat.value > targetAmount;
                    
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{cat.name}</span>
                          <span className={isOver ? "text-rose-600 font-bold" : "text-slate-600"}>
                            {formatCurrency(cat.value)} / {formatCurrency(targetAmount)}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                            style={{left: `${cat.target * 100}%`}}
                          ></div>
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{width: `${Math.min(percent, 100)}%`, backgroundColor: cat.color}}
                          ></div>
                        </div>
                        {isOver ? (
                          <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Budget dépassé de {formatCurrency(cat.value - targetAmount)}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-1">
                            {percent.toFixed(1)}% des revenus (Cible : {cat.target * 100}%)
                          </p>
                        )}
                      </div>
                    )
                  })}
               </div>
             </Card>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                 <strong>50% Besoins :</strong> Charges fixes (Loyer, courses...)
               </div>
               <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-800">
                 <strong>30% Envies :</strong> Loisirs et confort.
               </div>
               <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-emerald-800">
                 <strong>20% Épargne :</strong> Investissement futur.
               </div>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
