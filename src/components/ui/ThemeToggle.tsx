import { Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors cursor-pointer"
    >
      {theme === "dark" ? 
      <Sun size={20} weight="bold" className="hover:text-amber-500 hover:scale-110 transition-colors duration-300 ease-in-out" />
       : 
       <Moon size={20} weight="bold" className="hover:text-blue-700 hover:scale-110 transition-colors duration-300 ease-in-out" />
       }
    </button>
  );
}