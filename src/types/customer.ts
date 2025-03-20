
import { Transaction } from "./database";

export interface Customer {
  name: string;
  email: string;
}

// Extended transaction interface with frontend-specific properties
export interface ExtendedTransaction extends Transaction {
  customer?: Customer;
  // Make sure these properties mirror the ones in Transaction
  amount: number;
  currency: string;
  payment_method: string;
  paymentMethod?: string;
  riskScore?: number;
  risk_score: number;
  timestamp: string;
  status: 'approved' | 'declined' | 'flagged';
  type: 'payment' | 'refund' | 'payout';
  merchant: string;
  card_last4?: string;
  location?: {
    country?: string;
    city?: string;
  };
}
