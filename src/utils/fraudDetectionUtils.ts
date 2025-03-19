
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

// Simple utility function to measure performance - for debugging only
export const measureOperationTime = (operation: string, startTime: number): void => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`Operation [${operation}] took ${duration.toFixed(2)}ms`);
};

// Format number with K/M/B suffix for large numbers
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Get risk severity from risk score
export const getRiskSeverity = (score: number): string => {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 30) return "Medium";
  return "Low";
};

// Check if a transaction amount is suspicious (very round number)
export const isRoundAmount = (amount: number): boolean => {
  // Check if amount has no decimal places or is a multiple of 100/1000
  return amount % 1 === 0 || amount % 100 === 0 || amount % 1000 === 0;
};

// Utility to create an ISO date string for a relative time in the past
export const getRelativeTimeISOString = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Check if a time of day is unusual
export const isUnusualTime = (date: Date): boolean => {
  const hour = date.getHours();
  // Late night hours (0-5 AM)
  return hour >= 0 && hour <= 5;
};
