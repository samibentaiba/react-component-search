// hooks/use-searchContent.ts
"use client";

import { useCallback, useState, useEffect } from "react";
import type { Search as SearchResult } from "@/types";
import type { GroupedResults } from "@/types";

// Hook for filtering and grouping search results based on query
export function useSearchContent(query: string, index: SearchResult[]) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Filter results when query or index changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = index.filter(({ content }) =>
      content.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, index]);

  const groupedResults: GroupedResults = results.reduce((acc, result) => {
    const path = result.path;
    (acc[path] ??= []).push(result.content);
    return acc;
  }, {} as GroupedResults);

  const cleanPath = useCallback(({ path }: { path: string | null }) => {
    if (!path) return "";
    return path.startsWith("src/") ? path.slice(4) : path;
  }, []);

  return {
    results,
    showResults,
    groupedResults,
    cleanPath,
    setShowResults,
  };
}
