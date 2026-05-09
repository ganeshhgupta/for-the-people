import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { articles as articlesTable, clusters as clustersTable, syntheses as synthesesTable } from '@ftp/db';
import { buildSynthesisPrompt, SynthesisOutputSchema, SOURCE_MAP } from '@ftp/shared';
import { isNull, eq } from 'drizzle-orm';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// ── Helpers ────────────────────────────────────────────────────────────────────
const makeId = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 16);

// ── Domain → source mapping ────────────────────────────────────────────────────
const DOMAIN_MAP: Record<string, { id: string }> = {
  'ndtv.com':                    { id: 'ndtv' },
  'thehindu.com':                { id: 'the_hindu' },
  'hindustantimes.com':          { id: 'hindustan_times' },
  'indianexpress.com':           { id: 'indian_express' },
  'timesofindia.com':            { id: 'times_of_india' },
  'indiatoday.in':               { id: 'india_today' },
  'livemint.com':                { id: 'mint' },
  'scroll.in':                   { id: 'scroll' },
  'thewire.in':                  { id: 'the_wire' },
  'republicworld.com':           { id: 'republic_world' },
  'opindia.com':                 { id: 'opindia' },
  'news18.com':                  { id: 'news18' },
  'telegraphindia.com':          { id: 'telegraph_india' },
  'economictimes.indiatimes.com':{ id: 'economic_times' },
  'bbc.com':                     { id: 'web_bbc' },
  'reuters.com':                 { id: 'reuters' },
  'theguardian.com':             { id: 'web_theguardian' },
  'firstpost.com':               { id: 'firstpost' },
  'theprint.in':                 { id: 'the_print' },
  'wionews.com':                 { id: 'wion' },
  'barandbench.com':             { id: 'barandbench' },
};

function sourceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return DOMAIN_MAP[host]?.id ?? `web_${host.split('.')[0]}`;
  } catch { return 'web_unknown'; }
}

// ── Brave News ingest ──────────────────────────────────────────────────────────
const BRAVE_QUERIES = [
  'India news breaking today',
  'India politics government latest',
  'India crime law court',
  'India economy business finance',
  'India sports latest results',
  'India technology science',
  'India international foreign affairs',
];

async function ingestBrave(db: ReturnType<typeof getDb>): Promise<number> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) return 0;
  let count = 0;
  const seen = new Set<string>();

  for (const q of BRAVE_QUERIES) {
    try {
      const url = `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(q)}&count=20&freshness=pd&country=IN&search_lang=en`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'X-Subscription-Token': key },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const json = await res.json() as { results?: Record<string, unknown>[] };

      for (const r of json.results ?? []) {
        const articleUrl = String(r['url'] ?? '');
        if (!articleUrl || seen.has(articleUrl)) continue;
        seen.add(articleUrl);

        const id = makeId(articleUrl);
        const srcId = sourceFromUrl(articleUrl);
        const pubRaw = r['age'] ? new Date(String(r['age'])) : new Date();
        const pub = isNaN(pubRaw.getTime()) ? new Date() : pubRaw;
        const thumb = r['thumbnail'] as Record<string, unknown> | null;

        try {
          await db.insert(articlesTable).values({
            id, sourceId: srcId, url: articleUrl,
            title: String(r['title'] ?? 'Untitled'),
            publishedAt: pub,
            bodyExcerpt: String(r['description'] ?? '').slice(0, 2000),
            imageUrl: thumb?.['src'] ? String(thumb['src']) : null,
          }).onConflictDoNothing();
          count++;
        } catch { /* duplicate */ }
      }
    } catch (e) {
      console.error(`[brave] "${q}":`, (e as Error).message);
    }
  }
  return count;
}

