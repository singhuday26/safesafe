import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/database";
import { toast } from "sonner";
import { measureOperationTime, getRiskLevel } from "@/utils/fraudDetectionUtils";

// Factors for risk scoring
const RISK_FACTORS = {
  AMOUNT_THRESHOLD: {
    HIGH: 5000,
    MEDIUM: 1000,
    LOW: 100
  },
  TIME_PATTERNS: {
    UNUSUAL_HOUR: [0, 1, 2, 3, 4, 5], // Hours that are considered unusual (0-5 AM)
    LATE_NIGHT: [22, 23], // Hours that are considered late night
  },
  LOCATION: {
    HIGH_RISK_COUNTRIES: ["RU", "NG", "CN", "VE"], // Example high-risk countries
  },
  FREQUENCY: {
    MAX_TRANSACTIONS_PER_DAY: 15, // Consider suspicious if more than this
    MAX_TRANSACTIONS_PER_HOUR: 5, // Consider suspicious if more than this in an hour
  },
  VELOCITY: {
    MAX_AMOUNT_PER_DAY: 10000, // Maximum amount per day before flagging
  }
};

// Analyze a transaction for fraud risk
export const analyzeTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    const startTime = measureOperationTime("Starting fraud analysis");
    
    console.log(`Starting fraud analysis for transaction ${transaction.id}`);
    
    // Calculate initial risk score based on various factors
    const initialRiskScore = await calculateInitialRiskScore(transaction);
    
    // Update transaction with risk score
    await updateTransactionRiskScore(transaction.id, initialRiskScore);
    
    // If high risk, create security alert
    if (initialRiskScore > 70) {
      await createSecurityAlertForTransaction(transaction, initialRiskScore);
      toast.error("High risk transaction detected", {
        description: `Transaction to ${transaction.merchant} has triggered our fraud detection systems.`
      });
    }
    
    // Update overall risk metrics
    await updateRiskMetrics(transaction, initialRiskScore);
    
    measureOperationTime("Full transaction analysis", startTime);
    
    return initialRiskScore > 70; // Return true if high risk
  } catch (error) {
    console.error("Error analyzing transaction:", error);
    return false;
  }
};

// Calculate initial risk score for a transaction
const calculateInitialRiskScore = async (transaction: Transaction): Promise<number> => {
  const startTime = measureOperationTime("Risk score calculation");
  
  let riskScore = 0;
  
  // Amount based scoring
  riskScore += scoreBasedOnAmount(transaction.amount);
  
  // Time based scoring
  riskScore += scoreBasedOnTime(new Date(transaction.timestamp));
  
  // Location based scoring
  if (transaction.country) {
    riskScore += scoreBasedOnLocation(transaction.country);
  }
  
  // Velocity scoring
  const velocityScore = await scoreBasedOnVelocity(transaction);
  riskScore += velocityScore;
  
  // Frequency scoring
  const frequencyScore = await scoreBasedOnFrequency(transaction);
  riskScore += frequencyScore;
  
  // Device scoring (if device info is available)
  if (transaction.device_info) {
    riskScore += scoreBasedOnDevice(transaction.device_info);
  }
  
  // Merchant risk scoring
  riskScore += await scoreBasedOnMerchant(transaction.merchant);
  
  // Payment method risk scoring
  riskScore += scoreBasedOnPaymentMethod(transaction.payment_method);
  
  // Limit the risk score to 0-100 range
  riskScore = Math.max(0, Math.min(100, riskScore));
  
  measureOperationTime("Risk score calculation", startTime);
  
  console.log(`Calculated risk score for transaction ${transaction.id}: ${riskScore}`);
  
  return Math.round(riskScore);
};

// Score based on transaction amount
const scoreBasedOnAmount = (amount: number): number => {
  if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.HIGH) return 30;
  if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.MEDIUM) return 20;
  if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.LOW) return 10;
  return 0;
};

// Score based on time of day
const scoreBasedOnTime = (timestamp: Date): number => {
  const hour = timestamp.getHours();
  
  if (RISK_FACTORS.TIME_PATTERNS.UNUSUAL_HOUR.includes(hour)) return 25;
  if (RISK_FACTORS.TIME_PATTERNS.LATE_NIGHT.includes(hour)) return 15;
  
  return 0;
};

// Score based on location
const scoreBasedOnLocation = (country: string): number => {
  if (RISK_FACTORS.LOCATION.HIGH_RISK_COUNTRIES.includes(country)) return 40;
  return 0;
};

// Score based on transaction velocity
const scoreBasedOnVelocity = async (transaction: Transaction): Promise<number> => {
  try {
    // Get transaction amount sum for the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', transaction.user_id)
      .gte('timestamp', oneDayAgo.toISOString())
      .lt('timestamp', transaction.timestamp);
      
    if (error) throw error;
    
    const totalAmount = data.reduce((sum, tx) => sum + Number(tx.amount), 0) + Number(transaction.amount);
    
    if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY) return 35;
    if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY * 0.7) return 25;
    if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY * 0.5) return 15;
    
    return 0;
  } catch (error) {
    console.error("Error calculating velocity score:", error);
    return 0;
  }
};

