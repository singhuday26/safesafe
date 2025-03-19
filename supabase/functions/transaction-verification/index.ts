
// Transaction Verification Edge Function
// This function verifies incoming transactions and runs them through fraud detection rules

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const body = await req.json();
    const { transaction, clientInfo } = body;

    console.log("Received transaction verification request:", JSON.stringify(body, null, 2));

    if (!transaction || !transaction.account_id || !transaction.amount || !transaction.transaction_type) {
      return new Response(
        JSON.stringify({ error: "Missing required transaction data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Enhance transaction with client info
    const enhancedTransaction = {
      ...transaction,
      ip_address: clientInfo?.ip || req.headers.get("x-forwarded-for") || "unknown",
      device_info: clientInfo?.device || {},
      location_data: clientInfo?.location || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert transaction
    const { data: insertedTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(enhancedTransaction)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting transaction:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to process transaction", details: insertError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Run additional verification checks
    // 1. Check if account exists and has sufficient balance for withdrawals
    if (transaction.transaction_type === 'withdrawal' || transaction.transaction_type === 'transfer') {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance, status')
        .eq('id', transaction.account_id)
        .single();

      if (accountError || !account) {
        console.error("Account verification error:", accountError);
        return new Response(
          JSON.stringify({ error: "Account verification failed", details: accountError }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (account.status !== 'active') {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed', metadata: { reason: 'Account inactive' } })
          .eq('id', insertedTransaction.id);

        return new Response(
          JSON.stringify({ error: "Transaction failed", reason: "Account is not active" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (Math.abs(transaction.amount) > account.balance) {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed', metadata: { reason: 'Insufficient funds' } })
          .eq('id', insertedTransaction.id);

        return new Response(
          JSON.stringify({ error: "Transaction failed", reason: "Insufficient funds" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // 2. Update account balance based on transaction type
    if (insertedTransaction.status === 'completed') {
      let balanceChangeAmount = 0;
      
      switch (transaction.transaction_type) {
        case 'deposit':
          balanceChangeAmount = Math.abs(transaction.amount);
          break;
        case 'withdrawal':
        case 'payment':
          balanceChangeAmount = -Math.abs(transaction.amount);
          break;
        case 'transfer':
          // Handle sender's account (will be negative)
          balanceChangeAmount = -Math.abs(transaction.amount);
          
          // Handle recipient's account if it's internal
          if (transaction.recipient_id) {
            await supabase.rpc('update_account_balance', {
              p_account_id: transaction.recipient_id,
              p_amount: Math.abs(transaction.amount)
            });
          }
          break;
        case 'refund':
          balanceChangeAmount = Math.abs(transaction.amount);
          break;
      }
      
      // Update the account balance
      if (balanceChangeAmount !== 0) {
        await supabase.rpc('update_account_balance', {
          p_account_id: transaction.account_id,
          p_amount: balanceChangeAmount
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: insertedTransaction,
        message: insertedTransaction.status === 'flagged' 
          ? "Transaction has been flagged for review" 
          : "Transaction processed successfully"
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
