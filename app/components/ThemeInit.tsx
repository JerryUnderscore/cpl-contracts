"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    // 1. Explicit user preference wins
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
      return;
    }

    // 2. Otherwise, follow system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = prefersDark ? "dark" : "light";
  }, []);

  return null;
}