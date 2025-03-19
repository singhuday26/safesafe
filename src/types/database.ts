
export interface Transaction {
  id: string;
  user_id: string;
  transaction_number: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'approved' | 'declined' | 'flagged';
  risk_score: number;
  timestamp: string;
  card_last4?: string;
  merchant: string;
  type: 'payment' | 'refund' | 'payout';
  country?: string;
  city?: string;
  ip_address?: string;
  device_info?: any;
  created_at: string;
  category?: string;
  is_flagged?: boolean;
}

export interface SecurityAlert {
  id: string;
  user_id: string;
  title: string;
  description: string;
  alert_type: 'login' | 'transaction' | 'settings' | 'device' | 'location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  related_transaction_id?: string;
  timestamp: string;
  created_at: string;
  is_resolved?: boolean;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  security_level: 'low' | 'medium' | 'high';
  two_factor_enabled: boolean;
  login_alerts_enabled: boolean;
  transaction_alerts_enabled: boolean;
  location_tracking_enabled: boolean;
  created_at: string;
  updated_at: string;
  theme?: 'light' | 'dark' | 'system';
  alert_thresholds?: {
    transaction: number;
    login: number;
    device: number;
  };
}

export interface RiskMetrics {
  id: string;
  user_id: string;
  overall_risk_score: number;
  transaction_risk_score: number;
  location_risk_score: number;
  device_risk_score: number;
  behavior_risk_score: number;
  fraud_attempts_count: number;
  flagged_transactions_count: number;
  calculated_at: string;
  created_at: string;
  updated_at: string;
  unusual_activity_count?: number;
  last_assessment_date?: string;
}

export interface SecurityTip {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
  created_at: string;
  updated_at: string;
}
