# React Component Search

A utility to generate search indexes and component maps for React projects. This tool helps you efficiently search through your React components and dynamically import them when needed.

## Features

- **Search Index Generation**: Extracts text content from React components and stores it in a searchable JSON file.
- **Dynamic Component Mapping**: Creates a TypeScript file mapping component paths to dynamic imports.
- **Customizable**: Supports configuration for source directories, output paths, excluded files, and search terms.
- **CLI and Programmatic Usage**: Use it directly from the command line or integrate it into your project.

## Installation

Install the package globally or as a development dependency:

```bash
# Install globally
npm install -g react-component-search

# Or install as a development dependency
npm install --save-dev react-component-search
```

## Usage

### Command Line

Run the tool using the `react-component-search` command:

```bash
# Run with default settings
react-component-search

# Specify source directory
react-component-search --src src/components

# Specify output directory
react-component-search --output src/data

# Exclude specific patterns
react-component-search --exclude "src/components/theme-provider.tsx" "**/ui/**"

# Specify search term (leave empty to index all content)
react-component-search --search-term "some text"

# Use a configuration file
react-component-search --config project-indexer.json
```

### Configuration File

You can create a `project-indexer.json` file in your project root to define custom settings:

```json
{
  "src": ["src/components", "src/layouts"],
  "exclude": ["src/components/theme-provider.tsx", "**/ui/**"],
  "outputDir": "src/data",
  "searchTerm": ""
}
```

### Programmatic Usage

You can also use the package programmatically in your Node.js scripts:

```javascript
import { buildIndexes } from "react-component-search";

buildIndexes({
  src: ["src/components"],
  exclude: ["**/ui/**"],
  outputDir: "src/data",
  searchTerm: "",
}).then(() => {
  console.log("Indexes built successfully!");
});
```

### In `package.json` Scripts

Add the tool to your project scripts for easier usage:

```json
"scripts": {
  "generate-indexes": "react-component-search",
  "dev": "npm run generate-indexes && next dev",
  "build": "npm run generate-indexes && next build"
}
```

## Output

The tool generates the following files:

1. **`search-index.json`**: A JSON file containing all text content from your components.
2. **`componentMap.ts`**: A TypeScript file mapping component paths to dynamic imports.

## Options

| Option          | Alias | Type     | Default          | Description                           |
| --------------- | ----- | -------- | ---------------- | ------------------------------------- |
| `--src`         |       | `string` | `src/components` | Source directory to scan.             |
| `--output`      | `-o`  | `string` | `src/data`       | Output directory for generated files. |
| `--exclude`     | `-e`  | `array`  | `[]`             | Paths or patterns to exclude.         |
| `--search-term` |       | `string` | `""`             | Term to search for in components.     |
| `--config`      | `-c`  | `string` |                  | Path to a configuration file.         |

## Example

To generate a search index and component map for your project:

```bash
react-component-search --src src/components --output src/data --exclude "**/ui/**"
```

## Development

### Build

To build the project, run:

```bash
npm run build
```

### Publish

Before publishing, ensure the project is built:

```bash
npm run prepublishOnly
```

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Support

For issues or feature requests, please visit the [GitHub Issues](https://github.com/samibentaiba/react-component-search/issues) page.

## Repository

- **GitHub**: [https://github.com/samibentaiba/react-component-search](https://github.com/samibentaiba/react-component-search)
