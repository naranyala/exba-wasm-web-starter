import type { DocEntry } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDocEntry(entry: DocEntry): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!entry.description || entry.description === '(No description provided)') {
    warnings.push(
      `[${entry.filePath}:${entry.lineNumber}] ${entry.name} is undocumented.`,
    );
  } else if (entry.description.length < 10) {
    errors.push(
      `[${entry.filePath}:${entry.lineNumber}] ${entry.name} has a description that is too short (min 10 chars).`,
    );
  }

  if (entry.type === 'function') {
    // Check if params are documented if they exist
    // This is hard because we don't have the original source code signature here for TS
    // But we can check if params were found by the parser
    if (!entry.params || entry.params.length === 0) {
      warnings.push(
        `[${entry.filePath}:${entry.lineNumber}] ${entry.name} is a function but has no documented parameters.`,
      );
    } else {
      entry.params.forEach((p, i) => {
        if (p.description === 'See function description' || !p.description) {
          warnings.push(
            `[${entry.filePath}:${entry.lineNumber}] Parameter ${i + 1} of ${entry.name} (${p.name}) is missing a description.`,
          );
        }
      });
    }

    if (!entry.returns) {
      warnings.push(
        `[${entry.filePath}:${entry.lineNumber}] ${entry.name} is a function but has no documented return value.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
