// app/components/ThemeToggle.tsx
"use client";

import * as React from "react";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export default function ThemeToggle() {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    // ThemeInit likely sets this on mount; we mirror it.
    setThemeState(getCurrentTheme());

    // If something else changes theme (another toggle), stay in sync.
    const obs = new MutationObserver(() => setThemeState(getCurrentTheme()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="themeToggleIcon" aria-hidden="true">
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="themeToggleText">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}