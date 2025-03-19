
// External API Connector Edge Function
// This function integrates with third-party fraud detection APIs

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock implementation of external API calls
// In production, these would be actual API calls to services like Plaid, Stripe, etc.
async function checkExternalSources(transactionData: any) {
  console.log("Checking external sources for transaction:", transactionData.id);
  
  const results = {
    ip_reputation: await mockCheckIPReputation(transactionData.ip_address),
    device_reputation: await mockCheckDeviceReputation(transactionData.device_info),
    aml_check: await mockPerformAMLCheck(transactionData),
    sanctions_check: await mockCheckSanctions(transactionData)
  };
  
  return results;
}

async function mockCheckIPReputation(ip: string) {
  // Simulate API call to IP reputation service
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency
  
  // For demo purposes, flag IPs with specific patterns
  const isSuspicious = ip && (
    ip.startsWith('185.') || 
    ip.includes('42') || 
    Math.random() < 0.05 // 5% random flag rate
  );
  
  return {
    is_proxy: isSuspicious,
    is_tor: Math.random() < 0.02,
    risk_score: isSuspicious ? 75 + Math.floor(Math.random() * 25) : Math.floor(Math.random() * 30),
    country: isSuspicious ? "RU" : "US"
  };
}

async function mockCheckDeviceReputation(deviceInfo: any) {
  // Simulate API call to device reputation service
  await new Promise(resolve => setTimeout(resolve, 250)); // Simulate network latency
  
  const isSuspicious = Math.random() < 0.1; // 10% suspicious rate
  
  return {
    is_emulator: isSuspicious && Math.random() < 0.4,
    is_rooted: isSuspicious && Math.random() < 0.3,
    is_new_device: !deviceInfo || Math.random() < 0.2,
    has_malware: isSuspicious && Math.random() < 0.1,
    risk_score: isSuspicious ? 65 + Math.floor(Math.random() * 35) : Math.floor(Math.random() * 40)
  };
}

async function mockPerformAMLCheck(transactionData: any) {
  // Simulate API call to AML service
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network latency
  
  // High amount transactions have higher chance of AML flag
  const amount = Math.abs(transactionData.amount);
  const isSuspicious = amount > 10000 || Math.random() < 0.08; // 8% base flag rate
  
  return {
    is_suspicious: isSuspicious,
    risk_level: isSuspicious ? "high" : "low",
    risk_score: isSuspicious ? 70 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 40),
    reasons: isSuspicious ? ["unusual_pattern", "high_amount"] : []
  };
}

