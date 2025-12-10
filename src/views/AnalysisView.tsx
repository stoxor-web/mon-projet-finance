import React from 'react';
import { Card } from '../components/Card';
import { formatCurrency } from '../utils';
import { TrendingUp } from 'lucide-react';

interface AnalysisViewProps {
  stats: any;
  pieData: any[];
  filterLabel: string;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ stats, pieData, filterLabel }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Analyse 50/30/20</h3>
          <span className="text-sm text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">{filterLabel}</span>
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
  );
};
