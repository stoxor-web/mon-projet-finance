import React from 'react';
import { Card } from '../components/Card';
import { Chart } from "react-google-charts";
import { Transaction } from '../types';
import { Workflow } from 'lucide-react';

interface FlowViewProps {
  transactions: Transaction[];
  filterLabel: string;
  isDarkMode: boolean;
}

export const FlowView: React.FC<FlowViewProps> = ({ transactions, filterLabel, isDarkMode }) => {
  // Préparation des données Sankey
  const prepareSankeyData = () => {
    const data: any[] = [["De", "À", "Montant"]];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    if (totalIncome === 0) return null;

    const expensesByCat = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount; return acc;
    }, { needs: 0, wants: 0, savings: 0 } as Record<string, number>);

    if (expensesByCat.needs > 0) data.push(["Revenus", "Besoins (50%)", expensesByCat.needs]);
    if (expensesByCat.wants > 0) data.push(["Revenus", "Envies (30%)", expensesByCat.wants]);
    if (expensesByCat.savings > 0) data.push(["Revenus", "Épargne (20%)", expensesByCat.savings]);

    const remaining = totalIncome - (expensesByCat.needs + expensesByCat.wants + expensesByCat.savings);
    if (remaining > 0) data.push(["Revenus", "Solde Restant", remaining]);

    const expensesByLabelAndCat = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      const key = `${t.category}-${t.label}`;
      if (!acc[key]) acc[key] = { ...t, amount: 0 };
      acc[key].amount += t.amount; return acc;
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
        width: 12, nodePadding: 20,
        colors: isDarkMode ? ['#60a5fa', '#f59e0b', '#a855f7', '#10b981', '#cbd5e1'] : ['#2563eb', '#d97706', '#9333ea', '#059669', '#64748b'],
        label: { fontName: 'sans-serif', fontSize: 13, color: isDarkMode ? '#e2e8f0' : '#1e293b', bold: true }
      },
      link: { colorMode: 'gradient', fillOpacity: 0.5 }
    },
    tooltip: { isHtml: true, textStyle: { fontName: 'sans-serif' } },
    backgroundColor: 'transparent',
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Flux de trésorerie</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Visualisez où part votre argent ({filterLabel})</p>
          </div>
        </div>
        {sankeyData && sankeyData.length > 1 ? (
          <div className="flex-1 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <Chart chartType="Sankey" width="100%" height="100%" data={sankeyData} options={sankeyOptions} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <Workflow className="w-12 h-12 mb-2 opacity-50" />
            <p>Pas assez de données pour générer le flux.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
