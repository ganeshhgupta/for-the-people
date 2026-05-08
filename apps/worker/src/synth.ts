import './env.js';
import { db } from '@ftp/db/client';
import { articles, clusters, syntheses } from '@ftp/db';
import { eq } from 'drizzle-orm';
import { buildSynthesisPrompt, SynthesisOutputSchema, SOURCE_MAP } from '@ftp/shared';
import Groq from 'groq-sdk';
import { createHash } from 'crypto';

const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

const EMPTY_NARRATIVE = {
  summary: '',
  key_claims: [],
  framing_devices: [],
  sources_used: [],
};

function sanitize(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitizeStr = (v: unknown) => (v == null ? '' : String(v));
  const sanitizeArr = <T>(v: unknown, itemFn?: (x: unknown) => T): T[] =>
    Array.isArray(v) ? (itemFn ? (v as unknown[]).map(itemFn) : (v as T[])) : [];

  const rhetoric_flags = sanitizeArr(raw['rhetoric_flags'], (f: unknown) => {
    const flag = f as Record<string, unknown>;
    return {
      ...flag,
      leader_name: sanitizeStr(flag['leader_name']),
      party: sanitizeStr(flag['party']),
      quoted_statement: sanitizeStr(flag['quoted_statement']),
      context: sanitizeStr(flag['context']),
      contradicting_fact_or_question: sanitizeStr(flag['contradicting_fact_or_question']),
      citation: sanitizeStr(flag['citation']),
    };
  });

  const named_individuals = sanitizeArr(raw['named_individuals'], (ind: unknown) => {
    const i = ind as Record<string, unknown>;
    return {
      ...i,
      name: sanitizeStr(i['name']),
      role: sanitizeStr(i['role']),
      party_or_affiliation: sanitizeStr(i['party_or_affiliation']),
    };
  });

  const statistics = sanitizeArr(raw['statistics'], (s: unknown) => {
    const stat = s as Record<string, unknown>;
    return { ...stat, year: typeof stat['year'] === 'number' ? stat['year'] : new Date().getFullYear() };
  });

  const cc = (raw['contested_claims'] as Record<string, unknown> | null) ?? {};
  const contested_claims = {
    right_narrative: cc['right_narrative'] ?? EMPTY_NARRATIVE,
    left_narrative: cc['left_narrative'] ?? EMPTY_NARRATIVE,
    other_narrative: cc['other_narrative'] ?? null,
  };

  let common_ground = raw['common_ground'];
  if (common_ground !== null && !Array.isArray(common_ground) && typeof common_ground === 'object') {
    common_ground = [common_ground];
  }

  let irreconcilable = sanitizeArr<string>(raw['irreconcilable_disagreements']);
  if (common_ground === null && irreconcilable.length === 0) {
    irreconcilable = ['Narratives are too divergent to identify common ground.'];
  }

  return {
    ...raw,
    rhetoric_flags,
    named_individuals,
    statistics,
    contested_claims,
    common_ground,
    irreconcilable_disagreements: irreconcilable,
  };
}

async function synthesizeCluster(clusterId: string): Promise<void> {
  const [cluster] = await db.select().from(clusters).where(eq(clusters.id, clusterId));
  if (!cluster) throw new Error(`Cluster ${clusterId} not found`);

  const clusterArticles = await db.select().from(articles).where(eq(articles.clusterId, clusterId));
  if (clusterArticles.length === 0) throw new Error(`No articles for cluster ${clusterId}`);

  const articlesForPrompt = clusterArticles.map((a) => ({
    source_id: a.sourceId,
    lean: SOURCE_MAP.get(a.sourceId)?.lean ?? ('centre' as const),
    title: a.title,
    published_at: a.publishedAt.toISOString(),
    body_excerpt: a.bodyExcerpt,
  }));

  const { system, userMessage } = buildSynthesisPrompt(
    { id: cluster.id, canonical_title: cluster.canonicalTitle, story_fingerprint: cluster.storyFingerprint },
    articlesForPrompt
  );

  console.log(`  Synthesizing "${cluster.canonicalTitle}" (${clusterArticles.length} articles)…`);

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4096,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const raw = resp.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from Groq');

  const parsed = sanitize(JSON.parse(raw));
  const validated = SynthesisOutputSchema.parse(parsed);

  const synthId = createHash('sha256').update(clusterId).digest('hex').slice(0, 16);

  await db.insert(syntheses)
    .values({ id: synthId, clusterId, output: validated, createdAt: new Date() })
    .onConflictDoUpdate({ target: syntheses.clusterId, set: { output: validated, createdAt: new Date() } });

  await db.update(clusters)
    .set({ status: 'synthesized', updatedAt: new Date() })
    .where(eq(clusters.id, clusterId));

  console.log(`  Done: ${clusterId}`);
}

async function main() {
  const targetClusterId = process.argv[2];

  if (targetClusterId) {
    await synthesizeCluster(targetClusterId);
  } else {
    const pending = await db.select({ id: clusters.id }).from(clusters).where(eq(clusters.status, 'pending'));
    console.log(`Synthesizing ${pending.length} pending clusters…`);
    for (const { id } of pending) {
      try {
        await synthesizeCluster(id);
      } catch (err) {
        console.error(`  Error on ${id}:`, (err as Error).message);
      }
    }
  }

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
