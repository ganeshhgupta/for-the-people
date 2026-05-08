import './env.js';
import { db } from '@ftp/db/client';
import { clusterLinks, syntheses } from '@ftp/db';

const links = await db.select().from(clusterLinks);
console.log('Total links:', links.length);

const synths = await db.select().from(syntheses).limit(8);
for (const s of synths) {
  const out = typeof s.output === 'string' ? JSON.parse(s.output as string) : s.output as Record<string, unknown>;
  const names = ((out?.named_individuals as {name?:string}[]) ?? []).map(i => i.name).filter(Boolean);
  console.log(s.clusterId.slice(0,8), '->', names.slice(0,5).join(', ') || '(no names)');
}
