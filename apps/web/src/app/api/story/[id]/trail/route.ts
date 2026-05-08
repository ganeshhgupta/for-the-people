import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusters, syntheses, articles, trails } from '@tristhana/db';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';
import { randomUUID } from 'crypto';
import { SOURCE_MAP } from '@tristhana/shared';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

export type TrailNode = {
  id: string;
  title: string;
  date: string;
  summary: string;
  connectionType: 'caused' | 'escalated' | 'context' | 'triggered';
  parentId: string | null;
  isMain: boolean;
  sources: { title: string; url: string }[];
};

/* ── Brave Search ──────────────────────────────────── */
async function braveSearch(query: string): Promise<{ title: string; url: string; description: string }[]> {
  const key = process.env['BRAVE_API_KEY'];
  if (!key) return [];
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&text_decorations=0`;
    const res = await fetch(url, {
      headers: { 'X-Subscription-Token': key, 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { web?: { results?: { title: string; url: string; description: string }[] } };
    return (data.web?.results ?? []).slice(0, 5).map(r => ({
      title: r.title ?? '',
      url: r.url ?? '',
      description: r.description ?? '',
    }));
  } catch {
    return [];
  }
}

/* ── SSE helper ────────────────────────────────────── */
function makeSSE() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(c) { controller = c; },
  });
  function emit(obj: Record<string, unknown>) {
    try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch { /* closed */ }
  }
  function close() { try { controller.close(); } catch { /* already closed */ } }
  return { stream, emit, close };
}

/* ── Agentic trail builder ─────────────────────────── */
async function buildTrail(
  storyTitle: string,
  storySummary: string,
  entities: string[],
  emit: (obj: Record<string, unknown>) => void
): Promise<TrailNode[]> {
  const nodes: TrailNode[] = [];

  const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
    {
      type: 'function',
      function: {
        name: 'search_web',
        description: 'Search the web for historical background, prior events, or context that explains why this story happened.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Specific search query (include date range if relevant)' },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'add_node',
        description: 'Add a causal event to the trail. Call this once you have enough information about a specific prior event.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short title (under 10 words)' },
            date: { type: 'string', description: 'Approximate date: YYYY, YYYY-MM, or "decade" like "2010s"' },
            summary: { type: 'string', description: '2-3 sentences: what happened and how it connects to the current story' },
            connectionType: { type: 'string', enum: ['caused', 'escalated', 'context', 'triggered'], description: 'How this event connects to the next one' },
            parentId: { type: 'string', description: 'ID of the parent node this branches from. Use null for the root.' },
            isMain: { type: 'boolean', description: 'true = part of the main causal chain; false = a side branch/context' },
            searchQueryForSources: { type: 'string', description: 'A search query to find sources for this node (leave empty if already found)' },
          },
          required: ['title', 'date', 'summary', 'connectionType', 'parentId', 'isMain'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'finish',
        description: 'Call this when the trail is complete (5-8 nodes built).',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
  ];

  const systemPrompt = `You are a deep investigative journalist building a causal timeline.
Given a current news story, trace WHY it happened by identifying the chain of prior events, decisions, and structural conditions that led here.

Rules:
- Build 5-8 nodes total
- Start from the MOST DISTANT root cause and work forward
- The main chain is a single thread of 4-6 key events
- Add 1-2 branch nodes for important context (side causes)
- Each node needs a specific date (not vague)
- Use search_web to gather facts before adding nodes you're unsure about
- After adding a node, you may search for more context if needed
- Call finish() when done`;

  const userPrompt = `Current story: "${storyTitle}"

Summary: ${storySummary}

Key people/entities: ${entities.join(', ')}

Build the causal trail. Start with the deepest historical root cause and work forward to explain why this story happened now.`;

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  for (let iter = 0; iter < 14; iter++) {
    const resp = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1024,
      temperature: 0.3,
    });

    const msg = resp.choices[0]?.message;
    if (!msg) break;

    messages.push(msg as Groq.Chat.Completions.ChatCompletionMessageParam);

    if (!msg.tool_calls?.length) break;

    const toolResults: Groq.Chat.Completions.ChatCompletionToolMessageParam[] = [];

    for (const tc of msg.tool_calls) {
      const args = JSON.parse(tc.function.arguments) as Record<string, unknown>;

      if (tc.function.name === 'finish') {
        return nodes;
      }

      if (tc.function.name === 'search_web') {
        const query = String(args['query'] ?? '');
        emit({ type: 'status', text: `Searching: ${query}` });
        const results = await braveSearch(query);
        toolResults.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: results.length > 0
            ? results.map(r => `[${r.title}](${r.url})\n${r.description}`).join('\n\n')
            : 'No results found.',
        });
      }

      if (tc.function.name === 'add_node') {
        const nodeId = `n${nodes.length + 1}`;
        const searchQuery = String(args['searchQueryForSources'] ?? '');
        let sources: { title: string; url: string }[] = [];

        if (searchQuery) {
          emit({ type: 'status', text: `Finding sources for: ${String(args['title'])}` });
          const results = await braveSearch(searchQuery);
          sources = results.slice(0, 2).map(r => ({ title: r.title, url: r.url }));
        }

        const node: TrailNode = {
          id: nodeId,
          title: String(args['title'] ?? ''),
          date: String(args['date'] ?? ''),
          summary: String(args['summary'] ?? ''),
          connectionType: (args['connectionType'] as TrailNode['connectionType']) ?? 'caused',
          parentId: args['parentId'] === 'null' ? null : (String(args['parentId'] ?? '') || null),
          isMain: Boolean(args['isMain'] ?? true),
          sources,
        };

        nodes.push(node);
        emit({ type: 'node', node });
        toolResults.push({ role: 'tool', tool_call_id: tc.id, content: `Node "${node.id}" added.` });
      }
    }

    messages.push(...toolResults);
    if (nodes.length >= 8) break;
  }

  return nodes;
}

/* ── Route handler ─────────────────────────────────── */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  // Check cache
  const [cached] = await db.select().from(trails).where(eq(trails.clusterId, id));
  if (cached) {
    const { stream, emit, close } = makeSSE();
    (async () => {
      for (const node of cached.nodes as TrailNode[]) {
        emit({ type: 'node', node });
        await new Promise(r => setTimeout(r, 20));
      }
      emit({ type: 'done', cached: true });
      close();
    })();
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
    });
  }

  // Load story context
  const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
  if (!cluster) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [synthesis] = await db.select().from(syntheses).where(eq(syntheses.clusterId, id));
  const arts = await db.select({ sourceId: articles.sourceId }).from(articles).where(eq(articles.clusterId, id));

  const out = synthesis?.output as Record<string, unknown> | null;
  const storySummary = (() => {
    if (!out) return 'No synthesis available.';
    const facts = (out['established_facts'] as { claim: string }[] | undefined) ?? [];
    const cc = out['contested_claims'] as Record<string, { summary?: string }> | null;
    const lines = [
      ...facts.slice(0, 3).map(f => f.claim),
      cc?.right_narrative?.summary ?? '',
      cc?.left_narrative?.summary ?? '',
    ].filter(Boolean);
    return lines.join(' ').slice(0, 800);
  })();

  const entities = ((out?.['named_individuals'] as { name?: string }[] | undefined) ?? [])
    .map(i => i.name).filter((n): n is string => !!n).slice(0, 6);

  const sourceLeans = [...new Set(arts.map(a => SOURCE_MAP.get(a.sourceId)?.lean ?? 'centre'))];

  const { stream, emit, close } = makeSSE();

  (async () => {
    try {
      emit({ type: 'status', text: 'Tracing the causal chain…' });

      const nodes = await buildTrail(
        cluster.canonicalTitle,
        storySummary + ` (Sources lean: ${sourceLeans.join(', ')})`,
        entities,
        emit
      );

      // Cache in DB
      const trailId = randomUUID();
      await db.insert(trails)
        .values({ id: trailId, clusterId: id, nodes })
        .onConflictDoUpdate({ target: trails.clusterId, set: { nodes, createdAt: new Date() } })
        .catch(() => {});

      emit({ type: 'done', cached: false });
    } catch (err) {
      emit({ type: 'error', text: (err as Error).message });
    } finally {
      close();
    }
  })();

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' },
  });
}

/* ── DELETE to bust cache ──────────────────────────── */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  await db.delete(trails).where(eq(trails.clusterId, id));
  return NextResponse.json({ ok: true });
}
