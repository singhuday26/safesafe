
import React from "react";
import { BarChart3, BanknoteIcon, AlertTriangle, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import RiskMeter from "@/components/dashboard/RiskMeter";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import TransactionCard from "@/components/dashboard/TransactionCard";
import TransactionList from "@/components/dashboard/TransactionList";
import { fraudStats, mockTransactions } from "@/utils/mockData";
import { FadeIn, SlideInFromLeft, SlideInFromRight } from "@/components/animations/FadeIn";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container max-w-7xl px-4 sm:px-6 pt-24 pb-16">
        <DashboardHeader />
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            title="Total Transactions" 
            value={fraudStats.totalTransactions}
            change={{ value: 12.5, trend: "up" }}
            icon={<BarChart3 className="h-4 w-4" />}
            delay={100}
          />
          <StatCard 
            title="Flagged Transactions" 
            value={fraudStats.flaggedTransactions}
            change={{ value: 3.2, trend: "down" }}
            icon={<AlertTriangle className="h-4 w-4" />}
            delay={200}
          />
          <StatCard 
            title="Fraud Amount" 
            value={`$${fraudStats.fraudAmount.toLocaleString()}`}
            change={{ value: 5.7, trend: "down" }}
            icon={<BanknoteIcon className="h-4 w-4" />}
            delay={300}
          />
          <StatCard 
            title="Avg. Risk Score" 
            value={fraudStats.avgRiskScore}
            change={{ value: 2.1, trend: "up" }}
            icon={<TrendingUp className="h-4 w-4" />}
            delay={400}
          />
        </div>
        
        {/* Risk Assessment Section */}
        <SlideInFromLeft className="mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center mb-5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">System Risk Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <RiskMeter score={fraudStats.avgRiskScore} size="lg" />
                <p className="mt-3 text-sm text-center text-muted-foreground">
                  Current system-wide risk assessment based on all transactions
                </p>
              </div>
              
              <div className="lg:col-span-2 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Fraud Detection Rate</span>
                      <span className="text-sm font-medium text-success">98.2%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-success h-1.5 rounded-full" style={{ width: "98.2%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">False Positive Rate</span>
                      <span className="text-sm font-medium text-warning">12.4%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-warning h-1.5 rounded-full" style={{ width: "12.4%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Security Level</span>
                      <span className="text-sm font-medium text-info">94.7%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="bg-info h-1.5 rounded-full" style={{ width: "94.7%" }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Flagged Today</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Blocked Today</p>
                    <p className="text-xl font-bold">5</p>
                  </div>
                  <div className="glass-card p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Fraud Rate</p>
                    <p className="text-xl font-bold">{fraudStats.fraudRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SlideInFromLeft>
        
        {/* High Risk Transactions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SlideInFromRight className="lg:col-span-2">
            <TransactionList 
              transactions={mockTransactions}
            />
          </SlideInFromRight>
          
          <ActivityTimeline 
            transactions={mockTransactions}
          />
        </div>
        
        {/* Recently Flagged Transactions */}
        <FadeIn className="mb-2">
          <h3 className="font-semibold text-lg mb-5">Recently Flagged Transactions</h3>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockTransactions
            .filter(t => t.status === 'flagged')
            .map((transaction, index) => (
              <TransactionCard 
                key={transaction.id}
                transaction={transaction}
                delay={index * 100}
              />
            ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
