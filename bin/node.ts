#!/usr/bin/env node

// CLI entry point
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { run } from '../src/index';

const argv = yargs(hideBin(process.argv))
  .option('config', {
    alias: 'c',
    type: 'string',
    description: 'Path to config file'
  })
  .option('src', {
    type: 'string',
    description: 'Source directory to scan',
    default: 'src/components'
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory for generated files',
    default: 'src/data'
  })
  .option('exclude', {
    alias: 'e',
    type: 'array',
    description: 'Paths or patterns to exclude',
    default: []
  })
  .option('search-term', {
    type: 'string',
    description: 'Term to search for in components',
    default: ''
  })
  .help()
  .alias('help', 'h')
  .parseSync();

run(argv)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });