
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Transaction } from "@/types/database";
import { BlockchainVerification, verifyTransactionOnBlockchain, exportVerificationCertificate } from "@/services/BlockchainVerificationService";
import { FileLock, CheckCircle, XCircle, Clock, Download, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface TransactionVerificationProps {
  transaction: Transaction;
  existingVerification?: BlockchainVerification;
}

const TransactionVerification: React.FC<TransactionVerificationProps> = ({
  transaction,
  existingVerification
}) => {
  const [verification, setVerification] = useState<BlockchainVerification | null>(
    existingVerification || null
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const { toast } = useToast();
  
  // If no existing verification was provided, verify on component mount
  useEffect(() => {
    if (!existingVerification && !verification) {
      verifyTransaction();
    }
  }, [existingVerification]);
  
  const verifyTransaction = async () => {
    try {
      setIsVerifying(true);
      const result = await verifyTransactionOnBlockchain(transaction);
      setVerification(result);
      
      if (result.status === 'verified') {
        toast({
          title: "Transaction Verified",
          description: "Transaction has been successfully verified on the blockchain.",
          variant: "default"
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Unable to verify transaction on the blockchain.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error verifying transaction:", error);
      toast({
        title: "Verification Error",
        description: "An error occurred during verification.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const exportCertificate = () => {
    if (!verification) return;
    
    const certificateJson = exportVerificationCertificate(transaction, verification);
    
    // Create and download the file
    const blob = new Blob([certificateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification-${transaction.transaction_number}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Certificate Exported",
      description: "Verification certificate has been downloaded.",
    });
  };
  
  const getStatusIcon = () => {
    if (isVerifying) return <Skeleton className="h-12 w-12 rounded-full" />;
    
    switch (verification?.status) {
      case 'verified':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <FileLock className="h-12 w-12 text-muted-foreground" />;
    }
  };
  
  const getStatusBadge = () => {
    if (isVerifying) return <Skeleton className="h-6 w-24" />;
    
    switch (verification?.status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-500">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Blockchain Verification</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Immutable transaction verification record</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center py-3">
          {getStatusIcon()}
        </div>
        
        {verification ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction Hash:</span>
                <span className="text-sm font-mono truncate max-w-[200px]">{verification.transactionHash}</span>
              </div>
              
              {verification.blockNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Block Number:</span>
                  <span className="text-sm font-mono">{verification.blockNumber}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network:</span>
                <span className="text-sm">{verification.networkName}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verification Time:</span>
                <span className="text-sm">{new Date(verification.timestamp).toLocaleString()}</span>
              </div>
            </div>
            
            {verification.status === 'verified' ? (
              <Alert className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Verified Successfully</AlertTitle>
                <AlertDescription>
                  This transaction has been cryptographically verified and recorded on the blockchain.
                </AlertDescription>
              </Alert>
            ) : verification.status === 'failed' ? (
              <Alert className="bg-red-500/10 text-red-500 border-red-500/20">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  We couldn't verify this transaction. Please try again or contact support.
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        ) : isVerifying ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <Alert>
            <FileLock className="h-4 w-4" />
            <AlertTitle>Not Verified</AlertTitle>
            <AlertDescription>
              This transaction has not been verified on the blockchain yet.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-end">
        {verification?.verificationUrl && (
          <Button variant="outline" size="sm" onClick={() => window.open(verification.verificationUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>
        )}
        
        {verification?.status === 'verified' && (
          <Button size="sm" onClick={exportCertificate}>
            <Download className="mr-2 h-4 w-4" />
            Export Certificate
          </Button>
        )}
        
        {(!verification || verification.status === 'failed') && !isVerifying && (
          <Button onClick={verifyTransaction} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify Transaction"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TransactionVerification;
