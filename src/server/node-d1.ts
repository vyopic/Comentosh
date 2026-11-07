// Node.js SQLite adapter providing 1:1 Cloudflare D1Database compatibility
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { D1Database, D1PreparedStatement, D1Result } from './types';

export class NodeD1PreparedStatement implements D1PreparedStatement {
  private db: DatabaseSync;
  private query: string;
  private params: any[] = [];

  constructor(db: DatabaseSync, query: string) {
    this.db = db;
    this.query = query;
  }

  bind(...values: any[]): D1PreparedStatement {
    this.params = values;
    return this;
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    try {
      const stmt = this.db.prepare(this.query);
      const row = stmt.get(...this.params) as any;
      if (!row) return null;
      if (colName) return row[colName] ?? null;
      return row as T;
    } catch (error) {
      console.error('[NodeD1 Error first]', this.query, this.params, error);
      return null;
    }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    try {
      const stmt = this.db.prepare(this.query);
      const results = stmt.all(...this.params) as T[];
      return { success: true, results };
    } catch (error: any) {
      console.error('[NodeD1 Error all]', this.query, this.params, error);
      return { success: false, results: [], error: error?.message };
    }
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    try {
      const stmt = this.db.prepare(this.query);
      stmt.run(...this.params);
      return { success: true };
    } catch (error: any) {
      console.error('[NodeD1 Error run]', this.query, this.params, error);
      return { success: false, error: error?.message };
    }
  }

  async raw<T = unknown>(): Promise<T[]> {
    const res = await this.all<T>();
    return res.results || [];
  }
}

export class NodeD1Database implements D1Database {
  private db: DatabaseSync;

  constructor(dbPath: string = 'comentosh.db') {
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  private initSchema() {
    const schemaPath = resolve('schema.sql');
    if (existsSync(schemaPath)) {
      const sql = readFileSync(schemaPath, 'utf-8');
      this.db.exec(sql);
    }
  }

  prepare(query: string): D1PreparedStatement {
    return new NodeD1PreparedStatement(this.db, query);
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    const results: D1Result<T>[] = [];
    for (const stmt of statements) {
      results.push(await stmt.run());
    }
    return results;
  }

  async exec(query: string): Promise<D1Result> {
    try {
      this.db.exec(query);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message };
    }
  }
}

let instance: NodeD1Database | null = null;
export function getNodeD1Database(): D1Database {
  if (!instance) {
    instance = new NodeD1Database('comentosh.db');
  }
  return instance;
}
