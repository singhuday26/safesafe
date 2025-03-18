
import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, onToggle }) => {
  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          onClick={onToggle}
          className="ml-1 text-primary hover:underline focus:outline-none group flex items-center inline-flex"
        >
          <span>{isLogin ? "Sign Up" : "Login"}</span>
          <motion.span 
            initial={{ x: 0, opacity: 0 }}
            whileHover={{ x: 5, opacity: 1 }}
            className="inline-block ml-1"
          >
            <ArrowRight className="h-3 w-3" />
          </motion.span>
        </button>
      </p>
    </div>
  );
};

export default AuthToggle;
