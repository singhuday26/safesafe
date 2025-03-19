
// Notification Dispatcher Edge Function
// This function sends alerts for suspicious activities through various channels

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// For sending emails
// This is a mock implementation - in production, integrate with SendGrid, AWS SES, etc.
async function sendEmail(to: string, subject: string, body: string) {
  console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}, Body: ${body}`);
  // In production, implement actual email sending logic
  return true;
}

// For sending SMS
// This is a mock implementation - in production, integrate with Twilio, etc.
async function sendSMS(to: string, message: string) {
  console.log(`[SMS MOCK] To: ${to}, Message: ${message}`);
  // In production, implement actual SMS sending logic
  return true;
}

// For sending push notifications
// This is a mock implementation - in production, integrate with Firebase, OneSignal, etc.
async function sendPushNotification(userId: string, title: string, body: string) {
  console.log(`[PUSH MOCK] To User: ${userId}, Title: ${title}, Body: ${body}`);
  // In production, implement actual push notification logic
  return true;
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
    const { alert_id, notification_types = ['email', 'sms', 'push'] } = body;

    console.log(`Processing notifications for alert: ${alert_id}`);

    if (!alert_id) {
      return new Response(
        JSON.stringify({ error: "Missing alert_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch the alert with related transaction and account info
    const { data: alert, error: alertError } = await supabase
      .from('fraud_alerts')
      .select(`
        *,
        transactions!inner(*,
          accounts!inner(
            *,
            users!inner(*)
          )
        )
      `)
      .eq('id', alert_id)
      .single();

    if (alertError || !alert) {
      console.error("Error fetching alert:", alertError);
      return new Response(
        JSON.stringify({ error: "Alert not found", details: alertError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Extract relevant information
    const transaction = alert.transactions;
    const account = transaction.accounts;
    const user = account.users;
    
    const results = {
      email: false,
      sms: false,
      push: false
    };

    // Prepare notification content
    const alertSeverity = alert.severity.toUpperCase();
    const transactionAmount = Math.abs(transaction.amount);
    const transactionType = transaction.transaction_type;
    const merchantOrRecipient = transaction.metadata?.merchant || "Unknown Merchant";
    
    const notificationTitle = `${alertSeverity} Risk Alert: Suspicious ${transactionType}`;
    const notificationBody = `We detected a suspicious ${transactionType} of ${transactionAmount} to ${merchantOrRecipient}. Please review this transaction immediately.`;

    // Send email notification if requested
    if (notification_types.includes('email')) {
      // In production, get the actual email from user preferences
      const userEmail = user.email;
      if (userEmail) {
        results.email = await sendEmail(
          userEmail,
          notificationTitle,
          `Dear ${user.full_name},\n\n${notificationBody}\n\nIf you did not authorize this transaction, please contact our security team immediately.\n\nSecuraSentry Security Team`
        );
      }
    }

    // Send SMS notification if requested
    if (notification_types.includes('sms')) {
      // In production, get the phone number from user preferences
      const userPhone = user.phone_number || "123456789"; // Mock phone number
      if (userPhone) {
        results.sms = await sendSMS(
          userPhone,
          `SecuraSentry Alert: ${notificationBody} Reply HELP for assistance.`
        );
      }
    }

    // Send push notification if requested
    if (notification_types.includes('push')) {
      results.push = await sendPushNotification(
        user.id,
        notificationTitle,
        notificationBody
      );
    }

    // Log the notification in audit logs
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'notification_sent',
        resource_type: 'fraud_alert',
        resource_id: alert.id,
        metadata: {
          notification_types: notification_types,
          results: results,
          alert_severity: alert.severity,
          transaction_id: transaction.id
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          alert_id,
          notification_results: results
        },
        message: "Notifications dispatched successfully"
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
