import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useTheme, presetThemes } from "@/context/ThemeContext";

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<string>(theme as string);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setSelectedTheme(storedTheme);
    }
  }, []);

  const applyTheme = (themeName: string) => {
    const root = document.documentElement as HTMLElement;
    const themeObj = (presetThemes as any)[themeName] as Record<string, string> | undefined;

    if (themeObj) {
      Object.entries(themeObj).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      setSelectedTheme(themeName);
      setTheme(themeName as any);
      localStorage.setItem("theme", themeName);
    }
  };

  const applyCustomColor = (colorKey: string, hexValue: string) => {
    const root = document.documentElement as HTMLElement;
    const hsl = hexToHSL(hexValue);
    root.style.setProperty(`--${colorKey}`, hsl);

    const customColors = JSON.parse(localStorage.getItem("customColors") || "{}");
    customColors[colorKey] = hsl;
    localStorage.setItem("customColors", JSON.stringify(customColors));
    setSelectedTheme("Custom");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Choose from preset themes or create your own custom color scheme.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(presetThemes as any).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => applyTheme(themeName)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTheme === themeName
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold mb-2">{themeName}</div>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(presetThemes as any)[themeName]["--primary"]})`,
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(presetThemes as any)[themeName]["--secondary"]})`,
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(presetThemes as any)[themeName]["--accent"]})`,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {(["primary", "secondary", "accent"] as const).map((colorKey) => (
              <div key={colorKey} className="space-y-2">
                <Label htmlFor={colorKey}>
                  {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)} Color
                </Label>
                <input
                  type="color"
                  id={colorKey}
                  className="w-full h-10 rounded-md cursor-pointer"
                  onChange={(e) => applyCustomColor(colorKey, (e.target as HTMLInputElement).value)}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function hexToHSL(hex?: string) {
  if (!hex) return "0 0% 0%";
  let next = hex.replace(/^#/, "");
  if (next.length === 3)
    next = next
      .split("")
      .map((c) => c + c)
      .join("");
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(next);
  if (!match) return "0 0% 0%";
  const r = parseInt(match[1], 16) / 255;
  const g = parseInt(match[2], 16) / 255;
  const b = parseInt(match[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
