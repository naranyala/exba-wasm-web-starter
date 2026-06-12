import { describe, it, expect, beforeAll } from 'vitest';
import { sqliteService } from './service';
import fs from 'node:fs';
import path from 'node:path';

describe('SqliteService Integration', () => {
  beforeAll(async () => {
    // In test environment, we might need to manually load the wasm buffer
    // or point it to the node_modules location
    const wasmPath = path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
    const wasmBinary = fs.readFileSync(wasmPath);
    
    // We override the locateFile for the test
    (sqliteService as any).wasmPath = wasmPath;
    
    // Initialize service
    await sqliteService.init();
  });

  it('should create an empty database and run queries', () => {
    sqliteService.createEmptyDatabase();
    sqliteService.run("CREATE TABLE test (id INTEGER PRIMARY KEY, val TEXT)");
    sqliteService.run("INSERT INTO test (val) VALUES ('hello'), ('world')");
    
    const tables = sqliteService.getTables();
    expect(tables).toContain('test');
    
    const data = sqliteService.getTableData('test');
    expect(data.columns).toEqual(['id', 'val']);
    expect(data.values).toHaveLength(2);
    expect(data.values[0][1]).toBe('hello');
  });

  it('should execute custom SELECT queries', () => {
    const results = sqliteService.execute("SELECT * FROM test WHERE val = 'world'");
    expect(results).toHaveLength(1);
    expect(results[0].values[0][1]).toBe('world');
  });

  it('should handle errors gracefully', () => {
    expect(() => sqliteService.execute("SELECT * FROM non_existent")).toThrow();
  });

  it('should export and reload database', async () => {
    const binary = sqliteService.export();
    expect(binary.length).toBeGreaterThan(0);
    
    // Create new service instance or just clear current
    sqliteService.close();
    await sqliteService.loadDatabase(binary);
    
    const tables = sqliteService.getTables();
    expect(tables).toContain('test');
  });
});
