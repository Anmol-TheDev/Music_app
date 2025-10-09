import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "./components/ui/sonner.tsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { Analytics } from "@vercel/analytics/next"
createRoot(document.getElementById("root")).render(
  <ThemeProvider defaultTheme="dark" storageKey="music-app-theme">
    <App />
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          success: "group-[.toaster]:text-white",
        },
      }}
    />
    <Analytics />
  </ThemeProvider>
);
