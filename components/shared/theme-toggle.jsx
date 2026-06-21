"use client";

import { useState } from "react";
import { Moon, SunMedium } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof document === "undefined") {
      return "dark";
    }

    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  function toggleTheme() {
    const nextTheme =
      theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );

    document.documentElement.dataset.theme =
      nextTheme;

    window.localStorage.setItem(
      "gridlock-theme",
      nextTheme
    );

    setTheme(nextTheme);
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}