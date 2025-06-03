import React, { createContext, useContext, useReducer, useEffect } from "react";

const ThemeContext = createContext();

const themeReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        isDarkMode: !state.isDarkMode,
      };
    case "SET_THEME":
      return {
        ...state,
        isDarkMode: action.payload,
      };
    default:
      return state;
  }
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    isDarkMode: false,
  });

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      dispatch({ type: "SET_THEME", payload: true });
    }
  }, []);

  useEffect(() => {
    // Store current scroll position
    const scrollY = window.scrollY;

    // Apply theme to document with smooth transition
    const html = document.documentElement;
    const body = document.body;

    if (state.isDarkMode) {
      html.classList.add("dark");
      body.style.backgroundColor = "#111827"; // gray-900
      body.style.color = "#f9fafb"; // gray-50
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      body.style.backgroundColor = "#f9fafb"; // gray-50
      body.style.color = "#111827"; // gray-900
      localStorage.setItem("theme", "light");
    }

    // Restore scroll position after theme change
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });

    // Fix for browsers that lose scroll position during theme transitions
    setTimeout(() => {
      if (Math.abs(window.scrollY - scrollY) > 10) {
        window.scrollTo(0, scrollY);
      }
    }, 50);
  }, [state.isDarkMode]);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        dispatch({ type: "SET_THEME", payload: e.matches });
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    dispatch({ type: "TOGGLE_THEME" });
  };

  return (
    <ThemeContext.Provider value={{ ...state, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
