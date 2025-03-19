
// External API Connector Edge Function
// This function connects to external fraud detection services
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
    const { service, action, data } = await req.json();
    console.log(`Connecting to external service: ${service}, action: ${action}`);

    // Define supported external services
    const supportedServices = ['ip_intelligence', 'aml_screening', 'device_fingerprinting', 'ml_risk_assessment'];
    
    if (!supportedServices.includes(service)) {
      throw new Error(`Unsupported service: ${service}`);
    }

    // Mock responses for different services
    // In a real application, these would be actual API calls to external services
    let serviceResponse;

    switch (service) {
      case 'ip_intelligence':
        serviceResponse = await mockIpIntelligence(data.ip_address);
        break;
      case 'aml_screening':
        serviceResponse = await mockAmlScreening(data.name, data.country);
        break;
      case 'device_fingerprinting':
        serviceResponse = await mockDeviceFingerprinting(data.device_info);
        break;
      case 'ml_risk_assessment':
        serviceResponse = await mockMlRiskAssessment(data.transaction_data);
        break;
      default:
        throw new Error(`Unsupported service: ${service}`);
    }

    // If action is analyze_transaction, update transaction with external service data
    if (action === 'analyze_transaction' && data.transaction_id) {
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('metadata')
        .eq('id', data.transaction_id)
        .single();

      if (!txError) {
        // Update transaction metadata with external service results
        const updatedMetadata = {
          ...transaction.metadata,
          external_services: {
            ...(transaction.metadata?.external_services || {}),
            [service]: {
              timestamp: new Date().toISOString(),
              results: serviceResponse
            }
          }
        };

        await supabase
          .from('transactions')
          .update({ metadata: updatedMetadata })
          .eq('id', data.transaction_id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        service,
        action,
        results: serviceResponse
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in external API connector:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Mock external service functions
async function mockIpIntelligence(ip) {
  // In a real app, this would call an actual IP intelligence service API
  console.log(`IP Intelligence check for: ${ip}`);
  
  // For demo purposes, certain IPs are considered suspicious
  const isVpn = ip.startsWith('185.') || ip.includes('.42');
  const isTor = ip.includes('.73.') || ip.includes('.101.');
  const isProxy = ip.includes('.156.') || ip.includes('.22.');
  
  // Generate fake geolocation data
  let country, city, isp;
  if (ip.startsWith('185.')) {
    country = 'RU';
    city = 'Moscow';
    isp = 'ShadowNet Ltd';
  } else if (ip.includes('.73.')) {
    country = 'VE';
    city = 'Caracas';
    isp = 'Anonymous Hosting Inc';
  } else {
    country = 'US';
    city = 'New York';
    isp = 'Legitimate ISP Co';
  }
  
  return {
    ip,
    country,
    city,
    isp,
    is_vpn: isVpn,
    is_tor: isTor,
    is_proxy: isProxy,
    risk_score: isVpn || isTor || isProxy ? 85 : 20,
    last_seen: new Date().toISOString()
  };
}

async function mockAmlScreening(name, country) {
  // In a real app, this would call an AML/sanctions screening service
  console.log(`AML Screening for: ${name} from ${country}`);
  
  // For demo purposes, certain names trigger matches
  const isSanctioned = name?.toLowerCase().includes('suspicious') || 
                       name?.toLowerCase().includes('risk');
  
  const isPep = name?.toLowerCase().includes('official') || 
                name?.toLowerCase().includes('politician');
  
  // High-risk countries for AML purposes
  const highRiskCountries = ['RU', 'IR', 'KP', 'SY', 'VE'];
  const isHighRiskCountry = highRiskCountries.includes(country);
  
  return {
    name,
    matches_found: isSanctioned || isPep,
    sanction_lists: isSanctioned ? ['OFAC', 'EU Consolidated'] : [],
    pep_status: isPep,
    high_risk_country: isHighRiskCountry,
    risk_score: (isSanctioned ? 90 : 0) + (isPep ? 60 : 0) + (isHighRiskCountry ? 40 : 0),
    screened_at: new Date().toISOString()
  };
}

async function mockDeviceFingerprinting(deviceInfo) {
  // In a real app, this would call a device fingerprinting service
  console.log(`Device Fingerprinting for:`, deviceInfo);
  
  // Generate fake device risk assessment
  const isEmulator = deviceInfo?.isEmulator || deviceInfo?.browser === 'Unknown Browser';
  const isSuspiciousOs = deviceInfo?.os?.includes('Modified');
  const hasInconsistentTimezone = Math.random() > 0.7; // Random for demo
  
  return {
    device_hash: crypto.randomUUID(), // Fake unique device ID
    is_emulator: isEmulator,
    is_rooted: isSuspiciousOs,
    is_vpn: Math.random() > 0.8,
    timezone_mismatch: hasInconsistentTimezone,
    browser_fingerprint: {
      canvas_fingerprint: crypto.randomUUID().substring(0, 16),
      webgl_fingerprint: crypto.randomUUID().substring(0, 16),
      fonts_fingerprint: crypto.randomUUID().substring(0, 16),
    },
    risk_factors: [
      ...(isEmulator ? ['EMULATOR_DETECTED'] : []),
      ...(isSuspiciousOs ? ['MODIFIED_OS'] : []),
      ...(hasInconsistentTimezone ? ['TIMEZONE_MISMATCH'] : [])
    ],
    risk_score: (isEmulator ? 80 : 0) + (isSuspiciousOs ? 60 : 0) + (hasInconsistentTimezone ? 30 : 0),
    confidence: 0.95
  };
}

async function mockMlRiskAssessment(transactionData) {
  // In a real app, this would call a machine learning risk assessment API
  console.log(`ML Risk Assessment for transaction:`, transactionData);
  
  const amount = transactionData?.amount || 0;
  const transactionType = transactionData?.transaction_type || 'unknown';
  
  // Generate fake ML model predictions
  const isHighRiskAmount = amount > 5000;
  const isHighRiskType = ['transfer', 'withdrawal'].includes(transactionType);
  
  // Calculate risk scores and probabilities
  const fraudProbability = isHighRiskAmount ? 0.7 : isHighRiskType ? 0.5 : 0.1;
  const moneyLaunderingProbability = isHighRiskAmount && isHighRiskType ? 0.6 : 0.05;
  
  // For demo purposes, randomize slightly
  const randomizedFraudProb = Math.min(Math.max(fraudProbability + (Math.random() * 0.2 - 0.1), 0), 1);
  const randomizedMlProb = Math.min(Math.max(moneyLaunderingProbability + (Math.random() * 0.2 - 0.1), 0), 1);
  
  return {
    model_version: "FraudDetect-v3.2",
    predictions: {
      fraud_probability: randomizedFraudProb,
      money_laundering_probability: randomizedMlProb,
      account_takeover_probability: Math.random() * 0.3
    },
    risk_factors: [
      ...(randomizedFraudProb > 0.5 ? [{ name: 'HIGH_FRAUD_PROBABILITY', score: Math.round(randomizedFraudProb * 100) }] : []),
      ...(randomizedMlProb > 0.4 ? [{ name: 'POTENTIAL_MONEY_LAUNDERING', score: Math.round(randomizedMlProb * 100) }] : []),
      ...(isHighRiskAmount ? [{ name: 'UNUSUAL_AMOUNT', score: 75 }] : []),
      ...(isHighRiskType ? [{ name: 'HIGH_RISK_TRANSACTION_TYPE', score: 60 }] : [])
    ],
    explanation: {
      top_features: [
        { name: 'transaction_amount', importance: 0.4, value: amount },
        { name: 'transaction_type', importance: 0.3, value: transactionType },
        { name: 'account_age_days', importance: 0.2, value: transactionData?.accountAgeDays || 30 },
        { name: 'country_risk', importance: 0.1, value: transactionData?.countryRisk || 'low' }
      ]
    },
    risk_score: Math.round((randomizedFraudProb * 70) + (randomizedMlProb * 30)),
    confidence: 0.85,
    processing_time_ms: Math.floor(Math.random() * 100) + 50
  };
}
