
import { Tables } from "@/integrations/supabase/types";

// Define Transaction from Supabase database
export type Transaction = Tables<"transactions">; 

export interface Customer {
  name: string;
  email: string;
}

// Extended transaction interface with frontend-specific properties
export interface ExtendedTransaction extends Omit<Transaction, 'card_last4' | 'city' | 'country' | 'ip_address' | 'device_info'> {
  customer?: Customer;
  paymentMethod?: string;
  riskScore?: number;
  
  // Optional fields from Transaction that need to remain optional
  card_last4?: string;
  city?: string;
  country?: string;
  ip_address?: string;
  device_info?: any;
  
  // Location object for UI rendering
  location?: {
    country?: string;
    city?: string;
  };
}
