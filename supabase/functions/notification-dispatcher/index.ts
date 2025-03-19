
// Notification Dispatcher Edge Function
// This function sends alerts for suspicious activities
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
    const { alert_id } = await req.json();
    console.log("Processing notification for alert:", alert_id);

    // Get the alert details
    const { data: alert, error: alertError } = await supabase
      .from('fraud_alerts')
      .select(`
        *,
        transactions!inner(
          *,
          accounts!inner(
            *,
            users!inner(*)
          )
        )
      `)
      .eq('id', alert_id)
      .single();

    if (alertError || !alert) {
      throw new Error(`Alert not found: ${alertError?.message || "No data"}`);
    }

    // Get user settings to check notification preferences
    const user_id = alert.transactions.accounts.user_id;
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (settingsError) {
      console.error("Failed to get user settings:", settingsError);
    }

    // Prepare notification data
    const notificationData = {
      user_id,
      alert_id,
      transaction_id: alert.transaction_id,
      severity: alert.severity,
      title: getSeverityTitle(alert.severity),
      message: buildAlertMessage(alert),
      email_sent: false,
      sms_sent: false,
      push_sent: false,
      created_at: new Date().toISOString()
    };

    // Send appropriate notifications based on user preferences
    // In a real app, you would integrate with email, SMS, and push notification services
    
    // 1. Simulate email notification
    if (!userSettings || userSettings.notification_email) {
      console.log(`EMAIL NOTIFICATION to user ${user_id}:`, {
        subject: notificationData.title,
        body: notificationData.message
      });
      
      notificationData.email_sent = true;
      
      // Record sent email in audit log
      await supabase.rpc(
        'log_audit',
        { 
          p_user_id: user_id,
          p_action: 'email_notification_sent',
          p_resource_type: 'fraud_alert',
          p_resource_id: alert_id,
          p_metadata: { alert_severity: alert.severity }
        }
      );
    }
    
    // 2. Simulate SMS notification for high and critical alerts
    if ((!userSettings || userSettings.notification_sms) && 
        (alert.severity === 'high' || alert.severity === 'critical')) {
      console.log(`SMS NOTIFICATION to user ${user_id}:`, {
        message: `${notificationData.title}: ${notificationData.message.substring(0, 100)}...`
      });
      
      notificationData.sms_sent = true;
      
      // Record sent SMS in audit log
      await supabase.rpc(
        'log_audit',
        { 
          p_user_id: user_id,
          p_action: 'sms_notification_sent',
          p_resource_type: 'fraud_alert',
          p_resource_id: alert_id,
          p_metadata: { alert_severity: alert.severity }
        }
      );
    }
    
    // 3. Simulate push notification
    if (!userSettings || userSettings.notification_push) {
      console.log(`PUSH NOTIFICATION to user ${user_id}:`, {
        title: notificationData.title,
        body: notificationData.message.substring(0, 150) + "..."
      });
      
      notificationData.push_sent = true;
      
      // Record sent push notification in audit log
      await supabase.rpc(
        'log_audit',
        { 
          p_user_id: user_id,
          p_action: 'push_notification_sent',
          p_resource_type: 'fraud_alert',
          p_resource_id: alert_id,
          p_metadata: { alert_severity: alert.severity }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications: notificationData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notification dispatcher:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper functions
function getSeverityTitle(severity) {
  switch (severity) {
    case 'critical':
      return 'CRITICAL FRAUD ALERT';
    case 'high':
      return 'High Priority Security Alert';
    case 'medium':
      return 'Security Alert';
    case 'low':
      return 'Potential Security Concern';
    default:
      return 'Security Notification';
  }
}

function buildAlertMessage(alert) {
  const transaction = alert.transactions;
  const account = transaction.accounts;
  const amount = Math.abs(Number(transaction.amount));
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(amount);
  
  let message = '';
  
  switch (alert.detection_method) {
    case 'risk_scoring':
      message = `A ${transaction.transaction_type} transaction for ${formattedAmount} has been flagged with a high risk score of ${alert.details.risk_score}`;
      break;
    case 'velocity_pattern':
      message = `Unusual activity detected: Multiple transactions (${alert.details.transaction_count}) within a short time period (${alert.details.time_span_minutes} minutes)`;
      break;
    case 'structuring_pattern':
      message = `Potential structuring detected: Multiple small transactions totaling ${formattedAmount}`;
      break;
    case 'geographical_anomaly':
      message = `Transaction from unusual location detected: ${alert.details.current_location.country}`;
      break;
    default:
      message = `Suspicious transaction of ${formattedAmount} has been detected`;
  }
  
  message += `. Transaction occurred on ${new Date(transaction.created_at).toLocaleString()}.`;
  
  if (alert.severity === 'critical' || alert.severity === 'high') {
    message += " Please review this transaction immediately and contact support if you did not authorize it.";
  } else {
    message += " Please review this transaction and report if unauthorized.";
  }
  
  return message;
}
