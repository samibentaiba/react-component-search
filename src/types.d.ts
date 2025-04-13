// src/types.d.ts

// Unified Search Entry Type
export interface Search {
  path: string;
  content: string;
}

// Grouped Results Type
export interface GroupedResults {
  [path: string]: string[];
}

// Component Loader Type
import type { ComponentType } from "react";

export type ComponentLoader = () => Promise<{ default: ComponentType<any> }>;

// Note: No need for separate SearchResult or SearchIndexEntry anymore
