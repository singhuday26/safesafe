
import { Transaction, SecurityAlert, RiskMetrics } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

// Generate random number between min and max
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

// Get random element from array
const randomFrom = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

// Generate random transaction
export const generateRandomTransaction = async (userId: string): Promise<Omit<Transaction, 'id' | 'transaction_number' | 'created_at'>> => {
  const transactionTypes = ['payment', 'refund', 'payout'];
  const paymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay'];
  const statuses = ['approved', 'flagged', 'declined'];
  const merchants = [
    'Amazon', 'Walmart', 'Target', 'Best Buy', 'Starbucks', 'Netflix', 
    'Uber', 'DoorDash', 'Apple', 'Google', 'Microsoft', 'Facebook'
  ];
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  const countries = ['US', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China'];
  const cities = ['New York', 'London', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Tokyo', 'Beijing'];
  
  const type = randomFrom(transactionTypes) as 'payment' | 'refund' | 'payout';
  const paymentMethod = randomFrom(paymentMethods);
  const status = randomFrom(statuses) as 'approved' | 'flagged' | 'declined';
  const merchant = randomFrom(merchants);
  const currency = randomFrom(currencies);
  const country = randomFrom(countries);
  const city = randomFrom(cities);
  
  // Calculate a timestamp within the last 30 days
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - randomBetween(0, 30));
  
  // Generate a random amount between 1 and 1000
  const amount = Math.round((Math.random() * 990 + 10) * 100) / 100;
  
  // Generate risk score - make some transactions higher risk
  let riskScore = randomBetween(10, 60);
  if (Math.random() < 0.2) { // 20% chance of high risk
    riskScore = randomBetween(70, 95);
  }
  
  // For credit card payments, add last 4 digits
  const cardLast4 = paymentMethod === 'credit_card' || paymentMethod === 'debit_card' 
    ? randomBetween(1000, 9999).toString() 
    : null;
  
  return {
    user_id: userId,
    amount,
    currency,
    payment_method: paymentMethod,
    status: status as 'approved' | 'declined' | 'flagged',
    risk_score: riskScore,
    timestamp: pastDate.toISOString(),
    card_last4: cardLast4,
    merchant,
    type: type as 'payment' | 'refund' | 'payout',
    country,
    city,
    ip_address: `192.168.${randomBetween(1, 255)}.${randomBetween(1, 255)}`,
    device_info: {
      browser: randomFrom(['Chrome', 'Safari', 'Firefox', 'Edge']),
      os: randomFrom(['Windows', 'MacOS', 'iOS', 'Android']),
      device: randomFrom(['Desktop', 'Mobile', 'Tablet'])
    }
  };
};

// Generate random security alert
export const generateRandomAlert = async (userId: string, transactions: Transaction[]): Promise<Omit<SecurityAlert, 'id' | 'created_at'>> => {
  const alertTypes = ['login', 'transaction', 'settings', 'device', 'location'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['new', 'acknowledged', 'resolved', 'dismissed'];
  
  const alertType = randomFrom(alertTypes) as 'login' | 'transaction' | 'settings' | 'device' | 'location';
  const severity = randomFrom(severities) as 'low' | 'medium' | 'high' | 'critical';
  const status = randomFrom(statuses) as 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  
  // Calculate a timestamp within the last 30 days
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - randomBetween(0, 30));
  
  // Generate alert content based on type
  let title = '';
  let description = '';
  let relatedTransactionId: string | undefined;
  
  switch (alertType) {
    case 'login':
      title = 'Unusual login detected';
      description = `Login attempt from a new location: ${randomFrom(['New York', 'London', 'Tokyo', 'Sydney', 'Berlin'])}`;
      break;
    case 'transaction':
      title = 'Suspicious transaction flagged';
      if (transactions.length > 0) {
        const transaction = randomFrom(transactions);
        description = `Transaction of ${transaction.amount} ${transaction.currency} to ${transaction.merchant} has unusual patterns`;
        relatedTransactionId = transaction.id;
      } else {
        description = 'A recent transaction has unusual patterns';
      }
      break;
    case 'settings':
      title = 'Security settings changed';
      description = 'Your account security settings were modified recently';
      break;
    case 'device':
      title = 'New device detected';
      description = `Your account was accessed from a new ${randomFrom(['Windows PC', 'Mac', 'iPhone', 'Android device'])}`;
      break;
    case 'location':
      title = 'Unusual account activity';
      description = `Account accessed from ${randomFrom(['a new location', 'multiple locations', 'a foreign country'])}`;
      break;
  }
  
  return {
    user_id: userId,
    title,
    description,
    alert_type: alertType,
    severity,
    status,
    related_transaction_id: relatedTransactionId,
    timestamp: pastDate.toISOString()
  };
};

// Generate risk metrics
export const generateRiskMetrics = async (userId: string, transactions: Transaction[]): Promise<Omit<RiskMetrics, 'id' | 'created_at' | 'updated_at'>> => {
  // Calculate metrics based on transactions
  const highRiskTransactions = transactions.filter(t => t.risk_score > 70);
  const flaggedTransactions = transactions.filter(t => t.status === 'flagged');
  
  // Calculate average risk score from transactions or use a default
  let overallRiskScore = 30; // Default moderate risk
  
  if (transactions.length > 0) {
    const avgRiskScore = transactions.reduce((acc, t) => acc + t.risk_score, 0) / transactions.length;
    overallRiskScore = Math.round(avgRiskScore);
  }
  
  // Randomize the component risk scores around the overall score
  const transactionRiskScore = Math.min(100, Math.max(0, overallRiskScore + randomBetween(-15, 15)));
  const locationRiskScore = Math.min(100, Math.max(0, overallRiskScore + randomBetween(-15, 15)));
  const deviceRiskScore = Math.min(100, Math.max(0, overallRiskScore + randomBetween(-15, 15)));
  const behaviorRiskScore = Math.min(100, Math.max(0, overallRiskScore + randomBetween(-15, 15)));
  
  return {
    user_id: userId,
    overall_risk_score: overallRiskScore,
    transaction_risk_score: transactionRiskScore,
    location_risk_score: locationRiskScore,
    device_risk_score: deviceRiskScore,
    behavior_risk_score: behaviorRiskScore,
    fraud_attempts_count: highRiskTransactions.length,
    flagged_transactions_count: flaggedTransactions.length,
    calculated_at: new Date().toISOString()
  };
};

// Generate and save demo data for a user
export const generateDemoData = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user?.id) {
      console.error('User not authenticated');
      return false;
    }
    
    const userId = userData.user.id;
    
    // Check if user already has data
    const { data: existingTransactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (existingTransactions && existingTransactions.length > 0) {
      console.log('User already has data, skipping demo data generation');
      return true;
    }
    
    // Generate between 5-15 transactions
    const transactionCount = randomBetween(5, 15);
    const transactionPromises = [];
    
    for (let i = 0; i < transactionCount; i++) {
      const transaction = await generateRandomTransaction(userId);
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select();
      
      if (error) {
        console.error('Error creating transaction:', error);
      } else {
        transactionPromises.push(data[0]);
      }
    }
    
    // Wait for all transactions to be created
    const transactions = await Promise.all(transactionPromises);
    
    // Generate 2-5 security alerts
    const alertCount = randomBetween(2, 5);
    for (let i = 0; i < alertCount; i++) {
      const alert = await generateRandomAlert(userId, transactions);
      const { error } = await supabase
        .from('security_alerts')
        .insert(alert);
      
      if (error) {
        console.error('Error creating security alert:', error);
      }
    }
    
    // Generate risk metrics
    const riskMetrics = await generateRiskMetrics(userId, transactions);
    const { error: metricsError } = await supabase
      .from('risk_metrics')
      .insert(riskMetrics);
    
    if (metricsError) {
      console.error('Error creating risk metrics:', metricsError);
    }
    
    console.log('Demo data generation complete');
    return true;
  } catch (error) {
    console.error('Error generating demo data:', error);
    return false;
  }
};
