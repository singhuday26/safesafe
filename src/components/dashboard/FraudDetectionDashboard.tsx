
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/animations/FadeIn";
import { generateRandomTransactions, generateRiskInsights, generateDashboardStats, formatCurrency, formatDate, getRiskColor, getRiskLevel, TimePeriod } from "@/utils/fraudDetectionUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RiskMeter from "@/components/dashboard/RiskMeter";
import { 
  Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, Bell, Calendar, 
  Check, Clock, CreditCard, DollarSign, FileText, Filter, Info, PieChart, 
  Shield, Truck, User, X
} from "lucide-react";

const FraudDetectionDashboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("7d");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  
  // Generate mock data
  const transactions = generateRandomTransactions(10);
  const insights = generateRiskInsights();
  const stats = generateDashboardStats();
  
  // Calculate overall risk score
  const overallRiskScore = Math.floor(
    transactions.reduce((acc, transaction) => acc + transaction.riskScore, 0) / 
    Math.max(transactions.length, 1)
  );
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">Failed</Badge>;
      case "flagged":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-600">Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "transfer":
        return <ArrowRight className="h-4 w-4" />;
      case "withdrawal":
        return <ArrowUp className="h-4 w-4" />;
      case "deposit":
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "low":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-600">Medium</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 hover:text-orange-600">High</Badge>;
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600">Critical</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
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
  
  return (
    <FadeIn className="space-y-6">
      {/* Dashboard Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
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
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
            <CardDescription>Your current risk assessment</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <RiskMeter score={overallRiskScore} size="lg" showLabel={true} />
            
            <div className="mt-6 w-full space-y-4">
              <Alert className="border-yellow-500/50 text-yellow-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attention Required</AlertTitle>
                <AlertDescription>
                  Your account has 3 items that need attention.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">High Risk Transactions</span>
                <Badge variant="outline">{transactions.filter(t => t.riskScore > 70).length}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transactions Flagged</span>
                <Badge variant="outline">{transactions.filter(t => t.status === "flagged").length}</Badge>
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                View Full Risk Report
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Transaction Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaction Activity</CardTitle>
              <CardDescription>Recent transactions and their risk assessment</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Tabs value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)} className="w-full">
                <TabsList className="grid grid-cols-4 w-[260px]">
                  <TabsTrigger value="24h">24h</TabsTrigger>
                  <TabsTrigger value="7d">7d</TabsTrigger>
                  <TabsTrigger value="30d">30d</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 5).map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-muted">
                            {getTypeIcon(transaction.type)}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.merchant}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getRiskColor(transaction.riskScore)}`}></div>
                          <span className="text-sm">{transaction.riskScore}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <Button variant="ghost" className="mt-4 w-full" size="sm">
              View All Transactions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Risk Insights */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Risk Insights</CardTitle>
            <CardDescription>Potential security issues that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map(insight => (
                <div key={insight.id} className="border rounded-lg p-4 hover:bg-accent transition-colors duration-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    {getUrgencyBadge(insight.urgency)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(insight.timestamp)}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
};

export default FraudDetectionDashboard;
