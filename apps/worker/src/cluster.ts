import './env.js';
import { db } from '@ftp/db/client';
import { articles, clusters } from '@ftp/db';
import { isNull, eq, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

function makeClusterId(fingerprint: string): string {
  return createHash('sha256').update(fingerprint).digest('hex').slice(0, 16);
}

function tokenize(text: string): Set<string> {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'has', 'have', 'had', 'will', 'would', 'could', 'should', 'may', 'might',
    'it', 'its', 'this', 'that', 'as', 'says', 'said', 'after', 'over',
  ]);
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !stopwords.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

type Article = { id: string; title: string; publishedAt: Date; sourceId: string };

function clusterArticles(arts: Article[]): Map<string, Article[]> {
  const sorted = [...arts].sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
  const groups: Article[][] = [];
  const assigned = new Set<string>();

  for (const art of sorted) {
    if (assigned.has(art.id)) continue;
    const tokens = tokenize(art.title);
    let bestGroup: Article[] | null = null;
    let bestScore = 0;

    for (const group of groups) {
      const groupStart = group[0]!.publishedAt.getTime();
      const diff = Math.abs(art.publishedAt.getTime() - groupStart) / (1000 * 3600);
      if (diff > 72) continue;
      for (const member of group) {
        const score = jaccard(tokens, tokenize(member.title));
        if (score > bestScore) { bestScore = score; bestGroup = group; }
      }
    }

    if (bestScore >= 0.2 && bestGroup) {
      bestGroup.push(art);
    } else {
      groups.push([art]);
    }
    assigned.add(art.id);
  }

  const result = new Map<string, Article[]>();
  for (const group of groups) {
    if (group.length < 2) continue;
    const sources = new Set(group.map((a) => a.sourceId));
    if (sources.size < 2) continue;
    const fingerprint = group.map((a) => a.id).sort().join(',');
    const clusterId = makeClusterId(fingerprint);
    result.set(clusterId, group);
  }
  return result;
}

async function generateCanonicalTitle(titles: string[]): Promise<string> {
  try {
    const resp = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `Write ONE neutral headline (under 12 words, no bias) summarizing these news titles about the same event:\n\n${titles.slice(0, 6).join('\n')}\n\nRespond with only the headline, no quotes.`,
      }],
      max_tokens: 60,
      temperature: 0.2,
    });
    return resp.choices[0]?.message?.content?.trim() ?? titles[0] ?? 'Untitled';
  } catch {
    return titles[0] ?? 'Untitled';
  }
}

async function main() {
  console.log('Loading unclustered articles…');
  const rows = await db.select({
    id: articles.id,
    title: articles.title,
    publishedAt: articles.publishedAt,
    sourceId: articles.sourceId,
  }).from(articles).where(isNull(articles.clusterId));

  console.log(`  ${rows.length} unclustered articles`);
  if (rows.length === 0) { console.log('Nothing to cluster.'); process.exit(0); }

  const clusterMap = clusterArticles(rows);
  console.log(`  Formed ${clusterMap.size} clusters`);

  let clustered = 0;
  for (const [clusterId, members] of clusterMap) {
    const canonicalTitle = await generateCanonicalTitle(members.map((m) => m.title));
    const fingerprint = members.map((a) => a.id).sort().join(',');

    await db.insert(clusters).values({
      id: clusterId,
      canonicalTitle,
      storyFingerprint: fingerprint,
      status: 'pending',
      articleCount: members.length,
    }).onConflictDoNothing();

    for (const member of members) {
      await db.update(articles).set({ clusterId }).where(eq(articles.id, member.id));
    }

    clustered += members.length;
    console.log(`  Cluster [${clusterId}]: "${canonicalTitle}" (${members.length} articles)`);
  }

  const [row] = await db.select({ count: sql<number>`count(*)` }).from(clusters);
  console.log(`\nDone. Clustered ${clustered} articles into ${clusterMap.size} new clusters · DB total: ${row?.count ?? 0}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
