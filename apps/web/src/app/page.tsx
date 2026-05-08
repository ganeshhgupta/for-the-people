import { getDb } from '../lib/db';
import { clusters, articles } from '@ftp/db';
import { desc, eq, sql } from 'drizzle-orm';
import { StoryFeed } from '../components/StoryFeed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getDb();

  const rows = await db
    .select()
    .from(clusters)
    .orderBy(sql`(SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`)
    .limit(20);

  const coverMap: Record<string, string | null> = {};
  for (const row of rows) {
    const imgs = await db
      .select({ imageUrl: articles.imageUrl })
      .from(articles)
      .where(eq(articles.clusterId, row.id));
    coverMap[row.id] = imgs.find(i => i.imageUrl)?.imageUrl ?? null;
  }

  const clusterData = rows.map(r => ({
    id: r.id,
    canonicalTitle: r.canonicalTitle,
    status: r.status,
    articleCount: r.articleCount,
    createdAt: r.createdAt.toISOString(),
    coverImage: coverMap[r.id] ?? null,
  }));

  const countRows = await db.select({ totalCount: sql<number>`cast(count(*) as int)` }).from(clusters);
  const totalCount = countRows[0]?.totalCount ?? 0;

  return <StoryFeed initialClusters={clusterData} totalCount={totalCount} />;
}
