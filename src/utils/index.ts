// Formatage Monétaire
export const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

// Traductions
export const categoryLabels: Record<string, string> = {
  needs: 'Besoins',
  wants: 'Envies',
  savings: 'Épargne',
  salary: 'Salaire'
};

export const getDisplayCategory = (type: string, category: string) => {
  if (type === 'income') return 'Revenu';
  return categoryLabels[category] || category;
};
