
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import SafeSafeLogo from "./SafeSafeLogo";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You could log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <Card className="max-w-md w-full shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <SafeSafeLogo size="lg" />
              </div>
              <CardTitle className="text-red-500 flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
                {this.state.error?.message || "An unexpected error occurred"}
              </div>
              <p className="text-muted-foreground text-sm">
                We apologize for the inconvenience. Please try reloading the page or contact support if the issue persists.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 pt-2">
              <Button onClick={this.handleReload} variant="default">
                Reload Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
