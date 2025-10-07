import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "./LandingPage";

export default function HomeRedirect() {
  const navigate = useNavigate();
  const [shouldShowLanding, setShouldShowLanding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("hasVisited");

    if (hasVisited === "true") {
      // Returning user - redirect to search with default query
      const defaultSearch = localStorage.getItem("search") || "top hits";
      navigate(`/search?searchTxt=${encodeURIComponent(defaultSearch)}`, { replace: true });
    } else {
      // First-time visitor - mark as visited and show landing page
      localStorage.setItem("hasVisited", "true");
      setShouldShowLanding(true);
    }

    setIsChecking(false);
  }, [navigate]);

  // Don't render anything while checking
  if (isChecking) {
    return null;
  }

  // Only show landing page for first-time visitors
  return shouldShowLanding ? <LandingPage /> : null;
}
