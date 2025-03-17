
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const FadeIn: React.FC<AnimationProps> = ({ 
  children, 
  className,
  delay = 0
}) => {
  return (
    <div 
      className={cn(
        "opacity-0 animate-fade-in", 
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const SlideInFromRight: React.FC<AnimationProps> = ({ 
  children, 
  className,
  delay = 0
}) => {
  return (
    <div 
      className={cn(
        "opacity-0 animate-slide-in-from-right", 
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const SlideInFromLeft: React.FC<AnimationProps> = ({ 
  children, 
  className,
  delay = 0
}) => {
  return (
    <div 
      className={cn(
        "opacity-0 animate-slide-in-from-left", 
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const AnimateChildren: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={cn("animate-children", className)}>
      {children}
    </div>
  );
};
