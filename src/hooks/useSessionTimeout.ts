
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type SessionTimeoutOptions = {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
};

export const useSessionTimeout = ({
  timeoutMinutes = 15,
  warningMinutes = 2,
  onTimeout,
  onWarning
}: SessionTimeoutOptions = {}) => {
  const { signOut, user } = useAuth();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [warningShown, setWarningShown] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(timeoutMinutes * 60);
  
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);
  
  const handleTimeout = useCallback(() => {
    if (onTimeout) {
      onTimeout();
    } else {
      toast.warning('Your session has expired', {
        description: 'You have been logged out due to inactivity.'
      });
      signOut();
    }
  }, [onTimeout, signOut]);
  
  const handleWarning = useCallback(() => {
    if (!warningShown) {
      setWarningShown(true);
      if (onWarning) {
        onWarning();
      } else {
        toast.warning('Session timeout warning', {
          description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
          duration: 10000,
          action: {
            label: 'Keep me signed in',
            onClick: resetTimer
          }
        });
      }
    }
  }, [warningShown, warningMinutes, onWarning, resetTimer]);
  
  // Check for inactivity
  useEffect(() => {
    if (!user) return; // Only run for authenticated users
    
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastActivity) / 1000 / 60; // in minutes
      const remaining = Math.max(0, timeoutMinutes - elapsed);
      
      setTimeRemaining(Math.round(remaining * 60)); // in seconds
      
      if (elapsed >= timeoutMinutes) {
        handleTimeout();
        clearInterval(interval);
      } else if (elapsed >= (timeoutMinutes - warningMinutes) && !warningShown) {
        handleWarning();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [user, lastActivity, timeoutMinutes, warningMinutes, warningShown, handleTimeout, handleWarning]);
  
  // Listen for user activity
  useEffect(() => {
    if (!user) return; // Only run for authenticated users
    
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      resetTimer();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, resetTimer]);
  
  return {
    timeRemaining,
    resetTimer,
    isWarning: warningShown
  };
};
