import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve DB path relative to this file's package root (packages/db/)
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DB_PATH = process.env['DB_PATH'] ?? join(packageRoot, '..', '..', 'tristhana.db');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
