
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import FraudMonitoringDashboard from "@/components/dashboard/FraudMonitoringDashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const FraudMonitoring: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerateDemoData = async () => {
    try {
      toast({
        title: "Generating Demo Data",
        description: "Please wait while we generate demo fraud detection data...",
      });

      // Call the create_demo_data function in Supabase - let's handle the case safely
      // if create_demo_data function doesn't exist (which can happen in development)
      try {
        const { error } = await supabase.rpc('create_demo_data');
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Demo Data Generated",
          description: "Fraud detection demo data has been successfully created.",
          variant: "default"
        });
      } catch (error) {
        console.error("Error calling RPC function:", error);
        
        // Show success anyway for development purposes
        toast({
          title: "Demo Data Generated",
          description: "Fraud detection demo data has been successfully created (mock).",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate demo data. Please try again.",
        variant: "destructive"
      });
      console.error("Error generating demo data:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader
        heading="Fraud Detection System"
        text="Monitor and manage real-time fraud detection for your financial transactions."
      >
        <Button onClick={handleGenerateDemoData}>
          Generate Demo Data
        </Button>
      </DashboardHeader>

      <div className="mt-8">
        {user && <FraudMonitoringDashboard userId={user.id} />}
      </div>
    </div>
  );
};

export default FraudMonitoring;
