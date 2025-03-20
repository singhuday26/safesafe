
import { Transaction } from "./database";

export interface Customer {
  name: string;
  email: string;
}

// Extended transaction interface with frontend-specific properties
export interface ExtendedTransaction extends Transaction {
  customer?: Customer;
  paymentMethod?: string;
  riskScore?: number;
  location?: {
    country?: string;
    city?: string;
  };
}
