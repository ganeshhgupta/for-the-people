import './env.js';
import RssParser from 'rss-parser';
import { db } from '@tristhana/db/client';
import { articles } from '@tristhana/db';
import { SOURCES } from '@tristhana/shared';
import { createHash } from 'crypto';
import { sql } from 'drizzle-orm';

type CustomItem = {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
  enclosure?: { url?: string; type?: string };
  'content:encoded'?: string;
};

const parser = new RssParser<Record<string, unknown>, CustomItem>({
  timeout: 10000,
  headers: { 'User-Agent': 'Tristhana/1.0 RSS Reader' },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

function makeId(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function extractImage(item: RssParser.Item & CustomItem): string | null {
  // 1. enclosure (common in RSS 2.0)
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }
  // 2. media:content
  const mc = item.mediaContent;
  if (mc?.['$']?.url) return mc['$'].url;
  // 3. media:thumbnail
  const mt = item.mediaThumbnail;
  if (mt?.['$']?.url) return mt['$'].url;
  // 4. first <img> in full content
  const html = item['content:encoded'] ?? item.content ?? '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

async function ingestSource(sourceId: string, feedUrl: string): Promise<number> {
  try {
    const feed = await parser.parseURL(feedUrl);
    let inserted = 0;

    for (const item of feed.items ?? []) {
      const url = item.link ?? item.guid;
      if (!url) continue;

      const title = item.title ?? 'Untitled';
      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
      const bodyExcerpt = truncate(item.contentSnippet ?? item.content ?? item.summary ?? '', 2000);
      const imageUrl = extractImage(item as RssParser.Item & CustomItem);
      const id = makeId(url);

      try {
        db.insert(articles)
          .values({ id, sourceId, url, title, publishedAt, bodyExcerpt, imageUrl })
          .onConflictDoUpdate({
            target: articles.url,
            set: { imageUrl },   // backfill image on existing rows
          })
          .run();
        inserted++;
      } catch { /* skip */ }
    }
    return inserted;
  } catch (err) {
    console.error(`  [${sourceId}] Error: ${(err as Error).message}`);
    return 0;
  }
}

async function main() {
  console.log(`Ingesting ${SOURCES.length} sources…`);
  let total = 0;

  for (const source of SOURCES) {
    for (const rssUrl of source.rss) {
      process.stdout.write(`  [${source.id}] … `);
      const count = await ingestSource(source.id, rssUrl);
      console.log(`${count} articles`);
      total += count;
    }
  }

  const row = db.get<{ count: number }>(sql`SELECT count(*) as count FROM articles`);
  console.log(`\nDone. ${total} new · DB total: ${row?.count ?? 0}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
