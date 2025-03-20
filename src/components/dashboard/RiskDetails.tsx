
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getRiskLevel, getRiskColor } from "@/utils/fraudDetectionUtils";
import { Transaction } from "@/types/database";
import { ExtendedTransaction } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, AlertCircle, Clock, CheckCircle, Search, XCircle, ThumbsUp } from "lucide-react";

// Helper function for formatting currency
export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

interface RiskDetailsProps {
  transaction: Transaction;
  fraudAlert?: any;
  showActions?: boolean;
}

const RiskDetails: React.FC<RiskDetailsProps> = ({ 
  transaction, 
  fraudAlert,
  showActions = true
}) => {
  const updateAlert = { mutate: (params: any) => console.log("Updating alert:", params) };
  const riskLevel = getRiskLevel(transaction.risk_score);
  const colorClass = getRiskColor(transaction.risk_score);
  
  const handleUpdateStatus = (status: 'investigating' | 'resolved' | 'false_positive') => {
    if (fraudAlert?.id) {
      updateAlert.mutate({ 
        alertId: fraudAlert.id, 
        status,
        notes: status === 'false_positive' 
          ? 'Marked as false positive after review' 
          : undefined
      });
    }
  };
  
  // Helper function to render risk factor icons
  const getRiskIcon = (severity: string) => {
    switch(severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Helper function to render status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'investigating':
        return <Search className="h-4 w-4 mr-1" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'false_positive':
        return <ThumbsUp className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Risk Assessment</CardTitle>
          <Badge 
            className={`${colorClass.replace('bg-', 'bg-opacity-20 ')} ${colorClass.replace('text-', '')}`}
          >
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
        <CardDescription>
          Transaction #{transaction.id?.substring(0, 8)} - {formatCurrency(transaction.amount, transaction.currency)}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Risk Score</span>
            <span className={colorClass}>{transaction.risk_score}/100</span>
          </div>
          <Progress 
            value={transaction.risk_score} 
            max={100} 
            className={`h-2 ${colorClass.replace('text-', 'bg-')}`} 
          />
        </div>
        
        {fraudAlert && (
          <>
            <div className="mb-4">
              <h4 className="font-medium mb-2 flex items-center">
                {getRiskIcon(fraudAlert.severity)}
                <span className="ml-2">Detection Method: {fraudAlert.detection_method.replace(/_/g, ' ')}</span>
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm">
                <p className="mb-2"><span className="font-semibold">Alert Status:</span> 
                  <Badge 
                    variant="outline" 
                    className="ml-2"
                  >
                    {getStatusIcon(fraudAlert.status)}
                    {fraudAlert.status.replace(/_/g, ' ')}
                  </Badge>
                </p>
                
                {fraudAlert.details && (
                  <>
                    <p className="font-semibold mb-1">Risk Factors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {fraudAlert.details.risk_factors && fraudAlert.details.risk_factors.map((factor: any, index: number) => (
                        <li key={index} className="ml-2">
                          {factor.type.replace(/_/g, ' ')}: +{factor.score} points
                          {factor.details && 
                            <span className="text-gray-500 text-xs ml-1">
                              ({Object.entries(factor.details)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')})
                            </span>
                          }
                        </li>
                      ))}
                      {!fraudAlert.details.risk_factors && (
                        <li className="ml-2">{fraudAlert.detection_method}: {fraudAlert.details.description || 'Suspicious activity detected'}</li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            </div>
            
            {showActions && fraudAlert.status === 'new' && (
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUpdateStatus('investigating')}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Investigate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleUpdateStatus('false_positive')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  False Positive
                </Button>
              </div>
            )}
            
            {showActions && fraudAlert.status === 'investigating' && (
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-green-500 border-green-200 hover:bg-green-50"
                  onClick={() => handleUpdateStatus('resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => handleUpdateStatus('false_positive')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  False Positive
                </Button>
              </div>
            )}
          </>
        )}
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-semibold">Transaction Type</p>
            <p className="text-gray-600 dark:text-gray-400">
              {transaction.type}
            </p>
          </div>
          <div>
            <p className="font-semibold">Date & Time</p>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date(transaction.timestamp).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="font-semibold">Merchant</p>
            <p className="text-gray-600 dark:text-gray-400">
              {transaction.merchant}
            </p>
          </div>
          <div>
            <p className="font-semibold">Payment Method</p>
            <p className="text-gray-600 dark:text-gray-400">
              {transaction.payment_method}
              {transaction.card_last4 && ` (${transaction.card_last4})`}
            </p>
          </div>
          {transaction.city && transaction.country && (
            <div className="col-span-2">
              <p className="font-semibold">Location</p>
              <p className="text-gray-600 dark:text-gray-400">
                {transaction.city && `${transaction.city}, `}
                {transaction.country || 'Unknown'}
                {transaction.ip_address && ` (${transaction.ip_address})`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskDetails;
