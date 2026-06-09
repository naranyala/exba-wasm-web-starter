export interface Param {
  name: string;
  type: string;
  description: string;
}

export interface Return {
  type: string;
  description: string;
}

export interface DocEntry {
  name: string;
  type:
    | 'function'
    | 'class'
    | 'struct'
    | 'interface'
    | 'enum'
    | 'trait'
    | 'variable'
    | 'constant'
    | 'method';
  description: string;
  signature?: string;
  params?: Param[];
  returns?: Return;
  filePath: string;
  lineNumber: number;
  isPublic: boolean;
  container?: string;
  module: string;
}

export interface ParserResult {
  entries: DocEntry[];
  warnings: string[];
}

export abstract class BaseParser {
  abstract supportedExtensions: string[];
  abstract parseFile(filePath: string): ParserResult;
}
