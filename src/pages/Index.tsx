
import React, { useState, useEffect } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import Navbar from "@/components/layout/Navbar";
import FraudDetectionDashboard from "@/components/dashboard/FraudDetectionDashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSecurityTips } from "@/services/SecurityTipsService";
import { fetchProfile } from "@/services/ProfileService";
import SecurityTipAlert from "@/components/SecurityTipAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Bell, Settings, FileText, TrendingUp } from "lucide-react";

const Index = () => {
  const { user, isLoading } = useAuth();
  const [greeting, setGreeting] = useState("Good day");

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Redirect to auth if not logged in
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const userName = profile?.first_name || user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <FadeIn>
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900">{greeting}, {userName}!</h1>
              <p className="text-muted-foreground mb-2">
                Welcome to your security dashboard. Here's your latest overview.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Bell className="mr-2 h-4 w-4" />
                Alerts
              </Button>
              <Button size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
          
          <SecurityTipAlert className="mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover-lift border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5 bg-gradient-to-br from-primary/10 to-indigo-500/10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-700">Quick Actions</h3>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="bg-white/80 w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                      View Risk Analysis
                    </Button>
                    <Button variant="outline" className="bg-white/80 w-full justify-start">
                      <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                      Download Reports
                    </Button>
                    <Button variant="outline" className="bg-white/80 w-full justify-start">
                      <Bell className="mr-2 h-4 w-4 text-teal-500" />
                      Configure Alerts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2 hover-lift border-slate-200">
              <CardContent className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700">Account Security Status</h3>
                  <div className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Protected</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                        <Shield className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Two-factor authentication</p>
                        <p className="text-xs text-slate-500">Your account is secured with 2FA</p>
                      </div>
                    </div>
                    <div className="text-xs text-emerald-500 font-medium">Enabled</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Bell className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Security alerts</p>
                        <p className="text-xs text-slate-500">Receive alerts for suspicious activities</p>
                      </div>
                    </div>
                    <div className="text-xs text-amber-500 font-medium">4 unread</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Settings className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Account permissions</p>
                        <p className="text-xs text-slate-500">Manage your account access settings</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <FraudDetectionDashboard />
        </FadeIn>
      </main>
    </div>
  );
};

export default Index;
