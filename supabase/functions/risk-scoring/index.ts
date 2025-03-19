
// Risk Scoring Edge Function
// This function calculates detailed risk scores for transactions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Risk factors definitions
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const body = await req.json();
    const { transaction_id } = body;

    console.log(`Calculating risk score for transaction: ${transaction_id}`);

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "Missing transaction_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts(*)
      `)
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      console.error("Error fetching transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: "Transaction not found", details: transactionError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Calculate risk score components
    let riskScore = 0;
    let riskFactors = [];

    // 1. Amount-based risk
    const amount = Math.abs(transaction.amount);
    if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.HIGH) {
      riskScore += 30;
      riskFactors.push({ 
        type: "high_amount", 
        description: "Transaction amount exceeds high threshold",
        score: 30
      });
    } else if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.MEDIUM) {
      riskScore += 20;
      riskFactors.push({ 
        type: "medium_amount", 
        description: "Transaction amount exceeds medium threshold",
        score: 20
      });
    } else if (amount > RISK_FACTORS.AMOUNT_THRESHOLD.LOW) {
      riskScore += 10;
      riskFactors.push({ 
        type: "low_amount", 
        description: "Transaction amount exceeds low threshold",
        score: 10
      });
    }

    // 2. Time-based risk
    const transactionTime = new Date(transaction.created_at);
    const hour = transactionTime.getHours();
    
    if (RISK_FACTORS.TIME_PATTERNS.UNUSUAL_HOUR.includes(hour)) {
      riskScore += 25;
      riskFactors.push({ 
        type: "unusual_hour", 
        description: "Transaction occurred during unusual hours",
        score: 25
      });
    } else if (RISK_FACTORS.TIME_PATTERNS.LATE_NIGHT.includes(hour)) {
      riskScore += 15;
      riskFactors.push({ 
        type: "late_night", 
        description: "Transaction occurred during late night hours",
        score: 15
      });
    }

    // 3. Location-based risk
    if (transaction.location_data && transaction.location_data.country) {
      const country = transaction.location_data.country;
      if (RISK_FACTORS.LOCATION.HIGH_RISK_COUNTRIES.includes(country)) {
        riskScore += 40;
        riskFactors.push({ 
          type: "high_risk_location", 
          description: "Transaction from high-risk country",
          score: 40
        });
      }
    }

    // 4. Velocity check
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: recentTransactions, error: recentError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('account_id', transaction.account_id)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (!recentError && recentTransactions) {
      // Calculate total amount in last 24 hours
      const totalAmount = recentTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      
      if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY) {
        riskScore += 35;
        riskFactors.push({ 
          type: "high_velocity", 
          description: "High transaction volume in 24 hours",
          score: 35
        });
      } else if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY * 0.7) {
        riskScore += 25;
        riskFactors.push({ 
          type: "medium_velocity", 
          description: "Medium-high transaction volume in 24 hours",
          score: 25
        });
      } else if (totalAmount > RISK_FACTORS.VELOCITY.MAX_AMOUNT_PER_DAY * 0.5) {
        riskScore += 15;
        riskFactors.push({ 
          type: "low_velocity", 
          description: "Elevated transaction volume in 24 hours",
          score: 15
        });
      }
    }

    // 5. Frequency check
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { data: dayTransactions, error: dayError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', transaction.account_id)
      .gte('created_at', oneDayAgo.toISOString());
      
    const { data: hourTransactions, error: hourError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', transaction.account_id)
      .gte('created_at', oneHourAgo.toISOString());
    
    if (!dayError && dayTransactions && !hourError && hourTransactions) {
      if (dayTransactions.length >= RISK_FACTORS.FREQUENCY.MAX_TRANSACTIONS_PER_DAY) {
        riskScore += 30;
        riskFactors.push({ 
          type: "high_daily_frequency", 
          description: "Unusually high number of transactions in 24 hours",
          score: 30
        });
      }
      
      if (hourTransactions.length >= RISK_FACTORS.FREQUENCY.MAX_TRANSACTIONS_PER_HOUR) {
        riskScore += 25;
        riskFactors.push({ 
          type: "high_hourly_frequency", 
          description: "Unusually high number of transactions in 1 hour",
          score: 25
        });
      }
    }

    // Cap the risk score at 100
    riskScore = Math.min(riskScore, 100);
    
    // Update the transaction with the calculated risk score
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        risk_score: riskScore,
        status: riskScore >= 70 ? 'flagged' : transaction.status
      })
      .eq('id', transaction_id);
      
    if (updateError) {
      console.error("Error updating transaction risk score:", updateError);
    }
    
    // If high risk, create a fraud alert if one doesn't exist yet
    if (riskScore >= 70) {
      // Check if an alert already exists
      const { data: existingAlert } = await supabase
        .from('fraud_alerts')
        .select('id')
        .eq('transaction_id', transaction_id)
        .maybeSingle();
        
      if (!existingAlert) {
        // Create a new fraud alert
        const severity = riskScore >= 90 ? 'critical' : riskScore >= 80 ? 'high' : 'medium';
        const { error: alertError } = await supabase
          .from('fraud_alerts')
          .insert({
            transaction_id: transaction_id,
            detection_method: 'risk_scoring_engine',
            severity,
            details: {
              risk_score: riskScore,
              risk_factors: riskFactors,
              transaction_amount: transaction.amount,
              transaction_type: transaction.transaction_type,
              detection_timestamp: new Date().toISOString()
            }
          });
          
        if (alertError) {
          console.error("Error creating fraud alert:", alertError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          transaction_id,
          risk_score: riskScore,
          risk_factors: riskFactors,
          is_flagged: riskScore >= 70
        },
        message: "Risk score calculated successfully"
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
