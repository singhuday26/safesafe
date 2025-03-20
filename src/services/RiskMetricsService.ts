
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/database";
import { fetchTransactions } from "./TransactionService";

// Custom interface for frontend risk metrics (not related to DB RiskMetrics)
export interface RiskMetricsData {
  overall_risk_score: number;
  transaction_velocity: number;
  high_risk_transactions: number;
  flagged_transactions: number;
}

// Calculate risk metrics based on transaction patterns
export const calculateRiskMetrics = async (): Promise<RiskMetricsData> => {
  // Get transactions from the last 24 hours for a more comprehensive view
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const transactions = await fetchTransactions(100, twentyFourHoursAgo);
  
  // Calculate transaction velocity (transactions per hour)
  const transactionVelocity = transactions.length / 24; // Average per hour
  
  // Calculate risk score based on transaction patterns
  let overall_risk_score = 0;
  
  // Check last hour's transactions for immediate risk
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTransactions = transactions.filter(t => new Date(t.timestamp) >= oneHourAgo);
  
  if (recentTransactions.length >= 5) {
    overall_risk_score = 50; // Base risk for high transaction velocity
    
    // Additional risk factors
    const highValueTransactions = recentTransactions.filter(t => t.amount > 1000).length;
    if (highValueTransactions > 0) {
      overall_risk_score += 10;
    }
    
    // Check for unusual locations - handle differently since location might not be directly accessible
    const uniqueCountries = new Set(
      recentTransactions
        .filter(t => t.country !== undefined)
        .map(t => t.country)
    ).size;
      
    if (uniqueCountries > 2) {
      overall_risk_score += 20;
    }
  }
  
  // Cap the risk score at 100
  overall_risk_score = Math.min(overall_risk_score, 100);
  
  // Count high risk and flagged transactions from the last 24 hours
  const high_risk_transactions = transactions.filter(t => t.risk_score >= 50).length;
  const flagged_transactions = transactions.filter(t => t.status === 'flagged').length;
  
  return {
    overall_risk_score,
    transaction_velocity: Math.round(transactionVelocity * 10) / 10, // Round to 1 decimal
    high_risk_transactions,
    flagged_transactions
  };
};

// Fetch risk metrics
export const fetchRiskMetrics = async (): Promise<RiskMetricsData> => {
  return calculateRiskMetrics();
};

// Create or update risk metrics for the user
export const updateRiskMetrics = async (metrics: any): Promise<any | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  // Check if user already has risk metrics
  const { data: existingMetrics } = await supabase
    .from('risk_metrics')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  let result;
  
  if (existingMetrics) {
    // Update existing metrics
    const { data, error } = await supabase
      .from('risk_metrics')
      .update({
        ...metrics,
        updated_at: new Date().toISOString(),
        calculated_at: new Date().toISOString()
      })
      .eq('id', existingMetrics.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk metrics:', error);
      return null;
    }

    result = data;
  } else {
    // Create new metrics
    const { data, error } = await supabase
      .from('risk_metrics')
      .insert({
        ...metrics,
        user_id: userData.user.id,
        overall_risk_score: metrics.overall_risk_score || 0,
        transaction_risk_score: metrics.transaction_risk_score || 0,
        location_risk_score: metrics.location_risk_score || 0,
        device_risk_score: metrics.device_risk_score || 0,
        behavior_risk_score: metrics.behavior_risk_score || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating risk metrics:', error);
      return null;
    }

    result = data;
  }

  return result;
};

// Subscribe to risk metrics updates
export const subscribeToRiskMetrics = (callback: (metrics: RiskMetricsData) => void) => {
  // Update risk metrics every minute
  const interval = setInterval(async () => {
    const metrics = await calculateRiskMetrics();
    callback(metrics);
  }, 60 * 1000);
  
  return () => {
    clearInterval(interval);
  };
};
