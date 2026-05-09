import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { clusters, articles } from '@ftp/db';
import { eq, sql, inArray, isNotNull, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));
  const limit  = Math.min(PAGE_SIZE, parseInt(url.searchParams.get('limit') ?? String(PAGE_SIZE)));

  const db = getDb();

  const rows = await db
    .select()
    .from(clusters)
    .orderBy(sql`(SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`)
    .limit(limit + 1)
    .offset(offset);

  const hasMore  = rows.length > limit;
  const pageRows = rows.slice(0, limit);

  // First non-null imageUrl per cluster — single batched query
  const clusterIds = pageRows.map(r => r.id);
  const coverMap: Record<string, string | null> = {};
  if (clusterIds.length > 0) {
    const imgs = await db
      .select({ clusterId: articles.clusterId, imageUrl: articles.imageUrl })
      .from(articles)
      .where(and(inArray(articles.clusterId, clusterIds), isNotNull(articles.imageUrl)));
    for (const img of imgs) {
      if (img.clusterId && img.imageUrl && !coverMap[img.clusterId]) {
        coverMap[img.clusterId] = img.imageUrl;
      }
    }
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
  });
}
