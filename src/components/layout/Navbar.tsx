
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { getProfileSummary } from "@/services/ProfileService";
import { useQuery } from "@tanstack/react-query";
import { 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  Shield,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SafeSafeLogo from "@/components/SafeSafeLogo";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { data: profileName } = useQuery({
    queryKey: ['profileSummary'],
    queryFn: getProfileSummary,
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <SafeSafeLogo size="md" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-700 hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/reports" className="text-slate-700 hover:text-primary transition-colors">Reports</Link>
            <Link to="/alerts" className="text-slate-700 hover:text-primary transition-colors">Alerts</Link>
            <Link to="/security/settings" className="text-slate-700 hover:text-primary transition-colors">Security</Link>
          </div>
          
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">3</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="px-3">
                  <span className="mr-2">{profileName || 'User'}</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {profileName?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile/settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/security/settings')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Security Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Activity Log</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/reports" 
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>
            <Link 
              to="/alerts" 
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Alerts
            </Link>
            <Link 
              to="/security/settings" 
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Security
            </Link>
            <Link 
              to="/profile/settings" 
              className="block py-2 text-slate-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start pl-0" 
              onClick={() => {
                handleSignOut();
                setIsMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
