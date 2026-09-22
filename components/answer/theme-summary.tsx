"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceChip } from "@/components/source-chip";
import type { Answer } from "@/lib/types";

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
              <h4 className="mb-1.5 text-sm font-semibold">{theme.heading}</h4>
              {/* Every sentence carries its own citation(s) right after it,
                  rather than one citation list for the whole paragraph. */}
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                {theme.claims.map((claim) => (
                  <span key={claim.id} className="mr-1.5">
                    {claim.text}
                    <span className="ml-1 inline-flex gap-0.5 align-middle">
                      {claim.sourceIds.map((sid) => {
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
                    </span>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
