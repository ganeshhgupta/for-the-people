import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { clusters, articles } from '@ftp/db';
import { inArray, isNotNull, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids') ?? '';
  const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 50);

  if (ids.length === 0) return NextResponse.json({ clusters: [] });

  const db = getDb();

  const rows = await db.select().from(clusters).where(inArray(clusters.id, ids));

  const coverMap: Record<string, string | null> = {};
  const imgs = await db
    .select({ clusterId: articles.clusterId, imageUrl: articles.imageUrl })
    .from(articles)
    .where(and(inArray(articles.clusterId, ids), isNotNull(articles.imageUrl)));
  for (const img of imgs) {
    if (img.clusterId && img.imageUrl && !coverMap[img.clusterId]) {
      coverMap[img.clusterId] = img.imageUrl;
    }
  }

  return NextResponse.json({
    clusters: rows.map(r => ({
      id: r.id,
      canonicalTitle: r.canonicalTitle,
      status: r.status,
      articleCount: r.articleCount,
      createdAt: r.createdAt.toISOString(),
      coverImage: coverMap[r.id] ?? null,
    })),
  });
}
