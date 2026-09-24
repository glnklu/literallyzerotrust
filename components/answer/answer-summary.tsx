"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Answer } from "@/lib/types";

interface AnswerSummaryProps {
  answer: Answer;
}

export function AnswerSummary({ answer }: AnswerSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[15px] leading-relaxed text-foreground/90">{answer.summary}</p>
      </CardContent>
    </Card>
  );
}
