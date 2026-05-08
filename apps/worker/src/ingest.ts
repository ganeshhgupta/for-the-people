import './env.js';
import RssParser from 'rss-parser';
import { db } from '@ftp/db/client';
import { articles } from '@ftp/db';
import { SOURCES } from '@ftp/shared';
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
  headers: { 'User-Agent': 'ForThePeople/1.0 RSS Reader' },
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
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url))
    return item.enclosure.url;
  const mc = item.mediaContent;
  if (mc?.['$']?.url) return mc['$'].url;
  const mt = item.mediaThumbnail;
  if (mt?.['$']?.url) return mt['$'].url;
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
        await db.insert(articles)
          .values({ id, sourceId, url, title, publishedAt, bodyExcerpt, imageUrl })
          .onConflictDoUpdate({
            target: articles.url,
            set: { imageUrl },
          });
        inserted++;
      } catch { /* duplicate or constraint — skip */ }
    }
    return inserted;
  } catch (err) {
    console.error(`  [${sourceId}] Error: ${(err as Error).message}`);
    return 0;
  }
}

/* ── Optional: NewsAPI.org (free tier — set NEWS_API_KEY in .env.local) ── */
async function ingestNewsAPI(): Promise<number> {
  const key = process.env['NEWS_API_KEY'];
  if (!key) return 0;

  let total = 0;
  const queries = ['india politics', 'india economy', 'india crime', 'india sports', 'india technology'];

  for (const q of queries) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${key}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) { console.error(`  [newsapi] HTTP ${res.status}`); continue; }
      const json = await res.json() as { articles?: unknown[] };

      for (const art of json.articles ?? []) {
        const a = art as Record<string, unknown>;
        const articleUrl = String(a['url'] ?? '');
        if (!articleUrl || articleUrl === 'https://removed.com') continue;

        const sourceObj = a['source'] as Record<string, unknown> | null;
        const sourceId = `newsapi_${String(sourceObj?.['id'] ?? sourceObj?.['name'] ?? 'unknown').toLowerCase().replace(/\s+/g, '_').slice(0, 32)}`;
        const title = String(a['title'] ?? 'Untitled');
        const publishedAt = a['publishedAt'] ? new Date(String(a['publishedAt'])) : new Date();
        const bodyExcerpt = truncate(String(a['description'] ?? a['content'] ?? ''), 2000);
        const imageUrl = a['urlToImage'] ? String(a['urlToImage']) : null;
        const id = makeId(articleUrl);

        try {
          await db.insert(articles)
            .values({ id, sourceId, url: articleUrl, title, publishedAt, bodyExcerpt, imageUrl })
            .onConflictDoUpdate({ target: articles.url, set: { imageUrl } });
          total++;
        } catch { /* skip */ }
      }
    } catch (err) {
      console.error(`  [newsapi] "${q}" error: ${(err as Error).message}`);
    }
  }
  return total;
}

/* ── Optional: The Guardian API (free key at open-platform.theguardian.com) ── */
async function ingestGuardian(): Promise<number> {
  const key = process.env['GUARDIAN_API_KEY'] ?? 'test';
  let total = 0;

  for (let page = 1; page <= 4; page++) {
    try {
      const url = `https://content.guardianapis.com/search?q=india&api-key=${key}&page-size=50&page=${page}&show-fields=bodyText,thumbnail&lang=en&order-by=newest`;
      const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) break;
      const json = await res.json() as { response?: { results?: unknown[] } };
      const results = json.response?.results ?? [];
      if (results.length === 0) break;

      for (const item of results) {
        const r = item as Record<string, unknown>;
        const articleUrl = String(r['webUrl'] ?? '');
        if (!articleUrl) continue;

        const fields = r['fields'] as Record<string, unknown> | undefined;
        const title = String(r['webTitle'] ?? 'Untitled');
        const publishedAt = r['webPublicationDate'] ? new Date(String(r['webPublicationDate'])) : new Date();
        const bodyExcerpt = truncate(String(fields?.['bodyText'] ?? ''), 2000);
        const imageUrl = fields?.['thumbnail'] ? String(fields['thumbnail']) : null;
        const id = makeId(articleUrl);

        try {
          await db.insert(articles)
            .values({ id, sourceId: 'guardian', url: articleUrl, title, publishedAt, bodyExcerpt, imageUrl })
            .onConflictDoUpdate({ target: articles.url, set: { imageUrl } });
          total++;
        } catch { /* skip */ }
      }

      if (results.length < 50) break;
      await new Promise(r => setTimeout(r, 300)); // polite rate-limit
    } catch (err) {
      console.error(`  [guardian] page ${page} error: ${(err as Error).message}`);
      break;
    }
  }
  return total;
}

async function main() {
  let total = 0;

  // ── RSS feeds ──
  console.log(`Ingesting ${SOURCES.length} RSS sources…`);
  for (const source of SOURCES) {
    for (const rssUrl of source.rss) {
      process.stdout.write(`  [${source.id}] … `);
      const count = await ingestSource(source.id, rssUrl);
      console.log(`${count} articles`);
      total += count;
    }
  }

  // ── NewsAPI (optional) ──
  if (process.env['NEWS_API_KEY']) {
    process.stdout.write('  [newsapi] … ');
    const n = await ingestNewsAPI();
    console.log(`${n} articles`);
    total += n;
  }

  // ── The Guardian (optional; uses "test" key if GUARDIAN_API_KEY not set) ──
  process.stdout.write('  [guardian] … ');
  const g = await ingestGuardian();
  console.log(`${g} articles`);
  total += g;

  const [row] = await db.select({ count: sql<number>`count(*)` }).from(articles);
  console.log(`\nDone. ${total} new · DB total: ${row?.count ?? 0}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
