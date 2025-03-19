
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/database";
import { analyzeTransaction } from "@/services/FraudDetectionService";

// Fetch user's transactions with optional filters
export const fetchTransactions = async (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
  status?: string
): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (startDate) {
    query = query.gte('timestamp', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('timestamp', endDate.toISOString());
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as Transaction[];
};

// Fetch a single transaction by ID
export const fetchTransactionById = async (id: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return data as Transaction;
};

// Create a new transaction with fraud detection
export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'transaction_number' | 'created_at'>): Promise<Transaction | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  // Create transaction with initial risk score of 0
  const initialTransaction = {
    ...transaction,
    user_id: userData.user.id,
    risk_score: 0, // Will be updated after analysis
    is_flagged: false // Will be updated after analysis
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(initialTransaction)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  // Analyze the transaction for fraud (non-blocking)
  if (data) {
    // Run fraud detection asynchronously
    analyzeTransaction(data as Transaction).catch(err => {
      console.error('Error in transaction analysis:', err);
    });
  }

  return data as Transaction;
};

// Update transaction status
export const updateTransactionStatus = async (id: string, status: 'approved' | 'declined' | 'flagged'): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .update({ 
      status,
      is_flagged: status === 'flagged'
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating transaction status:', error);
    return false;
  }

  return true;
};

// Subscribe to real-time transaction updates
export const subscribeToTransactions = (callback: (transaction: Transaction) => void) => {
  const channel = supabase
    .channel('public:transactions')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'transactions' 
    }, (payload) => {
      callback(payload.new as Transaction);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
