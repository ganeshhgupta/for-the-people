import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@tristhana/db';
import { join } from 'path';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!_db) {
    // When Next.js runs from apps/web, cwd is apps/web; go up 2 levels to find root db
    const dbPath = process.env['DB_PATH']
      ?? (process.env['VERCEL']
        ? join(process.cwd(), 'tristhana.db')            // Vercel: cwd is repo root
        : join(process.cwd(), '..', '..', 'tristhana.db')); // local dev: apps/web → root
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}
