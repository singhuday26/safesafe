
import React, { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useSearchParams } from "react-router-dom";

interface AuthFormProps {
  isLogin: boolean;
  onSuccess: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const emailSchema = z.string().email("Please enter a valid email address");

const AuthForm: React.FC<AuthFormProps> = ({
  isLogin,
  onSuccess,
  loading,
  setLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [searchParams] = useSearchParams();
  const { toast: uiToast } = useToast();

  // Check if we're in a password reset flow
  const isReset = searchParams.get("reset") === "true";
  const isRecovery = searchParams.get("type") === "recovery";

  // Clear errors when inputs change
  useEffect(() => {
    if (email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    if (password) {
      setErrors(prev => ({ ...prev, password: "" }));
    }
    if (passwordConfirm) {
      setErrors(prev => ({ ...prev, passwordConfirm: "" }));
    }
  }, [email, password, passwordConfirm]);

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        newErrors.email = err.errors[0].message;
      }
    }
    
    // Validate password
    if (!isLogin || isReset || isRecovery) {
      try {
        passwordSchema.parse(password);
      } catch (err) {
        if (err instanceof z.ZodError) {
          newErrors.password = err.errors[0].message;
        }
      }
      
      // Confirm passwords match
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "Passwords do not match";
      }
    } else if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (isLogin) {
        if (isReset || isRecovery) {
          // Password reset flow
          const { data, error } = await supabase.auth.updateUser({
            password: password
          });
          
          if (error) throw error;
          
          toast.success("Password updated successfully", {
            description: "You can now login with your new password"
          });
          
          // Navigate to login page after reset
          window.location.href = "/auth";
          return;
        }
        
        // Normal login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Check for inactive session and start a timeout
        if (data.session) {
          // Set inactivity timeout - log out after 30 minutes of inactivity
          const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
          
          const activityWatcher = () => {
            localStorage.setItem('lastActivity', Date.now().toString());
          };
          
          // Add event listeners for user activity
          ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, activityWatcher);
          });
          
          // Check activity every minute
          setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity && Date.now() - parseInt(lastActivity) > inactivityTimeout) {
              // Log out due to inactivity
              supabase.auth.signOut();
              toast.info("Signed out due to inactivity", {
                description: "Please login again to continue"
              });
              
              // Remove event listeners
              ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
                document.removeEventListener(event, activityWatcher);
              });
            }
          }, 60000); // Check every minute
        }
        
        toast.success("Login successful", {
          description: "Welcome back!"
        });
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: "",
              last_name: ""
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user?.identities?.length === 0) {
          setErrors({
            email: "This email is already registered. Please login instead."
          });
          setLoading(false);
          return;
        }
        
        toast.success("Sign up successful", {
          description: "Please check your email to confirm your account."
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      
      // Handle specific error messages
      let errorMessage = "Authentication failed";
      
      if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email to confirm your account";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered";
      } else {
        errorMessage = error.message;
      }
      
      setErrors({ auth: errorMessage });
      toast.error("Authentication error", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email to reset password" });
      return;
    }

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors({ email: err.errors[0].message });
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset email sent", {
        description: "Check your inbox for instructions"
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.auth && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
          {errors.auth}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center">
          Email
          {errors.email && (
            <span className="ml-auto text-sm text-destructive flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.email}
            </span>
          )}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
            disabled={loading || isReset || isRecovery}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center">
          {isReset || isRecovery ? "New Password" : "Password"}
          {errors.password && (
            <span className="ml-auto text-sm text-destructive flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {errors.password}
            </span>
          )}
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {(!isLogin || isReset || isRecovery) && (
          <PasswordStrengthMeter strength={passwordStrength} />
        )}
      </div>
      
      {(!isLogin || isReset || isRecovery) && (
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm" className="flex items-center">
            Confirm Password
            {errors.passwordConfirm && (
              <span className="ml-auto text-sm text-destructive flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.passwordConfirm}
              </span>
            )}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="passwordConfirm"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={`pl-10 ${errors.passwordConfirm ? 'border-destructive' : ''}`}
              disabled={loading}
            />
          </div>
        </div>
      )}
      
      {isLogin && !isReset && !isRecovery && (
        <div className="text-right">
          <button 
            type="button" 
            className="text-sm text-primary hover:underline" 
            onClick={handlePasswordReset}
          >
            Forgot password?
          </button>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            {isReset || isRecovery ? "Reset Password" : (isLogin ? "Login" : "Sign Up")} 
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        )}
      </Button>
      
      {(!isLogin || isReset || isRecovery) && (
        <div className="bg-primary/10 text-primary-foreground p-3 rounded-md text-sm">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="space-y-1 pl-5 text-xs">
            <li className="flex items-center">
              {password.length >= 8 ? (
                <CheckCircle className="text-green-500 h-3 w-3 mr-1" />
              ) : (
                <span className="h-3 w-3 mr-1 rounded-full border border-current inline-block" />
              )}
              Minimum 8 characters
            </li>
            <li className="flex items-center">
              {/[A-Z]/.test(password) ? (
                <CheckCircle className="text-green-500 h-3 w-3 mr-1" />
              ) : (
                <span className="h-3 w-3 mr-1 rounded-full border border-current inline-block" />
              )}
              At least one uppercase letter
            </li>
            <li className="flex items-center">
              {/[a-z]/.test(password) ? (
                <CheckCircle className="text-green-500 h-3 w-3 mr-1" />
              ) : (
                <span className="h-3 w-3 mr-1 rounded-full border border-current inline-block" />
              )}
              At least one lowercase letter
            </li>
            <li className="flex items-center">
              {/[0-9]/.test(password) ? (
                <CheckCircle className="text-green-500 h-3 w-3 mr-1" />
              ) : (
                <span className="h-3 w-3 mr-1 rounded-full border border-current inline-block" />
              )}
              At least one number
            </li>
            <li className="flex items-center">
              {/[^A-Za-z0-9]/.test(password) ? (
                <CheckCircle className="text-green-500 h-3 w-3 mr-1" />
              ) : (
                <span className="h-3 w-3 mr-1 rounded-full border border-current inline-block" />
              )}
              At least one special character
            </li>
          </ul>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
