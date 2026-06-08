import fs from 'node:fs';
import path from 'node:path';
import { TSParser } from './parsers/ts-parser';
import { RustParser } from './parsers/rust-parser';
import { validateDocEntry } from './validator';
import { generateHTML } from './generator';
import { BaseParser, DocEntry } from './types';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: bun run ./src/index.ts <source_dir> <output_dir>');
    process.exit(1);
  }

  const sourceDir = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);
  const outputFile = path.join(outputDir, 'index.html');

  // Get project root and name for better path reporting
  const projectRoot = process.cwd();
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const projectName = packageJson.name || 'project';

  const parsers: BaseParser[] = [new TSParser(), new RustParser()];
  let allEntries: DocEntry[] = [];
  let allWarnings: string[] = [];
  let allErrors: string[] = [];

  function scan(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = path.extname(file);
        const parser = parsers.find(p => p.supportedExtensions.includes(ext));
        if (parser) {
          const { entries, warnings } = parser.parseFile(fullPath);
          allWarnings.push(...warnings);
          
          for (const entry of entries) {
            const validation = validateDocEntry(entry);
            if (!validation.isValid) {
              allErrors.push(...validation.errors);
            }
            allWarnings.push(...validation.warnings);
            
            // Store path relative to project root and prefix with project name
            const relativePath = path.relative(projectRoot, entry.filePath);
            entry.filePath = `${projectName}/${relativePath}`;
            
            allEntries.push(entry);
          }
        }
      }
    }
  }

  console.log(`🚀 Scanning ${sourceDir}...`);
  scan(sourceDir);

  if (allErrors.length > 0) {
    console.error('\n❌ Documentation Errors found:');
    allErrors.forEach(err => console.error(`  ${err}`));
    console.error('\nStrict mode: Please fix these documentation errors before continuing.\n');
    process.exit(1);
  }

  if (allWarnings.length > 0) {
    console.warn('\n⚠️  Documentation Warnings:');
    allWarnings.forEach(warn => console.warn(`  ${warn}`));
    console.warn('\n');
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const html = generateHTML(allEntries, 'Project API Documentation');
  fs.writeFileSync(outputFile, html);

  console.log(`✅ Documentation generated successfully at: ${outputFile}`);
  console.log(`📖 Found ${allEntries.length} documented entries.`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
