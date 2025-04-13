// hooks/use-searchResult.ts
import { useState } from "react";

import type { Search as SearchResult } from "@/types";

export const useSearchResult = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const handleSearchComplete = (
    _query: string | null,
    results: SearchResult[]
  ) => {
    setSearchResults(results);
  };

  return {
    searchResults,
    handleSearchComplete,
  };
};
