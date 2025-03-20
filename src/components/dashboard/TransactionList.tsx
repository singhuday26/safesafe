
import React from "react";
import { AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { Transaction } from "@/types/database";
import { ExtendedTransaction } from "@/types/customer";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { FadeIn } from "../animations/FadeIn";
import { formatCurrency, formatDate, getRiskCategoryColor } from "@/utils/fraudDetectionUtils";

interface TransactionListProps {
  transactions: (Transaction | ExtendedTransaction)[];
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  className
}) => {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
        <h3 className="font-semibold text-lg mb-2 sm:mb-0">Recent Transactions</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input 
            type="text"
            placeholder="Search transactions..."
            className="py-2 pl-10 pr-4 text-sm rounded-lg w-full sm:w-60 bg-muted/50 border-0 focus:ring-0 focus:border-primary"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Merchant</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Payment Method</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Risk Score</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((transaction, index) => {
              // Safely access transaction properties
              const transactionId = 'id' in transaction ? transaction.id : `tx-${index}`;
              const customerName = 'customer' in transaction && transaction.customer 
                ? transaction.customer.name 
                : 'Unknown';
              const merchant = transaction.merchant;
              const amount = transaction.amount;
              const currency = transaction.currency;
              
              const paymentMethod = transaction.payment_method;
                  
              const status = transaction.status;
              
              const riskScore = transaction.risk_score;
                  
              const timestamp = transaction.timestamp;
              
              return (
                <tr 
                  key={transactionId} 
                  className="hover:bg-muted/30 transition-colors"
                  style={{
                    animation: `fadeIn 0.2s ease-out forwards ${index * 0.05}s`
                  }}
                >
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium">{merchant}</div>
                    <div className="text-xs text-muted-foreground">{customerName}</div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {formatCurrency(amount, currency)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Badge variant="outline">
                      {paymentMethod.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      status === 'approved' ? 'default' :
                      status === 'declined' ? 'destructive' :
                      'outline'
                    }>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className={cn(
                      "text-sm font-medium", 
                      getRiskColor(riskScore)
                    )}>
                      {riskScore}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border flex justify-center">
        <button className="text-sm font-medium text-primary hover:text-primary/80">
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default TransactionList;
