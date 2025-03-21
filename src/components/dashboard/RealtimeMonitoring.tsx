
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/database";
import { FadeIn } from "@/components/animations/FadeIn";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/utils/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface RealtimeMonitoringProps {
  userId?: string;
}

const RealtimeMonitoring: React.FC<RealtimeMonitoringProps> = ({ userId }) => {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (!effectiveUserId) return;
    
    // Fetch initial recent transactions
    const fetchRecentTransactions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', effectiveUserId)
          .order('timestamp', { ascending: false })
          .limit(5);
          
        if (error) {
          console.error('Error fetching recent transactions:', error);
          return;
        }
        
        setRecentTransactions(data as Transaction[]);
      } catch (err) {
        console.error('Error in fetchRecentTransactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentTransactions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('public:transactions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transactions',
        filter: `user_id=eq.${effectiveUserId}`
      }, (payload) => {
        const newTransaction = payload.new as Transaction;
        
        // Show a toast notification
        if (newTransaction.risk_score >= 70) {
          toast({
            title: "High Risk Transaction Detected",
            description: `${formatCurrency(Number(newTransaction.amount), newTransaction.currency)} to ${newTransaction.merchant}`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "New Transaction",
            description: `${formatCurrency(Number(newTransaction.amount), newTransaction.currency)} to ${newTransaction.merchant}`,
          });
        }
        
        // Update state with new transaction at the beginning
        setRecentTransactions(prev => [newTransaction, ...prev].slice(0, 5));
      })
      .subscribe();
      
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveUserId, toast]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
          <CardDescription>Live transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg border animate-pulse">
                <div className="flex justify-between">
                  <div className="w-1/3 h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="w-2/3 h-8 bg-gray-200 rounded mt-1 mb-4"></div>
                <div className="flex gap-3 mt-3">
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <FadeIn>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
          <CardDescription>Live transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions detected
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div 
                  key={transaction.id} 
                  className={`p-4 rounded-lg border ${
                    transaction.risk_score >= 70 ? 'bg-red-50 border-red-200' : 
                    transaction.status === 'approved' ? 'bg-green-50 border-green-200' : 
                    'bg-amber-50 border-amber-200'
                  }`}
                  style={{ 
                    animation: `fadeIn 0.3s ease-out forwards ${index * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{transaction.merchant}</div>
                      <div className="text-2xl font-bold mt-1">
                        {formatCurrency(Number(transaction.amount), transaction.currency)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant={
                        transaction.status === 'approved' ? 'default' :
                        transaction.status === 'declined' ? 'destructive' :
                        'outline'
                      }>
                        {transaction.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {transaction.status === 'declined' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {transaction.status === 'flagged' && <Clock className="h-3 w-3 mr-1" />}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </div>
                      
                      {transaction.risk_score > 0 && (
                        <div className={`mt-1 text-sm font-medium ${
                          transaction.risk_score >= 70 ? 'text-red-600' :
                          transaction.risk_score >= 40 ? 'text-amber-600' :
                          'text-green-600'
                        }`}>
                          Risk: {transaction.risk_score}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-3">
                    <Badge variant="outline">
                      {formatPaymentMethod(transaction.payment_method)}
                    </Badge>
                    
                    {transaction.city && transaction.country && (
                      <Badge variant="outline">
                        {transaction.city}, {transaction.country}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
};

export default RealtimeMonitoring;
