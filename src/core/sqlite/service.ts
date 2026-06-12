import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import { EXBA } from '@core/lifecycle/exba';

export interface QueryResult {
  columns: string[];
  values: any[][];
}

export class SqliteService {
  private static instance: SqliteService;
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private wasmPath = '/wasm/sql-wasm.wasm';

  private constructor() {}

  static getInstance(): SqliteService {
    if (!SqliteService.instance) {
      SqliteService.instance = new SqliteService();
    }
    return SqliteService.instance;
  }

  async init() {
    if (this.SQL) return;
    
    try {
      this.SQL = await initSqlJs({
        locateFile: (file) => (file === 'sql-wasm.wasm' ? this.wasmPath : file),
      });
      console.log('[SQLite] WASM initialized');
    } catch (e) {
      console.error('[SQLite] Initialization failed', e);
      throw e;
    }
  }

  async loadDatabase(data: Uint8Array | ArrayBuffer) {
    await this.init();
    if (this.db) {
      this.db.close();
    }
    const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data);
    this.db = new this.SQL!.Database(uint8Array);
    console.log('[SQLite] Database loaded');
  }

  createEmptyDatabase() {
    if (!this.SQL) throw new Error('SQLite not initialized');
    if (this.db) this.db.close();
    this.db = new this.SQL.Database();
    console.log('[SQLite] Empty database created');
  }

  execute(sql: string, params?: any[]): QueryResult[] {
    if (!this.db) throw new Error('No database loaded');
    try {
      const results = this.db.exec(sql, params);
      return results.map(r => ({
        columns: r.columns,
        values: r.values
      }));
    } catch (e) {
      console.error('[SQLite] Execution error', e);
      throw e;
    }
  }

  run(sql: string, params?: any[]) {
    if (!this.db) throw new Error('No database loaded');
    this.db.run(sql, params);
  }

  getTables(): string[] {
    const res = this.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    if (res.length === 0) return [];
    return res[0].values.map(v => v[0] as string);
  }

  getTableData(tableName: string): QueryResult {
    const res = this.execute(`SELECT * FROM ${tableName}`);
    return res[0] || { columns: [], values: [] };
  }

  export(): Uint8Array {
    if (!this.db) throw new Error('No database loaded');
    return this.db.export();
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const sqliteService = SqliteService.getInstance();
