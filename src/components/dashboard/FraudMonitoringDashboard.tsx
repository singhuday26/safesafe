
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";
import { FadeIn } from "@/components/animations/FadeIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionList from "./TransactionList";
import TransactionCard from "./TransactionCard";
import RiskMeter from "./RiskMeter";
import { AlertTriangle, BarChart3, Bell, CheckCircle, ClipboardList, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface FraudMonitoringDashboardProps {
  userId: string;
}

const FraudMonitoringDashboard: React.FC<FraudMonitoringDashboardProps> = ({ userId }) => {
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'alerts'>('overview');
  
  // Fetch data using our hooks
  const { transactions, isLoading: isLoadingTransactions } = useTransactions(10);
  const { riskMetrics, isLoading: isLoadingMetrics } = useRiskMetrics();
  const { alerts, isLoading: isLoadingAlerts, updateAlertStatus } = useSecurityAlerts(5);
  
  // Filter for high-risk transactions
  const highRiskTransactions = transactions?.filter(tx => tx.risk_score >= 70) || [];
  
  // Group alerts by severity
  const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical') || [];
  const highAlerts = alerts?.filter(alert => alert.severity === 'high') || [];
  
  // Handle alert acknowledgement
  const handleAcknowledgeAlert = (alertId: string) => {
    updateAlertStatus({ id: alertId, status: 'acknowledged' });
  };
  
  return (
    <FadeIn>
      <Tabs 
        defaultValue="overview" 
        className="space-y-6"
        onValueChange={(value) => setActiveView(value as 'overview' | 'transactions' | 'alerts')}
      >
        <TabsList className="grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Score Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <CardDescription>Overall account risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  <RiskMeter value={riskMetrics?.overall_risk_score || 0} size={120} />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {riskMetrics?.overall_risk_score < 30 ? 'Low risk' : 
                     riskMetrics?.overall_risk_score < 70 ? 'Medium risk' : 'High risk'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Transaction Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transaction Activity</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Transaction Velocity</span>
                    </div>
                    <Badge variant="outline">
                      {riskMetrics?.transaction_velocity || 0}/hr
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm">Flagged Transactions</span>
                    </div>
                    <Badge variant="outline" className="text-amber-500">
                      {riskMetrics?.flagged_transactions || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">High Risk Transactions</span>
                    </div>
                    <Badge variant="outline" className="text-red-500">
                      {riskMetrics?.high_risk_transactions || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Alerts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <CardDescription>Recent alerts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAlerts ? (
                  <div className="flex justify-center py-6">
                    <span className="text-sm text-muted-foreground">Loading alerts...</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm text-muted-foreground text-center">No security alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalAlerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className="p-3 bg-red-500/10 rounded-md border border-red-200">
                        <p className="text-sm font-medium flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                          {alert.title}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">{alert.description}</p>
                      </div>
                    ))}
                    
                    {highAlerts.slice(0, 2).map((alert) => (
                      <div key={alert.id} className="p-3 bg-amber-500/10 rounded-md border border-amber-200">
                        <p className="text-sm font-medium flex items-center">
                          <Bell className="h-4 w-4 mr-1 text-amber-500" />
                          {alert.title}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground">{alert.description}</p>
                      </div>
                    ))}
                    
                    {alerts.length > 4 && (
                      <div className="text-center pt-2">
                        <button 
                          className="text-xs text-primary hover:underline"
                          onClick={() => setActiveView('alerts')}
                        >
                          View all {alerts.length} alerts
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Monitor your recent financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-6">
                  <span className="text-sm text-muted-foreground">Loading transactions...</span>
                </div>
              ) : (
                <TransactionList transactions={transactions.slice(0, 5)} className="border-0" />
              )}
            </CardContent>
          </Card>
          
          {/* High Risk Transactions */}
          {highRiskTransactions.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-500 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  High Risk Transactions
                </CardTitle>
                <CardDescription>These transactions require immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {highRiskTransactions.slice(0, 3).map((transaction, index) => (
                    <TransactionCard key={transaction.id} transaction={transaction} delay={index * 0.1} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>View and filter your transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-6">
                  <span className="text-sm text-muted-foreground">Loading transactions...</span>
                </div>
              ) : (
                <TransactionList transactions={transactions} className="border-0" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Manage and respond to security notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="flex justify-center py-6">
                  <span className="text-sm text-muted-foreground">Loading alerts...</span>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-lg font-medium">No security alerts</p>
                  <p className="text-sm text-muted-foreground mt-1">Your account is secure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 
                        alert.severity === 'high' ? 'bg-amber-50 border-amber-200' : 
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${
                            alert.severity === 'critical' ? 'text-red-700' : 
                            alert.severity === 'high' ? 'text-amber-700' : 
                            'text-blue-700'
                          }`}>
                            {alert.title}
                          </h3>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <div className="flex items-center mt-2 space-x-3">
                            <Badge variant="outline" className={
                              alert.severity === 'critical' ? 'text-red-500 border-red-200' : 
                              alert.severity === 'high' ? 'text-amber-500 border-amber-200' : 
                              'text-blue-500 border-blue-200'
                            }>
                              {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        {alert.status === 'new' && (
                          <button 
                            className={`px-3 py-1 text-xs rounded-full border ${
                              alert.severity === 'critical' ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' : 
                              alert.severity === 'high' ? 'bg-amber-100 border-amber-300 text-amber-700 hover:bg-amber-200' : 
                              'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                            }`}
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </button>
                        )}
                        
                        {alert.status === 'acknowledged' && (
                          <Badge variant="outline">Acknowledged</Badge>
                        )}
                        
                        {alert.status === 'resolved' && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </FadeIn>
  );
};

export default FraudMonitoringDashboard;
