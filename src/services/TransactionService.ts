
import { Transaction } from "@/types/database";
import { analyzeTransaction } from "@/services/FraudDetectionService";

// Sample transactions for demo purposes
const generateSampleTransactions = () => {
  const transactions: Transaction[] = [];
  const merchants = ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Apple Store', 'Nike', 'Adidas', 'Microsoft', 'Google', 'Steam'];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Boston', 'Seattle', 'Denver', 'Austin', 'San Francisco'];
  
  // Generate transactions for the last 24 hours
  for (let i = 0; i < 24; i++) {
    // Generate 1-3 transactions per hour
    const transactionsThisHour = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < transactionsThisHour; j++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = Math.round(Math.random() * 900 + 100); // Random amount between 100 and 1000
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      transactions.push({
        id: `txn_${i}_${j}`,
        user_id: 'demo-user',
        merchant,
        amount,
        currency: 'USD',
        payment_method: paymentMethod,
        status: 'approved',
        risk_score: 0,
        timestamp: new Date(Date.now() - (i * 60 + Math.floor(Math.random() * 60)) * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - (i * 60 + Math.floor(Math.random() * 60)) * 60 * 1000).toISOString(),
        card_last4: paymentMethod.includes('card') ? Math.floor(Math.random() * 9000 + 1000).toString() : undefined,
        city,
        country: 'US',
        type: 'payment',
        transaction_number: `TX-${i}${j}`
      });
    }
  }
  
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const sampleTransactions = generateSampleTransactions();

// Calculate risk score based on transaction frequency
const calculateRiskScore = (transactions: Transaction[]): Transaction[] => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const transactionsInLastHour = transactions.filter(
    t => new Date(t.timestamp) >= oneHourAgo
  );
  
  // Base risk score on transactions in the last hour
  const baseRiskScore = transactionsInLastHour.length >= 5 ? 50 : 0;
  
  // Additional risk factors
  const highValueTransactions = transactionsInLastHour.filter(t => t.amount > 1000).length;
  const uniqueLocations = new Set(transactionsInLastHour.map(t => t.city)).size;
  
  let riskScore = baseRiskScore;
  if (highValueTransactions > 0) riskScore += 10;
  if (uniqueLocations > 2) riskScore += 20;
  
  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);
  
  // Update risk scores for all transactions in the last hour
  return transactions.map(t => ({
    ...t,
    risk_score: new Date(t.timestamp) >= oneHourAgo ? riskScore : 0
  }));
};

// Fetch user's transactions with optional filters
export const fetchTransactions = async (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
  status?: string
): Promise<Transaction[]> => {
  // Get all transactions first
  let transactions = [...sampleTransactions];
  
  // Calculate risk scores before filtering
  transactions = calculateRiskScore(transactions);
  
  // Apply filters if provided
  if (startDate) {
    transactions = transactions.filter(t => new Date(t.timestamp) >= startDate);
  }
  if (endDate) {
    transactions = transactions.filter(t => new Date(t.timestamp) <= endDate);
  }
  if (status) {
    transactions = transactions.filter(t => t.status === status);
  }
  
  // Return filtered and limited results
  return transactions.slice(0, limit);
};

// Mock functions for demo purposes
export const fetchTransactionById = async (id: string): Promise<Transaction | null> => {
  const transaction = sampleTransactions.find(t => t.id === id);
  return transaction ? calculateRiskScore([transaction])[0] : null;
};

export const createTransaction = async (transaction: Partial<Transaction>): Promise<Transaction | null> => {
  return null;
};

export const updateTransactionStatus = async (id: string, status: 'approved' | 'declined' | 'flagged'): Promise<boolean> => {
  return true;
};

export const subscribeToTransactions = (callback: (transaction: Transaction) => void) => {
  return () => {};
};
