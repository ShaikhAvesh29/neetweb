"use client";

import { useTheme } from "@/lib/theme";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-white/80 dark:border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center transition-colors"
      aria-label="Toggle Dark Mode"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-zinc-700" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-300" />
      )}
    </motion.button>
  );
}
