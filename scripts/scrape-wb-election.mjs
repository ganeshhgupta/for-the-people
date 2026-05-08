/**
 * Scrapes latest West Bengal election articles via Brave News Search,
 * inserts into DB, creates a cluster, then prints article data for synthesis.
 */
import { createHash } from 'crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { neon } = await import(pathToFileURL(join(__dirname, '../apps/web/node_modules/@neondatabase/serverless/index.mjs')).href);

const sql = neon('postgresql://neondb_owner:npg_5OI0cxWkJwzq@ep-little-mud-aqgl4ijv-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
const BRAVE_KEY = 'BSAnsUq8Vavug2NYodu0FVL0duaxJYj';

function makeId(s) { return createHash('sha256').update(s).digest('hex').slice(0, 16); }
function makeClusterId(fp) { return createHash('sha256').update(fp).digest('hex').slice(0, 16); }

// Map Brave source domain to our source_id + lean
const DOMAIN_MAP = {
  'ndtv.com':            { id: 'ndtv',            lean: 'centre' },
  'thehindu.com':        { id: 'the_hindu',        lean: 'left_lean' },
  'hindustantimes.com':  { id: 'hindustan_times',  lean: 'centre' },
  'indianexpress.com':   { id: 'indian_express',   lean: 'centre' },
  'timesofindia.com':    { id: 'times_of_india',   lean: 'right_lean' },
  'indiatoday.in':       { id: 'india_today',      lean: 'centre' },
  'livemint.com':        { id: 'mint',             lean: 'centre' },
  'scroll.in':           { id: 'scroll',           lean: 'left_lean' },
  'thewire.in':          { id: 'the_wire',         lean: 'left_heavy' },
  'republicworld.com':   { id: 'republic_world',   lean: 'right_lean' },
  'opindia.com':         { id: 'opindia',          lean: 'right_heavy' },
  'news18.com':          { id: 'news18',           lean: 'right_lean' },
  'telegraphindia.com':  { id: 'telegraph_india',  lean: 'left_lean' },
  'barandbench.com':     { id: 'barandbench',      lean: 'centre' },
};

function sourceFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return DOMAIN_MAP[host] ?? { id: `web_${host.split('.')[0]}`, lean: 'centre' };
  } catch { return { id: 'web_unknown', lean: 'centre' }; }
}

async function braveSearch(query, count = 20, freshness = 'pw') {
  const url = `https://api.search.brave.com/res/v1/news/search?q=${encodeURIComponent(query)}&count=${count}&freshness=${freshness}&country=IN&search_lang=en`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Brave API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.results ?? [];
}

async function fetchArticleBody(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ForThePeople/1.0)' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Strip tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, 2000);
  } catch { return ''; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log('Searching Brave News for West Bengal election articles…\n');

// Multiple queries to get diverse coverage
const queries = [
  'West Bengal election 2026 results BJP TMC',
  'West Bengal election BJP government formation 2026',
  'Mamata Banerjee West Bengal election loss 2026',
  'West Bengal assembly election 2026 Suvendu Adhikari',
];

const seen = new Set();
const hits = [];

for (const q of queries) {
  try {
    const results = await braveSearch(q, 10, 'pw');
    for (const r of results) {
      const url = r.url;
      if (!url || seen.has(url)) continue;
      seen.add(url);
      hits.push(r);
    }
    await new Promise(r => setTimeout(r, 300));
  } catch (e) {
    console.error(`  Query failed: "${q}": ${e.message}`);
  }
}

console.log(`Found ${hits.length} unique articles. Fetching bodies…\n`);

const articlesToInsert = [];
for (const r of hits.slice(0, 30)) {
  const src = sourceFromUrl(r.url);
  const pub = r.age ? new Date(r.age) : new Date();
  let body = r.description ?? r.extra_snippets?.join(' ') ?? '';
  if (body.length < 200) {
    process.stdout.write(`  Fetching ${r.url.slice(0, 60)}… `);
    body = await fetchArticleBody(r.url);
    console.log(`${body.length} chars`);
  }
  const id = makeId(r.url);
  articlesToInsert.push({
    id,
    sourceId: src.id,
    lean: src.lean,
    url: r.url,
    title: r.title,
    publishedAt: isNaN(pub.getTime()) ? new Date() : pub,
    bodyExcerpt: body.slice(0, 2000),
    imageUrl: r.thumbnail?.src ?? r.img_src ?? null,
  });
}

console.log(`\nInserting ${articlesToInsert.length} articles…`);

// Create cluster first
const fp = articlesToInsert.map(a => makeId(a.url)).sort().join(',');
const clusterId = makeClusterId('wb-election-2026-' + Date.now());

await sql(
  `INSERT INTO clusters(id, canonical_title, story_fingerprint, status, article_count, created_at, updated_at)
   VALUES($1,$2,$3,'pending',$4,NOW(),NOW())
   ON CONFLICT(id) DO NOTHING`,
  [clusterId, 'West Bengal Election 2026: BJP Forms First Government, TMC Concedes', fp, articlesToInsert.length]
);

let inserted = 0;
for (const a of articlesToInsert) {
  try {
    await sql(
      `INSERT INTO articles(id,source_id,url,title,published_at,body_excerpt,image_url,cluster_id,ingested_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       ON CONFLICT(url) DO UPDATE SET cluster_id=$8, image_url=COALESCE(EXCLUDED.image_url, articles.image_url)`,
      [a.id, a.sourceId, a.url, a.title, a.publishedAt, a.bodyExcerpt, a.imageUrl, clusterId]
    );
    inserted++;
  } catch (e) {
    console.error(`  Skip ${a.url.slice(0, 50)}: ${e.message}`);
  }
}

await sql(`UPDATE clusters SET article_count=$1 WHERE id=$2`, [inserted, clusterId]);

console.log(`\nCluster ID : ${clusterId}`);
console.log(`Articles   : ${inserted} inserted`);
console.log('\n── Article dump for synthesis ──────────────────────────────────\n');

// Print full article data for synthesis
for (const a of articlesToInsert) {
  console.log(`ARTICLE:${JSON.stringify({ src: a.sourceId, lean: a.lean, pub: a.publishedAt.toISOString().slice(0,10), title: a.title, body: a.bodyExcerpt.slice(0,800) })}`);
}

console.log(`\nCLUSTER_ID:${clusterId}`);
