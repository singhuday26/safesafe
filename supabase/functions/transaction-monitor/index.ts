
// Transaction Monitor Edge Function
// This function periodically checks for suspicious patterns in recent transactions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Transaction monitoring patterns
const MONITORING_PATTERNS = {
  // Structuring pattern (multiple small transactions to avoid detection)
  STRUCTURING: {
    MIN_TRANSACTIONS: 3,
    MAX_AMOUNT: 3000,
    TIMEFRAME_HOURS: 24
  },
  // Velocity pattern (rapid succession of transactions)
  VELOCITY: {
    MIN_TRANSACTIONS: 3,
    TIMEFRAME_MINUTES: 30
  },
  // Round amount pattern (suspicious even amounts)
  ROUND_AMOUNTS: {
    THRESHOLD: 1000
  }
};

// Function to detect structuring pattern (multiple small transactions)
async function detectStructuring(supabase) {
  const timeframe = new Date();
  timeframe.setHours(timeframe.getHours() - MONITORING_PATTERNS.STRUCTURING.TIMEFRAME_HOURS);
  
  const { data, error } = await supabase.rpc('get_structuring_patterns', {
    p_timeframe: timeframe.toISOString(),
    p_min_transactions: MONITORING_PATTERNS.STRUCTURING.MIN_TRANSACTIONS,
    p_max_amount: MONITORING_PATTERNS.STRUCTURING.MAX_AMOUNT
  });
  
  if (error) {
    console.error("Error detecting structuring patterns:", error);
    return [];
  }
  
  return data || [];
}

// Function to detect velocity pattern (rapid succession of transactions)
async function detectVelocity(supabase) {
  const timeframe = new Date();
  timeframe.setMinutes(timeframe.getMinutes() - MONITORING_PATTERNS.VELOCITY.TIMEFRAME_MINUTES);
  
  const { data, error } = await supabase.rpc('get_velocity_patterns', {
    p_timeframe: timeframe.toISOString(),
    p_min_transactions: MONITORING_PATTERNS.VELOCITY.MIN_TRANSACTIONS
  });
  
  if (error) {
    console.error("Error detecting velocity patterns:", error);
    return [];
  }
  
  return data || [];
}

// Function to detect round amount transactions
async function detectRoundAmounts(supabase) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, 
      amount, 
      transaction_type, 
      status, 
      created_at,
      accounts!inner(
        id, 
        user_id
      )
    `)
    .gte('amount', MONITORING_PATTERNS.ROUND_AMOUNTS.THRESHOLD)
    .eq('status', 'completed')
    .filter('amount', 'eq', 'floor(amount)')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error("Error detecting round amount patterns:", error);
    return [];
  }
  
  return data || [];
}

// Create a fraud alert for detected patterns
async function createPatternAlert(supabase, pattern, transactions, patternType) {
  // Get the first transaction to use as the primary reference
  const primaryTransaction = transactions[0];
  
  // Create the alert
  const { data, error } = await supabase
    .from('fraud_alerts')
    .insert({
      transaction_id: primaryTransaction.id,
      detection_method: 'pattern_recognition',
      severity: 'medium',
      details: {
        pattern_type: patternType,
        pattern_description: pattern.description,
        transactions: transactions.map(t => t.id),
        total_amount: pattern.total_amount,
        detection_timestamp: new Date().toISOString()
      }
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating pattern alert:", error);
    return null;
  }
  
  return data;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting transaction pattern monitoring...");
    
    // Detect structuring patterns
    const structuringPatterns = await detectStructuring(supabase);
    console.log(`Detected ${structuringPatterns.length} structuring patterns`);
    
    // Detect velocity patterns
    const velocityPatterns = await detectVelocity(supabase);
    console.log(`Detected ${velocityPatterns.length} velocity patterns`);
    
    // Detect round amount patterns
    const roundAmountTransactions = await detectRoundAmounts(supabase);
    console.log(`Detected ${roundAmountTransactions.length} round amount transactions`);
    
    // Process and create alerts
    const alerts = [];
    
    // Create alerts for structuring patterns
    for (const pattern of structuringPatterns) {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .in('id', pattern.transaction_ids);
        
      if (!error && transactions) {
        const alert = await createPatternAlert(
          supabase, 
          pattern, 
          transactions, 
          'structuring'
        );
        
        if (alert) alerts.push(alert);
      }
    }
    
    // Create alerts for velocity patterns
    for (const pattern of velocityPatterns) {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .in('id', pattern.transaction_ids);
        
      if (!error && transactions) {
        const alert = await createPatternAlert(
          supabase, 
          pattern, 
          transactions, 
          'velocity'
        );
        
        if (alert) alerts.push(alert);
      }
    }
    
    // Create alerts for suspicious round amounts
    if (roundAmountTransactions.length > 0) {
      // Group by account
      const accountGroups = {};
      
      for (const tx of roundAmountTransactions) {
        const accountId = tx.accounts.id;
        if (!accountGroups[accountId]) {
          accountGroups[accountId] = [];
        }
        accountGroups[accountId].push(tx);
      }
      
      // Create an alert for each account with round amount transactions
      for (const [accountId, transactions] of Object.entries(accountGroups)) {
        if (transactions.length >= 2) { // Only alert if multiple round transactions
          const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
          
          const pattern = {
            description: "Multiple transactions with suspiciously round amounts",
            total_amount: totalAmount,
            transaction_count: transactions.length
          };
          
          const alert = await createPatternAlert(
            supabase, 
            pattern, 
            transactions, 
            'round_amounts'
          );
          
          if (alert) alerts.push(alert);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          patterns_detected: {
            structuring: structuringPatterns.length,
            velocity: velocityPatterns.length,
            round_amounts: roundAmountTransactions.length
          },
          alerts_created: alerts.length
        },
        message: "Transaction monitoring completed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
