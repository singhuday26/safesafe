
export type Transaction = {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'approved' | 'declined' | 'flagged';
  riskScore: number;
  timestamp: string;
  cardLast4?: string;
  location?: {
    country: string;
    city: string;
  };
  customer: {
    name: string;
    email: string;
  };
  type: 'payment' | 'refund' | 'payout';
};

export type RiskCategory = 'low' | 'medium' | 'high' | 'critical';

export const getRiskCategory = (score: number): RiskCategory => {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  if (score < 85) return 'high';
  return 'critical';
};

export const getRiskColor = (score: number): string => {
  if (score < 30) return 'bg-success';
  if (score < 60) return 'bg-warning';
  if (score < 85) return 'bg-orange-500';
  return 'bg-destructive';
};

export const getRiskTextColor = (score: number): string => {
  if (score < 30) return 'text-success';
  if (score < 60) return 'text-warning';
  if (score < 85) return 'text-orange-500';
  return 'text-destructive';
};

export const getStatusVariant = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'declined':
      return 'danger';
    case 'flagged':
      return 'warning';
    default:
      return 'default';
  }
};

export const getTransactionTypeVariant = (type: string) => {
  switch (type) {
    case 'payment':
      return 'info';
    case 'refund':
      return 'warning';
    case 'payout':
      return 'success';
    default:
      return 'default';
  }
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1NmZ9X',
    amount: 299.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'approved',
    riskScore: 15,
    timestamp: '2023-09-15T10:23:45Z',
    cardLast4: '4242',
    location: {
      country: 'US',
      city: 'New York'
    },
    customer: {
      name: 'Alex Johnson',
      email: 'alex@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_9LcK3P',
    amount: 1299.50,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'flagged',
    riskScore: 78,
    timestamp: '2023-09-15T09:45:22Z',
    cardLast4: '7890',
    location: {
      country: 'RU',
      city: 'Moscow'
    },
    customer: {
      name: 'Maria Smith',
      email: 'maria@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_5Zx8Qr',
    amount: 49.99,
    currency: 'EUR',
    paymentMethod: 'paypal',
    status: 'approved',
    riskScore: 22,
    timestamp: '2023-09-15T08:12:33Z',
    location: {
      country: 'FR',
      city: 'Paris'
    },
    customer: {
      name: 'Jean Dupont',
      email: 'jean@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_2Hj7Kl',
    amount: 799.99,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'declined',
    riskScore: 95,
    timestamp: '2023-09-15T07:55:18Z',
    cardLast4: '1234',
    location: {
      country: 'NG',
      city: 'Lagos'
    },
    customer: {
      name: 'Daniel Brown',
      email: 'daniel@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_7Ty6Ui',
    amount: 129.00,
    currency: 'GBP',
    paymentMethod: 'apple_pay',
    status: 'approved',
    riskScore: 35,
    timestamp: '2023-09-15T06:34:27Z',
    location: {
      country: 'GB',
      city: 'London'
    },
    customer: {
      name: 'Emma Wilson',
      email: 'emma@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_4Fg9Re',
    amount: 24.50,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'approved',
    riskScore: 12,
    timestamp: '2023-09-15T05:22:15Z',
    cardLast4: '5678',
    location: {
      country: 'US',
      city: 'Los Angeles'
    },
    customer: {
      name: 'Michael Lee',
      email: 'michael@example.com'
    },
    type: 'refund'
  },
  {
    id: 'txn_6Bn2Op',
    amount: 599.99,
    currency: 'CAD',
    paymentMethod: 'google_pay',
    status: 'flagged',
    riskScore: 68,
    timestamp: '2023-09-15T04:11:09Z',
    location: {
      country: 'CA',
      city: 'Toronto'
    },
    customer: {
      name: 'Sophie Martin',
      email: 'sophie@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_3Vx7Wq',
    amount: 1499.00,
    currency: 'AUD',
    paymentMethod: 'credit_card',
    status: 'approved',
    riskScore: 28,
    timestamp: '2023-09-15T03:45:52Z',
    cardLast4: '9012',
    location: {
      country: 'AU',
      city: 'Sydney'
    },
    customer: {
      name: 'James Taylor',
      email: 'james@example.com'
    },
    type: 'payment'
  },
  {
    id: 'txn_8Mn1Qw',
    amount: 250.00,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    status: 'declined',
    riskScore: 91,
    timestamp: '2023-09-15T02:33:41Z',
    location: {
      country: 'CN',
      city: 'Beijing'
    },
    customer: {
      name: 'Wei Zhang',
      email: 'wei@example.com'
    },
    type: 'payout'
  }
];

export const fraudStats = {
  totalTransactions: 458,
  flaggedTransactions: 34,
  blockedTransactions: 12,
  fraudAmount: 23857.45,
  fraudRate: 7.4,
  avgRiskScore: 23.5
};