// ── RSS ingest (lightweight XML parser, no extra dependency) ───────────────────
const RSS_FEEDS = [
  { id: 'ndtv',            url: 'https://feeds.feedburner.com/NDTV-LatestNews' },
  { id: 'the_hindu',       url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
  { id: 'times_of_india',  url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
  { id: 'indian_express',  url: 'https://indianexpress.com/feed/' },
  { id: 'hindustan_times', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
  { id: 'india_today',     url: 'https://www.indiatoday.in/rss/home' },
  { id: 'the_wire',        url: 'https://thewire.in/feed' },
  { id: 'scroll',          url: 'https://scroll.in/feed' },
  { id: 'republic_world',  url: 'https://www.republicworld.com/rss/india-news.xml' },
  { id: 'news18',          url: 'https://www.news18.com/rss/india.xml' },
  { id: 'the_print',       url: 'https://theprint.in/feed/' },
  { id: 'firstpost',       url: 'https://www.firstpost.com/rss/india.xml' },
];

function xmlText(tag: string, xml: string): string {
  const cdata = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, 'i').exec(xml)?.[1];
  if (cdata) return cdata.trim();
  return new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i').exec(xml)?.[1]?.trim() ?? '';
}
function xmlAttr(tag: string, attr: string, xml: string): string {
  return new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, 'i').exec(xml)?.[1] ?? '';
}

async function ingestRss(db: ReturnType<typeof getDb>): Promise<number> {
  let count = 0;
  for (const feed of RSS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'ForThePeople/1.0 (+https://forthepeoplenews.vercel.app)' },
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      const items = text.match(/<item[\s\S]*?<\/item>/gi) ?? [];

      for (const item of items.slice(0, 25)) {
        const link = xmlText('link', item) || xmlAttr('link', 'href', item) || xmlText('guid', item);
        const title = xmlText('title', item);
        if (!link || !title) continue;

        const pubStr = xmlText('pubDate', item) || xmlText('dc:date', item);
        const pub = pubStr ? new Date(pubStr) : new Date();
        const desc = xmlText('description', item).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const imgUrl = (xmlAttr('media:content', 'url', item) || xmlAttr('enclosure', 'url', item) ||
          (/<img[^>]+src="([^"]+)"/.exec(xmlText('content:encoded', item))?.[1])) ?? null;
        const id = makeId(link);

        try {
          await db.insert(articlesTable).values({
            id, sourceId: feed.id, url: link,
            title: title.slice(0, 500),
            publishedAt: isNaN(pub.getTime()) ? new Date() : pub,
            bodyExcerpt: desc.slice(0, 2000),
            imageUrl: imgUrl,
          }).onConflictDoNothing();
          count++;
        } catch { /* duplicate */ }
      }
    } catch (e) {
      console.error(`[rss] ${feed.id}:`, (e as Error).message);
    }
  }
  return count;
}

// ── Jaccard text clustering ────────────────────────────────────────────────────
const STOPWORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','has','have','had','will','would','could','should','may','might','it','its','this','that','as','says','said','after','over','india','indian']);

function tokenize(text: string): Set<string> {
  return new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return (a.size + b.size - inter) === 0 ? 0 : inter / (a.size + b.size - inter);
}

type RawArt = { id: string; title: string; publishedAt: Date; sourceId: string };

function buildClusters(arts: RawArt[]): Map<string, RawArt[]> {
  const sorted = [...arts].sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
  const groups: RawArt[][] = [];
  const assigned = new Set<string>();

  for (const art of sorted) {
    if (assigned.has(art.id)) continue;
    const tokens = tokenize(art.title);
    let best: RawArt[] | null = null;
    let bestScore = 0;

    for (const g of groups) {
      const ageDiff = Math.abs(art.publishedAt.getTime() - g[0]!.publishedAt.getTime()) / 3_600_000;
      if (ageDiff > 72) continue;
      for (const m of g) {
        const s = jaccard(tokens, tokenize(m.title));
        if (s > bestScore) { bestScore = s; best = g; }
      }
    }
    if (bestScore >= 0.22 && best) best.push(art); else groups.push([art]);
    assigned.add(art.id);
  }

  const result = new Map<string, RawArt[]>();
  for (const g of groups) {
    if (g.length < 2) continue;
    if (new Set(g.map(a => a.sourceId)).size < 2) continue;
    const fp = g.map(a => a.id).sort().join(',');
    result.set(createHash('sha256').update(fp).digest('hex').slice(0, 16), g);
  }
  return result;
}

