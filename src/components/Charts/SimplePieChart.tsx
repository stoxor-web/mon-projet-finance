import React from 'react';
import { formatCurrency } from '../../utils/format';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface SimplePieChartProps {
  data: PieChartData[];
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  if (total === 0) return (
    <div className="flex items-center justify-center h-48 bg-slate-50 rounded-full w-48 mx-auto border-2 border-dashed border-slate-300">
      <span className="text-slate-400 text-xs">Pas de données</span>
    </div>
  );

  return (
    <div className="relative h-48 w-48 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 360;
          const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
          const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + sliceAngle)) / 180);
          const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + sliceAngle)) / 180);
          
          const largeArc = sliceAngle > 180 ? 1 : 0;
          
          const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
          currentAngle += sliceAngle;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Cercle blanc au centre pour faire un Donut Chart */}
        <circle cx="50" cy="50" r="30" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-xs text-slate-500 font-medium">Dépenses</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
