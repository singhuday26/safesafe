
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

// Transaction types
export type TransactionType = "payment" | "transfer" | "withdrawal" | "deposit";

// Transaction status
export type TransactionStatus = "completed" | "pending" | "failed" | "flagged";

// Transaction interface
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  merchant?: string;
  timestamp: Date;
  riskScore: number;
}

// Generate a random risk score
export const generateRiskScore = (): number => {
  return Math.floor(Math.random() * 100);
};

// Generate random transactions for demo
export const generateRandomTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: TransactionType[] = ["payment", "transfer", "withdrawal", "deposit"];
  const statuses: TransactionStatus[] = ["completed", "pending", "failed", "flagged"];
  const merchants = [
    "Amazon", "Walmart", "Target", "Best Buy", "Apple", "Google", 
    "Netflix", "Spotify", "Uber", "Lyft", "DoorDash", "Grubhub"
  ];
  
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD"];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const amount = Math.floor(Math.random() * 1000) + 1;
    const riskScore = generateRiskScore();
    
    const transaction: Transaction = {
      id: `TRX-${Math.floor(Math.random() * 1000000)}`,
      amount,
      currency,
      type,
      status,
      description: `${type} to ${merchant}`,
      merchant,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      riskScore
    };
    
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Generate risk insights
export interface RiskInsight {
  id: string;
  title: string;
  description: string;
  urgency: RiskLevel;
  timestamp: Date;
}

export const generateRiskInsights = (): RiskInsight[] => {
  return [
    {
      id: "insight-1",
      title: "Unusual login location detected",
      description: "A login was detected from a new location that is significantly different from your usual patterns.",
      urgency: "high",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: "insight-2",
      title: "Multiple failed login attempts",
      description: "There were 5 failed login attempts on your account in the last hour.",
      urgency: "medium",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: "insight-3",
      title: "Large transaction flagged",
      description: "A transaction of $2,500 was flagged as potentially fraudulent based on your spending patterns.",
      urgency: "critical",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
    },
    {
      id: "insight-4",
      title: "New device used for transaction",
      description: "A new device was used to make a payment that doesn't match your regular devices.",
      urgency: "medium",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: "insight-5",
      title: "Potential card skimming detected",
      description: "Your card was used at a location associated with recent skimming reports.",
      urgency: "high",
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

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

// Dashboard stats
export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
}

export const generateDashboardStats = (): DashboardStat[] => {
  return [
    {
      id: "stat-1",
      title: "Fraud Attempts",
      value: "24",
      change: 12.5,
      trend: "up",
      icon: "shield"
    },
    {
      id: "stat-2",
      title: "Risk Score",
      value: "67/100",
      change: -3.8,
      trend: "down",
      icon: "activity"
    },
    {
      id: "stat-3",
      title: "Alerts",
      value: "9",
      change: 0,
      trend: "neutral",
      icon: "bell"
    },
    {
      id: "stat-4",
      title: "Secure Transactions",
      value: "342",
      change: 8.2,
      trend: "up",
      icon: "check-circle"
    }
  ];
};

// Time periods for filters
export type TimePeriod = "24h" | "7d" | "30d" | "90d" | "1y" | "all";
