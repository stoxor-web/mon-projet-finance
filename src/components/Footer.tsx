import React from 'react';
import { Wallet, Twitter, Linkedin, Instagram, Github } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-12 mt-12 transition-colors duration-300">
    <div className="max-w-5xl mx-auto px-4">
      {/* ... Contenu du Footer simplifié pour l'exemple, tu as le complet ... */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-blue-600 p-1.5 rounded-lg"><Wallet className="w-4 h-4 text-white" /></div>
           <span className="font-bold text-slate-900 dark:text-white text-sm">Finance Flow</span>
        </div>
        <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-blue-600"><Twitter className="w-5 h-5"/></a>
            <a href="#" className="text-slate-400 hover:text-blue-600"><Github className="w-5 h-5"/></a>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Finance Flow by STOXOR.
        </p>
      </div>
    </div>
  </footer>
);
