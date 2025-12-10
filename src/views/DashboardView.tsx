import React from 'react';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils';
import { Repeat } from 'lucide-react';
import { Chart } from "react-google-charts";

interface DashboardViewProps {
  stats: any;
  balance: number;
  pieData: any[];
  filterLabel: string;
  isDarkMode: boolean;
  pendingRecurringCount: number;
  onGenerateRecurring: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  stats, balance, pieData, filterLabel, isDarkMode, pendingRecurringCount, onGenerateRecurring 
}) => {
  return (
    <div className="space-y-6">
      {pendingRecurringCount > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300"><Repeat className="w-5 h-5"/></div>
            <div>
              <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Opérations automatiques en attente</h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">Vous avez {pendingRecurringCount} opérations planifiées.</p>
            </div>
          </div>
          <button onClick={onGenerateRecurring} className="whitespace-nowrap px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-sm transition-colors">
            Générer maintenant
          </button>
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
};
