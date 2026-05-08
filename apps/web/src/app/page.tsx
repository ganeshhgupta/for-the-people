import { getDb } from '../lib/db';
import { clusters, articles } from '@ftp/db';
import { desc, eq, sql } from 'drizzle-orm';
import { StoryFeed } from '../components/StoryFeed';

export const revalidate = 60;

export default async function HomePage() {
  const db = getDb();

  const rows = await db
    .select()
    .from(clusters)
    .orderBy(
      sql`CASE WHEN ${clusters.status} = 'synthesized' THEN 0 ELSE 1 END`,
      desc(clusters.createdAt)
    )
    .limit(10);

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

  const totalCount = await db.$count(clusters);

  return <StoryFeed initialClusters={clusterData} totalCount={totalCount} />;
}
