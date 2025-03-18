
import React, { ReactNode } from "react";
import { Shield } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

interface AuthContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex flex-col items-center justify-center p-4">
      <FadeIn>
        <div className="w-full max-w-md glass-card rounded-xl p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">
            {title}
          </h1>
          
          <p className="text-center text-muted-foreground mb-8">
            {subtitle}
          </p>
          
          {children}
        </div>
      </FadeIn>
    </div>
  );
};

export default AuthContainer;
