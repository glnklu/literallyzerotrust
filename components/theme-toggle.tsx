"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "theme";
type ThemePreference = "light" | "dark" | "system";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(pref: ThemePreference) {
  const dark = pref === "dark" || (pref === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

const CYCLE: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const META: Record<ThemePreference, { icon: typeof Sun; label: string }> = {
  system: { icon: MonitorSmartphone, label: "System theme" },
  light: { icon: Sun, label: "Light theme" },
  dark: { icon: Moon, label: "Dark theme" },
};

export function ThemeToggle() {
  // Lazy initializer reads the same source the inline script (layout.tsx)
  // used, so React's first render already agrees with the DOM.
  const [pref, setPref] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? "system";
  });

  // Re-apply the DOM class directly (no setState) whenever `pref` changes.
  // This also covers React Strict Mode's dev-only remount, which resets
  // <html> to only the attributes it manages from JSX and clears the class
  // the inline script set — a no-op in production, but without this dark
  // mode appears to "reset" in dev. See Next's flash-prevention guide.
  useLayoutEffect(() => {
    applyTheme(pref);
  }, [pref]);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [pref]);

  const cycle = useCallback(() => {
    setPref((current) => {
      const next = CYCLE[current];
      localStorage.setItem(STORAGE_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const { icon: Icon, label } = META[pref];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      title={`Theme: ${label}. Click to change.`}
      aria-label={`Theme: ${label}. Click to change.`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
