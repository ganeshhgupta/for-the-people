/**
 * synth-claude.mjs
 * Synthesizes all pending clusters using Claude (Anthropic API).
 * Run from project root:
 *   $env:ANTHROPIC_API_KEY = "sk-ant-..."
 *   node scripts/synth-claude.mjs
 *
 * Optional: synthesize one specific cluster:
 *   node scripts/synth-claude.mjs <cluster-id>
 */

import { createHash } from 'crypto';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const neonPath = join(__dirname, '../apps/web/node_modules/@neondatabase/serverless/index.mjs');
const { neon } = await import(pathToFileURL(neonPath).href);

// ── Config ────────────────────────────────────────────────────────────────────
const DATABASE_URL = 'postgresql://neondb_owner:npg_5OI0cxWkJwzq@ep-little-mud-aqgl4ijv-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-6';
const DELAY_MS = 2000; // pause between clusters to avoid overloading

if (!ANTHROPIC_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set.');
  console.error('Run: $env:ANTHROPIC_API_KEY = "sk-ant-..."');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ── Source lean map (inline — avoids TS module resolution) ────────────────────
const SOURCE_LEAN = {
  opindia: 'right_heavy', swarajya: 'right_heavy', zeenews: 'right_lean',
  republicworld: 'right_lean', indiatoday: 'centre', ndtv: 'centre',
  thehindu: 'left_lean', scroll: 'left_lean', thewire: 'left_heavy',
  newslaundry: 'left_heavy', ani: 'wire', pti: 'wire', ians: 'wire',
};
function getLean(sourceId) {
  return SOURCE_LEAN[sourceId] ?? 'centre';
}

// ── System prompt (matches packages/shared/src/synthesis-prompt.ts) ───────────
const SYSTEM_PROMPT = `You are the lead editor for For The People, an Indian multi-perspective news synthesis system. You receive a cluster of articles covering the same news event from outlets across the Indian political spectrum, each tagged with editorial lean: right_heavy, right_lean, centre, left_lean, left_heavy, wire.

Your output is a single strict JSON object matching the schema below. No markdown, no preamble, no trailing commentary.

# Core epistemological rules

You distinguish three tiers of factual confidence and never collapse them in either direction.

Tier 1 (Adjudicated facts): Things established by court verdicts, official commission reports, parliamentary records, government gazette entries, RTI responses with documents, autopsy reports, formal arrest records, conviction orders. State these flatly. No "alleged," no "reportedly," no hedging.

Tier 2 (Reported facts with strong multi-source convergence): Specific factual claims (date, location, named entity, casualty count, procedural action like "FIR registered" or "chargesheet filed") reported consistently across at least 3 outlets from at least 2 different lean buckets within the first 24 hours, before narratives crystallized. State these as facts, with source citations visible.

Tier 3 (Contested claims): Motive, sequence of provocation, who organized whom, who started it, intent, blame. This is where right/left/other narratives diverge. State these as claims attributed to their sources, with steelmanned versions of each side from its own primary text.

You never bothsides adjudicated facts. If a court has convicted someone, the conviction is a Tier 1 fact and is stated flatly. The political argument that may still surround it goes in Tier 3. Both can coexist; the structure is what makes it honest.

# Naming individuals and procedural-status rules

When the story involves crimes, alleged crimes, corruption, scams, hate speech, or misconduct by identifiable individuals, you must name them using the names from the source articles. Do not anonymize as "a senior leader," "the accused official," or "an individual" when the sources have named the person.

For each named individual, classify their procedural status:
- TIER_1_CONVICTED: A court has convicted them, or they have admitted the act, or there is authenticated documentary evidence.
- TIER_2_CHARGED: A chargesheet has been filed, an FIR has been registered, an investigative agency has formally named them.
- TIER_3_ALLEGED: Allegations exist in media reports by political opponents or anonymous sources; the person denies; no agency has formally acted.
- PROCEDURAL_BARRIERS_NOTED: The above is technically Tier 3 but the available record shows specific obstacles to investigation.

You apply identical language for identical procedural status regardless of the person's political party, religion, caste, gender, or current power.

# Precedent extraction rules

For each lean direction, extract: which prior events did THAT side's outlets explicitly invoke in their coverage? Report this as a factual claim about what those outlets wrote, with citations.

# Rhetoric and accountability rules

Actively flag: RED_HERRING, BROKEN_PROMISE, EVASION, THREAT, FACTUAL_FALSEHOOD. These apply to leaders of all parties equally.

# Statistics integrity rules

Do not invent statistics. For any statistic you include, point to a specific named authoritative source. An empty statistics array is always preferable to a fabricated entry.

# Common-ground rules

If common ground does not honestly exist, set common_ground to null and write irreconcilable_disagreements explicitly. If common_ground is null, irreconcilable_disagreements must be non-empty.

# Self-awareness rules

You are aware that LLMs tend to skew slightly liberal-progressive. Counterweight this when constructing the right_narrative: do not strawman, steelman from right-leaning outlets' own primary text.

model_uncertainty_notes is required and may not be empty.

# Output JSON schema

Respond with ONLY a valid JSON object:
{
  "story_age_band": "breaking" | "developing" | "mature" | "historical",
  "established_facts": [{"claim": string, "tier": 1, "citations": [string]}],
  "reported_facts": [{"claim": string, "tier": 2, "citations": [string]}],
  "contested_claims": {
    "right_narrative": {"summary": string, "key_claims": [{"claim": string, "citations": [string]}], "framing_devices": [string], "sources_used": [string]},
    "left_narrative": {"summary": string, "key_claims": [{"claim": string, "citations": [string]}], "framing_devices": [string], "sources_used": [string]},
    "other_narrative": {"summary": string, "key_claims": [{"claim": string, "citations": [string]}], "framing_devices": [string], "sources_used": [string]} | null
  },
  "named_individuals": [{"name": string, "role": string, "party_or_affiliation": string, "procedural_status": "TIER_1_CONVICTED"|"TIER_2_CHARGED"|"TIER_3_ALLEGED"|"PROCEDURAL_BARRIERS_NOTED", "specific_acts": [string], "status_evidence": [{"fact": string, "citation": string}], "procedural_barriers": [{"fact": string, "citation": string}] | null}],
  "precedents_cited_by_right": [{"event": string, "year": number, "citing_outlets": [string]}],
  "precedents_cited_by_left": [{"event": string, "year": number, "citing_outlets": [string]}],
  "precedents_cited_by_other": [{"event": string, "year": number, "citing_outlets": [string]}],
  "rhetoric_flags": [{"type": "RED_HERRING"|"BROKEN_PROMISE"|"EVASION"|"THREAT"|"FACTUAL_FALSEHOOD", "leader_name": string, "party": string, "quoted_statement": string, "context": string, "contradicting_fact_or_question": string, "citation": string}],
  "statistics": [{"claim": string, "value": string, "unit": string, "year": number, "source_authority": string, "source_url": string | null, "self_confidence": "high"|"medium"}],
  "common_ground": [{"proposal": string, "why_right_might_accept": string, "why_left_might_accept": string, "why_it_might_still_fail": string}] | null,
  "irreconcilable_disagreements": [string],
  "model_uncertainty_notes": string
}`;

// ── Sanitize (matches apps/worker/src/synth.ts) ───────────────────────────────
function sanitize(raw) {
  const str = v => (v == null ? '' : String(v));
  const arr = (v, fn) => Array.isArray(v) ? (fn ? v.map(fn) : v) : [];

  const rhetoric_flags = arr(raw.rhetoric_flags, f => ({
    ...f,
    leader_name: str(f.leader_name), party: str(f.party),
    quoted_statement: str(f.quoted_statement), context: str(f.context),
    contradicting_fact_or_question: str(f.contradicting_fact_or_question),
    citation: str(f.citation),
  }));

  const named_individuals = arr(raw.named_individuals, i => ({
    ...i, name: str(i.name), role: str(i.role), party_or_affiliation: str(i.party_or_affiliation),
  }));

  const statistics = arr(raw.statistics, s => ({
    ...s, year: typeof s.year === 'number' ? s.year : new Date().getFullYear(),
  }));

  const cc = raw.contested_claims ?? {};
  const EMPTY = { summary: '', key_claims: [], framing_devices: [], sources_used: [] };
  const contested_claims = {
    right_narrative: cc.right_narrative ?? EMPTY,
    left_narrative:  cc.left_narrative  ?? EMPTY,
    other_narrative: cc.other_narrative ?? null,
  };

  let common_ground = raw.common_ground;
  if (common_ground !== null && !Array.isArray(common_ground) && typeof common_ground === 'object') {
    common_ground = [common_ground];
  }

  let irreconcilable = arr(raw.irreconcilable_disagreements);
  if (common_ground === null && irreconcilable.length === 0) {
    irreconcilable = ['Narratives are too divergent to identify common ground.'];
  }

  return {
    ...raw, rhetoric_flags, named_individuals, statistics,
    contested_claims, common_ground, irreconcilable_disagreements: irreconcilable,
  };
}

// ── Call Claude API ───────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude');
  return text;
}

