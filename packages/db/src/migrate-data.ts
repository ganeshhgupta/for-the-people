/**
 * One-time script: migrate data from local tristhana.db (SQLite) → Neon PostgreSQL.
 * Run from repo root: pnpm --filter @tristhana/db migrate-data
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(dir, '../../../.env.local') });

import BetterSqlite from 'better-sqlite3';
const { db } = await import('./client.js');
const { clusters, articles, syntheses, clusterLinks } = await import('./schema.js');

const SQLITE_PATH = resolve(dir, '../../../tristhana.db');

const sqlite = new BetterSqlite(SQLITE_PATH, { readonly: true });

function toDate(val: unknown): Date {
  if (val instanceof Date) return val;
  if (typeof val === 'number') return new Date(val * 1000);
  if (typeof val === 'string') return new Date(val);
  return new Date();
}

console.log('Reading from SQLite…');

const rawClusters = sqlite.prepare('SELECT * FROM clusters').all() as Record<string, unknown>[];
const rawArticles = sqlite.prepare('SELECT * FROM articles').all() as Record<string, unknown>[];
const rawSyntheses = sqlite.prepare('SELECT * FROM syntheses').all() as Record<string, unknown>[];
const rawLinks    = sqlite.prepare('SELECT * FROM cluster_links').all() as Record<string, unknown>[];

console.log(`clusters: ${rawClusters.length}, articles: ${rawArticles.length}, syntheses: ${rawSyntheses.length}, links: ${rawLinks.length}`);

const chunk = <T>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

if (rawClusters.length > 0) {
  console.log('Inserting clusters…');
  for (const batch of chunk(rawClusters, 100)) {
    await db.insert(clusters).values(batch.map(r => ({
      id: String(r.id),
      canonicalTitle: String(r.canonical_title),
      storyFingerprint: String(r.story_fingerprint),
      status: String(r.status),
      articleCount: Number(r.article_count),
      createdAt: toDate(r.created_at),
      updatedAt: toDate(r.updated_at),
    }))).onConflictDoNothing();
  }
}

if (rawArticles.length > 0) {
  console.log('Inserting articles…');
  for (const batch of chunk(rawArticles, 100)) {
    await db.insert(articles).values(batch.map(r => ({
      id: String(r.id),
      sourceId: String(r.source_id),
      url: String(r.url),
      title: String(r.title),
      publishedAt: toDate(r.published_at),
      bodyExcerpt: String(r.body_excerpt ?? ''),
      imageUrl: r.image_url ? String(r.image_url) : null,
      clusterId: r.cluster_id ? String(r.cluster_id) : null,
      ingestedAt: toDate(r.ingested_at),
    }))).onConflictDoNothing();
  }
}

if (rawSyntheses.length > 0) {
  console.log('Inserting syntheses…');
  for (const batch of chunk(rawSyntheses, 50)) {
    await db.insert(syntheses).values(batch.map(r => ({
      id: String(r.id),
      clusterId: String(r.cluster_id),
      output: JSON.parse(String(r.output)) as Record<string, unknown>,
      createdAt: toDate(r.created_at),
    }))).onConflictDoNothing();
  }
}

if (rawLinks.length > 0) {
  console.log('Inserting cluster links…');
  for (const batch of chunk(rawLinks, 100)) {
    await db.insert(clusterLinks).values(batch.map(r => ({
      id: String(r.id),
      fromClusterId: String(r.from_cluster_id),
      toClusterId: String(r.to_cluster_id),
      sharedEntities: String(r.shared_entities ?? '[]'),
      createdAt: toDate(r.created_at),
    }))).onConflictDoNothing();
  }
}

console.log('Migration complete.');
sqlite.close();
