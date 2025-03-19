import React from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "../animations/FadeIn";
import { getRiskLevel } from "@/utils/fraudDetectionUtils";

interface RiskMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  size = "md",
  showLabel = true,
  className,
}) => {
  const level = getRiskLevel(score);
  
  // Set a fixed yellow color
  const fixedColor = "bg-yellow-500";
  
  const sizeDimensions = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };
  
  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  
  const valueSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  // Keep the current angle calculation (you mentioned it's slightly slanted)
  const angle = (39 / 100) * 180;
  
  return (
    <FadeIn className={cn("flex flex-col items-center", className)}>
      <div 
        className={cn(
          "relative rounded-full border-8 border-muted flex items-center justify-center",
          sizeDimensions[size]
        )}
      >
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div 
            className={cn(fixedColor, "absolute h-1/2 w-full")}
            style={{
              transformOrigin: 'center bottom',
              transform: `rotate(${angle}deg)`,
              opacity: 0.2
            }}
          ></div>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
            height: '45%',
            width: '2px',
            backgroundColor: fixedColor.split(' ')[0].replace('bg-', 'rgb(var(--') + '))',
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <div 
            className={cn(
              "w-2 h-2 absolute -top-1 -left-1 rounded-full",
              fixedColor
            )}
          ></div>
        </div>
        
        {/* Score value */}
        <div className="flex flex-col items-center justify-center">
          <span className={cn("font-bold", valueSize[size])}>39</span>
          <span className={cn("text-muted-foreground", textSize[size])}>/ 100</span>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-3 text-center">
          <p className={cn("font-semibold capitalize", textSize[size])}>
            {level} Risk
          </p>
        </div>
      )}
    </FadeIn>
  );
};

export default RiskMeter;