// Score based on transaction frequency
const scoreBasedOnFrequency = async (transaction: Transaction): Promise<number> => {
  try {
    // Get transactions in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: dayData, error: dayError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', transaction.user_id)
      .gte('timestamp', oneDayAgo.toISOString());
      
    if (dayError) throw dayError;
    
    // Get transactions in the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { data: hourData, error: hourError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', transaction.user_id)
      .gte('timestamp', oneHourAgo.toISOString());
      
    if (hourError) throw hourError;
    
    let score = 0;
    
    if (dayData.length >= RISK_FACTORS.FREQUENCY.MAX_TRANSACTIONS_PER_DAY) score += 30;
    if (hourData.length >= RISK_FACTORS.FREQUENCY.MAX_TRANSACTIONS_PER_HOUR) score += 25;
    
    return score;
  } catch (error) {
    console.error("Error calculating frequency score:", error);
    return 0;
  }
};

// Score based on device information
const scoreBasedOnDevice = (deviceInfo: any): number => {
  let score = 0;
  
  // Check if this is a new device
  if (deviceInfo.isNewDevice) score += 20;
  
  // Check if device is using proxy or VPN
  if (deviceInfo.isProxy || deviceInfo.isVpn) score += 30;
  
  // Check if device is emulated
  if (deviceInfo.isEmulator) score += 35;
  
  // Check if browser has suspicious fingerprint
  if (deviceInfo.isSuspiciousFingerprint) score += 25;
  
  return score;
};

// Score based on merchant reputation
const scoreBasedOnMerchant = async (merchant: string): Promise<number> => {
  // In a real system, this would check against a database of high-risk merchants
  // For demo purposes, we'll use a simple check
  const highRiskMerchants = ["Unknown Vendor", "Crypto Exchange", "High Stakes Gambling"];
  
  if (highRiskMerchants.includes(merchant)) return 25;
  
  return 0;
};

// Score based on payment method
const scoreBasedOnPaymentMethod = (paymentMethod: string): number => {
  // Different payment methods have different risk profiles
  if (paymentMethod === "cryptocurrency") return 30;
  if (paymentMethod === "wire transfer") return 20;
  if (paymentMethod === "digital wallet") return 15;
  if (paymentMethod === "credit card") return 10;
  if (paymentMethod === "debit card") return 5;
  
  return 15; // Default for unknown payment methods
};

// Update transaction with calculated risk score
const updateTransactionRiskScore = async (transactionId: string, riskScore: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({ 
        risk_score: riskScore,
        status: riskScore > 70 ? 'flagged' : 'approved'
      })
      .eq('id', transactionId);
      
    if (error) throw error;
    
    console.log(`Updated transaction ${transactionId} with risk score ${riskScore}`);
  } catch (error) {
    console.error("Error updating transaction risk score:", error);
  }
};

// Create security alert for high-risk transaction
const createSecurityAlertForTransaction = async (transaction: Transaction, riskScore: number): Promise<void> => {
  try {
    const severity = getRiskLevel(riskScore);
    
    const alertData = {
      title: `Suspicious ${transaction.type} transaction detected`,
      description: `A ${severity} risk transaction to ${transaction.merchant} for ${transaction.amount} ${transaction.currency} has been flagged by our system.`,
      alert_type: 'suspicious_transaction',
      severity,
      related_transaction_id: transaction.id,
      user_id: transaction.user_id,
      status: 'new'
    };
    
    const { error } = await supabase
      .from('security_alerts')
      .insert(alertData);
      
    if (error) throw error;
    
    console.log(`Created security alert for transaction ${transaction.id}`);
  } catch (error) {
    console.error("Error creating security alert:", error);
  }
};

// Update overall risk metrics for user
const updateRiskMetrics = async (transaction: Transaction, riskScore: number): Promise<void> => {
  try {
    // Get current risk metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('risk_metrics')
      .select('*')
      .eq('user_id', transaction.user_id)
      .maybeSingle();
      
    if (metricsError) throw metricsError;
    
    // If no metrics exist, create new ones
    if (!metricsData) {
      // Create initial risk metrics
      const initialMetrics = {
        user_id: transaction.user_id,
        overall_risk_score: riskScore,
        transaction_risk_score: riskScore,
        location_risk_score: transaction.country ? 50 : 0,
        device_risk_score: transaction.device_info ? 50 : 0,
        behavior_risk_score: 50,
        flagged_transactions_count: riskScore > 70 ? 1 : 0,
        fraud_attempts_count: 0,
        calculated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('risk_metrics')
        .insert(initialMetrics);
        
      if (error) throw error;
      
      console.log(`Created new risk metrics for user ${transaction.user_id}`);
      return;
    }
    
    // Update existing metrics with weighted average
    const updatedMetrics = {
      transaction_risk_score: Math.round((metricsData.transaction_risk_score * 0.7) + (riskScore * 0.3)),
      flagged_transactions_count: riskScore > 70 
        ? metricsData.flagged_transactions_count + 1 
        : metricsData.flagged_transactions_count,
      calculated_at: new Date().toISOString()
    };
    
    // Calculate overall risk score (weighted average of all risk scores)
    const overallScore = Math.round(
      (updatedMetrics.transaction_risk_score * 0.4) + 
      (metricsData.location_risk_score * 0.2) + 
      (metricsData.device_risk_score * 0.2) + 
      (metricsData.behavior_risk_score * 0.2)
    );
    
    // Update the overall risk score
    updatedMetrics['overall_risk_score'] = overallScore;
    
    // Update the risk metrics
    const { error } = await supabase
      .from('risk_metrics')
      .update(updatedMetrics)
      .eq('id', metricsData.id);
      
    if (error) throw error;
    
    console.log(`Updated risk metrics for user ${transaction.user_id}`);
  } catch (error) {
    console.error("Error updating risk metrics:", error);
  }
};
