
import React from "react";
import { Activity } from "lucide-react";
import { FadeIn, AnimateChildren } from "../animations/FadeIn";
import { Transaction, formatDate, getStatusVariant } from "@/utils/mockData";
import Badge from "../ui/Badge";

interface ActivityTimelineProps {
  transactions: Transaction[];
  className?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  transactions,
  className 
}) => {
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  return (
    <FadeIn className={className}>
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
            <Activity className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg">Recent Activities</h3>
        </div>
        
        <AnimateChildren className="space-y-4">
          {sortedTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-start opacity-0 animate-fade-in"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-primary/80 mr-2"></div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                  <div className="flex items-center">
                    <p className="font-medium text-sm mr-2">{transaction.customer.name}</p>
                    <Badge 
                      variant={getStatusVariant(transaction.status)}
                      size="sm"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {transaction.type === 'payment' ? 'Made a payment of' : 
                   transaction.type === 'refund' ? 'Received a refund of' : 'Received a payout of'}{' '}
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: transaction.currency 
                    }).format(transaction.amount)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </AnimateChildren>
        
        <button className="mt-4 w-full py-2 text-sm font-medium text-primary hover:text-primary/80 border-t border-border flex justify-center items-center click-bounce">
          View All Activities
        </button>
      </div>
    </FadeIn>
  );
};

export default ActivityTimeline;