async function mockCheckSanctions(transactionData: any) {
  // Simulate API call to sanctions list
  await new Promise(resolve => setTimeout(resolve, 350)); // Simulate network latency
  
  const isSanctioned = Math.random() < 0.03; // 3% sanction rate for demo
  
  return {
    is_sanctioned: isSanctioned,
    sanctioned_by: isSanctioned ? ["OFAC"] : [],
    risk_score: isSanctioned ? 100 : Math.floor(Math.random() * 20)
  };
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

    // Get the request body
    const body = await req.json();
    const { transaction_id, checks = ['ip', 'device', 'aml', 'sanctions'] } = body;

    console.log(`Performing external checks for transaction: ${transaction_id}`);

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: "Missing transaction_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (transactionError || !transaction) {
      console.error("Error fetching transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: "Transaction not found", details: transactionError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Perform external checks
    const externalCheckResults = await checkExternalSources(transaction);
    
    // Calculate overall risk from external checks
    let externalRiskScore = 0;
    let riskFactors = [];
    
    // IP reputation check
    if (checks.includes('ip') && externalCheckResults.ip_reputation) {
      const ipScore = externalCheckResults.ip_reputation.risk_score;
      externalRiskScore += ipScore * 0.25; // 25% weight
      
      if (ipScore > 50) {
        riskFactors.push({
          type: "suspicious_ip",
          description: "IP address has suspicious reputation",
          score: ipScore
        });
      }
      
      if (externalCheckResults.ip_reputation.is_proxy) {
        riskFactors.push({
          type: "proxy_detected",
          description: "Transaction initiated through proxy",
          score: 70
        });
        externalRiskScore += 70 * 0.1; // Additional 10% weight
      }
      
      if (externalCheckResults.ip_reputation.is_tor) {
        riskFactors.push({
          type: "tor_detected",
          description: "Transaction initiated through TOR network",
          score: 90
        });
        externalRiskScore += 90 * 0.15; // Additional 15% weight
      }
    }
    
    // Device reputation check
    if (checks.includes('device') && externalCheckResults.device_reputation) {
      const deviceScore = externalCheckResults.device_reputation.risk_score;
      externalRiskScore += deviceScore * 0.25; // 25% weight
      
      if (deviceScore > 50) {
        riskFactors.push({
          type: "suspicious_device",
          description: "Device has suspicious characteristics",
          score: deviceScore
        });
      }
      
      if (externalCheckResults.device_reputation.is_emulator) {
        riskFactors.push({
          type: "emulator_detected",
          description: "Transaction initiated from emulated device",
          score: 80
        });
        externalRiskScore += 80 * 0.1; // Additional 10% weight
      }
      
      if (externalCheckResults.device_reputation.is_rooted) {
        riskFactors.push({
          type: "rooted_device",
          description: "Transaction initiated from jailbroken/rooted device",
          score: 75
        });
        externalRiskScore += 75 * 0.1; // Additional 10% weight
      }
    }
    
    // AML check
    if (checks.includes('aml') && externalCheckResults.aml_check) {
      const amlScore = externalCheckResults.aml_check.risk_score;
      externalRiskScore += amlScore * 0.25; // 25% weight
      
      if (externalCheckResults.aml_check.is_suspicious) {
        riskFactors.push({
          type: "aml_flag",
          description: "Transaction flagged by AML checks",
          score: amlScore,
          reasons: externalCheckResults.aml_check.reasons
        });
      }
    }
    
    // Sanctions check
    if (checks.includes('sanctions') && externalCheckResults.sanctions_check) {
      const sanctionsScore = externalCheckResults.sanctions_check.risk_score;
      externalRiskScore += sanctionsScore * 0.25; // 25% weight
      
      if (externalCheckResults.sanctions_check.is_sanctioned) {
        riskFactors.push({
          type: "sanctions_match",
          description: "Match found on sanctions list",
          score: 100,
          sanctions: externalCheckResults.sanctions_check.sanctioned_by
        });
      }
    }
    
    // Average the scores and cap at 100
    externalRiskScore = Math.min(Math.round(externalRiskScore), 100);
    
    // Update transaction with external API results
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        metadata: {
          ...transaction.metadata,
          external_checks: externalCheckResults,
          external_risk_score: externalRiskScore,
          external_risk_factors: riskFactors,
          checked_at: new Date().toISOString()
        }
      })
      .eq('id', transaction_id);
      
    if (updateError) {
      console.error("Error updating transaction with external checks:", updateError);
    }
    
    // If high risk from external sources, create or update a fraud alert
    if (externalRiskScore >= 70) {
      // Check if an alert already exists
      const { data: existingAlert } = await supabase
        .from('fraud_alerts')
        .select('id, details')
        .eq('transaction_id', transaction_id)
        .maybeSingle();
        
      if (existingAlert) {
        // Update existing alert
        const { error: alertUpdateError } = await supabase
          .from('fraud_alerts')
          .update({
            details: {
              ...existingAlert.details,
              external_checks: externalCheckResults,
              external_risk_score: externalRiskScore,
              external_risk_factors: riskFactors,
              updated_at: new Date().toISOString()
            }
          })
          .eq('id', existingAlert.id);
          
        if (alertUpdateError) {
          console.error("Error updating fraud alert:", alertUpdateError);
        }
      } else {
        // Create a new fraud alert
        const severity = externalRiskScore >= 90 ? 'critical' : externalRiskScore >= 80 ? 'high' : 'medium';
        const { error: alertError } = await supabase
          .from('fraud_alerts')
          .insert({
            transaction_id: transaction_id,
            detection_method: 'external_api',
            severity,
            details: {
              external_checks: externalCheckResults,
              external_risk_score: externalRiskScore,
              external_risk_factors: riskFactors,
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
          external_check_results: externalCheckResults,
          risk_score: externalRiskScore,
          risk_factors: riskFactors
        },
        message: "External API checks completed successfully"
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
