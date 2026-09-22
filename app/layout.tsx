import type { Metadata } from "next";
import { Inter, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trust No One? — Public Figure Statement Explorer",
  description:
    "Understand influential public figures by their actual words — not second-hand commentary. Source-backed, neutral, fact-based.",
};

// Runs synchronously during HTML parsing, before first paint, so the theme
// is correct on the very first frame instead of flashing light-then-dark.
// See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
// ("Themes"). We use a `dark` class (not the doc's `data-theme` attribute)
// to match Tailwind's `darkMode: ["class"]` config and globals.css's `.dark` block.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(inter.variable, sourceSerif.variable, plexMono.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
