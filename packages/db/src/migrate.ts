import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(dir, '../../../.env.local') });

const { db } = await import('./client.js');
import { sql } from 'drizzle-orm';

await db.execute(sql`
  CREATE TABLE IF NOT EXISTS clusters (
    id TEXT PRIMARY KEY,
    canonical_title TEXT NOT NULL,
    story_fingerprint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    article_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await db.execute(sql`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    body_excerpt TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    cluster_id TEXT REFERENCES clusters(id),
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await db.execute(sql`
  CREATE TABLE IF NOT EXISTS syntheses (
    id TEXT PRIMARY KEY,
    cluster_id TEXT NOT NULL UNIQUE REFERENCES clusters(id),
    output JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await db.execute(sql`
  CREATE TABLE IF NOT EXISTS cluster_links (
    id TEXT PRIMARY KEY,
    from_cluster_id TEXT NOT NULL REFERENCES clusters(id),
    to_cluster_id TEXT NOT NULL REFERENCES clusters(id),
    shared_entities TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_cluster_id, to_cluster_id)
  )
`);

await db.execute(sql`CREATE INDEX IF NOT EXISTS clusters_status_idx ON clusters(status)`);
await db.execute(sql`CREATE INDEX IF NOT EXISTS clusters_created_idx ON clusters(created_at)`);
await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_source_idx ON articles(source_id)`);
await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_cluster_idx ON articles(cluster_id)`);
await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published_at)`);
await db.execute(sql`CREATE INDEX IF NOT EXISTS cluster_links_to_idx ON cluster_links(to_cluster_id)`);

console.log('Database schema up to date.');
