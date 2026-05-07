import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const clusters = sqliteTable(
  'clusters',
  {
    id: text('id').primaryKey(),
    canonicalTitle: text('canonical_title').notNull(),
    storyFingerprint: text('story_fingerprint').notNull(),
    status: text('status').notNull().default('pending'),
    articleCount: integer('article_count').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index('clusters_status_idx').on(t.status), index('clusters_created_idx').on(t.createdAt)]
);

export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id').notNull(),
    url: text('url').notNull().unique(),
    title: text('title').notNull(),
    publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
    bodyExcerpt: text('body_excerpt').notNull().default(''),
    imageUrl: text('image_url'),
    clusterId: text('cluster_id').references(() => clusters.id),
    ingestedAt: integer('ingested_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [
    index('articles_source_idx').on(t.sourceId),
    index('articles_cluster_idx').on(t.clusterId),
    index('articles_published_idx').on(t.publishedAt),
  ]
);

export const syntheses = sqliteTable('syntheses', {
  id: text('id').primaryKey(),
  clusterId: text('cluster_id')
    .notNull()
    .unique()
    .references(() => clusters.id),
  output: text('output', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const clusterLinks = sqliteTable(
  'cluster_links',
  {
    id: text('id').primaryKey(),
    fromClusterId: text('from_cluster_id').notNull().references(() => clusters.id),
    toClusterId: text('to_cluster_id').notNull().references(() => clusters.id),
    sharedEntities: text('shared_entities').notNull().default('[]'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('cluster_links_pair_idx').on(t.fromClusterId, t.toClusterId),
    index('cluster_links_to_idx').on(t.toClusterId),
  ]
);
