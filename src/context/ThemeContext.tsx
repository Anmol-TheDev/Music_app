import { createContext, useContext, useEffect, useState } from "react";

type ThemeName = keyof typeof presetThemes | "system";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Full theme definitions
export const presetThemes = {
  default: {
    "--background": "204 50% 8%",
    "--foreground": "204 5% 90%",
    "--card": "204 50% 8%",
    "--card-foreground": "204 5% 90%",
    "--primary": "204 100% 31%",
    "--secondary": "204 30% 10%",
    "--accent": "166 30% 15%",
  },
  light: {
    "--background": "0 0% 100%",
    "--foreground": "0 0% 3.9%",
    "--card": "0 0% 100%",
    "--card-foreground": "0 0% 3.9%",
    "--primary": "0 0% 9%",
    "--secondary": "0 0% 96.1%",
    "--accent": "0 0% 96.1%",
  },
  dark: {
    "--background": "0 0% 6%",
    "--foreground": "0 0% 98%",
    "--card": "0 0% 10%",
    "--card-foreground": "0 0% 98%",
    "--primary": "220 80% 60%",
    "--secondary": "0 0% 20%",
    "--accent": "220 80% 60%",
  },
  Purple: {
    "--background": "270 95.2% 75.3%",
    "--foreground": "262.1 83.3% 57.8%",
    "--card": "280 89.1% 89.2%",
    "--card-foreground": "262.1 83.3% 57.8%",
    "--primary": "262.1 83.3% 57.8%",
    "--secondary": "270 95.2% 75.3%",
    "--accent": "280 89.1% 89.2%",
  },
  Blue: {
    "--background": "210 40% 96.1%",
    "--foreground": "221.2 83.2% 53.3%",
    "--card": "210 40% 96.1%",
    "--card-foreground": "221.2 83.2% 53.3%",
    "--primary": "221.2 83.2% 53.3%",
    "--secondary": "210 40% 96.1%",
    "--accent": "210 40% 96.1%",
  },
  Green: {
    "--background": "145 63% 93%",
    "--foreground": "145 63% 17%",
    "--card": "145 63% 93%",
    "--card-foreground": "145 63% 17%",
    "--primary": "158 57% 32%",
    "--secondary": "145 63% 93%",
    "--accent": "158 57% 32%",
  },
  Orange: {
    "--background": "24 100% 95%",
    "--foreground": "24 100% 20%",
    "--card": "24 100% 95%",
    "--card-foreground": "24 100% 20%",
    "--primary": "24 100% 50%",
    "--secondary": "24 100% 95%",
    "--accent": "24 100% 50%",
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem("theme") as ThemeName) || "default";
  });

  const applyCustomColors = (root: HTMLElement) => {
    try {
      const customColors = JSON.parse(localStorage.getItem("customColors") || "{}") as Record<
        string,
        string
      >;
      Object.entries(customColors).forEach(([key, value]) =>
        root.style.setProperty(`--${key}`, value)
      );
    } catch (e) {
      console.warn("Failed to apply custom colors:", e);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const allVars = [
      "--background",
      "--foreground",
      "--card",
      "--card-foreground",
      "--primary",
      "--secondary",
      "--accent",
    ];

    allVars.forEach((v) => root.style.removeProperty(v));

    let themeToApply: keyof typeof presetThemes;
    if (theme === "system") themeToApply = "light";
    else themeToApply = theme as keyof typeof presetThemes;
    let cleanup: (() => void) | undefined;

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      themeToApply = (mediaQuery.matches ? "dark" : "light") as keyof typeof presetThemes;

      const listener = (e: MediaQueryListEvent) => {
        const newTheme = (e.matches ? "dark" : "light") as keyof typeof presetThemes;
        const selected = presetThemes[newTheme] || presetThemes.light;
        Object.entries(selected).forEach(([key, value]) => root.style.setProperty(key, value));
        applyCustomColors(root);
      };

      mediaQuery.addEventListener("change", listener);
      cleanup = () => mediaQuery.removeEventListener("change", listener);
    }

    const selectedTheme = presetThemes[themeToApply] || presetThemes.light;
    Object.entries(selectedTheme).forEach(([key, value]) => root.style.setProperty(key, value));
    applyCustomColors(root);

    return cleanup;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