// ── Gemini API call ────────────────────────────────────────────────────────────
async function geminiCall(system: string, user: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 8192 },
      }),
      signal: AbortSignal.timeout(90_000),
    }
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

async function geminiTitle(titles: string[]): Promise<string> {
  try {
    return (await geminiCall(
      'You write neutral news headlines.',
      `Write ONE neutral headline under 12 words for this story:\n${titles.slice(0, 5).join('\n')}\n\nOnly the headline, no quotes.`
    )).trim().replace(/^["']|["']$/g, '');
  } catch { return titles[0] ?? 'Untitled'; }
}

// ── Sanitize raw Gemini JSON output ───────────────────────────────────────────
const EMPTY_NARRATIVE = { summary: '', key_claims: [], framing_devices: [], sources_used: [] };

function sanitize(raw: Record<string, unknown>): Record<string, unknown> {
  const str = (v: unknown) => (v == null ? '' : String(v));
  const arr = <T>(v: unknown, fn?: (x: unknown) => T): T[] =>
    Array.isArray(v) ? (fn ? (v as unknown[]).map(fn) : (v as T[])) : [];

  const rhetoric_flags = arr(raw['rhetoric_flags'], (f: unknown) => {
    const fl = f as Record<string, unknown>;
    return { ...fl, leader_name: str(fl['leader_name']), party: str(fl['party']),
      quoted_statement: str(fl['quoted_statement']), context: str(fl['context']),
      contradicting_fact_or_question: str(fl['contradicting_fact_or_question']), citation: str(fl['citation']) };
  });
  const named_individuals = arr(raw['named_individuals'], (i: unknown) => {
    const ind = i as Record<string, unknown>;
    return { ...ind, name: str(ind['name']), role: str(ind['role']), party_or_affiliation: str(ind['party_or_affiliation']) };
  });
  const statistics = arr(raw['statistics'], (s: unknown) => {
    const st = s as Record<string, unknown>;
    return { ...st, year: typeof st['year'] === 'number' ? st['year'] : new Date().getFullYear() };
  });
  const cc = (raw['contested_claims'] as Record<string, unknown> | null) ?? {};
  const contested_claims = {
    right_narrative: cc['right_narrative'] ?? EMPTY_NARRATIVE,
    left_narrative:  cc['left_narrative']  ?? EMPTY_NARRATIVE,
    other_narrative: cc['other_narrative'] ?? null,
  };
  let common_ground = raw['common_ground'];
  if (common_ground !== null && !Array.isArray(common_ground) && typeof common_ground === 'object') {
    common_ground = [common_ground];
  }
  const irreconcilable = arr<string>(raw['irreconcilable_disagreements']);

  const VALID_TONES = new Set(['positive', 'neutral', 'negative', 'mixed']);
  const VALID_CATS = new Set(['politics', 'finance', 'tech', 'sports', 'entertainment', 'travel', 'art']);
  const rawTone = typeof raw['tone'] === 'string' ? raw['tone'].toLowerCase() : undefined;
  const tone = rawTone && VALID_TONES.has(rawTone) ? rawTone : undefined;
  const categories = arr<string>(raw['categories']).map(c => c.toLowerCase()).filter(c => VALID_CATS.has(c));

  return { ...raw, rhetoric_flags, named_individuals, statistics, contested_claims, common_ground,
    irreconcilable_disagreements: irreconcilable.length > 0 ? irreconcilable : common_ground ? [] : ['Narratives are too divergent to identify common ground.'],
    tone,
    categories: categories.length > 0 ? categories : undefined,
  };
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function GET(req: Request) {
  // Vercel sets CRON_SECRET and sends it; skip auth locally
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const db = getDb();
  const t0 = Date.now();
  const log: string[] = [];

  // ── 1. Ingest ────────────────────────────────────────────────────────────────
  const [rssCount, braveCount] = await Promise.all([ingestRss(db), ingestBrave(db)]);
  log.push(`Ingested ${rssCount} (RSS) + ${braveCount} (Brave) = ${rssCount + braveCount} articles`);

  // ── 2. Cluster ───────────────────────────────────────────────────────────────
  const unclustered = await db.select({
    id: articlesTable.id,
    title: articlesTable.title,
    publishedAt: articlesTable.publishedAt,
    sourceId: articlesTable.sourceId,
  }).from(articlesTable).where(isNull(articlesTable.clusterId));

  const clusterMap = buildClusters(unclustered);
  let newClusters = 0;

  for (const [clusterId, members] of clusterMap) {
    const canonicalTitle = await geminiTitle(members.map(m => m.title));
    const fingerprint = members.map(a => a.id).sort().join(',');
    await db.insert(clustersTable).values({
      id: clusterId, canonicalTitle,
      storyFingerprint: fingerprint,
      status: 'pending',
      articleCount: members.length,
    }).onConflictDoUpdate({
      target: clustersTable.id,
      set: { articleCount: members.length, updatedAt: new Date() },
    });
    for (const m of members) {
      await db.update(articlesTable).set({ clusterId }).where(eq(articlesTable.id, m.id));
    }
    newClusters++;
  }
  log.push(`Formed ${newClusters} clusters from ${unclustered.length} unclustered articles`);

  // ── 3. Synthesize (max 3 per run to stay within time budget) ─────────────────
  const pending = await db.select({ id: clustersTable.id })
    .from(clustersTable).where(eq(clustersTable.status, 'pending')).limit(3);

  let synthesized = 0;
  for (const { id: cId } of pending) {
    // Stop if we're approaching 4.5 minutes — leave buffer for response
    if (Date.now() - t0 > 270_000) { log.push('Time budget reached, deferring remaining clusters'); break; }

    try {
      const [cluster] = await db.select().from(clustersTable).where(eq(clustersTable.id, cId));
      if (!cluster) continue;
      const arts = await db.select().from(articlesTable).where(eq(articlesTable.clusterId, cId));
      if (arts.length === 0) continue;

      const articlesForPrompt = arts.map(a => ({
        source_id: a.sourceId,
        lean: (SOURCE_MAP.get(a.sourceId)?.lean ?? 'centre') as 'centre',
        title: a.title,
        published_at: a.publishedAt.toISOString(),
        body_excerpt: (a.bodyExcerpt ?? '').slice(0, 1500),
      }));

      const { system, userMessage } = buildSynthesisPrompt(
        { id: cluster.id, canonical_title: cluster.canonicalTitle, story_fingerprint: cluster.storyFingerprint },
        articlesForPrompt
      );

      const rawText = await geminiCall(system, userMessage);
      const parsed = sanitize(JSON.parse(rawText));
      const validated = SynthesisOutputSchema.parse(parsed);

      const synthId = makeId(cId);
      await db.insert(synthesesTable).values({ id: synthId, clusterId: cId, output: validated, createdAt: new Date() })
        .onConflictDoUpdate({ target: synthesesTable.clusterId, set: { output: validated, createdAt: new Date() } });
      await db.update(clustersTable).set({ status: 'synthesized', updatedAt: new Date() }).where(eq(clustersTable.id, cId));

      synthesized++;
      log.push(`Synthesized: "${cluster.canonicalTitle}"`);
    } catch (e) {
      log.push(`Synth error [${cId}]: ${(e as Error).message.slice(0, 80)}`);
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  return NextResponse.json({ ok: true, elapsed: `${elapsed}s`, log, timestamp: new Date().toISOString() });
}
