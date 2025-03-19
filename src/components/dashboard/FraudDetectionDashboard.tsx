import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/animations/FadeIn";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RiskMeter from "@/components/dashboard/RiskMeter";
import { useTransactions } from "@/hooks/useTransactions";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";
import { useQuery } from "@tanstack/react-query";
import { fetchSecurityTips } from "@/services/SecurityTipsService";
import { TimePeriod, getRiskColor, getRiskLevel, formatCurrency, formatDate } from "@/utils/fraudDetectionUtils";
import { Transaction } from "@/types/database";
import { 
  Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, Bell, Check, 
  CreditCard, Info, Shield, X, Clock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionList from "./TransactionList";
import TransactionCard from "./TransactionCard";
// Import TransactionsPage from the same folder
import TransactionsPage from "./TransactionsPage";

const FraudDetectionDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  
  const getTimeRangeForPeriod = (): { startDate?: Date, endDate?: Date } => {
    const endDate = new Date();
    let startDate: Date | undefined;
    
    switch (timePeriod) {
      case "24h":
        startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "all":
        startDate = undefined; // No start date limit
        break;
    }
    
    return { startDate, endDate };
  };
  
  const { startDate, endDate } = getTimeRangeForPeriod();
  const { transactions, isLoading: isLoadingTransactions } = useTransactions(50, startDate, endDate);
  const { riskMetrics, isLoading: isLoadingMetrics } = useRiskMetrics();
  const { alerts, isLoading: isLoadingAlerts } = useSecurityAlerts(5);
  
  const { data: securityTips, isLoading: isLoadingSecurityTips } = useQuery({
    queryKey: ['securityTips'],
    queryFn: () => fetchSecurityTips(3),
  });
  
  const getDashboardStats = () => {
    const totalTransactions = transactions.length;
    const flaggedCount = transactions.filter(t => t.status === 'flagged').length;
    const highRiskCount = transactions.filter(t => t.risk_score > 70).length;
    const alertsCount = alerts.length;
    
    return [
      {
        id: 1,
        title: "Risk Score",
        value: riskMetrics?.overall_risk_score.toString() || "N/A",
        change: 5,
        trend: "down",
        icon: "shield"
      },
      {
        id: 2,
        title: "Total Transactions",
        value: totalTransactions.toString(),
        change: 12,
        trend: "up",
        icon: "activity"
      },
      {
        id: 3,
        title: "Security Alerts",
        value: alertsCount.toString(),
        change: flaggedCount > 0 ? flaggedCount : 0,
        trend: flaggedCount > 0 ? "up" : "flat",
        icon: "bell"
      },
      {
        id: 4,
        title: "Protected Assets",
        value: "100%",
        change: 0,
        trend: "flat",
        icon: "check-circle"
      }
    ];
  };
  
  const stats = getDashboardStats();
  
  const overallRiskScore = riskMetrics?.overall_risk_score || 0;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">Approved</Badge>;
      case "pending":
      case "flagged":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">Flagged</Badge>;
      case "declined":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "refund":
        return <ArrowDown className="h-4 w-4" />;
      case "payout":
        return <ArrowUp className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getUrgencyBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-600">High</Badge>;
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  const getStatIcon = (icon: string) => {
    switch (icon) {
      case "shield":
        return <Shield className="h-5 w-5 text-primary" />;
      case "activity":
        return <Activity className="h-5 w-5 text-primary" />;
      case "bell":
        return <Bell className="h-5 w-5 text-primary" />;
      case "check-circle":
        return <Check className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getTrendColorClass = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  const renderTransactionSkeleton = () => (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    </TableRow>
  );
  
  const renderSecurityTipSkeleton = () => (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
  
  const parseTransactionDate = (dateString: string): Date => {
    return new Date(dateString);
  };
  
  return (
    <FadeIn className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  {isLoadingMetrics && stat.title === "Risk Score" ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  )}
                  <div className="flex items-center mt-1">
                    {getTrendIcon(stat.trend)}
                    <span className={`text-xs font-medium ml-1 ${getTrendColorClass(stat.trend)}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">vs. last period</span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  {getStatIcon(stat.icon)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
            <CardDescription>Your current risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {isLoadingMetrics ? (
              <Skeleton className="h-40 w-40 rounded-full" />
            ) : (
              <RiskMeter score={overallRiskScore} size="lg" showLabel={true} />
            )}
            
            <div className="mt-6 w-full space-y-4">
              {isLoadingAlerts ? (
                <Skeleton className="h-20 w-full" />
              ) : alerts.some(a => a.status === 'new') ? (
                <Alert className="border-yellow-500/50 text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Attention Required</AlertTitle>
                  <AlertDescription>
                    Your account has {alerts.filter(a => a.status === 'new').length} alerts that need attention.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-500/50 text-green-500">
                  <Check className="h-4 w-4" />
                  <AlertTitle>All Clear</AlertTitle>
                  <AlertDescription>
                    No security issues currently require your attention.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">High Risk Transactions</span>
                <Badge variant="outline">{isLoadingTransactions ? "-" : transactions.filter(t => t.risk_score > 70).length}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transactions Flagged</span>
                <Badge variant="outline">{isLoadingTransactions ? "-" : transactions.filter(t => t.status === "flagged").length}</Badge>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View Full Risk Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Transaction Activity</CardTitle>
              <CardDescription>Monitor your recent transactions and their risk levels</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="text-sm bg-transparent border-none focus:ring-0"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="cards">Card View</TabsTrigger>
                {/* New Tab Trigger for Transactions Page */}
                <TabsTrigger value="page">Page View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                {isLoadingTransactions ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => renderTransactionSkeleton())}
                  </div>
                ) : (
                  <TransactionList transactions={transactions} />
                )}
              </TabsContent>
              
              <TabsContent value="cards" className="space-y-4">
                {isLoadingTransactions ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[...Array(4)].map((_, i) => renderTransactionSkeleton())}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {transactions.map((transaction, index) => (
                      <TransactionCard 
                        key={transaction.id}
                        transaction={transaction}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* New Tab Content for Page View */}
              <TabsContent value="page" className="space-y-4">
                <TransactionsPage />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Security Tips</CardTitle>
            <CardDescription>Recommendations to enhance your security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingSecurityTips ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <div key={i}>{renderSecurityTipSkeleton()}</div>)
              ) : securityTips && securityTips.length > 0 ? (
                securityTips.map(tip => (
                  <div key={tip.id} className="border rounded-lg p-4 hover:bg-accent transition-colors duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{tip.title}</h4>
                      <Badge variant="outline">{tip.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{tip.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 mr-1" />
                        Priority: {tip.priority}
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Learn More
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No security tips available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
};

export default FraudDetectionDashboard;
