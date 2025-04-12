# Project Indexer

A utility to generate search indexes and component maps for React projects.

## Installation

```bash
# Install globally
npm install -g project-indexer

# Or install as a development dependency in your project
npm install --save-dev project-indexer
```

## Usage

### Command Line

```bash
# Run with default settings
project-indexer

# Specify source directory
project-indexer --src src/components

# Specify output directory
project-indexer --output src/data

# Exclude specific patterns
project-indexer --exclude "src/components/theme-provider.tsx" "**/ui/**"

# Specify search term (usually leave empty to index all content)
project-indexer --search-term "some text"

# Use a config file
project-indexer --config project-indexer.json
```

### Configuration File

You can create a `project-indexer.json` file in your project root:

```json
{
  "src": ["src/components", "src/layouts"],
  "exclude": [
    "src/components/theme-provider.tsx",
    "**/ui/**"
  ],
  "outputDir": "src/data",
  "searchTerm": ""
}
```

### In package.json Scripts

Add to your project's package.json:

```json
"scripts": {
  "generate-indexes": "project-indexer",
  "dev": "npm run generate-indexes && next dev",
  "build": "npm run generate-indexes && next build"
}
```

### Programmatic Usage

```javascript
const { buildIndexes } = require('project-indexer');

buildIndexes({
  src: ['src/components'],
  exclude: ['**/ui/**'],
  outputDir: 'src/data',
  searchTerm: ''
}).then(() => {
  console.log('Indexes built successfully!');
});
```

## Output

The tool generates:

1. `search-index.json` - A JSON file containing all text content from your components
2. `componentMap.ts` - A TypeScript file mapping component paths to dynamic imports

## License

MIT