
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SecurityAlert } from '@/types/database';
import { getSeverityVariant } from '@/utils/formatters';

interface UseFraudAlertsOptions {
  onNewAlert?: (alert: SecurityAlert) => void;
  userId?: string;
  limit?: number;
}

export const useRealtimeFraudAlerts = ({ 
  onNewAlert, 
  userId,
  limit = 5
}: UseFraudAlertsOptions = {}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial alerts
  useEffect(() => {
    const fetchInitialAlerts = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('security_alerts')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(limit);
          
        if (error) {
          console.error('Error fetching security alerts:', error);
          return;
        }
        
        setAlerts(data as SecurityAlert[]);
      } catch (error) {
        console.error('Error in fetchInitialAlerts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialAlerts();
  }, [userId, limit]);

  // Subscribe to real-time alerts
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('public:security_alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'security_alerts',
        filter: userId ? `user_id=eq.${userId}` : undefined
      }, (payload) => {
        const newAlert = payload.new as SecurityAlert;
        
        // Show a toast notification
        const variant = getSeverityVariant(newAlert.severity);
          
        toast({
          title: newAlert.title,
          description: newAlert.description,
          variant
        });
        
        // Update the alerts state
        setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, limit));
        
        // Call the optional callback
        if (onNewAlert) {
          onNewAlert(newAlert);
        }
      })
      .subscribe(() => {
        setIsSubscribed(true);
        console.log('Subscribed to real-time fraud alerts');
      });
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId, toast, onNewAlert, limit]);
  
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ status: 'acknowledged' })
        .eq('id', alertId);
        
      if (error) {
        console.error('Error acknowledging alert:', error);
        return false;
      }
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' } 
            : alert
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error in acknowledgeAlert:', error);
      return false;
    }
  };
  
  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ status: 'resolved' })
        .eq('id', alertId);
        
      if (error) {
        console.error('Error resolving alert:', error);
        return false;
      }
      
      // Update local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'resolved' } 
            : alert
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error in resolveAlert:', error);
      return false;
    }
  };
  
  return { 
    alerts,
    isLoading,
    isSubscribed,
    acknowledgeAlert,
    resolveAlert
  };
};
