"use client";

import { cn } from "@/lib/utils";
import type { Source } from "@/lib/mock-data";

const typeLabel: Record<Source["type"], string> = {
  transcript: "Transcript",
  video: "Video",
  "press-release": "Release",
  "vote-record": "Vote",
  interview: "Interview",
};

interface SourceChipProps {
  source: Source;
  index: number;
  onClick: (id: string) => void;
  active?: boolean;
}

export function SourceChip({ source, index, onClick, active }: SourceChipProps) {
  return (
    <button
      onClick={() => onClick(source.id)}
      title={`${source.title} — ${source.publisher}`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-source/30 bg-source/10 px-1.5 text-[10px] font-semibold text-source transition-colors hover:bg-source/20",
        active && "ring-2 ring-source/50"
      )}
    >
      {index}
    </button>
  );
}

export function SourceTypeLabel({ type }: { type: Source["type"] }) {
  return <>{typeLabel[type]}</>;
}
