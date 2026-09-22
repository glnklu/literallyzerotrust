"use client";

import { ShieldCheck, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4.5 w-4.5" strokeWidth={2.25} />
          </div>
          <div className="leading-none">
            <p className="font-serif text-[15px] font-semibold tracking-tight">
              literally<span className="text-accent">zero</span>trust
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Statement &amp; Interview Explorer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#methodology" className="transition-colors hover:text-foreground">
              Methodology
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              Source
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
