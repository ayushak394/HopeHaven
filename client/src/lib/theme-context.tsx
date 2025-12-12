// "use client";

// import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// type Theme = "light" | "dark" | "calm-blue" | "sunset-orange" | "lavender";

// interface ThemeContextType {
//   theme: Theme;
//   setTheme: (theme: Theme) => void;
// }

// const ThemeContext = createContext<ThemeContextType | null>(null);

// export function ThemeProvider({ children }: { children: ReactNode }) {
//   const [theme, setTheme] = useState<Theme>("light");

//   useEffect(() => {
//   document.documentElement.setAttribute("data-theme", theme);
//   document.documentElement.className = theme;  // ⭐ REQUIRED ⭐
// }, [theme]);

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme }}>
//       <div data-theme={theme}>{children}</div>
//     </ThemeContext.Provider>
//   );
// }

// export function useTheme() {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useTheme must be used inside ThemeProvider");
//   }
//   return context;
// }

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark" | "calm-blue" | "sunset-orange" | "lavender";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.className = theme;  
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
