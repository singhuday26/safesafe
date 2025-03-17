
import React from "react";
import { FadeIn } from "@/components/animations/FadeIn";
import Navbar from "@/components/layout/Navbar";
import FraudDetectionDashboard from "@/components/dashboard/FraudDetectionDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Fraud Detection Dashboard</h1>
          <FraudDetectionDashboard />
        </FadeIn>
      </main>
    </div>
  );
};

export default Index;
