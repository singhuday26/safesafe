
// Transaction Verification Edge Function
// This function verifies transactions and triggers risk scoring
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { transaction } = await req.json();
    console.log("Verifying transaction:", transaction);

    // Validate required fields
    if (!transaction.account_id || !transaction.amount || !transaction.transaction_type) {
      throw new Error("Missing required transaction fields");
    }

    // Verify account exists and has sufficient balance for debits
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', transaction.account_id)
      .single();

    if (accountError || !account) {
      throw new Error(`Account verification failed: ${accountError?.message || "Account not found"}`);
    }

    // For withdrawals, transfers, and payments, check if the account has sufficient balance
    const isDebit = ['withdrawal', 'transfer', 'payment'].includes(transaction.transaction_type);
    if (isDebit && Math.abs(Number(transaction.amount)) > account.balance) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Insufficient funds", 
          required: Math.abs(Number(transaction.amount)),
          available: account.balance
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the transaction record
    const transactionToInsert = {
      account_id: transaction.account_id,
      amount: isDebit ? -Math.abs(Number(transaction.amount)) : Math.abs(Number(transaction.amount)),
      transaction_type: transaction.transaction_type,
      status: 'pending',
      merchant: transaction.merchant || 'Unknown Merchant',
      ip_address: transaction.ip_address,
      location_data: transaction.location_data,
      device_info: transaction.device_info,
      metadata: transaction.metadata || {}
    };

    const { data: newTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(transactionToInsert)
      .select()
      .single();

    if (insertError || !newTransaction) {
      throw new Error(`Transaction creation failed: ${insertError?.message}`);
    }

    // Call risk scoring function
    const { data: riskData, error: riskError } = await supabase.functions.invoke("risk-scoring", {
      body: { transaction_id: newTransaction.id }
    });

    if (riskError) {
      console.error("Risk scoring failed:", riskError);
    }

    // If the transaction is not flagged, update the account balance
    if (!riskData || riskData.risk_score < 70) {
      const { error: balanceError } = await supabase.rpc(
        'update_account_balance',
        { 
          p_account_id: transaction.account_id,
          p_amount: isDebit ? -Math.abs(Number(transaction.amount)) : Math.abs(Number(transaction.amount)) 
        }
      );

      if (balanceError) {
        console.error("Failed to update account balance:", balanceError);
        
        // If we can't update the balance, rollback by setting the transaction to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', newTransaction.id);

        throw new Error(`Balance update failed: ${balanceError.message}`);
      }

      // Mark the transaction as completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', newTransaction.id);
    }

    // Call transaction monitor to check for patterns
    await supabase.functions.invoke("transaction-monitor", {
      body: { transaction: newTransaction }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction: newTransaction,
        risk_score: riskData?.risk_score || 0,
        risk_factors: riskData?.risk_factors || []
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in transaction verification:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
