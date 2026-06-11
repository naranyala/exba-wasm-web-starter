import fs from 'node:fs';
import path from 'node:path';
import { RustParser } from './parsers/rust-parser';
import { TSParser } from './parsers/ts-parser';
import type { BaseParser, DocEntry } from './types';
import { validateDocEntry } from './validator';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: bun run ./src/index.ts <source_dir1> [source_dir2...] <output_dir>');
    process.exit(1);
  }

  const outputDir = path.resolve(args.pop()!);
  const sourceDirs = args.map(d => path.resolve(d));

  // Get project root and name for better path reporting
  const projectRoot = process.cwd();
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const projectName = packageJson.name || 'project';

  const parsers: BaseParser[] = [new TSParser(), new RustParser()];
  const allEntries: DocEntry[] = [];
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const undocumentedEntries: { name: string; filePath: string; module: string }[] = [];

  function scan(dir: string) {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Source directory not found: ${path.relative(projectRoot, dir)}`);
      return;
    }
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      // Skip irrelevant dirs
      if (file === 'target' || file === 'node_modules' || file === '.git' || file === 'dist' || file === 'tests') continue;

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = path.extname(file);
        const parser = parsers.find((p) => p.supportedExtensions.includes(ext));
        if (parser) {
          const { entries, warnings } = parser.parseFile(fullPath);
          
          // Store raw warnings from parser (usually few)
          allWarnings.push(...warnings.map(w => w.replace(projectRoot, '.')));

          for (const entry of entries) {
            // 1. Resolve paths first
            const relativePath = path.relative(projectRoot, entry.filePath);
            entry.fullPath = entry.filePath;
            // Use project-relative path for display
            entry.filePath = `./${relativePath}`;

            // 2. Validate with relative paths
            const validation = validateDocEntry(entry);
            if (!validation.isValid) {
              allErrors.push(...validation.errors);
            }
            
            // Filter out 'undocumented' from general warnings, we handle those in the report
            const filteredValWarnings = validation.warnings.filter(w => !w.includes('undocumented'));
            allWarnings.push(...filteredValWarnings);

            if (entry.description === '(No description provided)') {
              undocumentedEntries.push({
                name: entry.name,
                filePath: entry.filePath,
                module: entry.module
              });
            }

            allEntries.push(entry);
          }
        }
      }
    }
  }

  sourceDirs.forEach(sourceDir => {
    console.log(`🚀 Scanning ./${path.relative(projectRoot, sourceDir)}...`);
    scan(sourceDir);
  });

  if (allErrors.length > 0) {
    console.error('\n❌ Documentation Errors found:');
    allErrors.forEach((err) => console.error(`  ${err}`));
    process.exit(1);
  }

  if (allWarnings.length > 0) {
    console.warn('\n⚠️  Other Warnings:');
    allWarnings.forEach((warn) => console.warn(`  ${warn}`));
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const apiData = {
    generatedAt: new Date().toISOString(),
    projectName,
    stats: {
      total: allEntries.length,
      covered: allEntries.length - undocumentedEntries.length,
      undocumented: undocumentedEntries.length,
    },
    entries: allEntries
  };

  const jsonOutputFile = path.join(outputDir, 'api-data.json');
  fs.writeFileSync(jsonOutputFile, JSON.stringify(apiData, null, 2));

  console.log(`\n✅ API data extracted successfully to: ./${path.relative(projectRoot, jsonOutputFile)}`);
  console.log(`📊 Total Symbols: ${allEntries.length} (${apiData.stats.covered} covered)`);

  if (undocumentedEntries.length > 0) {
    const reportPath = path.join(outputDir, 'undocumented_report.txt');
    let reportContent = '📝 UNDOCUMENTED APIS REPORT\n';
    reportContent += `Generated on: ${new Date().toLocaleString()}\n`;
    reportContent += `Total Undocumented: ${undocumentedEntries.length}\n\n`;

    const grouped: Record<string, string[]> = {};
    undocumentedEntries.forEach(e => {
      if (!grouped[e.module]) grouped[e.module] = [];
      grouped[e.module].push(`${e.name} (${e.filePath})`);
    });

    for (const [module, items] of Object.entries(grouped)) {
      reportContent += `[${module}]\n`;
      items.forEach(item => reportContent += `  - ${item}\n`);
      reportContent += '\n';
    }

    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Detailed report written to: ./${path.relative(projectRoot, reportPath)}`);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
