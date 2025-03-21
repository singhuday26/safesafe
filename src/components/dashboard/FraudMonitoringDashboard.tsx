
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";
import { FadeIn } from "@/components/animations/FadeIn";
import FraudDetectionDashboard from "./FraudDetectionDashboard";

interface FraudMonitoringDashboardProps {
  userId: string;
}

const FraudMonitoringDashboard: React.FC<FraudMonitoringDashboardProps> = ({ userId }) => {
  // We can use the userId parameter here if needed for future implementations
  console.log("Rendering fraud monitoring dashboard for user:", userId);
  
  return (
    <FadeIn>
      <FraudDetectionDashboard />
    </FadeIn>
  );
};

export default FraudMonitoringDashboard;
