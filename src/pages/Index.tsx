
import React, { useState, useEffect } from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import Navbar from "@/components/layout/Navbar";
import FraudDetectionDashboard from "@/components/dashboard/FraudDetectionDashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSecurityTips } from "@/services/SecurityTipsService";
import { fetchProfile } from "@/services/ProfileService";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-2">{greeting}, {userName}!</h1>
          <p className="text-muted-foreground mb-8">
            Welcome to your fraud detection dashboard. Here's your latest security overview.
          </p>
          <FraudDetectionDashboard />
        </FadeIn>
      </main>
    </div>
  );
};

export default Index;
