
// Transaction Monitor Edge Function
// This function monitors transactions in real-time for potential fraud
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
    console.log("Processing transaction:", transaction.id);

    // Skip if the transaction is already flagged
    if (transaction.status === 'flagged') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Transaction already flagged, skipping checks" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Check for velocity patterns
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: velocityPatterns, error: velocityError } = await supabase.rpc(
      'get_velocity_patterns',
      { 
        p_timeframe: oneHourAgo,
        p_min_transactions: 3
      }
    );
    
    if (velocityError) {
      console.error("Velocity pattern check error:", velocityError);
    } else if (velocityPatterns && velocityPatterns.length > 0) {
      console.log("Velocity patterns detected:", velocityPatterns);

      // Create fraud alert for velocity pattern
      for (const pattern of velocityPatterns) {
        if (pattern.transaction_ids.includes(transaction.id)) {
          await supabase.from('fraud_alerts').insert({
            transaction_id: transaction.id,
            detection_method: 'velocity_pattern',
            severity: 'medium',
            status: 'new',
            details: {
              pattern_type: 'velocity',
              transaction_count: pattern.transaction_count,
              time_span_minutes: pattern.time_span_minutes,
              total_amount: pattern.total_amount,
              transaction_ids: pattern.transaction_ids,
              description: pattern.description
            }
          });

          // Flag the transaction
          await supabase
            .from('transactions')
            .update({ status: 'flagged' })
            .eq('id', transaction.id);
        }
      }
    }

    // 2. Check for structuring patterns (multiple small transactions)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { data: structuringPatterns, error: structuringError } = await supabase.rpc(
      'get_structuring_patterns',
      { 
        p_timeframe: threeDaysAgo,
        p_min_transactions: 5,
        p_max_amount: 1000
      }
    );
    
    if (structuringError) {
      console.error("Structuring pattern check error:", structuringError);
    } else if (structuringPatterns && structuringPatterns.length > 0) {
      console.log("Structuring patterns detected:", structuringPatterns);

      // Create fraud alert for structuring pattern
      for (const pattern of structuringPatterns) {
        if (pattern.transaction_ids.includes(transaction.id)) {
          await supabase.from('fraud_alerts').insert({
            transaction_id: transaction.id,
            detection_method: 'structuring_pattern',
            severity: 'high',
            status: 'new',
            details: {
              pattern_type: 'structuring',
              transaction_count: pattern.transaction_count,
              total_amount: pattern.total_amount,
              transaction_ids: pattern.transaction_ids,
              description: pattern.description
            }
          });

          // Flag the transaction
          await supabase
            .from('transactions')
            .update({ status: 'flagged' })
            .eq('id', transaction.id);
        }
      }
    }

    // 3. Check for geographical anomalies
    if (transaction.ip_address && transaction.location_data) {
      const { data: recentTransactions, error: geoError } = await supabase
        .from('transactions')
        .select('location_data, created_at')
        .eq('account_id', transaction.account_id)
        .neq('id', transaction.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (geoError) {
        console.error("Geo anomaly check error:", geoError);
      } else if (recentTransactions && recentTransactions.length > 0) {
        // Check if current country is different from previous transactions
        const currentCountry = transaction.location_data.country;
        const previousCountries = recentTransactions
          .filter(t => t.location_data && t.location_data.country)
          .map(t => t.location_data.country);
        
        // If we have previous country data and current country is different
        if (previousCountries.length > 0 && !previousCountries.includes(currentCountry)) {
          console.log("Geographical anomaly detected:", currentCountry, "vs", previousCountries);
          
          await supabase.from('fraud_alerts').insert({
            transaction_id: transaction.id,
            detection_method: 'geographical_anomaly',
            severity: 'high',
            status: 'new',
            details: {
              current_location: transaction.location_data,
              previous_locations: recentTransactions.map(t => t.location_data),
              description: `Transaction from new location (${currentCountry}) detected`
            }
          });

          // Flag the transaction
          await supabase
            .from('transactions')
            .update({ status: 'flagged' })
            .eq('id', transaction.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Transaction monitoring completed" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in transaction monitor:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
