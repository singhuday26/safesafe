
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Clock, 
  DollarSign,
  MapPin,
  Smartphone,
  UserCheck,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFraudDetection, useFraudAlerts, useRecentRiskyTransactions } from "@/integrations/supabase/hooks/useFraudDetection";
import { useToast } from "@/hooks/use-toast";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie
} from "recharts";
import { formatDate, formatLargeNumber } from "@/utils/fraudDetectionUtils";
import RiskDetails from "./RiskDetails";
import FullRiskReport from "./FullRiskReport";

interface FraudMonitoringDashboardProps {
  userId?: string;
}

const FraudMonitoringDashboard: React.FC<FraudMonitoringDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    transactionsPerMinute: 0,
    fraudAttemptsPerHour: 0,
    averageResponseTime: 0,
    activeUsers: 0
  });
  
  const { toast } = useToast();
  const { fraudAlerts, riskProfile, riskyTransactions, systemStatus } = useFraudDetection(userId);
  
  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics({
        transactionsPerMinute: Math.floor(Math.random() * 120) + 60,
        fraudAttemptsPerHour: Math.floor(Math.random() * 15) + 5,
        averageResponseTime: Math.floor(Math.random() * 50) + 50,
        activeUsers: Math.floor(Math.random() * 1000) + 500
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Subscribe to real-time fraud alerts
  useEffect(() => {
    const channel = supabase
      .channel('fraud-alerts-real-time')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fraud_alerts'
        }, 
        (payload) => {
          toast({
            title: "New Fraud Alert Detected",
            description: `A new fraud alert has been created for transaction ${payload.new.transaction_id.substring(0, 8)}`,
            variant: "destructive"
          });
          // Refresh data
          fraudAlerts.refetch();
          riskyTransactions.refetch();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, fraudAlerts, riskyTransactions]);
  
  // Mock data for charts
  const fraudTrendsData = [
    { name: '00:00', value: 4 },
    { name: '03:00', value: 3 },
    { name: '06:00', value: 2 },
    { name: '09:00', value: 7 },
    { name: '12:00', value: 5 },
    { name: '15:00', value: 8 },
    { name: '18:00', value: 12 },
    { name: '21:00', value: 10 }
  ];
  
  const riskDistributionData = [
    { name: 'Critical', value: fraudAlerts.criticalCount || 2, color: '#ef4444' },
    { name: 'High', value: fraudAlerts.highCount || 5, color: '#f97316' },
    { name: 'Medium', value: fraudAlerts.mediumCount || 8, color: '#eab308' },
    { name: 'Low', value: fraudAlerts.lowCount || 15, color: '#3b82f6' }
  ];
  
  const detectionMethodsData = [
    { name: 'Risk Scoring', value: 45 },
    { name: 'Velocity Patterns', value: 20 },
    { name: 'Geo Anomalies', value: 15 },
    { name: 'Device Fingerprint', value: 10 },
    { name: 'Behavior Analysis', value: 10 }
  ];
  
  const openFullReport = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setShowFullReport(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Fraud Monitoring Dashboard</h2>
        <Button onClick={() => {
          fraudAlerts.refetch();
          riskyTransactions.refetch();
          riskProfile.refetch();
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Fraud Alerts
            {fraudAlerts.alerts.filter(a => a.status === 'new').length > 0 && (
              <Badge className="ml-2 bg-red-500" variant="default">
                {fraudAlerts.alerts.filter(a => a.status === 'new').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <DollarSign className="h-4 w-4 mr-2" />
            Risky Transactions
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions / Minute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-green-500 mr-2" />
                  <div className="text-2xl font-bold">{realTimeMetrics.transactionsPerMinute}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">+12% from average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Fraud Attempts / Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  <div className="text-2xl font-bold">{realTimeMetrics.fraudAttemptsPerHour}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">-3% from last hour</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{realTimeMetrics.averageResponseTime}ms</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Within SLA target</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-indigo-500 mr-2" />
                  <div className="text-2xl font-bold">{formatLargeNumber(realTimeMetrics.activeUsers)}</div>
                </div>
                <p className="text-xs text-gray-500 mt-1">+5% from yesterday</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Chart and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Fraud Detection Trends (24h)</CardTitle>
                <CardDescription>
                  Hourly fraud attempts detected by our system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={fraudTrendsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#ef4444" 
                        fill="#fee2e2" 
                        name="Fraud Attempts"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Breakdown of alerts by severity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                The most recent fraud alerts detected by our system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fraudAlerts.isLoading ? (
                <p className="text-center py-4">Loading recent alerts...</p>
              ) : fraudAlerts.alerts.length === 0 ? (
                <p className="text-center py-4">No recent alerts detected</p>
              ) : (
                <div className="space-y-4">
                  {fraudAlerts.alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-3 flex justify-between">
                      <div className="flex items-start">
                        {alert.severity === 'critical' ? (
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        )}
                        <div className="ml-3">
                          <div className="flex items-center">
                            <h4 className="font-medium">
                              {alert.detection_method.replace(/_/g, ' ')}
                            </h4>
                            <Badge 
                              className={`ml-2 ${
                                alert.severity === 'critical' ? 'bg-red-500' : 
                                alert.severity === 'high' ? 'bg-orange-500' : 
                                alert.severity === 'medium' ? 'bg-yellow-500' : 
                                'bg-blue-500'
                              }`}
                            >
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Transaction #{alert.transaction_id.substring(0, 8)} • {formatDate(new Date(alert.created_at))}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openFullReport(alert.transaction_id)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <div className="text-2xl font-bold">{fraudAlerts.criticalCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  High Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                  <div className="text-2xl font-bold">{fraudAlerts.highCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Medium Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <div className="text-2xl font-bold">{fraudAlerts.mediumCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{fraudAlerts.lowCount}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Fraud Alerts</CardTitle>
              <CardDescription>
                Comprehensive list of all detected fraud alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fraudAlerts.isLoading ? (
                <p className="text-center py-4">Loading fraud alerts...</p>
              ) : fraudAlerts.alerts.length === 0 ? (
                <p className="text-center py-4">No fraud alerts detected</p>
              ) : (
                <div className="space-y-4">
                  {fraudAlerts.alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start">
                          {alert.severity === 'critical' ? (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          ) : alert.severity === 'high' ? (
                            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                          ) : alert.severity === 'medium' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                          )}
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h4 className="font-medium">
                                {alert.detection_method.replace(/_/g, ' ')}
                              </h4>
                              <Badge 
                                className={`ml-2 ${
                                  alert.severity === 'critical' ? 'bg-red-500' : 
                                  alert.severity === 'high' ? 'bg-orange-500' : 
                                  alert.severity === 'medium' ? 'bg-yellow-500' : 
                                  'bg-blue-500'
                                }`}
                              >
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="ml-2">
                                {alert.status.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Transaction #{alert.transaction_id.substring(0, 8)} • {formatDate(new Date(alert.created_at))}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openFullReport(alert.transaction_id)}
                        >
                          View Full Report
                        </Button>
                      </div>
                      
                      {alert.transaction && (
                        <RiskDetails 
                          transaction={alert.transaction as any} 
                          fraudAlert={alert}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  High Risk Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <div className="text-2xl font-bold">{riskyTransactions.highRiskCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Medium Risk Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  <div className="text-2xl font-bold">{riskyTransactions.mediumRiskCount}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Monitored
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">{riskyTransactions.transactions.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>High Risk Transactions</CardTitle>
              <CardDescription>
                Transactions with high risk scores that may require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskyTransactions.isLoading ? (
                <p className="text-center py-4">Loading transactions...</p>
              ) : riskyTransactions.transactions.length === 0 ? (
                <p className="text-center py-4">No high risk transactions found</p>
              ) : (
                <div className="space-y-6">
                  {riskyTransactions.transactions
                    .filter(t => t.risk_score >= 50)
                    .map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - {transaction.merchant}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(transaction.amount, transaction.currency)} • {formatDate(new Date(transaction.timestamp))}
                          </p>
                        </div>
                        <Badge 
                          className={`${
                            transaction.risk_score >= 70 ? 'bg-red-500' : 
                            transaction.risk_score >= 50 ? 'bg-orange-500' : 
                            transaction.risk_score >= 30 ? 'bg-yellow-500' : 
                            'bg-blue-500'
                          }`}
                        >
                          Risk: {transaction.risk_score}/100
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            {transaction.country && transaction.city 
                              ? `${transaction.city}, ${transaction.country}` 
                              : 'Location unknown'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Smartphone className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            {transaction.device_info 
                              ? `${transaction.device_info.browser || 'Unknown browser'}` 
                              : 'Device unknown'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm">
                            {transaction.payment_method}
                            {transaction.card_last4 ? ` (${transaction.card_last4})` : ''}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openFullReport(transaction.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detection Methods</CardTitle>
                <CardDescription>
                  Breakdown of fraud detection by method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={detectionMethodsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Percent of Detections" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Monitoring fraud detection system performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>API Success Rate</span>
                      <span className="text-green-500">98.7%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '98.7%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg. Processing Time</span>
                      <span className="text-yellow-500">87ms</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Detection Accuracy</span>
                      <span className="text-blue-500">96.2%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '96.2%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>False Positive Rate</span>
                      <span className="text-green-500">3.8%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '3.8%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ML Model Confidence</span>
                      <span className="text-blue-500">92.1%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '92.1%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Status of external API integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="font-medium">IP Geolocation API</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="text-green-500 font-medium">Operational</span> • 
                    <span className="ml-1">28ms avg. response</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="font-medium">Currency Exchange API</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="text-green-500 font-medium">Operational</span> • 
                    <span className="ml-1">43ms avg. response</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                    <span className="font-medium">BIN List API</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="text-yellow-500 font-medium">Performance Degraded</span> • 
                    <span className="ml-1">120ms avg. response</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="font-medium">HIBP API</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="text-green-500 font-medium">Operational</span> • 
                    <span className="ml-1">76ms avg. response</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="font-medium">GitHub Fraud Patterns</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="text-green-500 font-medium">Operational</span> • 
                    <span className="ml-1">Last sync: 12 minutes ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Show full report modal when a transaction is selected */}
      {showFullReport && (
        <FullRiskReport 
          onClose={() => setShowFullReport(false)} 
          transactionId={selectedTransactionId || undefined}
        />
      )}
    </div>
  );
};

export default FraudMonitoringDashboard;
