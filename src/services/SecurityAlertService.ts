
import { supabase } from "@/integrations/supabase/client";
import { SecurityAlert } from "@/types/database";

// Fetch user's security alerts
export const fetchSecurityAlerts = async (
  limit: number = 10,
  status?: string
): Promise<SecurityAlert[]> => {
  let query = supabase
    .from('security_alerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching security alerts:', error);
    return [];
  }

  return data as SecurityAlert[];
};

// Create a new security alert
export const createSecurityAlert = async (alert: Omit<SecurityAlert, 'id' | 'user_id' | 'created_at' | 'timestamp'>): Promise<SecurityAlert | null> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('security_alerts')
    .insert({
      ...alert,
      user_id: userData.user.id,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating security alert:', error);
    return null;
  }

  return data as SecurityAlert;
};

// Update security alert status
export const updateAlertStatus = async (id: string, status: 'acknowledged' | 'resolved' | 'dismissed'): Promise<boolean> => {
  const { error } = await supabase
    .from('security_alerts')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating alert status:', error);
    return false;
  }

  return true;
};

// Subscribe to real-time security alert updates
export const subscribeToSecurityAlerts = (callback: (alert: SecurityAlert) => void) => {
  const channel = supabase
    .channel('public:security_alerts')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'security_alerts' 
    }, (payload) => {
      callback(payload.new as SecurityAlert);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
