
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '../client';
import { Transaction } from '@/types/database';
import { getRiskLevel, getRiskColor } from '@/utils/fraudDetectionUtils';

// Define types for our fraud detection system
export interface RiskScore {
  overall: number;
  categories: {
    amount: number;
    velocity: number;
    location: number;
    behavior: number;
    device: number;
  };
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  description: string;
  impact: number;
  category: 'amount' | 'velocity' | 'location' | 'behavior' | 'device';
}

export interface FraudAlert {
  id: string;
  transaction_id: string;
  detection_method: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  details: any;
  created_at: string;
  updated_at: string;
  resolved_by?: string;
  resolution_notes?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  condition_json: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Mock data for development and testing
const generateMockRiskProfile = (userId: string) => ({
  id: `risk_${userId}`,
  user_id: userId,
  overall_risk_score: Math.floor(Math.random() * 100),
  transaction_risk_score: Math.floor(Math.random() * 100),
  location_risk_score: Math.floor(Math.random() * 100),
  device_risk_score: Math.floor(Math.random() * 100),
  behavior_risk_score: Math.floor(Math.random() * 100),
  fraud_attempts_count: Math.floor(Math.random() * 5),
  flagged_transactions_count: Math.floor(Math.random() * 10),
  calculated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const generateMockFraudAlert = (userId: string, transactionId: string, index: number): FraudAlert => ({
  id: `alert_${index}`,
  transaction_id: transactionId,
  detection_method: ['unusual_amount', 'velocity_check', 'location_anomaly', 'device_fingerprint'][index % 4],
  severity: ['low', 'medium', 'high', 'critical'][index % 4] as 'low' | 'medium' | 'high' | 'critical',
  status: ['new', 'investigating', 'resolved', 'false_positive'][index % 4] as 'new' | 'investigating' | 'resolved' | 'false_positive',
  details: {
    risk_factors: [
      {
        type: 'amount_threshold',
        score: 25,
        details: { threshold: '$1000', actual: '$2500' }
      },
      {
        type: 'velocity_check',
        score: 15,
        details: { threshold: '3 per hour', actual: '5 per hour' }
      }
    ],
    description: 'Multiple risk factors triggered for this transaction'
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const generateMockTransactions = (userId: string, count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    transactions.push({
      id: `txn_${i}`,
      user_id: userId,
      transaction_number: `TX-${100000 + i}`,
      amount: Math.floor(Math.random() * 1000) + 50,
      currency: 'USD',
      payment_method: ['credit_card', 'paypal', 'bank_transfer', 'crypto'][i % 4],
      status: ['approved', 'declined', 'flagged'][i % 3] as 'approved' | 'declined' | 'flagged',
      risk_score: Math.floor(Math.random() * 100),
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      created_at: new Date(Date.now() - i * 3600000).toISOString(),
      merchant: ['Amazon', 'eBay', 'Walmart', 'Apple', 'Target'][i % 5],
      type: ['payment', 'refund', 'payout'][i % 3] as 'payment' | 'refund' | 'payout',
      city: ['New York', 'San Francisco', 'Chicago', 'Miami', 'Seattle'][i % 5],
      country: 'US',
      card_last4: Math.floor(1000 + Math.random() * 9000).toString(),
      ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      device_info: { os: 'iOS', browser: 'Safari', device: 'iPhone' }
    });
  }
  return transactions;
};

// Hook to get user's risk profile
export const useRiskProfile = (userId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['riskProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const { data, error } = await supabase
          .from('risk_metrics')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (error) throw error;
        return data;
      } catch (err) {
        console.log('Using mock data for risk profile');
        return generateMockRiskProfile(userId);
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
  
  return {
    riskProfile: data,
    isLoading,
    error,
    refetch,
    riskLevel: data ? getRiskLevel(data.overall_risk_score) : 'unknown',
    riskColor: data ? getRiskColor(data.overall_risk_score) : 'bg-gray-500 text-gray-500'
  };
};

// Hook to get recent transactions with risk scores
export const useRecentRiskyTransactions = (userId?: string, limit: number = 10) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['riskyTransactions', userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('risk_score', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        return data;
      } catch (err) {
        console.log('Using mock data for transactions');
        return generateMockTransactions(userId, limit);
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  return {
    transactions: data || [],
    isLoading,
    error,
    refetch,
    highRiskCount: data ? data.filter(t => t.risk_score >= 70).length : 0,
    mediumRiskCount: data ? data.filter(t => t.risk_score >= 40 && t.risk_score < 70).length : 0
  };
};

// Hook to get fraud alerts for a user
export const useFraudAlerts = (userId?: string, status?: string) => {
  const [mockAlerts, setMockAlerts] = useState<any[]>([]);
  
  useEffect(() => {
    if (userId) {
      // Generate mock fraud alerts
      const alerts = Array(5).fill(0).map((_, i) => 
        generateMockFraudAlert(userId, `txn_${i}`, i)
      );
      setMockAlerts(alerts);
    }
  }, [userId]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['fraudAlerts', userId, status],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        // In a real implementation, we'd query the fraud_alerts table
        // Since we're using mock data, return the mock alerts
        return mockAlerts.map(alert => ({
          ...alert,
          transaction: generateMockTransactions(userId, 1)[0]
        }));
      } catch (err) {
        console.log('Using mock data for fraud alerts');
        return mockAlerts.map(alert => ({
          ...alert,
          transaction: generateMockTransactions(userId, 1)[0]
        }));
      }
    },
    enabled: !!userId && mockAlerts.length > 0,
    staleTime: 30 * 1000, // 30 seconds for fraud alerts
  });
  
  return {
    alerts: data || [],
    isLoading,
    error,
    refetch,
    criticalCount: data ? data.filter(a => a.severity === 'critical').length : 0,
    highCount: data ? data.filter(a => a.severity === 'high').length : 0,
    mediumCount: data ? data.filter(a => a.severity === 'medium').length : 0,
    lowCount: data ? data.filter(a => a.severity === 'low').length : 0
  };
};

// Hook to update fraud alert status
export const useUpdateFraudAlertStatus = () => {
  return useMutation({
    mutationFn: async ({ 
      alertId, 
      status, 
      notes 
    }: { 
      alertId: string; 
      status: 'investigating' | 'resolved' | 'false_positive'; 
      notes?: string;
    }) => {
      // In a real implementation, we'd update the fraud_alerts table
      // For mock purposes, just log and return
      console.log(`Updating alert ${alertId} to status ${status}`);
      
      return {
        id: alertId,
        status: status,
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      toast.success('Alert Updated', {
        description: `Fraud alert status updated to ${data.status}`
      });
    },
    onError: (error) => {
      toast.error('Error Updating Alert', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};

// Main hook that combines fraud detection capabilities
export const useFraudDetection = (userId?: string) => {
  const riskProfile = useRiskProfile(userId);
  const riskyTransactions = useRecentRiskyTransactions(userId);
  const fraudAlerts = useFraudAlerts(userId);
  const updateAlertStatus = useUpdateFraudAlertStatus();
  
  return {
    riskProfile,
    riskyTransactions,
    fraudAlerts,
    updateAlertStatus,
    
    // Check if there are any critical alerts that need attention
    hasCriticalAlerts: fraudAlerts.alerts.some(alert => 
      alert.severity === 'critical' && alert.status === 'new'
    ),
    
    // Get system status
    systemStatus: {
      alertsRequiringAttention: fraudAlerts.alerts.filter(a => a.status === 'new').length,
      highRiskTransactionsToday: riskyTransactions.transactions.filter(
        t => t.risk_score >= 70 && new Date(t.created_at).toDateString() === new Date().toDateString()
      ).length,
      overallRiskScore: riskProfile.riskProfile?.overall_risk_score || 0,
      riskLevel: riskProfile.riskLevel
    }
  };
};
