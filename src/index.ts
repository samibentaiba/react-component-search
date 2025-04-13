// src/index.ts
import path from "path";
import fs from "fs";
import { glob } from "glob";
import ts from "typescript";
import { minimatch } from "minimatch";

export * from "./hooks/use-searchContent";
export * from "./hooks/use-searchDynamicImport";
export * from "./hooks/use-searchResult";
export * from "./api";

// Type definitions
export type SearchResult = {
  path: string;
  content: string;
};

export interface SearchIndexEntry {
  path: string;
  content: string;
}

export interface ProjectIndexerConfig {
  src?: string | string[];
  exclude?: string[];
  outputDir?: string;
  searchTerm?: string;
}

// Function to parse TypeScript and JSX/TSX
function parseTSX(content: string) {
  const sourceFile = ts.createSourceFile(
    "temp.tsx",
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  return sourceFile;
}

function searchInFile(filePath: string, searchTerm: string): string[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const matches: string[] = [];

    if (filePath.endsWith(".js") || filePath.endsWith(".jsx")) {
      const regex = new RegExp(searchTerm, "gi");
      const match = content.match(regex);
      if (match) {
        matches.push(...match);
      }
    } else {
      const sourceFile = parseTSX(content);

      const visitNode = (node: ts.Node) => {
        if (ts.isJsxText(node)) {
          const text = node.text.trim();
          if (text && (searchTerm === "" || text.toLowerCase().includes(searchTerm.toLowerCase()))) {
            matches.push(text);
          }
        }
        if (
          ts.isJsxAttribute(node) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer)
        ) {
          const value = node.initializer.text;
          if (searchTerm === "" || value.toLowerCase().includes(searchTerm.toLowerCase())) {
            if (ts.isIdentifier(node.name)) {
              matches.push(`${node.name.text}="${node.initializer.text}"`);
            }
          }
        }
        ts.forEachChild(node, visitNode); // Traverse child nodes
      };

      visitNode(sourceFile);
    }

    return matches;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error processing file ${filePath}:`, error.message);
    } else {
      console.error(`Error processing file ${filePath}: ${String(error)}`);
    }
    return [];
  }
}

function isPathExcluded(filePath: string, excludedPaths: string[]): boolean {
  const normalized = filePath.replace(/\\/g, "/");

  return excludedPaths.some((pattern) =>
    minimatch(normalized, pattern, { matchBase: true })
  );
}

function searchProject(sources: string[], searchTerm: string, excludedPaths: string[]): SearchResult[] {
  const results: SearchResult[] = [];
  const failedFiles: string[] = [];

  for (const dir of sources) {
    const files = glob.sync(path.join(dir, "**/*.{js,jsx,ts,tsx}"), {
      absolute: true,
    });

    for (const file of files) {
      const normalizedFile = file.replace(/\\/g, "/");

      if (isPathExcluded(normalizedFile, excludedPaths)) {
        continue;
      }

      try {
        const matches = searchInFile(file, searchTerm);
        for (const match of matches) {
          results.push({
            path: path.relative(process.cwd(), file),
            content: match,
          });
        }
      } catch (error) {
        failedFiles.push(file);
        if (error instanceof Error) {
          console.error(`Error processing file ${file}: ${error.message}`);
        } else {
          console.error(`Error processing file ${file}: ${String(error)}`);
        }
      }
    }
  }

  if (failedFiles.length > 0) {
    console.log(
      `Failed to process the following files: ${failedFiles.join(", ")}`
    );
  }

  return results;
}

export function generateSearchIndex(
  sources: string[] = ["src/components"], 
  searchTerm: string = "", 
  outputDir: string = "src/data",
  excludedPaths: string[] = [
    "src/components/theme-provider.tsx",
    "src/components/pages/aides/SubSide/radio-group",
    "src/components/pages/aides/SubSide/slider",
    "**/ui/**", 
  ]
): SearchResult[] {
  // Get the results by passing the searchTerm
  const results = searchProject(sources, searchTerm, excludedPaths);

  // Define the output path for the search index
  const outputPath = path.join(process.cwd(), outputDir, "search-index.json");

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  // Write the results to the output file
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`✅ search-index.json generated with ${results.length} entries`);
  return results;
}

export function generateComponentMap(
  entries: SearchIndexEntry[], 
  outputDir: string = "src/data"
) {
  const outPath = path.resolve(process.cwd(), outputDir, "componentMap.ts");
  
  // Create the output directory if it doesn't exist
  const dataDir = path.dirname(outPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const tsxPaths = Array.from(
    new Set(
      entries
        .map((entry) => entry.path)
        .filter((p) => p.endsWith(".tsx"))
    )
  );

  const hasDefaultExport = (filePath: string): boolean => {
    try {
      const fullPath = path.resolve(filePath);
      const content = fs.readFileSync(fullPath, "utf-8");
      return /export\s+default\s+/.test(content);
    } catch (err) {
      console.warn(`⚠️  Failed to read file: ${filePath}`, err);
      return false;
    }
  };

  const validPaths = tsxPaths
    .filter((p) => {
      const localPath = path.resolve(p);
      return hasDefaultExport(localPath);
    })
    .map((p) =>
      p
        .replace(/^src\//, "") // remove src/
        .replace(/\.tsx$/, "") // remove .tsx
    )
    .sort();

  const componentMap = `
// This file is auto-generated by project-indexer
// Do not edit manually

// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { ComponentType } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentMap: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
${validPaths.map((p) => `  "${p}": () => import("@/${p}")`).join(",\n")}
};
`;

  fs.writeFileSync(outPath, componentMap, "utf-8");

  console.log(
    "✅ componentMap generated with " +
      validPaths.length +
      " entries at " +
      outPath
  );
}

// Function to read config from a file
function readConfig(configPath: string): ProjectIndexerConfig {
  try {
    const configFullPath = path.resolve(process.cwd(), configPath);
    const configContent = fs.readFileSync(configFullPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    console.warn(`Failed to read config file: ${configPath}. Using default options.`);
    return {};
  }
}

// Main function to build both indexes
export async function buildIndexes(options: ProjectIndexerConfig = {}) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n🔄 Building indexes at ${timestamp}...`);
  
  try {
    const sources = Array.isArray(options.src) ? options.src : [options.src || "src/components"];
    const excludePaths = options.exclude || [
      "src/components/theme-provider.tsx",
      "src/components/pages/aides/SubSide/radio-group",
      "src/components/pages/aides/SubSide/slider",
      "**/ui/**"
    ];
    const outputDir = options.outputDir || "src/data";
    const searchTerm = options.searchTerm || "";
    
    const searchResults = generateSearchIndex(sources, searchTerm, outputDir, excludePaths);
    generateComponentMap(searchResults, outputDir);
    console.log(`✨ All indexes built successfully at ${timestamp}`);
    return true;
  } catch (error) {
    console.error("❌ Error building indexes:", error);
    throw error;
  }
}

// Main run function for the CLI
export async function run(args: any) {
  let config: ProjectIndexerConfig = {};
  
  // If a config file is specified, read it
  if (args.config) {
    config = readConfig(args.config);
  }
  
  // CLI args override config file
  config.src = args.src || config.src;
  config.outputDir = args.output || config.outputDir;
  config.searchTerm = args.searchTerm || config.searchTerm;
  
  if (args.exclude && args.exclude.length > 0) {
    config.exclude = args.exclude;
  }
  
  return buildIndexes(config);
}

// Run directly if called from CLI
if (require.main === module) {
  buildIndexes().catch(console.error);
}