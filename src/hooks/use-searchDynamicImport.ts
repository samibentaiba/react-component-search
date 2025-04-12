// hooks/use-searchDynamicImport.ts
"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";

type ComponentLoader = () => Promise<{ default: ComponentType<any> }>;

export function useSearchDynamicImport(
  path: string | null,
  componentMap: Record<string, ComponentLoader>
) {
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      console.log(`Attempting to load component from: ${path}`);

      if (!path) {
        setComponent(null);
        return;
      }

      const loader = componentMap[path];

      if (!loader) {
        console.error("Invalid or missing path in componentMap.");
        setComponent(null);
        return;
      }

      try {
        const mod = await loader(); // ✅ no more TS error here
        setComponent(() => mod.default);
      } catch (error) {
        console.error("Error during component loading:", error);
        setComponent(null);
      }
    };

    loadComponent();
  }, [path, componentMap]);

  return Component;
}
