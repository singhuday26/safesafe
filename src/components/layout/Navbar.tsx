
import React from "react";
import { Shield, LogOut, Bell, Search } from "lucide-react";
import { FadeIn } from "../animations/FadeIn";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out.",
        variant: "destructive",
      });
    }
  };

  // Get initials from user email
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <FadeIn>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 glass-morphism">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-xl">SecuraSentry</span>
          </div>
          
          <div className="hidden md:flex relative mx-auto max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full h-9 pl-10 pr-4 rounded-md bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium hover:text-primary click-bounce">Dashboard</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary click-bounce">Transactions</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary click-bounce">Reports</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary click-bounce">Settings</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted click-bounce relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"></span>
            </button>
            
            <div className="relative group">
              <Avatar className="cursor-pointer ring-2 ring-offset-2 ring-offset-background ring-primary/10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-popover border border-border invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">User</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start px-4 py-2 text-sm text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </FadeIn>
  );
};

export default Navbar;
