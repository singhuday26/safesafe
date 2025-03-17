
import React, { useEffect, useState } from "react";
import { SecurityTip, fetchSecurityTip } from "@/services/SecurityTipsService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface SecurityTipAlertProps {
  className?: string;
}

const SecurityTipAlert: React.FC<SecurityTipAlertProps> = ({ className }) => {
  const [tip, setTip] = useState<SecurityTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTip = async () => {
      try {
        const securityTip = await fetchSecurityTip();
        setTip(securityTip);
      } catch (error) {
        console.error("Failed to load security tip:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTip();
  }, []);

  if (loading) {
    return null;
  }

  if (!tip) {
    return null;
  }

  return (
    <Alert className={`mb-6 border-primary/20 bg-primary/5 ${className}`}>
      <Shield className="h-5 w-5 text-primary" />
      <AlertTitle className="text-primary">Security Tip</AlertTitle>
      <AlertDescription className="mt-2 text-sm">
        {tip.tip}
        {tip.source && (
          <div className="mt-2 text-xs text-muted-foreground">
            Source: {tip.source}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default SecurityTipAlert;
