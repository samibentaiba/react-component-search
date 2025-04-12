// hooks/use-searchContent.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";

// Types
export interface SearchResult {
  path: string;
  content: string;
}

export interface GroupedResults {
  [path: string]: string[];
}

// Hook
export function useSearch(
  onSearchComplete: (
    query: string | null,
    results: SearchResult[]
  ) => void = () => {}
) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchResult[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch search index when query changes
  useEffect(() => {
    const fetchIndex = async () => {
      setLoading(true);
      try {
        const url = `/api/search-index?query=${encodeURIComponent(query)}`;
        console.log("Making request to:", url);
        const response = await axios.get<SearchResult[]>(url);
        setIndex(response.data);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching search index:", err);
        if (err instanceof Error) {
          setError(`Failed to load search data: ${err.message}`);
        } else {
          setError("Failed to load search data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) {
      fetchIndex();
    }
  }, [query]);

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
