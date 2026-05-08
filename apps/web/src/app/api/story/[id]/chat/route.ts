import { NextRequest } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { clusters, syntheses } from '@tristhana/db';
import { eq } from 'drizzle-orm';
import Groq from 'groq-sdk';
import type { TrailNode } from '../trail/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const groq = new Groq({ apiKey: process.env['GROQ_API_KEY'] });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message, trailNodes, history } = await req.json() as {
    message: string;
    trailNodes: TrailNode[];
    history: { role: 'user' | 'assistant'; content: string }[];
  };

  const db = getDb();
  const [cluster] = await db.select({ canonicalTitle: clusters.canonicalTitle }).from(clusters).where(eq(clusters.id, id));
  const [synthesis] = await db.select({ output: syntheses.output }).from(syntheses).where(eq(syntheses.clusterId, id));

  const out = synthesis?.output as Record<string, unknown> | null;
  const facts = (out?.['established_facts'] as { claim: string }[] ?? []).slice(0, 5).map(f => f.claim).join('\n');

  const trailContext = trailNodes.map((n, i) =>
    `[${i + 1}] ${n.date} — ${n.title}: ${n.summary}`
  ).join('\n');

  const systemPrompt = `You are an expert analyst explaining the causes and context behind this news story.

Story: "${cluster?.canonicalTitle ?? 'Unknown'}"

Established facts:
${facts || 'None available.'}

Causal trail (from root cause to now):
${trailContext || 'No trail built yet.'}

Answer the user's questions based on this context. Be concise and cite specific trail nodes when relevant (e.g., "as seen in node 2"). If asked about something outside the trail, say so and reason from general knowledge. Never make up specific dates or facts not in the context.`;

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 512,
    temperature: 0.4,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of resp) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Accel-Buffering': 'no' },
  });
}
