
// Risk Scoring Edge Function
// This function calculates a risk score for transactions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Risk scoring factors and weights
const RISK_FACTORS = {
  AMOUNT: {
    HIGH: { threshold: 5000, score: 30 },
    MEDIUM: { threshold: 1000, score: 15 }
  },
  VELOCITY: {
    HIGH: { threshold: 5, score: 25 },
    MEDIUM: { threshold: 3, score: 15 }
  },
  GEO_LOCATION: {
    HIGH_RISK_COUNTRIES: ['RU', 'VE', 'IR', 'KP', 'SY'],
    SCORE: 40
  },
  NEW_ACCOUNT: {
    DAYS_THRESHOLD: 7,
    SCORE: 10
  },
  DEVICE: {
    EMULATOR: { score: 25 },
    UNKNOWN_BROWSER: { score: 15 },
    SUSPICIOUS_OS: { score: 15 }
  },
  TRANSACTION_TYPE: {
    HIGH_RISK: ['transfer', 'withdrawal'],
    SCORE: 10
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { transaction_id } = await req.json();
    console.log("Calculating risk score for transaction:", transaction_id);

    // Get the transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*, accounts!inner(*)')
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      throw new Error(`Transaction not found: ${txError?.message || "No data"}`);
    }

    // Initialize risk score and risk factors
    let riskScore = 0;
    const riskFactors = [];

    // 1. Amount factor
    const absAmount = Math.abs(Number(transaction.amount));
    if (absAmount >= RISK_FACTORS.AMOUNT.HIGH.threshold) {
      riskScore += RISK_FACTORS.AMOUNT.HIGH.score;
      riskFactors.push({
        type: 'high_amount',
        score: RISK_FACTORS.AMOUNT.HIGH.score,
        details: { amount: absAmount }
      });
    } else if (absAmount >= RISK_FACTORS.AMOUNT.MEDIUM.threshold) {
      riskScore += RISK_FACTORS.AMOUNT.MEDIUM.score;
      riskFactors.push({
        type: 'medium_amount',
        score: RISK_FACTORS.AMOUNT.MEDIUM.score,
        details: { amount: absAmount }
      });
    }

    // 2. Transaction velocity
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: transactionCount, error: countError } = await supabase.rpc(
      'count_account_transactions',
      { 
        p_account_id: transaction.account_id,
        p_start_time: oneHourAgo
      }
    );

    if (!countError && transactionCount) {
      if (transactionCount >= RISK_FACTORS.VELOCITY.HIGH.threshold) {
        riskScore += RISK_FACTORS.VELOCITY.HIGH.score;
        riskFactors.push({
          type: 'high_velocity',
          score: RISK_FACTORS.VELOCITY.HIGH.score,
          details: { transactions_per_hour: transactionCount }
        });
      } else if (transactionCount >= RISK_FACTORS.VELOCITY.MEDIUM.threshold) {
        riskScore += RISK_FACTORS.VELOCITY.MEDIUM.score;
        riskFactors.push({
          type: 'medium_velocity',
          score: RISK_FACTORS.VELOCITY.MEDIUM.score,
          details: { transactions_per_hour: transactionCount }
        });
      }
    }

    // 3. Geographical risk
    if (transaction.location_data && transaction.location_data.country) {
      const country = transaction.location_data.country;
      if (RISK_FACTORS.GEO_LOCATION.HIGH_RISK_COUNTRIES.includes(country)) {
        riskScore += RISK_FACTORS.GEO_LOCATION.SCORE;
        riskFactors.push({
          type: 'high_risk_location',
          score: RISK_FACTORS.GEO_LOCATION.SCORE,
          details: { country }
        });
      }
    }

    // 4. New account risk
    const accountCreatedAt = new Date(transaction.accounts.created_at);
    const daysSinceCreation = (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation <= RISK_FACTORS.NEW_ACCOUNT.DAYS_THRESHOLD) {
      riskScore += RISK_FACTORS.NEW_ACCOUNT.SCORE;
      riskFactors.push({
        type: 'new_account',
        score: RISK_FACTORS.NEW_ACCOUNT.SCORE,
        details: { days_since_creation: Math.round(daysSinceCreation) }
      });
    }

    // 5. Device risk
    if (transaction.device_info) {
      if (transaction.device_info.isEmulator) {
        riskScore += RISK_FACTORS.DEVICE.EMULATOR.score;
        riskFactors.push({
          type: 'emulator_detected',
          score: RISK_FACTORS.DEVICE.EMULATOR.score
        });
      }
      
      if (transaction.device_info.browser === 'Unknown Browser') {
        riskScore += RISK_FACTORS.DEVICE.UNKNOWN_BROWSER.score;
        riskFactors.push({
          type: 'unknown_browser',
          score: RISK_FACTORS.DEVICE.UNKNOWN_BROWSER.score
        });
      }
      
      if (transaction.device_info.os && transaction.device_info.os.includes('Modified')) {
        riskScore += RISK_FACTORS.DEVICE.SUSPICIOUS_OS.score;
        riskFactors.push({
          type: 'suspicious_os',
          score: RISK_FACTORS.DEVICE.SUSPICIOUS_OS.score,
          details: { os: transaction.device_info.os }
        });
      }
    }

    // 6. Transaction type risk
    if (RISK_FACTORS.TRANSACTION_TYPE.HIGH_RISK.includes(transaction.transaction_type)) {
      riskScore += RISK_FACTORS.TRANSACTION_TYPE.SCORE;
      riskFactors.push({
        type: 'high_risk_transaction_type',
        score: RISK_FACTORS.TRANSACTION_TYPE.SCORE,
        details: { transaction_type: transaction.transaction_type }
      });
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Update the transaction with the new risk score
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ risk_score: riskScore })
      .eq('id', transaction_id);

    if (updateError) {
      throw new Error(`Failed to update risk score: ${updateError.message}`);
    }

    // Create a fraud alert if the risk score is high
    if (riskScore >= 70) {
      const severity = riskScore >= 90 ? 'critical' : riskScore >= 80 ? 'high' : 'medium';
      
      const { error: alertError } = await supabase
        .from('fraud_alerts')
        .insert({
          transaction_id,
          detection_method: 'risk_scoring',
          severity,
          status: 'new',
          details: {
            risk_score: riskScore,
            risk_factors: riskFactors,
            transaction_amount: absAmount,
            transaction_type: transaction.transaction_type,
            detection_timestamp: new Date().toISOString()
          }
        });

      if (alertError) {
        console.error("Failed to create fraud alert:", alertError);
      }

      // Flag the transaction
      if (transaction.status !== 'flagged') {
        await supabase
          .from('transactions')
          .update({ status: 'flagged' })
          .eq('id', transaction_id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        risk_score: riskScore,
        risk_factors: riskFactors
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in risk scoring:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
