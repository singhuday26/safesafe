
import React from "react";
import { AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { Transaction, formatCurrency, formatDate, getRiskCategory, getRiskTextColor, getStatusVariant, getTransactionTypeVariant } from "@/utils/mockData";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { FadeIn, AnimateChildren } from "../animations/FadeIn";

interface TransactionListProps {
  transactions: Transaction[];
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  className
}) => {
  return (
    <FadeIn className={cn("glass-card rounded-xl p-5", className)}>
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
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Type</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Risk Score</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <AnimateChildren>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="opacity-0 animate-fade-in hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">{transaction.id}</td>
                  <td className="py-3 px-4 text-sm">
                    <div className="font-medium">{transaction.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{transaction.customer.email}</div>
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      getTransactionTypeVariant(transaction.type) === "default" ? "default" :
                      getTransactionTypeVariant(transaction.type) === "success" ? "default" :
                      getTransactionTypeVariant(transaction.type) === "warning" ? "secondary" :
                      getTransactionTypeVariant(transaction.type) === "danger" ? "destructive" :
                      getTransactionTypeVariant(transaction.type) === "info" ? "default" :
                      "outline"
                    }>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      getStatusVariant(transaction.status) === "success" ? "default" :
                      getStatusVariant(transaction.status) === "warning" ? "secondary" :
                      getStatusVariant(transaction.status) === "danger" ? "destructive" :
                      "outline"
                    }>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className={cn(
                      "text-sm font-medium", 
                      getRiskTextColor(transaction.riskScore)
                    )}>
                      {transaction.riskScore}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </AnimateChildren>
        </table>
      </div>
      
      <div className="mt-4 pt-3 border-t border-border flex justify-center">
        <button className="text-sm font-medium text-primary hover:text-primary/80 click-bounce">
          View All Transactions
        </button>
      </div>
    </FadeIn>
  );
};

export default TransactionList;
