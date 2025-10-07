import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";

interface PasswordToggleProps {
  showPassword: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({
  showPassword,
  onToggle,
  disabled = false,
  className = "",
}) => {
  const Icon = showPassword ? EyeOff : Eye;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={`absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent ${className}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
    </Button>
  );
};

export { PasswordToggle };
