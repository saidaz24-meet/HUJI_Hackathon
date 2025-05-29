// hooks/use-theme.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Try to get the dark mode preference from localStorage
      const savedDarkMode = localStorage.getItem("darkMode")
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode))
      } else {
        // Check for system preference if no saved preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setDarkMode(prefersDark)
      }
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save preference to localStorage
      localStorage.setItem("darkMode", JSON.stringify(darkMode))

      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [darkMode, mounted])

  return (
      <ThemeContext.Provider value={{ darkMode, setDarkMode, mounted }}>
        {children}
      </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}