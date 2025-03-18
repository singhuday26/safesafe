
import React from "react";
import { Shield, Lock } from "lucide-react";

interface SafeSafeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon";
  className?: string;
}

const SafeSafeLogo: React.FC<SafeSafeLogoProps> = ({ 
  size = "md", 
  variant = "full",
  className = ""
}) => {
  // Size mapping
  const sizeMap = {
    sm: { icon: 16, text: "text-lg" },
    md: { icon: 24, text: "text-xl" },
    lg: { icon: 32, text: "text-2xl" },
    xl: { icon: 40, text: "text-3xl" }
  };
  
  // Get current size
  const currentSize = sizeMap[size];
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <Shield 
          className="text-primary" 
          size={currentSize.icon} 
        />
        <Lock 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-foreground" 
          size={currentSize.icon / 2.5} 
        />
      </div>
      
      {variant === "full" && (
        <span className={`ml-2 font-bold ${currentSize.text} text-primary`}>
          SafeSafe
        </span>
      )}
    </div>
  );
};

export default SafeSafeLogo;
