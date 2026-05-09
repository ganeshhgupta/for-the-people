import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { clusters, syntheses, articles } from '@ftp/db';
import { eq, sql, inArray, isNotNull, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  sports: ['cricket','football','tennis','hockey','olympic','medal','tournament','ipl','fifa','athlete','badminton','kabaddi','chess','wrestling','sport','match','league','cup','player','team'],
  entertainment: ['film','movie','bollywood','actor','actress','music','award','netflix','amazon','ott','celebrity','director','song','album','release','cinema','series','web series'],
  finance: ['market','stock','economy','gdp','rbi','budget','inflation','rupee','bank','tax','trade','investment','startup','fund','finance','loan','rate','growth','revenue','sebi','sensex','nifty'],
  tech: ['technology','artificial intelligence','ai','startup','app','digital','cyber','software','smartphone','electric','internet','data','robot','satellite','space','isro','nasa','drone'],
  travel: ['tourism','heritage','travel','destination','monument','unesco','airport','hotel','resort','pilgrimage','trek','visa','tourist','railway','train'],
  art: ['art','culture','museum','painting','literature','poetry','sculpture','exhibition','dance','theatre','festival','craft','classical','architecture'],
  politics: ['modi','bjp','congress','election','parliament','minister','party','vote','campaign','government','policy','rajya sabha','lok sabha','cabinet','chief minister','mla','mp'],
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cat = (url.searchParams.get('cat') ?? '').toLowerCase();
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') ?? '0'));
  const limit = 10;

  const keywords = CATEGORY_KEYWORDS[cat];
  if (!keywords) return NextResponse.json({ clusters: [], hasMore: false, nextOffset: 0 });

  const db = getDb();
  const allClusters = await db
    .select()
    .from(clusters)
    .where(eq(clusters.status, 'synthesized'))
    .orderBy(sql`(SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`);

  const allSynths = await db.select({ clusterId: syntheses.clusterId, output: syntheses.output }).from(syntheses);
  const synthMap = new Map(allSynths.map(s => [s.clusterId, s.output as Record<string, unknown>]));

  const matched = allClusters.filter(c => {
    const out = synthMap.get(c.id);
    // Use synthesis categories first (more accurate than title keywords)
    const synthCategories = out?.categories as string[] | undefined;
    if (synthCategories && synthCategories.includes(cat)) return true;
    // Fall back to title keyword matching for older records without categories
    const lower = c.canonicalTitle.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  });

  const pageRows = matched.slice(offset, offset + limit);
  const hasMore = matched.length > offset + limit;

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
