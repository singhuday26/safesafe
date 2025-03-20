
// Standard risk evaluation functions
export const getRiskLevel = (score: number): string => {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
};

export const getRiskColor = (score: number): string => {
  if (score >= 80) return 'bg-red-500 text-red-500';
  if (score >= 60) return 'bg-orange-500 text-orange-500';
  if (score >= 30) return 'bg-yellow-500 text-yellow-500';
  return 'bg-green-500 text-green-500';
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

export type TimePeriod = '24h' | '7d' | '30d' | 'all';

export const getTimeRangeFromPeriod = (period: TimePeriod): { startDate?: Date, endDate?: Date } => {
  const endDate = new Date();
  let startDate: Date | undefined;
  
  switch (period) {
    case "24h":
      startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);
      break;
    case "7d":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "all":
      startDate = undefined; // No start date limit
      break;
  }
  
  return { startDate, endDate };
};

// Analyze transaction risk
export const analyzeTransactionRisk = (transaction: any): {
  score: number;
  factors: Array<{ name: string; score: number; details?: any }>;
} => {
  const factors = [];
  let totalScore = 0;
  
  // Amount factor
  if (transaction.amount > 1000) {
    const amountFactor = {
      name: 'High Value Transaction',
      score: 20,
      details: { threshold: 1000, actual: transaction.amount }
    };
    factors.push(amountFactor);
    totalScore += amountFactor.score;
  }
  
  // Time of day factor
  const hour = new Date(transaction.timestamp).getHours();
  if (hour >= 0 && hour <= 5) {
    const timeFactor = {
      name: 'Unusual Hour',
      score: 15,
      details: { timeOfDay: `${hour}:00` }
    };
    factors.push(timeFactor);
    totalScore += timeFactor.score;
  }
  
  // Payment method factor
  if (transaction.payment_method === 'bitcoin' || transaction.payment_method === 'crypto') {
    const methodFactor = {
      name: 'High-Risk Payment Method',
      score: 25,
      details: { method: transaction.payment_method }
    };
    factors.push(methodFactor);
    totalScore += methodFactor.score;
  }
  
  // New merchant factor
  if (transaction.is_new_merchant) {
    const merchantFactor = {
      name: 'New Merchant',
      score: 10
    };
    factors.push(merchantFactor);
    totalScore += merchantFactor.score;
  }
  
  // Cap at 100
  totalScore = Math.min(totalScore, 100);
  
  return {
    score: totalScore,
    factors
  };
};

export const getRiskCategoryLabel = (score: number): string => {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
};

export const getRiskCategoryColor = (score: number): string => {
  if (score >= 80) return 'text-red-500';
  if (score >= 60) return 'text-orange-500';
  if (score >= 30) return 'text-yellow-500';
  return 'text-green-500';
};
