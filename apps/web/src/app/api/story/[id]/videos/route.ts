import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusters } from '@ftp/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const STOP = new Set(['the','a','an','and','or','of','in','on','at','to','for','is','are','was','were','with','its','amid','over','after','from','by','as','be','has','have','had','not','but','that','this','it','he','she','they','we','you','i','into']);

function decodeHtml(s: string) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/');
}

function keywords(title: string) {
  return new Set(
    title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w))
  );
}

function hasTimestamps(description: string) {
  const matches = description.match(/\d+:\d{2}(?::\d{2})?/g);
  return (matches?.length ?? 0) >= 2;
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

  if (!cluster) return NextResponse.json({ videos: [] });

  const key = process.env['YOUTUBE_API_KEY'];
  if (!key) return NextResponse.json({ videos: [], error: 'YOUTUBE_API_KEY not set' });

  const q = encodeURIComponent(`${cluster.canonicalTitle} news`);
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=10&relevanceLanguage=en&order=relevance&key=${key}`;

  try {
    const res = await fetch(searchUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return NextResponse.json({ videos: [] });

    const json = await res.json();
    const storyKw = keywords(cluster.canonicalTitle);

    const candidates = ((json.items ?? []) as unknown[])
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(item => {
        const id_ = (item.id as Record<string, string>)?.videoId;
        const snip = item.snippet as Record<string, unknown>;
        const title = decodeHtml(String(snip?.title ?? ''));
        return {
          videoId:      id_,
          title,
          channelTitle: decodeHtml(String(snip?.channelTitle ?? '')),
          publishedAt:  String(snip?.publishedAt ?? ''),
          thumbnail:    (snip?.thumbnails as Record<string, Record<string, string>>)?.medium?.url ?? null,
          overlap:      [...keywords(title)].filter(w => storyKw.has(w)).length,
        };
      })
      .filter(v => !!v.videoId && v.overlap >= 1);

    if (candidates.length === 0) return NextResponse.json({ videos: [] });

    // Fetch descriptions to detect chapters
    const ids = candidates.map(v => v.videoId).join(',');
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${key}`;
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(8_000) });
    const chapterMap: Record<string, boolean> = {};
    if (detailRes.ok) {
      const detail = await detailRes.json();
      for (const item of (detail.items ?? []) as Record<string, unknown>[]) {
        const vid = (item.id as string) ?? '';
        const desc = String((item.snippet as Record<string, unknown>)?.description ?? '');
        chapterMap[vid] = hasTimestamps(desc);
      }
    }

    const videos = candidates
      .map(v => ({ ...v, hasChapters: chapterMap[v.videoId as string] ?? false }))
      .sort((a, b) => (b.hasChapters ? 1 : 0) - (a.hasChapters ? 1 : 0) || b.overlap - a.overlap)
      .slice(0, 6)
      .map(({ overlap: _, ...v }) => v);

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
