# Docs-Gen

A lightweight, Doxygen-inspired API documentation generator for TypeScript/JavaScript projects.

## Features
- Scans directories for `.ts` and `.js` files.
- Parses JSDoc comments (`/** ... */`).
- Extracts function names, types, descriptions, parameters, and return values.
- Generates a single-file, responsive HTML report with a navigation sidebar.

## Usage

### From the root project
Run the following command:
```bash
bun run docs
```

### Directly using the tool
```bash
bun run ./docs-gen/src/index.ts <source_directory> <output_file.html>
```

## JSDoc Format Supported
```typescript
/**
 * This is a description of the function.
 * 
 * @param {string} name The name of the user
 * @param {number} age The age of the user
 * @returns {boolean} True if successful
 */
function createUser(name: string, age: number): boolean {
  // ...
}
```
