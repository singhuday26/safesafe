
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SecurityTipAlert from "@/components/SecurityTipAlert";
import { showSecurityTipNotification } from "@/services/SecurityTipsService";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";
import { toast } from "sonner";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [showTip, setShowTip] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  // Check if we're in a password reset flow
  const isReset = searchParams.get("reset") === "true";
  const isRecovery = searchParams.get("type") === "recovery";

  useEffect(() => {
    // Show reset password UI if needed
    if (isReset || isRecovery) {
      setIsLogin(true);
      toast.info("Password Reset", {
        description: "Enter your email and new password to reset your password"
      });
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

    // Set up auth state change subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Show security tip when user logs in
        showSecurityTipNotification();
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isReset, isRecovery]);

  const handleAuthSuccess = () => {
    setShowTip(true);
  };

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  return (
    <AuthContainer
      title={isLogin ? "Welcome Back" : "Create Account"}
      subtitle={
        isLogin 
          ? "Login to access your SecuraSentry dashboard" 
          : "Sign up to start monitoring for fraud activities"
      }
    >
      {showTip && <SecurityTipAlert className="mb-6" />}
      
      <AuthForm
        isLogin={isLogin}
        onSuccess={handleAuthSuccess}
        loading={loading}
        setLoading={setLoading}
      />
      
      <AuthToggle isLogin={isLogin} onToggle={toggleView} />
    </AuthContainer>
  );
};

export default Auth;
