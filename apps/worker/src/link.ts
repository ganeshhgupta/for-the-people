import './env.js';
import { db } from '@tristhana/db/client';
import { clusters, syntheses, clusterLinks } from '@tristhana/db';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const STOP = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','but','with',
  'from','by','is','are','was','were','that','this','has','have','will',
  'its','it','be','been','as','over','after','amid','india','indian',
  'government','minister','party','state','national','new','says','said',
  'also','their','they','been','would','could','should','during','between',
  'against','before','about','under','while','more','than','when','where',
]);

function keywords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !STOP.has(w))
  );
}

async function main() {
  // Wipe existing links so we can recompute cleanly
  await db.delete(clusterLinks);

  const synths = await db.select().from(syntheses);
  const clusterRows = await db.select().from(clusters)
    .where(eq(clusters.status, 'synthesized'));

  // Build map: clusterId → { names: Set<string>, keywords: Set<string> }
  const metaMap = new Map<string, { names: Set<string>; kw: Set<string> }>();

  for (const s of synths) {
    const out = typeof s.output === 'string'
      ? JSON.parse(s.output as string) as Record<string, unknown>
      : s.output as Record<string, unknown>;

    const names = new Set(
      ((out?.named_individuals as { name?: string }[]) ?? [])
        .map(i => i.name?.toLowerCase())
        .filter((n): n is string => !!n)
    );

    const [cluster] = await db.select({ canonicalTitle: clusters.canonicalTitle })
      .from(clusters).where(eq(clusters.id, s.clusterId));
    const kw = cluster ? keywords(cluster.canonicalTitle) : new Set<string>();

    metaMap.set(s.clusterId, { names, kw });
  }

  clusterRows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  let inserted = 0;

  for (let i = 0; i < clusterRows.length; i++) {
    for (let j = i + 1; j < clusterRows.length; j++) {
      const older = clusterRows[i];
      const newer = clusterRows[j];

      const daysDiff = (newer.createdAt.getTime() - older.createdAt.getTime()) / 86_400_000;
      if (daysDiff > 90) continue;

      const mo = metaMap.get(older.id);
      const mn = metaMap.get(newer.id);
      if (!mo || !mn) continue;

      // Match 1: shared named individuals
      const sharedNames = [...mn.names].filter(n => mo.names.has(n));

      // Match 2: shared title keywords (need ≥2)
      const sharedKw = [...mn.kw].filter(k => mo.kw.has(k));

      const sharedEntities: string[] = sharedNames.length > 0
        ? sharedNames
        : sharedKw.length >= 2 ? sharedKw : [];

      if (sharedEntities.length === 0) continue;

      try {
        await db.insert(clusterLinks).values({
          id: randomUUID(),
          fromClusterId: older.id,
          toClusterId: newer.id,
          sharedEntities: JSON.stringify(sharedEntities),
        }).onConflictDoNothing();
        inserted++;
      } catch { /* ignore */ }
    }
  }

  console.log(`Linked ${inserted} story pairs.`);
}

main().catch(console.error);
