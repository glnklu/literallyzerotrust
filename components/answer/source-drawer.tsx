"use client";

import { useEffect, useRef } from "react";
import { X, ExternalLink, FileText, Video, Megaphone, Vote, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Answer, Source, SourceType } from "@/lib/mock-data";
import { SourceTypeLabel } from "@/components/source-chip";

interface SourceDrawerProps {
  answer: Answer;
  open: boolean;
  onClose: () => void;
  highlightId?: string;
}

const typeIcon: Record<SourceType, React.ElementType> = {
  transcript: FileText,
  video: Video,
  "press-release": Megaphone,
  "vote-record": Vote,
  interview: Mic,
};

function confidenceColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-amber-500";
  return "bg-red-500";
}

function SourceRow({ source, index, highlighted }: { source: Source; index: number; highlighted: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = typeIcon[source.type];

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border p-4 transition-colors",
        highlighted && "border-accent/50 bg-accent/5 ring-1 ring-accent/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-source/10 text-[11px] font-semibold text-source">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug">{source.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {source.publisher} · {new Date(source.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Icon className="h-3 w-3" />
              <SourceTypeLabel type={source.type} />
              {source.timestamp && ` · ${source.timestamp}`}
            </span>
            <a
              href={source.url}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              View source
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Confidence</span>
              <span className="font-mono">{source.confidence}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", confidenceColor(source.confidence))}
                style={{ width: `${source.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SourceDrawer({ answer, open, onClose, highlightId }: SourceDrawerProps) {
  const sourceIndex = new Map(answer.sources.map((s, i) => [s.id, i + 1]));

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[1px] transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="font-serif text-lg font-semibold">Sources</h3>
            <p className="text-xs text-muted-foreground">
              {answer.sources.length} primary sources for this answer
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-5">
          {answer.sources.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              index={sourceIndex.get(source.id) ?? 0}
              highlighted={highlightId === source.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
}
