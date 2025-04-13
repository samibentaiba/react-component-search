// hooks/use-search.ts
"use client";

import { useState, useCallback } from "react";
import { useSearchApi } from "./use-searchApi";
import { useSearchContent } from "./use-searchContent";
import type { Search as SearchResult } from "@/types";

// Main hook combining search API and content filtering logic
export function useSearch(
  onSearchComplete: (
    query: string | null,
    results: SearchResult[]
  ) => void = () => {},
  apiUrl: string = "/api/search-index", // Default API URL
  queryParams: Record<string, string> = {} // Default empty query parameters
) {
  const [query, setQuery] = useState<string>("");

  // Fetch search index using the flexible API hook
  const { index, error, loading } = useSearchApi(query, apiUrl, queryParams);

  // Filter and group search results
  const { results, showResults, groupedResults, cleanPath, setShowResults } = useSearchContent(query, index);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowResults(true);
      onSearchComplete(query, results);
    },
    [query, results, onSearchComplete]
  );

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setShowResults(true);
  }, []);

  return {
    query,
    setQuery,
    results,
    error,
    loading,
    showResults,
    groupedResults,
    cleanPath,
    handleSearchSubmit,
    handleInputChange,
  };
}
