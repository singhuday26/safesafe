
// Risk level categories
export type RiskLevel = "low" | "medium" | "high" | "critical";

// Get risk level based on score
export const getRiskLevel = (score: number): RiskLevel => {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "critical";
};

// Get risk color based on score
export const getRiskColor = (score: number): string => {
  const level = getRiskLevel(score);
  switch (level) {
    case "low":
      return "bg-green-500 text-green-500";
    case "medium":
      return "bg-yellow-500 text-yellow-500";
    case "high":
      return "bg-orange-500 text-orange-500";
    case "critical":
      return "bg-red-500 text-red-500";
    default:
      return "bg-gray-500 text-gray-500";
  }
};

// Time periods for analysis
export type TimePeriod = "24h" | "7d" | "30d" | "all";

// Format currency
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

// Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
