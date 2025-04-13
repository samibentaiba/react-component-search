// src/api.ts
import fs from "fs";
import path from "path";

import type { Search as SearchResult } from "@/types";

export function searchIndex(query: string): SearchResult[] {
  const filePath = path.join(process.cwd(), "src/data", "search-index.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const index = JSON.parse(rawData) as SearchResult[];

  return index.filter(({ content }) =>
    content.toLowerCase().includes(query.toLowerCase())
  );
}
