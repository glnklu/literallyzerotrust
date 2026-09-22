"use client";

import { useState } from "react";
import { AnswerHeader } from "@/components/answer/answer-header";
import { ThemeSummary } from "@/components/answer/theme-summary";
import { QuoteBlock } from "@/components/answer/quote-block";
import { StanceShiftTimeline } from "@/components/answer/stance-shift";
import { RelatedPrompts } from "@/components/answer/related-prompts";
import { SourceDrawer } from "@/components/answer/source-drawer";
import type { Answer } from "@/lib/types";

interface AnswerViewProps {
  answer: Answer;
  onSelectRelated: (prompt: string) => void;
}

export function AnswerView({ answer, onSelectRelated }: AnswerViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | undefined>();

  function openSource(id: string) {
    setActiveSourceId(id);
    setDrawerOpen(true);
  }

  return (
    // SourceDrawer is deliberately a sibling here, not a child of the
    // animated div: the fade-in animation sets a transient CSS `transform`
    // on its element (even the "to" keyframe's translateY(0) counts), which
    // would make it the containing block for the drawer's `fixed`
    // positioning and briefly drag the closed drawer into view.
    <>
      <div className="animate-fade-in">
        <AnswerHeader answer={answer} onOpenSources={() => setDrawerOpen(true)} />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <ThemeSummary answer={answer} onOpenSource={openSource} activeSourceId={activeSourceId} />
            <QuoteBlock answer={answer} onOpenSource={openSource} activeSourceId={activeSourceId} />
            {answer.stanceShift && (
              <StanceShiftTimeline answer={answer} onOpenSource={openSource} activeSourceId={activeSourceId} />
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <RelatedPrompts prompts={answer.relatedPrompts} onSelect={onSelectRelated} />
          </div>
        </div>
      </div>

      <SourceDrawer
        answer={answer}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        highlightId={activeSourceId}
      />
    </>
  );
}
