import Link from "next/link";
import { ArrowLeft, Layers, Quote, MessagesSquare, AlertTriangle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PRINCIPLES = [
  {
    icon: Layers,
    title: "Sources are tiered, not treated equally",
    body: "Government and official records score highest, then verified transcript archives and the figure's own social posts, then major news outlets. Anything outside this registry scores low and is usually excluded rather than cited as if it were primary.",
  },
  {
    icon: MessagesSquare,
    title: "The answer is quotes, not a paraphrase",
    body: "Every answer is built from the figure's own verbatim words — a post, an interview, an official statement — never a synthesized narrative written about them. If there's no clean quote to pull, that topic simply isn't answered.",
  },
  {
    icon: Quote,
    title: "Quotes are verified, not assumed",
    body: "A \"verbatim\" quote is checked against the retrieved source text — and, if needed, the live source page — before it's shown. If neither confirms it, it's still shown, but visibly flagged as unconfirmed rather than presented as a clean match.",
  },
  {
    icon: AlertTriangle,
    title: "Insufficient evidence is reported, never papered over",
    body: "If the sources found don't clearly answer the question, the app says so directly instead of stretching thin material into a confident-sounding answer.",
  },
];

export default function MethodologyPage() {
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

          <h1 className="font-serif text-3xl font-semibold tracking-tight">Methodology</h1>
          <p className="mt-2 text-muted-foreground">The rules the pipeline follows, and why.</p>

          <div className="mt-8 space-y-4">
            {PRINCIPLES.map((principle) => (
              <Card key={principle.title}>
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <principle.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <CardTitle className="text-base">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
                  {principle.body}
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
            None of this replaces reading the source yourself — every card in the app links
            directly to where a claim came from.
          </p>
        </div>
      </div>
    </main>
  );
}
