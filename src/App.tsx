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
  Calendar, Filter, AlertCircle, Moon, Sun, Mail, Lock, Repeat, CheckCircle, Workflow,
  Github, Twitter, Linkedin, Instagram
} from 'lucide-react';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyAAKdOZCiJ9uGqmgmdoqp_-IioTScFsU0I",
  authDomain: "financeflowbystoxor.firebaseapp.com",
  projectId: "financeflowbystoxor",
  storageBucket: "financeflowbystoxor.firebasestorage.app",
  messagingSenderId: "43977997722",
  appId: "1:43977997722:web:d055af7410b66567538e23"
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

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
    {children}
  </div>
);

// --- FOOTER ---
const Footer = () => (
  <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 mt-12 transition-colors duration-300">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Produit</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tarifs</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Application Mobile</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mises à jour</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Ressources</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Guide 50/30/20</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Aide & Support</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Communauté</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Légal</h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Confidentialité</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">CGU</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mentions légales</a></li>
            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Cookies</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">STOXOR</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Simplifiez la gestion de vos finances personnelles avec des outils intelligents.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-100 dark:border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg"><Wallet className="w-4 h-4 text-white" /></div>
           <span className="font-bold text-slate-900 dark:text-white text-sm">Finance Flow</span>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Finance Flow by STOXOR. Fait avec ❤️ à Paris.
        </p>
      </div>
    </div>
  </footer>
);

// --- ECRAN DE CONNEXION (AVEC LOGO GOOGLE RETABLI) ---
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
        <p className="text-slate-500 dark:text-slate-400">Gérez vos finances avec l'outil développé par STOXOR</p>
      </div>
      
      <Card className="p-8 max-w-sm w-full space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{isSignUp ? "Créer un compte" : "Bienvenue"}</h2>
          <p className="text-sm text-slate-400">Entrez vos identifiants pour continuer</p>
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
          {/* BOUTON GOOGLE AVEC LE LOGO RESTAURÉ */}
          <button onClick={onGoogle} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuer avec Google
          </button>
          
          <button onClick={onGuest} className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm">
            <UserIcon className="w-4 h-4" /> Mode Invité
          </button>
        </div>
        <div className="text-center mt-4"><button onClick={() => { setIsSignUp(!isSignUp); setError(null); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{isSignUp ? "J'ai déjà un compte" : "Pas de compte ? S'inscrire"}</button></div>
      </Card>
      
      {/* FOOTER ÉCRAN LOGIN */}
      <div className="mt-12 w-full max-w-sm text-center">
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Finance Flow by STOXOR</p>
      </div>
    </div>
  );
};

