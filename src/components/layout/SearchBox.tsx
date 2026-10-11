"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  categories: { slug: string; name: string; description: string | null }[];
  bundles: { slug: string; title: string; category_slug: string; price_inr: number }[];
}

const EMPTY_RESULT: SearchResult = { categories: [], bundles: [] };

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>(EMPTY_RESULT);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY_RESULT);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // best-effort; leave previous results visible rather than erroring
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const hasResults = results.categories.length > 0 || results.bundles.length > 0;

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative w-full md:max-w-xs">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search exams or bundles..."
          className="w-full rounded-full border border-border-subtle bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border-subtle bg-surface-raised shadow-lg">
          {loading && !hasResults ? (
            <p className="px-4 py-3 text-sm text-foreground/50">Searching...</p>
          ) : !hasResults ? (
            <p className="px-4 py-3 text-sm text-foreground/50">No results for &quot;{query}&quot;.</p>
          ) : (
            <>
              {results.categories.length > 0 && (
                <div className="border-b border-border-subtle p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/40">
                    Exam Categories
                  </p>
                  {results.categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => go(`/categories/${c.slug}`)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50"
                    >
                      <span className="font-medium text-foreground">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.bundles.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/40">
                    Bundles
                  </p>
                  {results.bundles.map((b) => (
                    <button
                      key={b.slug}
                      onClick={() => go(`/bundles/${b.slug}`)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50"
                    >
                      <span className="font-medium text-foreground">{b.title}</span>
                      <span className="text-xs text-foreground/50">₹{b.price_inr}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
