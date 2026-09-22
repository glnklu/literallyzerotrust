"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceChip } from "@/components/source-chip";
import type { Answer } from "@/lib/mock-data";

interface ThemeSummaryProps {
  answer: Answer;
  onOpenSource: (id: string) => void;
  activeSourceId?: string;
}

export function ThemeSummary({ answer, onOpenSource, activeSourceId }: ThemeSummaryProps) {
  const sourceIndex = new Map(answer.sources.map((s, i) => [s.id, i + 1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-[15px] leading-relaxed text-foreground/90">{answer.summary}</p>

        <div className="space-y-5 border-t border-border pt-5">
          {answer.themes.map((theme) => (
            <div key={theme.id}>
              <div className="mb-1.5 flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold">{theme.heading}</h4>
                <div className="flex shrink-0 gap-1 pt-0.5">
                  {theme.sourceIds.map((sid) => {
                    const source = answer.sources.find((s) => s.id === sid);
                    const idx = sourceIndex.get(sid);
                    if (!source || !idx) return null;
                    return (
                      <SourceChip
                        key={sid}
                        source={source}
                        index={idx}
                        onClick={onOpenSource}
                        active={activeSourceId === sid}
                      />
                    );
                  })}
                </div>
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{theme.body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
