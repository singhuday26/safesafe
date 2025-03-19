
import { Transaction, RiskMetrics } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { measurePerformance } from "@/utils/performanceMonitoring";

// Risk factors and their weights
const RISK_FACTORS = {
  AMOUNT_THRESHOLD: { weight: 0.3, threshold: 1000 }, // Large transaction amount
  UNUSUAL_LOCATION: { weight: 0.25 }, // Transaction from unusual location
  UNUSUAL_TIME: { weight: 0.2 }, // Transaction at unusual time
  FREQUENCY: { weight: 0.15 }, // Many transactions in short time
  NEW_MERCHANT: { weight: 0.1 }, // Transaction with new merchant
};

// Analyzes a transaction and returns a risk score (0-100)
export const analyzeTransaction = async (transaction: Transaction): Promise<number> => {
  const endMeasure = measurePerformance("analyzeTransaction");
  try {
    // Get user's transaction history for pattern analysis
    const { data: userTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', transaction.user_id)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    const riskFactors: { factor: string; score: number }[] = [];
    let totalRiskScore = 0;
    
    // 1. Check for large transaction amount
    if (transaction.amount > RISK_FACTORS.AMOUNT_THRESHOLD.threshold) {
      const amountRisk = Math.min(
        (transaction.amount / RISK_FACTORS.AMOUNT_THRESHOLD.threshold) * 30, 
        100
      );
      riskFactors.push({ factor: 'large_amount', score: amountRisk });
      totalRiskScore += amountRisk * RISK_FACTORS.AMOUNT_THRESHOLD.weight;
    }
    
    // 2. Check for unusual location
    if (transaction.country && userTransactions) {
      const uniqueCountries = new Set(userTransactions.map(t => t.country).filter(Boolean));
      
      if (!uniqueCountries.has(transaction.country) && uniqueCountries.size > 0) {
        const locationRisk = 80; // High risk for transactions from new countries
        riskFactors.push({ factor: 'unusual_location', score: locationRisk });
        totalRiskScore += locationRisk * RISK_FACTORS.UNUSUAL_LOCATION.weight;
      }
    }
    
    // 3. Check for transaction velocity (many transactions in short time)
    if (userTransactions && userTransactions.length > 0) {
      const now = new Date(transaction.timestamp);
      const recentTransactions = userTransactions.filter(t => {
        const transDate = new Date(t.timestamp);
        // Transactions in the last hour
        return (now.getTime() - transDate.getTime()) < 60 * 60 * 1000;
      });
      
      if (recentTransactions.length > 3) {
        const frequencyRisk = Math.min(recentTransactions.length * 15, 100);
        riskFactors.push({ factor: 'high_frequency', score: frequencyRisk });
        totalRiskScore += frequencyRisk * RISK_FACTORS.FREQUENCY.weight;
      }
    }
    
    // 4. Check for new merchant
    if (transaction.merchant && userTransactions) {
      const knownMerchants = new Set(userTransactions.map(t => t.merchant));
      if (!knownMerchants.has(transaction.merchant)) {
        const merchantRisk = 40; // Moderate risk for new merchants
        riskFactors.push({ factor: 'new_merchant', score: merchantRisk });
        totalRiskScore += merchantRisk * RISK_FACTORS.NEW_MERCHANT.weight;
      }
    }
    
    // 5. Apply an overall risk adjustment based on user's risk profile
    const { data: riskMetrics } = await supabase
      .from('risk_metrics')
      .select('*')
      .eq('user_id', transaction.user_id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (riskMetrics) {
      // Adjust by a factor of the user's overall risk score, but with a dampening effect
      const userRiskAdjustment = (riskMetrics.overall_risk_score / 100) * 0.2;
      totalRiskScore = totalRiskScore * (1 + userRiskAdjustment);
    }
    
    // Cap the final score at 100
    const finalRiskScore = Math.min(Math.round(totalRiskScore), 100);
    
    // Check if transaction is high risk and should be flagged
    const shouldFlagTransaction = finalRiskScore > 70;
    
    // Asynchronously update the transaction with the risk score and flag status
    updateTransactionRiskData(transaction.id, finalRiskScore, shouldFlagTransaction);
    
    // Update risk metrics asynchronously
    updateUserRiskMetrics(transaction.user_id, finalRiskScore, riskFactors);
    
    // Create security alert for high-risk transactions
    if (shouldFlagTransaction) {
      createSecurityAlert(transaction, finalRiskScore, riskFactors);
    }
    
    endMeasure();
    return finalRiskScore;
    
  } catch (error) {
    console.error('Error in transaction analysis:', error);
    endMeasure();
    return 30; // Default moderate risk score in case of analysis failure
  }
};

// Update transaction with risk score and flag status
const updateTransactionRiskData = async (
  transactionId: string, 
  riskScore: number, 
  isFlagged: boolean
): Promise<void> => {
  try {
    await supabase
      .from('transactions')
      .update({ 
        risk_score: riskScore,
        is_flagged: isFlagged,
        status: isFlagged ? 'flagged' : 'approved'
      })
      .eq('id', transactionId);
  } catch (error) {
    console.error('Error updating transaction risk data:', error);
  }
};

// Update user risk metrics based on new transaction analysis
const updateUserRiskMetrics = async (
  userId: string,
  transactionRiskScore: number,
  riskFactors: { factor: string; score: number }[]
): Promise<void> => {
  try {
    // Get current risk metrics
    const { data: currentMetrics } = await supabase
      .from('risk_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!currentMetrics) {
      // Create new risk metrics if none exist
      await supabase.from('risk_metrics').insert({
        user_id: userId,
        overall_risk_score: transactionRiskScore,
        transaction_risk_score: transactionRiskScore,
        location_risk_score: riskFactors.find(f => f.factor === 'unusual_location')?.score || 0,
        device_risk_score: 0,
        behavior_risk_score: riskFactors.find(f => f.factor === 'high_frequency')?.score || 0,
        flagged_transactions_count: transactionRiskScore > 70 ? 1 : 0,
        fraud_attempts_count: 0,
        calculated_at: new Date().toISOString(),
        unusual_activity_count: riskFactors.length,
        last_assessment_date: new Date().toISOString()
      });
      return;
    }
    
    // Calculate new scores with smoothing (70% old, 30% new)
    const newTransactionRiskScore = Math.round(
      currentMetrics.transaction_risk_score * 0.7 + transactionRiskScore * 0.3
    );
    
    const locationFactor = riskFactors.find(f => f.factor === 'unusual_location');
    const newLocationRiskScore = locationFactor 
      ? Math.round(currentMetrics.location_risk_score * 0.7 + locationFactor.score * 0.3)
      : currentMetrics.location_risk_score;
    
    const frequencyFactor = riskFactors.find(f => f.factor === 'high_frequency');
    const newBehaviorRiskScore = frequencyFactor
      ? Math.round(currentMetrics.behavior_risk_score * 0.7 + frequencyFactor.score * 0.3)
      : currentMetrics.behavior_risk_score;
    
    // Calculate overall risk as weighted average of component scores
    const newOverallRiskScore = Math.round(
      newTransactionRiskScore * 0.4 +
      newLocationRiskScore * 0.25 +
      currentMetrics.device_risk_score * 0.15 +
      newBehaviorRiskScore * 0.2
    );
    
    // Update risk metrics
    await supabase
      .from('risk_metrics')
      .update({
        overall_risk_score: newOverallRiskScore,
        transaction_risk_score: newTransactionRiskScore,
        location_risk_score: newLocationRiskScore,
        behavior_risk_score: newBehaviorRiskScore,
        flagged_transactions_count: currentMetrics.flagged_transactions_count + (transactionRiskScore > 70 ? 1 : 0),
        calculated_at: new Date().toISOString(),
        unusual_activity_count: (currentMetrics.unusual_activity_count || 0) + (riskFactors.length > 0 ? 1 : 0),
        last_assessment_date: new Date().toISOString()
      })
      .eq('id', currentMetrics.id);
    
  } catch (error) {
    console.error('Error updating user risk metrics:', error);
  }
};

// Create a security alert for high-risk transactions
const createSecurityAlert = async (
  transaction: Transaction,
  riskScore: number,
  riskFactors: { factor: string; score: number }[]
): Promise<void> => {
  try {
    // Generate a descriptive message based on risk factors
    const riskDescriptions: Record<string, string> = {
      large_amount: `Unusually large transaction amount of ${transaction.amount} ${transaction.currency}`,
      unusual_location: `Transaction from unusual location: ${transaction.country || 'Unknown'}`,
      high_frequency: 'Unusually high number of transactions in a short time period',
      new_merchant: `First transaction with merchant: ${transaction.merchant}`
    };
    
    const descriptions = riskFactors.map(factor => riskDescriptions[factor.factor]).filter(Boolean);
    const description = `Risk score: ${riskScore}. Risk factors: ${descriptions.join('; ')}`;
    
    await supabase.from('security_alerts').insert({
      user_id: transaction.user_id,
      title: `Suspicious transaction detected: ${transaction.merchant}`,
      description,
      alert_type: 'transaction',
      severity: riskScore > 85 ? 'critical' : riskScore > 70 ? 'high' : 'medium',
      status: 'new',
      related_transaction_id: transaction.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating security alert:', error);
  }
};

// Analysis interface for exposed details
export interface TransactionAnalysis {
  riskScore: number;
  riskFactors: { factor: string; score: number; description: string }[];
  isFlagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Get detailed transaction analysis
export const getDetailedTransactionAnalysis = async (transaction: Transaction): Promise<TransactionAnalysis> => {
  const riskScore = transaction.risk_score;
  
  // Reconstruct risk factors based on transaction data
  const riskFactors: { factor: string; score: number; description: string }[] = [];
  
  if (transaction.amount > RISK_FACTORS.AMOUNT_THRESHOLD.threshold) {
    riskFactors.push({ 
      factor: 'large_amount', 
      score: Math.min((transaction.amount / RISK_FACTORS.AMOUNT_THRESHOLD.threshold) * 30, 100),
      description: `Unusually large transaction amount of ${transaction.amount} ${transaction.currency}`
    });
  }
  
  // Add other detected risk factors based on available data
  if (transaction.country) {
    const { data: userTransactions } = await supabase
      .from('transactions')
      .select('country')
      .eq('user_id', transaction.user_id)
      .not('id', 'eq', transaction.id)
      .order('timestamp', { ascending: false })
      .limit(20);
    
    if (userTransactions) {
      const uniqueCountries = new Set(userTransactions.map(t => t.country).filter(Boolean));
      if (!uniqueCountries.has(transaction.country) && uniqueCountries.size > 0) {
        riskFactors.push({ 
          factor: 'unusual_location', 
          score: 80,
          description: `Transaction from unusual location: ${transaction.country}`
        });
      }
    }
  }
  
  // Determine severity level
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore > 85) severity = 'critical';
  else if (riskScore > 70) severity = 'high';
  else if (riskScore > 40) severity = 'medium';
  
  return {
    riskScore,
    riskFactors,
    isFlagged: transaction.is_flagged || false,
    severity
  };
};

// Analyze user behavior for anomalies
export const analyzeUserBehavior = async (userId: string): Promise<{ score: number; anomalies: string[] }> => {
  try {
    // Get user's transaction history
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (!transactions || transactions.length < 5) {
      return { score: 10, anomalies: [] }; // Not enough data for meaningful analysis
    }
    
    const anomalies: string[] = [];
    let behaviorRiskScore = 0;
    
    // 1. Check transaction time patterns
    const hourCounts: Record<number, number> = {};
    transactions.forEach(t => {
      const hour = new Date(t.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find unusual transaction hours (hours with only 1 transaction when user typically transacts during other hours)
    const unusualHours = Object.entries(hourCounts)
      .filter(([_, count]) => count === 1)
      .map(([hour]) => parseInt(hour));
    
    if (unusualHours.length > 2) {
      anomalies.push('Transactions at unusual hours');
      behaviorRiskScore += 20;
    }
    
    // 2. Check for transaction amount anomalies
    const amounts = transactions.map(t => t.amount);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length
    );
    
    const outlierThreshold = avgAmount + 2 * stdDev;
    const amountOutliers = transactions.filter(t => t.amount > outlierThreshold);
    
    if (amountOutliers.length > 0) {
      anomalies.push('Unusually large transaction amounts');
      behaviorRiskScore += 15 * Math.min(amountOutliers.length, 4);
    }
    
    // 3. Check for sudden changes in transaction frequency
    // Simplified: compare recent transactions (last week) to overall pattern
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentTransactions = transactions.filter(
      t => new Date(t.timestamp) >= oneWeekAgo
    );
    
    const historicalTransactionsPerWeek = (transactions.length - recentTransactions.length) / 
      Math.max((new Date(transactions[transactions.length - 1].timestamp).getTime() - 
      oneWeekAgo.getTime()) / (7 * 24 * 60 * 60 * 1000), 1);
    
    if (recentTransactions.length > historicalTransactionsPerWeek * 2) {
      anomalies.push('Sudden increase in transaction frequency');
      behaviorRiskScore += 25;
    }
    
    // Cap score at 100
    behaviorRiskScore = Math.min(behaviorRiskScore, 100);
    
    return {
      score: behaviorRiskScore,
      anomalies
    };
    
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    return { score: 10, anomalies: ['Analysis error'] };
  }
};

// Measure performance for this function
const measurePerformance = (functionName: string) => {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    console.log(`[FraudDetection] ${functionName} execution time: ${(endTime - startTime).toFixed(2)}ms`);
  };
};
