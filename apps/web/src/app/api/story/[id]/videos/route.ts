import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusters } from '@tristhana/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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

  if (!cluster) return NextResponse.json({ videos: [] });

  const key = process.env['YOUTUBE_API_KEY'];
  if (!key) return NextResponse.json({ videos: [], error: 'YOUTUBE_API_KEY not set' });

  const q = encodeURIComponent(`${cluster.canonicalTitle} india`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=6&regionCode=IN&key=${key}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return NextResponse.json({ videos: [] });

    const json = await res.json();
    const videos = ((json.items ?? []) as unknown[])
      .filter((item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
      )
      .map(item => {
        const id_ = (item.id as Record<string, string>)?.videoId;
        const snip = item.snippet as Record<string, unknown>;
        return {
          videoId:      id_,
          title:        String(snip?.title ?? ''),
          channelTitle: String(snip?.channelTitle ?? ''),
          publishedAt:  String(snip?.publishedAt ?? ''),
          thumbnail:    (snip?.thumbnails as Record<string, Record<string, string>>)?.medium?.url ?? null,
        };
      })
      .filter(v => !!v.videoId);

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