// --- APP PRINCIPALE ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
  
  const [isDarkMode, setIsDarkMode] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false);
  const [filterType, setFilterType] = useState<'month' | 'year' | 'all'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());

  const [formData, setFormData] = useState({
    label: '', amount: '', date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType, category: 'needs' as CategoryType
  });

  const [recurringForm, setRecurringForm] = useState({
    label: '', amount: '', type: 'expense' as TransactionType, category: 'needs' as CategoryType, durationMonths: 0
  });

  // Dark Mode Logic
  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  // Auth & Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setTransactions([]); setRecurringItems([]); return; }
    
    const qTrx = query(collection(db, "users", user.uid, "transactions"), orderBy("date", "desc"));
    const unsubTrx = onSnapshot(qTrx, 
      (snap) => { setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]); setErrorMsg(null); }, 
      (err) => setErrorMsg("Erreur accès base de données.")
    );

    const qRec = query(collection(db, "users", user.uid, "recurring"));
    const unsubRec = onSnapshot(qRec,
      (snap) => setRecurringItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecurringItem[]),
      (err) => console.error("Erreur recurring", err)
    );

    return () => { unsubTrx(); unsubRec(); };
  }, [user]);

  // Actions
  const handleGoogleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); } };
  const handleGuestLogin = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
  const handleLogout = () => signOut(auth);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.label || !formData.amount) return;
    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), { ...formData, amount: parseFloat(formData.amount), createdAt: new Date() });
      setFormData({ ...formData, label: '', amount: '' });
      if (window.innerWidth < 768) setActiveTab('transactions');
    } catch (err) { alert("Erreur d'ajout"); }
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !recurringForm.label || !recurringForm.amount) return;
    try {
      await addDoc(collection(db, "users", user.uid, "recurring"), {
        ...recurringForm,
        amount: parseFloat(recurringForm.amount),
        frequency: 'monthly',
        startDate: new Date().toISOString().slice(0, 7),
        lastGenerated: "", 
        createdAt: new Date()
      });
      setRecurringForm({ ...recurringForm, label: '', amount: '', durationMonths: 0 });
      alert("Abonnement programmé !");
    } catch (err) { alert("Erreur d'ajout récurrent"); }
  };

  // Suppression SANS confirmation (Directe)
  const handleDelete = async (id: string, collectionName: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, collectionName, id));
  };

  // Logic Gen
  const pendingRecurringCount = recurringItems.filter(item => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const isDue = item.lastGenerated < currentMonthStr;
    let isExpired = false;
    if (item.durationMonths > 0) {
      const start = new Date(item.startDate + "-01");
      const end = new Date(start.setMonth(start.getMonth() + item.durationMonths));
      if (new Date() > end) isExpired = true;
    }
    return isDue && !isExpired;
  }).length;

  const generateRecurringTransactions = async () => {
    if (!user) return;
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const dayOfMonth = new Date().getDate().toString().padStart(2, '0');
    let generatedCount = 0;

    for (const item of recurringItems) {
      if (item.lastGenerated < currentMonthStr) {
        let isExpired = false;
        if (item.durationMonths > 0) {
          const start = new Date(item.startDate + "-01");
          const end = new Date(start.setMonth(start.getMonth() + item.durationMonths));
          if (new Date() > end) isExpired = true;
        }

        if (!isExpired) {
          await addDoc(collection(db, "users", user.uid, "transactions"), {
            label: `${item.label} (Auto)`,
            amount: item.amount,
            date: `${currentMonthStr}-${dayOfMonth}`, 
            type: item.type,
            category: item.category,
            isAuto: true,
            createdAt: new Date()
          });
          await updateDoc(doc(db, "users", user.uid, "recurring", item.id), { lastGenerated: currentMonthStr });
          generatedCount++;
        }
      }
    }
    alert(`${generatedCount} opérations générées !`);
  };

  // Stats & Filtering
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'year') return t.date.startsWith(currentYear);
    return t.date.startsWith(currentMonth);
  });

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
    { name: 'Besoins', value: stats.expensesByCategory.needs || 0, color: '#3b82f6', target: 0.5 },
    { name: 'Envies', value: stats.expensesByCategory.wants || 0, color: '#a855f7', target: 0.3 },
    { name: 'Épargne', value: stats.expensesByCategory.savings || 0, color: '#22c55e', target: 0.2 },
  ];

  // --- PRÉPARATION DES DONNÉES SANKEY ---
  const prepareSankeyData = () => {
    const data: any[] = [["De", "À", "Montant"]];
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalIncome === 0) return null;

    const expensesByCat = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, { needs: 0, wants: 0, savings: 0 } as Record<string, number>);

    if (expensesByCat.needs > 0) data.push(["Revenus", "Besoins (50%)", expensesByCat.needs]);
    if (expensesByCat.wants > 0) data.push(["Revenus", "Envies (30%)", expensesByCat.wants]);
    if (expensesByCat.savings > 0) data.push(["Revenus", "Épargne (20%)", expensesByCat.savings]);

    const remaining = totalIncome - (expensesByCat.needs + expensesByCat.wants + expensesByCat.savings);
    if (remaining > 0) data.push(["Revenus", "Solde Restant", remaining]);

    const expensesByLabelAndCat = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const key = `${t.category}-${t.label}`;
        if (!acc[key]) acc[key] = { ...t, amount: 0 };
        acc[key].amount += t.amount;
        return acc;
      }, {} as Record<string, Transaction>);

    Object.values(expensesByLabelAndCat).forEach(t => {
      let sourceName = "";
      if (t.category === 'needs') sourceName = "Besoins (50%)";
      if (t.category === 'wants') sourceName = "Envies (30%)";
      if (t.category === 'savings') sourceName = "Épargne (20%)";
      data.push([sourceName, t.label, t.amount]);
    });

    return data;
  };

  const sankeyData = prepareSankeyData();
  const sankeyOptions = {
    sankey: {
      node: {
        width: 12, // Barres plus fines
        nodePadding: 20, // Plus d'espace entre les nœuds
        colors: isDarkMode 
          ? ['#60a5fa', '#f59e0b', '#a855f7', '#10b981', '#cbd5e1'] // Palette Dark (Bleu, Orange, Violet, Vert)
          : ['#2563eb', '#d97706', '#9333ea', '#059669', '#64748b'], // Palette Light
        label: { 
          fontName: 'sans-serif',
          fontSize: 13,
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          bold: true
        }
      },
      link: { 
        colorMode: 'gradient', // Dégradé fluide comme sur l'image
        fillOpacity: 0.5 // Transparence pour voir les superpositions
      }
    },
    tooltip: { 
      isHtml: true, 
      textStyle: { fontName: 'sans-serif' } 
    },
    backgroundColor: 'transparent',
  };

  const getFilterLabel = () => filterType === 'all' ? "Global" : (filterType === 'year' ? currentYear : currentMonth);
  const displayName = user?.isAnonymous ? "Invité" : (user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || "Utilisateur");

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Chargement...</div>;
  if (!user) return <LoginScreen onGoogle={handleGoogleLogin} onGuest={handleGuestLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20 md:pb-0 transition-colors duration-300 flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 leading-tight">Finance Flow</h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">{user.isAnonymous && <UserIcon className="w-3 h-3" />} Bonjour, {displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-yellow-400 rounded-lg bg-slate-100 dark:bg-slate-700">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 rounded-lg"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-1.5 rounded-lg border border-slate-200 dark:border-slate-600 w-full md:w-auto transition-colors">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer">
              <option value="month" className="text-slate-900">Mois</option>
              <option value="year" className="text-slate-900">Année</option>
              <option value="all" className="text-slate-900">Tout</option>
            </select>
            {filterType === 'month' && (<><div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1"></div><input type="month" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-medium text-sm w-full md:w-auto cursor-pointer dark:scheme-dark" /></>)}
            {filterType === 'year' && (<><div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1"></div><input type="number" min="2020" max="2030" value={currentYear} onChange={(e) => setCurrentYear(e.target.value)} className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-medium text-sm w-16 cursor-pointer" /></>)}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-yellow-400 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-all"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {errorMsg && <div className="bg-rose-100 dark:bg-rose-900/30 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-4 m-4 font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {errorMsg}</div>}

      <main className="max-w-5xl mx-auto px-4 py-6 flex-grow w-full">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
            { id: 'transactions', icon: PlusCircle, label: 'Transactions' },
            { id: 'recurring', icon: Repeat, label: 'Récurrent' },
            { id: 'analysis', icon: Target, label: 'Analyse' },
            { id: 'flow', icon: Workflow, label: 'Flux' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {pendingRecurringCount > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300"><Repeat className="w-5 h-5"/></div>
                  <div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Opérations automatiques en attente</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Vous avez {pendingRecurringCount} opérations planifiées pour ce mois.</p>
                  </div>
                </div>
                <button onClick={generateRecurringTransactions} className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors">
                  Générer maintenant
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 !bg-blue-600 !dark:bg-blue-700 text-white border-none">
                <p className="text-blue-100 text-sm">Solde ({getFilterLabel()})</p>
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
                    {pieData.reduce((acc: any, item, i) => {
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
                 {pieData.map((d, i) => (
                   <div key={i} className="flex items-center justify-between gap-8 text-sm">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div><span className="dark:text-slate-300">{d.name}</span></div>
                     <span className="font-bold dark:text-white">{formatCurrency(d.value)}</span>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 h-fit sticky top-24">
              <h3 className="font-bold mb-4 dark:text-white">Nouvelle Opération</h3>
              <form onSubmit={handleAdd} className="space-y-4">
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
                <span>Historique ({getFilterLabel()})</span>
                <span className="text-xs bg-white dark:bg-slate-600 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{filteredTransactions.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTransactions.map(t => (
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
                      <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                      <button onClick={() => handleDelete(t.id, 'transactions')} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Calendar className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune transaction trouvée.</p></div>}
              </div>
            </Card>
          </div>
        )}

        {/* RÉCURRENT */}
        {activeTab === 'recurring' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="p-6 h-fit">
              <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><Repeat className="w-5 h-5"/> Programmer une récurrence</h3>
              <form onSubmit={handleAddRecurring} className="space-y-4">
                 <div className="flex gap-2">
                    {['expense', 'income'].map(t => (
                      <button type="button" key={t} onClick={() => setRecurringForm({...recurringForm, type: t as any})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${recurringForm.type === t ? (t === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400' : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-400') : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>{t === 'income' ? 'Revenu' : 'Dépense'}</button>
                    ))}
                 </div>
                 <input type="text" placeholder="Libellé (ex: PEL, Loyer, Netflix)" required className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.label} onChange={e => setRecurringForm({...recurringForm, label: e.target.value})} />
                 <input type="number" placeholder="Montant Mensuel" required step="0.01" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.amount} onChange={e => setRecurringForm({...recurringForm, amount: e.target.value})} />
                 
                 <div>
                   <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Durée (Mois) - Vide pour illimité</label>
                   <input type="number" placeholder="ex: 24 pour PEL" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-transparent dark:text-white placeholder-slate-400" value={recurringForm.durationMonths === 0 ? '' : recurringForm.durationMonths} onChange={e => setRecurringForm({...recurringForm, durationMonths: parseInt(e.target.value) || 0})} />
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
                <span className="text-xs bg-white dark:bg-slate-600 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{recurringItems.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {recurringItems.map(item => (
                  <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{item.label}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 capitalize">
                          {item.durationMonths === 0 ? "Illimité" : `${item.durationMonths} Mois restants`} • {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {formatCurrency(item.amount)}/mois
                      </span>
                      <button onClick={() => handleDelete(item.id, 'recurring')} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2" title="Arrêter">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {recurringItems.length === 0 && <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2"><Repeat className="w-8 h-8 text-slate-200 dark:text-slate-600" /><p>Aucune récurrence active.</p></div>}
              </div>
            </Card>
          </div>
        )}
        
        {/* ANALYSE */}
        {activeTab === 'analysis' && (
           <div className="space-y-6">
             <Card className="p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-lg text-slate-800 dark:text-white">Analyse 50/30/20</h3>
                 <span className="text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{getFilterLabel()}</span>
               </div>
               
               <div className="space-y-6">
                  {pieData.map((cat, i) => {
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
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300"><strong>50% Besoins :</strong> Charges fixes (Loyer, courses...)</div>
               <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800 text-sm text-purple-800 dark:text-purple-300"><strong>30% Envies :</strong> Loisirs et confort.</div>
               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-300"><strong>20% Épargne :</strong> Investissement futur.</div>
             </div>
           </div>
        )}

        {/* NOUVEL ONGLET : FLUX (SANKEY STYLE FINARY) */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <Card className="p-6 h-[600px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">Flux de trésorerie</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Visualisez où part votre argent ({getFilterLabel()})</p>
                </div>
              </div>
              {sankeyData && sankeyData.length > 1 ? (
                <div className="flex-1 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                  <Chart
                    chartType="Sankey"
                    width="100%"
                    height="100%"
                    data={sankeyData}
                    options={sankeyOptions}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Workflow className="w-12 h-12 mb-2 opacity-50" />
                  <p>Pas assez de données pour générer le flux.</p>
                  <p className="text-sm">Ajoutez des revenus et des dépenses pour voir le graphique.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
