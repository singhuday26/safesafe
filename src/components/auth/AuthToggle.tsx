
import React from "react";

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
          className="ml-1 text-primary hover:underline focus:outline-none"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthToggle;
