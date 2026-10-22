import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router keeps the scroll position between pages; reset it, or jump to #hash targets.
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};
