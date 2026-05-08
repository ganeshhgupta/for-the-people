import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { syntheses, articles } from '@ftp/db';
import { eq } from 'drizzle-orm';
import { SOURCE_MAP } from '@ftp/shared';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const [synthesis] = await db.select().from(syntheses).where(eq(syntheses.clusterId, id));
  const arts = await db.select().from(articles).where(eq(articles.clusterId, id));

  return NextResponse.json({
    synthesis: synthesis?.output ?? null,
    articles: arts.map(a => {
      const src = SOURCE_MAP.get(a.sourceId);
      return {
        id: a.id,
        title: a.title,
        url: a.url,
        sourceId: a.sourceId,
        publishedAt: a.publishedAt,
        imageUrl: a.imageUrl ?? null,
        sourceName: src?.name ?? a.sourceId,
        sourceLean: src?.lean ?? 'centre',
        sourceFactuality: src?.factuality ?? 'mixed',
      };
    }),
  });
}
