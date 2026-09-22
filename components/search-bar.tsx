"use client";

import { FormEvent, useState } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
}

export function SearchBar({ onSearch, loading, initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm ring-1 ring-transparent transition-shadow focus-within:ring-accent/40">
        <Search className="ml-2 h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask what a public figure has actually said, e.g. “What is Trump's stance on Iran?”"
          className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
        />
        <Button type="submit" size="default" disabled={loading || !value.trim()} className="shrink-0">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching
            </>
          ) : (
            <>
              Ask
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
