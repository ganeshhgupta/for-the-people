import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusterLinks, clusters } from '@ftp/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const links = await db
    .select({
      fromClusterId: clusterLinks.fromClusterId,
      sharedEntities: clusterLinks.sharedEntities,
    })
    .from(clusterLinks)
    .where(eq(clusterLinks.toClusterId, id));

  if (links.length === 0) return NextResponse.json({ reasons: [] });

  const reasons = (
    await Promise.all(
      links.map(async (link) => {
        const [cluster] = await db
          .select({
            id: clusters.id,
            canonicalTitle: clusters.canonicalTitle,
            createdAt: clusters.createdAt,
            status: clusters.status,
          })
          .from(clusters)
          .where(eq(clusters.id, link.fromClusterId));

        if (!cluster) return null;
        return {
          id: cluster.id,
          title: cluster.canonicalTitle,
          createdAt: cluster.createdAt.toISOString(),
          status: cluster.status,
          sharedEntities: JSON.parse(link.sharedEntities || '[]') as string[],
        };
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime());

  return NextResponse.json({ reasons });
}
