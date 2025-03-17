
import React from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Transaction, getRiskCategory, getRiskTextColor, formatCurrency } from "@/utils/mockData";
import { cn } from "@/lib/utils";
import RiskMeter from "./RiskMeter";
import Badge from "../ui/Badge";
import { FadeIn } from "../animations/FadeIn";

interface TransactionCardProps {
  transaction: Transaction;
  className?: string;
  delay?: number;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction,
  className,
  delay = 0
}) => {
  const {
    amount,
    currency,
    status,
    riskScore,
    timestamp,
    cardLast4,
    customer,
    paymentMethod,
    location,
    type
  } = transaction;
  
  const riskCategory = getRiskCategory(riskScore);
  const riskTextColor = getRiskTextColor(riskScore);
  
  const statusIcon = {
    approved: <CheckCircle className="h-4 w-4 text-success" />,
    declined: <AlertTriangle className="h-4 w-4 text-destructive" />,
    flagged: <Clock className="h-4 w-4 text-warning" />
  };
  
  const formattedAmount = formatCurrency(amount, currency);
  const formattedDate = new Date(timestamp).toLocaleString('en-US', {
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
    bank_transfer: "Bank Transfer"
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
            <h3 className="font-medium text-sm mr-2">{getTypeLabel(type)}</h3>
            <div className="flex items-center text-sm">
              {statusIcon[status]}
              <span className={cn(
                "ml-1",
                status === 'approved' ? 'text-success' : 
                status === 'declined' ? 'text-destructive' : 
                'text-warning'
              )}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-xl font-bold mt-1">{formattedAmount}</p>
        </div>
        <RiskMeter score={riskScore} size="sm" showLabel={false} />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Customer</span>
          <span className="font-medium">{customer.name}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-medium">
            {paymentNames[paymentMethod as keyof typeof paymentNames]}
            {cardLast4 && ` •••• ${cardLast4}`}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Time</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        
        {location && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium">{location.city}, {location.country}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Risk Score</span>
          <span className={cn("font-medium", riskTextColor)}>
            {riskScore} - {riskCategory.charAt(0).toUpperCase() + riskCategory.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border flex justify-between">
        <button className="text-sm font-medium text-primary hover:text-primary/80 click-bounce">
          View Details
        </button>
        
        {status === 'flagged' && (
          <div className="flex space-x-2">
            <button className="text-sm font-medium text-success hover:text-success/80 click-bounce">
              Approve
            </button>
            <button className="text-sm font-medium text-destructive hover:text-destructive/80 click-bounce">
              Decline
            </button>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default TransactionCard;
