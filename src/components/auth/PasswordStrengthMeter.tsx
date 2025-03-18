
import React from "react";

interface PasswordStrengthMeterProps {
  strength: number; // 0-5 (0=empty, 1=weak, 2=fair, 3=good, 4=strong, 5=very strong)
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  strength 
}) => {
  // Skip if password is empty
  if (strength === 0) return null;
  
  const getStrengthLabel = () => {
    switch (strength) {
      case 1: return { text: "Weak", color: "text-red-500" };
      case 2: return { text: "Fair", color: "text-orange-500" };
      case 3: return { text: "Good", color: "text-yellow-500" };
      case 4: return { text: "Strong", color: "text-lime-500" };
      case 5: return { text: "Very Strong", color: "text-green-500" };
      default: return { text: "", color: "" };
    }
  };
  
  const getBarColor = (barIndex: number) => {
    if (barIndex > strength) return "bg-gray-200";
    
    switch (strength) {
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-lime-500";
      case 5: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };
  
  const label = getStrengthLabel();
  
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs">Password strength:</span>
        <span className={`text-xs font-semibold ${label.color}`}>{label.text}</span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div 
            key={index} 
            className={`h-full flex-1 rounded-sm ${getBarColor(index)}`}
          />
        ))}
      </div>
    </div>
  );
};
