import { getDb } from '../../../../lib/db';
import { clusters, articles } from '@ftp/db';
import { eq, gt, and, sql, inArray, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// Poll for new synthesized clusters and stream them as SSE events.
// The client reconnects automatically when the server closes (after ~20s).
// Each reconnect passes the latest `since` timestamp to avoid re-sending seen clusters.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sinceParam = url.searchParams.get('since');
  const sinceDate = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60_000);

  const db = getDb();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller already closed
        }
      };

      send({ type: 'connected' });

      let lastCheck = sinceDate;
      const deadline = Date.now() + 20_000; // 20s max — safe on all Vercel plans
      const POLL_INTERVAL = 5_000;

      async function poll() {
        if (Date.now() >= deadline) {
          controller.close();
          return;
        }

        try {
          const newClusters = await db
            .select()
            .from(clusters)
            .where(and(
              eq(clusters.status, 'synthesized'),
              gt(clusters.updatedAt, lastCheck),
            ))
            .orderBy(sql`(SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`)
            .limit(10);

          if (newClusters.length > 0) {
            lastCheck = new Date();

            const ids = newClusters.map(c => c.id);
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

            for (const c of newClusters) {
              send({
                type: 'new_cluster',
                cluster: {
                  id: c.id,
                  canonicalTitle: c.canonicalTitle,
                  status: c.status,
                  articleCount: c.articleCount,
                  createdAt: c.createdAt.toISOString(),
                  coverImage: coverMap[c.id] ?? null,
                },
              });
            }
          }

          setTimeout(poll, POLL_INTERVAL);
        } catch {
          controller.close();
        }
      }

      await poll();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
