import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { clusters, articles } from '@ftp/db';
import { desc, eq, sql } from 'drizzle-orm';

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
    .orderBy(
      sql`CASE WHEN ${clusters.status} = 'synthesized' THEN 0 ELSE 1 END`,
      desc(clusters.createdAt)
    )
    .limit(limit + 1)
    .offset(offset);

  const hasMore  = rows.length > limit;
  const pageRows = rows.slice(0, limit);

  // First non-null imageUrl per cluster
  const coverMap: Record<string, string | null> = {};
  for (const row of pageRows) {
    const imgs = await db
      .select({ imageUrl: articles.imageUrl })
      .from(articles)
      .where(eq(articles.clusterId, row.id));
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
  });
}
