// hooks/use-searchApi.ts
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import type { Search as SearchResult } from "@/types";

// Hook for fetching search index
export function useSearchApi(
  query: string,
  apiUrl: string = "/api/search-index",  // Default API URL
  queryParams: Record<string, string> = {} // Additional query params
) {
  const [index, setIndex] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchIndex = async () => {
      setLoading(true);
      try {
        // Build query parameters, including the passed query string and custom params
        const params = { query: encodeURIComponent(query), ...queryParams };
        const url = `${apiUrl}?${new URLSearchParams(params).toString()}`;

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
  }, [query, apiUrl, queryParams]);

  return { index, error, loading };
}
