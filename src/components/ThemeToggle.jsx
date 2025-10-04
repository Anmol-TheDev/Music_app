import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-3">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="theme-toggle" className="text-sm cursor-pointer">
          Dark Mode
        </Label>
      </div>
      <Switch
        id="theme-toggle"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}
