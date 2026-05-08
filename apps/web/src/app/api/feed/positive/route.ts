import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { clusters, syntheses, articles } from '@ftp/db';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const POSITIVE_WORDS = new Set([
  'harmony','peace','unity','rescue','award','achievement','innovation',
  'conservation','celebration','festival','milestone','progress','initiative',
  'success','breakthrough','historic','hope','inspire','community','empower',
  'reconcil','cooperation','agreement','dialogue','rebuild','recovery','help',
  'support','donate','launch','growth','development','protect','save','clean',
  'green','heritage','culture','art','sports','olympic','medal','champion',
  'relief','aid','welfare','education','school','hospital','vaccine','cure',
]);

// Any story whose title contains these words is excluded, even if it has common_ground
const NEGATIVE_WORDS = new Set([
  'death','deaths','dead','died','die','dying','kill','kills','killed','killing',
  'murder','murders','murdered','suicide','poisoned','poison','poisoning',
  'attack','attacks','attacked','blast','explosion','bomb','bombing','strike','strikes',
  'violence','violent','riot','riots','crash','crashes','accident','accidents',
  'tragedy','disaster','flood','earthquake','cyclone','hurricane','tornado',
  'rape','assault','abuse','scam','fraud','corruption','scandal','arrested',
  'war','battle','conflict','shooting','shot','stabbed','stabbing','fire',
  'disease','outbreak','epidemic','pandemic','contaminated','toxic',
]);

function isNegativeTitle(title: string): boolean {
  const words = title.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/);
  return words.some(w => NEGATIVE_WORDS.has(w));
}

function isPositiveTitle(title: string): boolean {
  if (isNegativeTitle(title)) return false;
  const words = title.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/);
  return words.some(w => POSITIVE_WORDS.has(w));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));
  const limit = 10;

  const db = getDb();

  // Fetch all synthesized clusters with their syntheses
  const allClusters = await db
    .select()
    .from(clusters)
    .where(eq(clusters.status, 'synthesized'))
    .orderBy(sql`(SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`);

  const allSynths = await db.select({ clusterId: syntheses.clusterId, output: syntheses.output }).from(syntheses);
  const synthMap = new Map(allSynths.map(s => [s.clusterId, s.output as Record<string, unknown>]));

  // Filter: positive title keywords AND not a negative/tragedy story
  // common_ground alone is not sufficient — tragedy stories can have common_ground proposals too
  const positive = allClusters.filter(c => {
    if (isNegativeTitle(c.canonicalTitle)) return false;
    if (isPositiveTitle(c.canonicalTitle)) return true;
    const out = synthMap.get(c.id);
    if (!out) return false;
    const cg = out.common_ground;
    return Array.isArray(cg) && cg.length > 0;
  });

  const pageRows = positive.slice(offset, offset + limit);
  const hasMore = positive.length > offset + limit;

  const coverMap: Record<string, string | null> = {};
  for (const row of pageRows) {
    const imgs = await db.select({ imageUrl: articles.imageUrl }).from(articles).where(eq(articles.clusterId, row.id));
    coverMap[row.id] = imgs.find(i => i.imageUrl)?.imageUrl ?? null;
  }

  return NextResponse.json({
    clusters: pageRows.map(r => ({
      id: r.id,
      canonicalTitle: r.canonicalTitle,
      status: r.status,
      articleCount: r.articleCount,
      createdAt: r.createdAt.toISOString(),
      coverImage: coverMap[r.id] ?? null,
    })),
    hasMore,
    nextOffset: offset + limit,
    total: positive.length,
  });
}
