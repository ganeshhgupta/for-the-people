import { pgTable, text, integer, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const clusters = pgTable(
  'clusters',
  {
    id: text('id').primaryKey(),
    canonicalTitle: text('canonical_title').notNull(),
    storyFingerprint: text('story_fingerprint').notNull(),
    status: text('status').notNull().default('pending'),
    articleCount: integer('article_count').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('clusters_status_idx').on(t.status), index('clusters_created_idx').on(t.createdAt)]
);

export const articles = pgTable(
  'articles',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id').notNull(),
    url: text('url').notNull().unique(),
    title: text('title').notNull(),
    publishedAt: timestamp('published_at', { mode: 'date', withTimezone: true }).notNull(),
    bodyExcerpt: text('body_excerpt').notNull().default(''),
    imageUrl: text('image_url'),
    clusterId: text('cluster_id').references(() => clusters.id),
    ingestedAt: timestamp('ingested_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('articles_source_idx').on(t.sourceId),
    index('articles_cluster_idx').on(t.clusterId),
    index('articles_published_idx').on(t.publishedAt),
  ]
);

export const syntheses = pgTable('syntheses', {
  id: text('id').primaryKey(),
  clusterId: text('cluster_id')
    .notNull()
    .unique()
    .references(() => clusters.id),
  output: jsonb('output').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
});

export const trails = pgTable('trails', {
  id: text('id').primaryKey(),
  clusterId: text('cluster_id').notNull().unique().references(() => clusters.id),
  nodes: jsonb('nodes').notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
});

export const clusterLinks = pgTable(
  'cluster_links',
  {
    id: text('id').primaryKey(),
    fromClusterId: text('from_cluster_id').notNull().references(() => clusters.id),
    toClusterId: text('to_cluster_id').notNull().references(() => clusters.id),
    sharedEntities: text('shared_entities').notNull().default('[]'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('cluster_links_pair_idx').on(t.fromClusterId, t.toClusterId),
    index('cluster_links_to_idx').on(t.toClusterId),
  ]
);
