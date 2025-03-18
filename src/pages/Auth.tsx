
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SecurityTipAlert from "@/components/SecurityTipAlert";
import { showSecurityTipNotification } from "@/services/SecurityTipsService";
import AuthContainer from "@/components/auth/AuthContainer";
import AuthForm from "@/components/auth/AuthForm";
import AuthToggle from "@/components/auth/AuthToggle";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [session, setSession] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/");
      }
    });

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
  }, [navigate]);

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
