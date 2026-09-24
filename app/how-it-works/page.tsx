import Link from "next/link";
import { ArrowLeft, Search, Filter, Sparkles, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    icon: Search,
    title: "1. You ask a question",
    body: "Type a question about any public figure — a politician, executive, or other newsmaker — the same way you'd ask a colleague.",
  },
  {
    icon: Filter,
    title: "2. Targeted first-source searches are planned",
    body: "The figure and topic are identified, then split into targeted searches — official transcripts and government records, the figure's own organization, their own posts on X or Truth Social, and interview transcripts. No general web search is run, so secondary commentary and analysis never enter the mix.",
  },
  {
    icon: ShieldCheck,
    title: "3. Sources are scored before anything is written",
    body: "Every result is checked against a domain registry — official records, verified transcript archives, the figure's own social accounts, major news outlets — and given a confidence score. Anything too unreliable is dropped before it ever reaches the writing step.",
  },
  {
    icon: Sparkles,
    title: "4. Claude picks quotes first, then a short summary",
    body: "Claude reads only the sources that passed step 3 and pulls out the figure's own verbatim words — from posts, interviews, and official statements — each cited to its specific source. Only after the quotes are chosen does it write a short summary recapping what they show.",
  },
  {
    icon: ShieldCheck,
    title: "5. Quotes are checked, not just trusted",
    body: "Any verbatim quote is checked against the retrieved source text — and, if needed, the live page — before being shown. Confirmed quotes are marked as such; unconfirmed ones are flagged rather than hidden.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-dvh">
      <SiteHeader />
      <div className="container py-14">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>

          <h1 className="font-serif text-3xl font-semibold tracking-tight">How it works</h1>
          <p className="mt-2 text-muted-foreground">
            From a typed question to a cited answer — five steps, no step skipped.
          </p>

          <div className="mt-8 space-y-4">
            {STEPS.map((step) => (
              <Card key={step.title}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <step.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            When live search isn&apos;t connected — as in this preview unless you&apos;ve added your
            own API keys — the app falls back to a small set of ready-made example answers instead
            of guessing.
          </p>
        </div>
      </div>
    </main>
  );
}