// ── Synthesize one cluster ────────────────────────────────────────────────────
async function synthesizeCluster(cluster, clusterArticles) {
  const articleList = clusterArticles.map((a, i) =>
    `[${i + 1}] source_id: ${a.source_id} | lean: ${getLean(a.source_id)} | published: ${a.published_at.toISOString()}\nTitle: ${a.title}\nExcerpt: ${(a.body_excerpt ?? '').slice(0, 1500)}`
  ).join('\n\n---\n\n');

  const userMessage = `Cluster: "${cluster.canonical_title}"
Story fingerprint: ${cluster.story_fingerprint}
Article count: ${clusterArticles.length}

ARTICLES:

${articleList}

Synthesize these articles into the required JSON format.`;

  const raw = await callClaude(SYSTEM_PROMPT, userMessage);

  // Strip markdown code fences if Claude wrapped the JSON
  const jsonText = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

  const parsed = sanitize(JSON.parse(jsonText));

  // Basic validation
  if (!parsed.story_age_band || !parsed.contested_claims || !parsed.model_uncertainty_notes) {
    throw new Error('Response missing required fields');
  }

  const synthId = createHash('sha256').update(cluster.id).digest('hex').slice(0, 16);

  await sql(
    `INSERT INTO syntheses (id, cluster_id, output, created_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (cluster_id) DO UPDATE SET output = $3, created_at = NOW()`,
    [synthId, cluster.id, JSON.stringify(parsed)]
  );

  await sql(
    `UPDATE clusters SET status = 'synthesized', updated_at = NOW() WHERE id = $1`,
    [cluster.id]
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const targetId = process.argv[2];

  let pending;
  if (targetId) {
    const rows = await sql(`SELECT id, canonical_title, story_fingerprint FROM clusters WHERE id = $1`, [targetId]);
    pending = rows;
  } else {
    pending = await sql(`SELECT id, canonical_title, story_fingerprint FROM clusters WHERE status = 'pending' ORDER BY (SELECT MAX(published_at) FROM articles WHERE cluster_id = clusters.id) DESC NULLS LAST`);
  }

  console.log(`\nSynthesizing ${pending.length} cluster(s) using ${MODEL}…\n`);

  let done = 0, failed = 0;
  for (const cluster of pending) {
    const arts = await sql(
      `SELECT source_id, title, published_at, body_excerpt FROM articles WHERE cluster_id = $1`,
      [cluster.id]
    );

    if (arts.length === 0) {
      console.log(`  [SKIP] ${cluster.canonical_title} — no articles`);
      continue;
    }

    process.stdout.write(`  [${done + failed + 1}/${pending.length}] "${cluster.canonical_title}" (${arts.length} articles)… `);
    try {
      await synthesizeCluster(cluster, arts);
      console.log('✓');
      done++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    }

    if (done + failed < pending.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\nDone: ${done} synthesized, ${failed} failed.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
