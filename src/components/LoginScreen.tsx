import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Wallet, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Card } from './Card';

interface LoginScreenProps {
  onGoogle: () => void;
  onGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGoogle, onGuest }) => {
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
