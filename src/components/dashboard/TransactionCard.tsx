
import React from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Transaction } from "@/types/database";
import { ExtendedTransaction, Customer } from "@/types/customer";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { FadeIn } from "../animations/FadeIn";
import { getRiskLevel, getRiskColor, formatCurrency } from "@/utils/fraudDetectionUtils";

interface TransactionCardProps {
  transaction: Transaction | ExtendedTransaction;
  className?: string;
  delay?: number;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction,
  className,
  delay = 0
}) => {
  // Handle both Transaction and ExtendedTransaction
  const customer = (transaction as ExtendedTransaction).customer;
  const location = {
    city: transaction.city,
    country: transaction.country
  };
  
  const riskLevel = getRiskLevel(transaction.risk_score);
  const riskColor = getRiskColor(transaction.risk_score);
  
  const statusIcon = {
    approved: <CheckCircle className="h-4 w-4 text-green-500" />,
    declined: <AlertTriangle className="h-4 w-4 text-red-500" />,
    flagged: <Clock className="h-4 w-4 text-yellow-500" />
  };
  
  const formattedAmount = formatCurrency(transaction.amount, transaction.currency);
  const formattedDate = new Date(transaction.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  const paymentIcon = {
    credit_card: "💳",
    paypal: "🅿️",
    apple_pay: "",
    google_pay: "",
    bank_transfer: "🏦"
  };
  
  const paymentNames = {
    credit_card: "Credit Card",
    paypal: "PayPal",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    bank_transfer: "Bank Transfer",
    debit_card: "Debit Card"
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'refund':
        return 'Refund';
      case 'payout':
        return 'Payout';
      default:
        return 'Transaction';
    }
  };

  return (
    <FadeIn 
      delay={delay}
      className={cn(
        "glass-card rounded-xl p-5 hover-lift",
        className
      )}
    >
      <div className="flex justify-between mb-4">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-sm mr-2">{getTypeLabel(transaction.type)}</h3>
            <div className="flex items-center text-sm">
              {statusIcon[transaction.status as keyof typeof statusIcon]}
              <span className={cn(
                "ml-1",
                transaction.status === 'approved' ? 'text-green-500' : 
                transaction.status === 'declined' ? 'text-red-500' : 
                'text-yellow-500'
              )}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-xl font-bold mt-1">{formattedAmount}</p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <span className="text-sm font-bold">{transaction.risk_score}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Customer</span>
          <span className="font-medium">{customer?.name || 'Unknown'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-medium">
            {(paymentNames as any)[transaction.payment_method] || transaction.payment_method}
            {transaction.card_last4 && ` •••• ${transaction.card_last4}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        
        {(location.city || location.country) && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">
              {location.city && `${location.city}, `}
              {location.country || 'Unknown'}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Risk Score</span>
          <span className={cn("font-medium", riskColor.replace('bg-', 'text-'))}>
            {transaction.risk_score} - {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex justify-between">
        <button className="text-sm font-medium text-primary hover:text-primary/80 click-bounce">
          View Details
        </button>
        
        {transaction.status === 'flagged' && (
          <div className="flex space-x-2">
            <button className="text-sm font-medium text-green-500 hover:text-green-600 click-bounce">
              Approve
            </button>
            <button className="text-sm font-medium text-red-500 hover:text-red-600 click-bounce">
              Decline
            </button>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default TransactionCard;
