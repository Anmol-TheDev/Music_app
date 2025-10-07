import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-3">
        <div
          className="transition-transform duration-300 ease-in-out transform"
          key={isDark ? "moon" : "sun"}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-muted-foreground transition-all duration-300 ease-in-out" />
          ) : (
            <Sun className="h-4 w-4 text-muted-foreground transition-all duration-300 ease-in-out" />
          )}
        </div>

        <Label htmlFor="theme-toggle" className="text-sm cursor-pointer">
          {isDark ? "Light Mode" : "Dark Mode"}
        </Label>
      </div>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}
