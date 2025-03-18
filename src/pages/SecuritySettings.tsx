
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { FadeIn } from "@/components/animations/FadeIn";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchUserSettings, updateUserSettings } from "@/services/UserSettingsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Bell, 
  Smartphone, 
  Mail, 
  Map, 
  Lock, 
  KeyRound,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const SecuritySettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerificationOpen, setIsPhoneVerificationOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  
  // Fetch user settings
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: fetchUserSettings,
    enabled: !!user,
  });
  
  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update settings", {
        description: error.message
      });
    }
  });
  
  // Handle toggle changes
  const handleToggleSetting = (key: string, value: boolean) => {
    if (!userSettings) return;
    
    updateSettingsMutation.mutate({
      ...userSettings,
      [key]: value
    });
  };
  
  // Handle security level change
  const handleSecurityLevelChange = (level: string) => {
    if (!userSettings) return;
    
    updateSettingsMutation.mutate({
      ...userSettings,
      security_level: level as 'low' | 'medium' | 'high'
    });
  };
  
  // Mock phone verification
  const handleSendVerificationCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsPhoneVerificationOpen(true);
    
    // Generate a fake recovery code for demo
    const generatedCode = Array(16)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
      .toUpperCase();
    
    setRecoveryCode(generatedCode);
    
    toast.success("Verification code sent", {
      description: `A verification code has been sent to ${phoneNumber}`
    });
  };
  
  // Mock OTP verification
  const handleVerifyOTP = () => {
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (otpValue === "123456") {
        toast.success("Phone number verified successfully");
        setIsPhoneVerificationOpen(false);
        setShowRecoveryCode(true);
        
        // Update settings with two-factor enabled
        if (userSettings) {
          updateSettingsMutation.mutate({
            ...userSettings,
            two_factor_enabled: true
          });
        }
      } else {
        toast.error("Invalid verification code", {
          description: "Please try again or request a new code"
        });
      }
      setIsVerifying(false);
    }, 1500);
  };
  
  // Mock password change
  const handlePasswordChange = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        user?.email || '',
        {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        }
      );
      
      if (error) throw error;
      
      toast.success("Password reset email sent", {
        description: "Check your inbox for instructions"
      });
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message
      });
    }
  };
  
  // Mock disable 2FA
  const handle2FADisable = () => {
    if (userSettings) {
      updateSettingsMutation.mutate({
        ...userSettings,
        two_factor_enabled: false
      });
      
      toast.success("Two-factor authentication disabled", {
        description: "Your account is now using password-only authentication"
      });
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading security settings...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
                <p className="text-muted-foreground">
                  Manage your account security and preferences
                </p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {userSettings?.security_level === 'high' ? 'High Security' : 
                     userSettings?.security_level === 'medium' ? 'Medium Security' : 'Basic Security'}
                  </span>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="authentication" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="authentication">Authentication</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
              </TabsList>
              
              {/* Authentication Tab */}
              <TabsContent value="authentication">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lock className="mr-2 h-5 w-5 text-primary" />
                        Password Management
                      </CardTitle>
                      <CardDescription>
                        Update your password and recovery options
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-muted-foreground">
                            It's a good idea to use a strong password that you don't use elsewhere
                          </p>
                        </div>
                        <Button onClick={handlePasswordChange}>
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">Password History</p>
                          <p className="text-sm text-muted-foreground">
                            Your system remembers your last 5 passwords
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last changed: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <KeyRound className="mr-2 h-5 w-5 text-primary" />
                        Two-Factor Authentication (2FA)
                      </CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {userSettings?.two_factor_enabled ? (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="font-medium">Two-factor authentication is enabled</p>
                                <p className="text-sm text-muted-foreground">
                                  Your account has an extra layer of security
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={handle2FADisable}
                            >
                              Disable
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-muted rounded-md">
                            <h4 className="font-medium mb-2">Recovery Codes</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              If you lose access to your 2FA device, you can use these recovery codes to regain access to your account.
                            </p>
                            <div className="bg-background p-3 rounded border mb-3 font-mono text-sm break-all">
                              {recoveryCode}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Download</Button>
                              <Button size="sm" variant="outline">Copy</Button>
                              <Button size="sm" variant="outline">Generate New Codes</Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">SMS Authentication</p>
                              <p className="text-sm text-muted-foreground">
                                Receive a code via SMS to verify your identity
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                type="tel"
                                placeholder="Phone number"
                                className="w-56"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                              <Button
                                onClick={handleSendVerificationCode}
                                disabled={!phoneNumber || phoneNumber.length < 10}
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b">
                            <div>
                              <p className="font-medium">Authenticator App</p>
                              <p className="text-sm text-muted-foreground">
                                Use an authentication app like Google Authenticator or Authy
                              </p>
                            </div>
                            <Button variant="outline">
                              Set Up
                            </Button>
                          </div>
                          
                          <div className="p-4 bg-primary/10 rounded-md">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-primary" />
                              Why enable two-factor authentication?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Two-factor authentication adds an extra layer of security to your account. 
                              In addition to your password, you'll need a code from your phone or 
                              authentication app to sign in, making it harder for attackers to gain access.
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-primary" />
                        Security Level
                      </CardTitle>
                      <CardDescription>
                        Choose the security level that's right for you
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div 
                          className={`p-4 rounded-md border cursor-pointer transition-colors ${
                            userSettings?.security_level === 'low' 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleSecurityLevelChange('low')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Basic Security</h3>
                            {userSettings?.security_level === 'low' && (
                              <div className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                Current
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Simple password-based protection with minimal disruption.
                          </p>
                        </div>
                        
                        <div 
                          className={`p-4 rounded-md border cursor-pointer transition-colors ${
                            userSettings?.security_level === 'medium' 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleSecurityLevelChange('medium')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">Medium Security</h3>
                            {userSettings?.security_level === 'medium' && (
                              <div className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                Current
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Email verification for sensitive actions and login alerts for new devices.
                          </p>
                        </div>
                        
                        <div 
                          className={`p-4 rounded-md border cursor-pointer transition-colors ${
                            userSettings?.security_level === 'high' 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-primary/50'
                          }`}
                          onClick={() => handleSecurityLevelChange('high')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">High Security</h3>
                            {userSettings?.security_level === 'high' && (
                              <div className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                Current
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Two-factor authentication required for all logins and verification for all sensitive actions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="mr-2 h-5 w-5 text-primary" />
                      Security Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage how you receive security alerts and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive security alerts via email
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={userSettings?.notification_email} 
                        onCheckedChange={(checked) => handleToggleSetting('notification_email', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive security alerts via SMS
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={userSettings?.notification_sms} 
                        onCheckedChange={(checked) => handleToggleSetting('notification_sms', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive security alerts via push notifications
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={userSettings?.notification_push} 
                        onCheckedChange={(checked) => handleToggleSetting('notification_push', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Login Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get alerted for new login attempts
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={userSettings?.login_alerts_enabled} 
                        onCheckedChange={(checked) => handleToggleSetting('login_alerts_enabled', checked)} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Map className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Unusual Location Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get alerted when your account is accessed from a new location
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={userSettings?.location_tracking_enabled} 
                        onCheckedChange={(checked) => handleToggleSetting('location_tracking_enabled', checked)} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage your privacy preferences and data usage
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Data Collection</p>
                        <p className="text-sm text-muted-foreground">
                          Allow SafeSafe to collect usage data to improve security
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">Third-party Services</p>
                        <p className="text-sm text-muted-foreground">
                          Allow third-party security services to protect your account
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="mt-4">
                      <Button variant="outline">Download My Data</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Sessions Tab */}
              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                      Manage your active sessions and connected devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <p className="font-medium">Current Session</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {navigator.userAgent}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                            <span>IP: 192.168.1.1</span>
                            <span>Location: New York, USA</span>
                            <span>Started: {new Date().toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Chrome on Windows</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                            <span>IP: 203.0.113.1</span>
                            <span>Location: Los Angeles, USA</span>
                            <span>Last accessed: 2 days ago</span>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Safari on iPhone</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                            <span>IP: 198.51.100.1</span>
                            <span>Location: Boston, USA</span>
                            <span>Last accessed: 5 days ago</span>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Sign Out of All Sessions</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </FadeIn>
      </div>
      
      {/* Phone Verification Dialog */}
      <Dialog open={isPhoneVerificationOpen} onOpenChange={setIsPhoneVerificationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Phone Number</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to {phoneNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => handleSendVerificationCode()}>
              Resend Code
            </Button>
            <Button type="submit" onClick={handleVerifyOTP} disabled={otpValue.length !== 6 || isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recovery Code Dialog */}
      <Dialog open={showRecoveryCode} onOpenChange={setShowRecoveryCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Recovery Codes</DialogTitle>
            <DialogDescription>
              Keep these recovery codes in a safe place. You can use them to regain access to your account if you lose your phone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded font-mono text-sm break-all">
            {recoveryCode}
          </div>
          <div className="flex justify-between gap-4">
            <Button className="flex-1" variant="outline">
              Download
            </Button>
            <Button className="flex-1" variant="outline">
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRecoveryCode(false)}>
              I've saved my recovery codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettings;
