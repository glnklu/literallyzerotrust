export function AnswerSkeleton() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <div className="shimmer-bg h-11 w-11 animate-shimmer rounded-full" />
        <div className="space-y-2">
          <div className="shimmer-bg h-3.5 w-32 animate-shimmer rounded" />
          <div className="shimmer-bg h-3 w-24 animate-shimmer rounded" />
        </div>
      </div>
      <div className="shimmer-bg h-7 w-3/4 animate-shimmer rounded" />
      <div className="space-y-3 rounded-xl border border-border p-5">
        <div className="shimmer-bg h-3.5 w-full animate-shimmer rounded" />
        <div className="shimmer-bg h-3.5 w-11/12 animate-shimmer rounded" />
        <div className="shimmer-bg h-3.5 w-4/5 animate-shimmer rounded" />
        <div className="pt-3 space-y-2">
          <div className="shimmer-bg h-3 w-2/3 animate-shimmer rounded" />
          <div className="shimmer-bg h-3 w-3/4 animate-shimmer rounded" />
        </div>
      </div>
      <div className="rounded-xl border border-border p-5">
        <div className="shimmer-bg mb-3 h-3.5 w-40 animate-shimmer rounded" />
        <div className="shimmer-bg h-20 w-full animate-shimmer rounded-lg" />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Retrieving statements and cross-checking sources…
      </p>
    </div>
  );
}
