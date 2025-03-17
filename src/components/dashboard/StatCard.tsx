
import React from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "../animations/FadeIn";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
  delay = 0
}) => {
  const trendColor = change 
    ? change.trend === "up" 
      ? "text-success" 
      : change.trend === "down" 
        ? "text-destructive" 
        : "text-muted-foreground"
    : "";

  const trendIcon = change 
    ? change.trend === "up" 
      ? "↑" 
      : change.trend === "down" 
        ? "↓" 
        : "→"
    : null;

  return (
    <FadeIn 
      delay={delay}
      className={cn(
        "glass-card p-6 rounded-xl hover-lift", 
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={cn("text-xs font-medium mt-1 flex items-center", trendColor)}>
              {trendIcon} {Math.abs(change.value)}% from last week
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default StatCard;
