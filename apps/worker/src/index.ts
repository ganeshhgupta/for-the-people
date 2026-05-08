import './env.js';
import { runIngest } from './ingest.js';
import { runCluster } from './cluster.js';
import { runSynth } from './synth.js';

const INTERVAL_MS = parseInt(process.env['PIPELINE_INTERVAL_MS'] ?? '60000');
const SYNTH_PER_TICK = parseInt(process.env['SYNTH_PER_TICK'] ?? '3');

async function tick() {
  const ts = new Date().toISOString();
  console.log(`\n━━━ [${ts}] Pipeline tick ━━━`);
  const t0 = Date.now();
  try {
    const ingested  = await runIngest();
    const clustered = await runCluster();
    const synthesized = await runSynth(SYNTH_PER_TICK);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\n✓ ${elapsed}s — +${ingested} articles, +${clustered} clusters, +${synthesized} synthesized`);
  } catch (e) {
    console.error('Pipeline error:', (e as Error).message);
  }
}

console.log(`For The People pipeline starting (interval: ${INTERVAL_MS / 1000}s, synth/tick: ${SYNTH_PER_TICK})`);
console.log('Press Ctrl+C to stop.\n');

tick();
setInterval(tick, INTERVAL_MS);
