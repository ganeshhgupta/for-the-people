import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusters } from '@ftp/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const STOP = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','but','with',
  'from','by','is','are','was','were','that','this','has','have','will',
  'its','it','be','been','as','up','india','indian','after','over',
]);

function toHashtags(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP.has(w))
    .slice(0, 3);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const [cluster] = await db
    .select({ canonicalTitle: clusters.canonicalTitle })
    .from(clusters)
    .where(eq(clusters.id, id));

  if (!cluster) return NextResponse.json({ reels: [] });

  const hashtags = toHashtags(cluster.canonicalTitle);
  if (hashtags.length === 0) return NextResponse.json({ reels: [] });

  const token = process.env['APIFY_TOKEN'];
  if (!token) return NextResponse.json({ reels: [], error: 'APIFY_TOKEN not set' });

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=45`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags,
          resultsType: 'posts',
          resultsLimit: 10,
          addParentData: false,
        }),
        signal: AbortSignal.timeout(50_000),
      }
    );

    if (!res.ok) return NextResponse.json({ reels: [] });

    const items: unknown[] = await res.json();

    const reels = (Array.isArray(items) ? items : [])
      .filter((item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null &&
        typeof (item as Record<string, unknown>).videoUrl === 'string' &&
        (item as Record<string, unknown>).type === 'Video'
      )
      .slice(0, 6)
      .map(item => ({
        videoUrl:   item.videoUrl as string,
        displayUrl: (item.displayUrl ?? null) as string | null,
        caption:    ((item.caption ?? '') as string).slice(0, 140),
        likes:      (item.likesCount ?? 0) as number,
        views:      (item.videoViewCount ?? 0) as number,
        shortCode:  (item.shortCode ?? '') as string,
      }));

    return NextResponse.json({ reels });
  } catch {
    return NextResponse.json({ reels: [] });
  }
}
