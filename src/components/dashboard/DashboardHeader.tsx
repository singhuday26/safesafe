
import React from "react";
import { Clock, Bell } from "lucide-react";
import { FadeIn } from "../animations/FadeIn";

interface DashboardHeaderProps {
  heading: string;
  text: string;
  children?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ heading, text, children }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <FadeIn className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground mt-1">{text}</p>
          <div className="flex items-center mt-2 text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{currentDate}</span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center">
          <button className="mr-2 relative p-2 rounded-full hover:bg-muted/50 click-bounce">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          {children}
        </div>
      </div>
    </FadeIn>
  );
};

export default DashboardHeader;
