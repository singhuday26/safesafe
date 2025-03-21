
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SecurityAlert } from '@/types/database';

interface UseFraudAlertsOptions {
  onNewAlert?: (alert: SecurityAlert) => void;
  userId?: string;
}

export const useRealtimeFraudAlerts = ({ onNewAlert, userId }: UseFraudAlertsOptions = {}) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

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
        const variant = newAlert.severity === 'critical' || newAlert.severity === 'high' 
          ? 'destructive' 
          : 'default';
          
        toast({
          title: newAlert.title,
          description: newAlert.description,
          variant
        });
        
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
  }, [userId, toast, onNewAlert]);
  
  return { isSubscribed };
};
