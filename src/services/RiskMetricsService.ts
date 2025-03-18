
import { supabase } from "@/integrations/supabase/client";
import { RiskMetrics } from "@/types/database";

// Fetch user's risk metrics
export const fetchRiskMetrics = async (): Promise<RiskMetrics | null> => {
  const { data, error } = await supabase
    .from('risk_metrics')
    .select('*')
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching risk metrics:', error);
    return null;
  }

  return data as RiskMetrics;
};

// Create or update risk metrics for the user
export const updateRiskMetrics = async (metrics: Partial<RiskMetrics>): Promise<RiskMetrics | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  // Check if user already has risk metrics
  const { data: existingMetrics } = await supabase
    .from('risk_metrics')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  let result;
  
  if (existingMetrics) {
    // Update existing metrics
    const { data, error } = await supabase
      .from('risk_metrics')
      .update({
        ...metrics,
        updated_at: new Date().toISOString(),
        calculated_at: new Date().toISOString()
      })
      .eq('id', existingMetrics.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk metrics:', error);
      return null;
    }

    result = data;
  } else {
    // Create new metrics
    const { data, error } = await supabase
      .from('risk_metrics')
      .insert({
        ...metrics,
        user_id: userData.user.id,
        overall_risk_score: metrics.overall_risk_score || 0,
        transaction_risk_score: metrics.transaction_risk_score || 0,
        location_risk_score: metrics.location_risk_score || 0,
        device_risk_score: metrics.device_risk_score || 0,
        behavior_risk_score: metrics.behavior_risk_score || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating risk metrics:', error);
      return null;
    }

    result = data;
  }

  return result as RiskMetrics;
};

// Subscribe to real-time risk metrics updates
export const subscribeToRiskMetrics = (callback: (metrics: RiskMetrics) => void) => {
  const channel = supabase
    .channel('public:risk_metrics')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'risk_metrics' 
    }, (payload) => {
      callback(payload.new as RiskMetrics);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
