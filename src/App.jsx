import React, { useState } from 'react';
import { Wallet, BarChart3, PlusCircle, Target } from 'lucide-react';

// Imports de nos fichiers
import { Card } from './components/Layout/Card';
import { SimplePieChart } from './components/Charts/SimplePieChart';
import { useFinance } from './hooks/useFinance';
import { formatCurrency } from './utils/format';

// Tu devras peut-être extraire les sous-parties (Dashboard, Forms) dans d'autres fichiers 
// si App.tsx reste trop gros, mais pour l'instant c'est gérable.

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // On utilise notre Hook personnalisé ici !
  const { transactions, addTransaction, deleteTransaction, stats } = useFinance();
  
  // État local juste pour le formulaire
  const [formData, setFormData] = useState({ /* ... état initial ... */ });

  // ... Le reste du code (JSX) ...
  // Remplace les références directes par les variables destructurées ci-dessus.
  
  return (
     // ... Ton JSX propre ...
  );
}

