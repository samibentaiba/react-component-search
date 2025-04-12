// hooks/use-searchResult.ts
import { useState } from "react";

export type SearchResult = {
  path: string;
  content: string;
};

export const useSearchResult = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const handleSearchComplete = (
    _query: string | null,
    results: SearchResult[],
  ) => {
    setSearchResults(results);
  };

  return {
    searchResults,
    handleSearchComplete,
  };
};
