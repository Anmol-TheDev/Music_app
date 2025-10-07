import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element with id 'root' not found");

createRoot(rootElement).render(
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
  </ThemeProvider>
);
