'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SynthesisOutput } from '@tristhana/shared';

/* ── Types ────────────────────────────────────────── */
type ClusterRow = {
  id: string; canonicalTitle: string; status: string;
  articleCount: number; createdAt: string; coverImage: string | null;
};
type ArticleRow = {
  id: string; title: string; url: string; sourceId: string;
  publishedAt: string; imageUrl: string | null;
  sourceName: string; sourceLean: string; sourceFactuality: string;
};
type StoryData  = { synthesis: SynthesisOutput | null; articles: ArticleRow[] };
type ReasonNode = { id: string; title: string; createdAt: string; sharedEntities: string[] };
type VideoData  = { videoId: string; title: string; channelTitle: string; publishedAt: string; thumbnail: string | null };
type Channel    = 'main' | 'good';

/* ── Helpers ──────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function shortDate(iso: string) { const d = new Date(iso); return `${MONTHS[d.getMonth()]} ${d.getDate()}`; }

function factScore(s: SynthesisOutput) {
  const hard = s.established_facts.length + s.reported_facts.length;
  const narr = (s.contested_claims.right_narrative?.key_claims.length ?? 0)
             + (s.contested_claims.left_narrative?.key_claims.length ?? 0)
             + s.rhetoric_flags.filter(f => f.leader_name).length;
  const tot = hard + narr;
  return tot > 0 ? Math.round((hard / tot) * 100) : 50;
}
function scoreColor(p: number) { return p >= 65 ? 'var(--forest)' : p >= 40 ? 'var(--gold)' : 'var(--red)'; }

const LEAN_COLOR: Record<string,string> = {
  right_heavy:'var(--red)', right_lean:'#b84000', centre:'var(--ink-muted)',
  left_lean:'var(--navy)', left_heavy:'#5b2d8b', wire:'var(--ink-faint)',
};
const LEAN_LABEL: Record<string,string> = {
  right_heavy:'Far Right', right_lean:'Right', centre:'Centre',
  left_lean:'Left', left_heavy:'Far Left', wire:'Wire',
};
const RHETORIC_LABEL: Record<string,string> = {
  RED_HERRING:'Red Herring', BROKEN_PROMISE:'Broken Promise',
  EVASION:'Evasion', THREAT:'Threat', FACTUAL_FALSEHOOD:'False Claim',
};
const STATUS_LABEL: Record<string,string> = {
  TIER_1_CONVICTED:'Convicted', TIER_2_CHARGED:'Charged',
  TIER_3_ALLEGED:'Alleged', PROCEDURAL_BARRIERS_NOTED:'Under investigation',
};
const STATUS_COLOR: Record<string,string> = {
  TIER_1_CONVICTED:'var(--red)', TIER_2_CHARGED:'#b84000',
  TIER_3_ALLEGED:'var(--gold)', PROCEDURAL_BARRIERS_NOTED:'var(--navy)',
};

/* ── Cover image (full-bleed, natural ratio) ──────── */
function CoverImage({ src, alt, initials }: { src:string|null; alt:string; initials:string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width:'calc(100% + 2rem)', marginLeft:'-1rem', overflow:'hidden', background:'var(--paper-alt)' }}>
      {src && !failed
        ? <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" style={{ width:'100%', height:'auto', display:'block' }} /> // eslint-disable-line @next/next/no-img-element
        : <div style={{ height:'220px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}>
            <span style={{ fontFamily:'var(--font-playfair)', fontWeight:700, color:'var(--rule-heavy)', fontSize:'clamp(2.5rem,10vw,4rem)', letterSpacing:'-0.03em' }}>{initials}</span>
            <span className="sc" style={{ color:'var(--ink-faint)' }}>For the People</span>
          </div>
      }
    </div>
  );
}

/* ── Source thumbnail ─────────────────────────────── */
function ArticleThumb({ src, alt, initials, color }: { src:string|null; alt:string; initials:string; color:string }) {
  const [failed, setFailed] = useState(false);
  const sz = 62;
  const base: React.CSSProperties = { width:sz, height:sz, flexShrink:0, objectFit:'cover', display:'block' };
  if (src && !failed)
    return <img src={src} alt={alt} style={base} onError={() => setFailed(true)} loading="lazy" />; // eslint-disable-line @next/next/no-img-element
  return <div style={{ ...base, background:color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:sz*0.28, fontWeight:700, opacity:0.85 }}>{initials}</div>;
}

/* ── Recursive Possible Reasons ───────────────────── */
function PossibleReasons({ clusterId, depth = 0 }: { clusterId:string; depth?:number }) {
  const [open, setOpen]       = useState(false);
  const [reasons, setReasons] = useState<ReasonNode[]|null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (reasons !== null) return;
    setLoading(true);
    const data = await fetch(`/api/story/${clusterId}/reasons`).then(r => r.json());
    setReasons(data.reasons ?? []);
    setLoading(false);
  }

  if (depth >= 4) return null;

  return (
    <div style={{ marginTop:'0.4rem' }}>
      <button onClick={toggle} className="ctrl-btn" style={{ fontSize:'0.65rem' }}>
        {open ? '▲ Collapse' : '◉ Possible Reasons'}
      </button>
      {open && (
        <div style={{ marginTop:'0.5rem', paddingLeft: depth > 0 ? '0.9rem' : 0, borderLeft: depth > 0 ? '2px solid var(--rule)' : 'none' }}>
          {loading && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.5rem 0' }}>Tracing connections…</p>}
          {!loading && reasons?.length === 0 && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.4rem 0' }}>No prior connected stories found.</p>}
          {reasons?.map(r => (
            <div key={r.id} style={{ marginBottom:'0.55rem', padding:'0.6rem 0.85rem', background:'var(--paper-alt)', borderLeft:'3px solid var(--rule-heavy)' }}>
              <div className="sc" style={{ color:'var(--ink-faint)', marginBottom:'0.15rem' }}>{shortDate(r.createdAt)}</div>
              <p style={{ fontFamily:'var(--font-playfair)', fontSize: depth === 0 ? '0.97rem' : '0.88rem', lineHeight:1.3, color:'var(--ink)' }}>{r.title}</p>
              {r.sharedEntities.length > 0 && <p className="sc" style={{ color:'var(--ink-muted)', marginTop:'0.2rem' }}>via {r.sharedEntities.slice(0,3).join(', ')}</p>}
              <PossibleReasons clusterId={r.id} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── YouTube video card ───────────────────────────── */
function VideoCard({ video }: { video:VideoData }) {
  const [playing, setPlaying] = useState(false);
  const d = new Date(video.publishedAt);
  return (
    <div style={{ marginBottom:'0.85rem', background:'var(--paper-alt)' }}>
      {playing ? (
        <iframe src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`} title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen style={{ width:'100%', height:'210px', border:'none', display:'block' }} />
      ) : (
        <button onClick={() => setPlaying(true)}
          style={{ position:'relative', width:'100%', padding:0, border:'none', cursor:'pointer', background:'none', display:'block' }}>
          {video.thumbnail
            ? <img src={video.thumbnail} alt={video.title} style={{ width:'100%', height:'210px', objectFit:'cover', display:'block' }} /> // eslint-disable-line @next/next/no-img-element
            : <div style={{ width:'100%', height:'210px', background:'var(--rule)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:'2rem', color:'var(--ink-faint)' }}>▶</span></div>
          }
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.28)' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,255,255,0.92)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'1.1rem', color:'#c00', marginLeft:'3px' }}>▶</span>
            </div>
          </div>
        </button>
      )}
      <div style={{ padding:'0.4rem 0.7rem 0.55rem' }}>
        <p style={{ fontFamily:'var(--font-crimson)', fontSize:'0.9rem', lineHeight:1.35, color:'var(--ink)', marginBottom:'0.15rem' }}>{video.title}</p>
        <p className="sc" style={{ color:'var(--ink-faint)' }}>{video.channelTitle} · {MONTHS[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</p>
      </div>
    </div>
  );
}

/* ── Videos section ───────────────────────────────── */
function VideosSection({ clusterId }: { clusterId:string }) {
  const [open, setOpen]       = useState(false);
  const [videos, setVideos]   = useState<VideoData[]|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (videos !== null) return;
    setLoading(true);
    const data = await fetch(`/api/story/${clusterId}/videos`).then(r => r.json());
    if (data.error) setError(data.error);
    setVideos(data.videos ?? []);
    setLoading(false);
  }

  return (
    <div style={{ padding:'0.65rem 0', borderBottom:'1px solid var(--rule)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: open ? '0.75rem' : 0 }}>
        <div className="sc" style={{ color:'var(--ink-muted)' }}>Related videos</div>
        <button onClick={toggle} className="ctrl-btn" style={{ fontSize:'0.63rem' }}>
          {open ? '▲ Hide' : '▶ Load from YouTube'}
        </button>
      </div>
      {open && loading && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.4rem 0' }}>Searching YouTube…</p>}
      {open && error && <p className="sc" style={{ color:'var(--red)', padding:'0.4rem 0' }}>Add YOUTUBE_API_KEY to .env.local to enable this.</p>}
      {open && !loading && !error && videos?.length === 0 && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.4rem 0' }}>No videos found.</p>}
      {open && videos?.map(v => <VideoCard key={v.videoId} video={v} />)}
    </div>
  );
}

/* ── Expanded synthesis ───────────────────────────── */
function StoryContent({ data, clusterId }: { data:StoryData; clusterId:string }) {
  const { synthesis:s, articles } = data;
  if (!s) return <p style={{ fontStyle:'italic', color:'var(--ink-muted)', padding:'1rem 0' }}>Synthesis not yet available.</p>;

  const pct = factScore(s);
  const col = scoreColor(pct);
  const allFacts = [...s.established_facts, ...s.reported_facts];

  type RawPOV = NonNullable<typeof s.contested_claims.right_narrative>;
  const rawPovs = [s.contested_claims.right_narrative, s.contested_claims.left_narrative, s.contested_claims.other_narrative]
    .filter((p): p is RawPOV => !!(p?.summary));

  function wordSet(t: string) { return new Set(t.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(/\s+/).filter(Boolean)); }
  const povs: RawPOV[] = [];
  for (const p of rawPovs) {
    const ws = wordSet(p.summary);
    const dupe = povs.some(e => { const es=wordSet(e.summary); const i=[...ws].filter(w=>es.has(w)).length; return new Set([...ws,...es]).size > 0 && i/new Set([...ws,...es]).size > 0.75; });
    if (!dupe) povs.push(p);
    if (povs.length === 3) break;
  }

  return (
    <div className="expand-enter">
      {/* Fact bar */}
      <div style={{ padding:'0.85rem 0 0.7rem', borderBottom:'1px solid var(--rule)' }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span className="sc" style={{ color:'var(--ink-muted)' }}>Fact / Narrative</span>
          <span className="sc" style={{ color:col }}>{pct}% factual · {100-pct}% disputed</span>
        </div>
        <div className="fact-bar-track" style={{ marginTop:'0.35rem' }}><div className="fact-bar-fill" style={{ width:`${pct}%`, background:col }} /></div>
        {s.model_uncertainty_notes && <p style={{ fontSize:'0.78rem', fontStyle:'italic', color:'var(--ink-faint)', marginTop:'0.3rem' }}>{s.model_uncertainty_notes}</p>}
      </div>

      {/* Facts */}
      {allFacts.length > 0 && (
        <div style={{ padding:'0.75rem 0', borderBottom:'1px solid var(--rule)' }}>
          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {allFacts.map((f,i) => (
              <li key={i} style={{ display:'flex', gap:'0.55rem', alignItems:'flex-start', fontSize:'0.97rem', lineHeight:1.5 }}>
                <span style={{ color:'var(--forest)', flexShrink:0, fontSize:'0.55rem', marginTop:'0.35rem' }}>⬤</span>{f.claim}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* POVs */}
      {povs.length > 0 && (
        <div style={{ padding:'0.75rem 0', borderBottom:'1px solid var(--rule)' }}>
          <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.5rem' }}>{povs.length === 1 ? 'Point of view' : 'Points of view'}</div>
          {povs.map((pov,idx) => (
            <div key={idx} style={{ background:'var(--paper-alt)', borderTop: idx===0 ? '1px solid var(--rule-heavy)' : '1px solid var(--rule)', padding:'0.9rem 1rem' }}>
              <div className="sc" style={{ color:'var(--rule-heavy)', marginBottom:'0.3rem', paddingBottom:'0.2rem', borderBottom:'1px solid var(--rule)' }}>POV {idx+1}</div>
              <p style={{ fontSize:'0.93rem', lineHeight:1.55 }}>{pov.summary}</p>
              {pov.key_claims.slice(0,2).map((c,i) => (
                <p key={i} style={{ fontSize:'0.82rem', color:'var(--ink-muted)', marginTop:'0.35rem', paddingLeft:'0.55rem', borderLeft:'2px solid var(--rule-heavy)' }}>{c.claim}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* People */}
      {s.named_individuals.filter(i => i.name).length > 0 && (
        <div style={{ padding:'0.65rem 0', borderBottom:'1px solid var(--rule)' }}>
          <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.4rem' }}>People involved</div>
          {s.named_individuals.filter(i => i.name).map((ind,i) => (
            <div key={i} style={{ display:'flex', flexWrap:'wrap', gap:'0.45rem', alignItems:'baseline', padding:'0.35rem 0', borderBottom:'1px solid var(--rule)' }}>
              <strong style={{ fontFamily:'var(--font-playfair)', fontSize:'0.97rem' }}>{ind.name}</strong>
              <span style={{ fontStyle:'italic', color:'var(--ink-muted)', fontSize:'0.87rem' }}>{ind.role}</span>
              {ind.party_or_affiliation && <span className="sc" style={{ color:'var(--ink-faint)' }}>{ind.party_or_affiliation}</span>}
              <span className="sc" style={{ color:STATUS_COLOR[ind.procedural_status]??'var(--ink-muted)', border:`1px solid ${STATUS_COLOR[ind.procedural_status]??'var(--rule)'}`, padding:'1px 5px' }}>
                {STATUS_LABEL[ind.procedural_status]??ind.procedural_status}
              </span>
              {ind.specific_acts.length > 0 && <span style={{ width:'100%', fontSize:'0.83rem', color:'var(--ink-muted)' }}>{ind.specific_acts.join('; ')}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Rhetoric flags */}
      {s.rhetoric_flags.filter(f => f.leader_name).length > 0 && (
        <div style={{ padding:'0.65rem 0', borderBottom:'1px solid var(--rule)' }}>
          <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.4rem' }}>Flagged statements</div>
          {s.rhetoric_flags.filter(f => f.leader_name).map((flag,i) => (
            <div key={i} style={{ borderLeft:'3px solid var(--red)', paddingLeft:'0.7rem', marginBottom:'0.65rem' }}>
              <div style={{ display:'flex', gap:'0.45rem', alignItems:'baseline', flexWrap:'wrap' }}>
                <span className="sc" style={{ color:'var(--red)' }}>{RHETORIC_LABEL[flag.type]??flag.type}</span>
                <strong style={{ fontFamily:'var(--font-playfair)' }}>{flag.leader_name}</strong>
                <span style={{ color:'var(--ink-muted)', fontSize:'0.87rem', fontStyle:'italic' }}>{flag.party}</span>
              </div>
              {flag.quoted_statement && <p style={{ fontStyle:'italic', color:'var(--ink-muted)', fontSize:'0.88rem', margin:'0.2rem 0' }}>"{flag.quoted_statement}"</p>}
              {flag.contradicting_fact_or_question && <p style={{ fontSize:'0.83rem', color:'var(--ink-muted)' }}>{flag.contradicting_fact_or_question}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {s.statistics.length > 0 && (
        <div style={{ padding:'0.65rem 0', borderBottom:'1px solid var(--rule)' }}>
          <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.5rem' }}>On the record</div>
          <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--rule)' }}>
            {s.statistics.map((st,i) => (
              <div key={i} style={{ background:'var(--paper)', padding:'0.65rem' }}>
                <div style={{ fontFamily:'var(--font-playfair)', fontSize:'1.4rem', fontWeight:700 }}>{st.value}<span style={{ fontSize:'0.75rem', color:'var(--ink-muted)', marginLeft:'0.2rem' }}>{st.unit}</span></div>
                <p style={{ fontSize:'0.82rem', lineHeight:1.4, marginTop:'0.1rem' }}>{st.claim}</p>
                <p className="sc" style={{ color:'var(--ink-faint)', marginTop:'0.15rem' }}>{st.source_authority} · {st.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      <div style={{ paddingTop:'0.65rem', borderBottom:'1px solid var(--rule)', paddingBottom:'0.5rem' }}>
        <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.4rem' }}>Sources ({articles.length})</div>
        {articles.map(art => {
          const lc = LEAN_COLOR[art.sourceLean]??'var(--ink-muted)';
          const d = new Date(art.publishedAt);
          return (
            <a key={art.id} href={art.url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', gap:'0.7rem', padding:'0.6rem 0', borderBottom:'1px solid var(--rule)', textDecoration:'none', alignItems:'flex-start' }}>
              <ArticleThumb src={art.imageUrl} alt={art.title} initials={art.sourceName.slice(0,2).toUpperCase()} color={lc} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontFamily:'var(--font-crimson)', fontSize:'0.93rem', lineHeight:1.4, color:'var(--ink)' }}>{art.title}</p>
                <p className="sc" style={{ color:'var(--ink-faint)', marginTop:'0.2rem' }}>
                  <span style={{ color:lc }}>{art.sourceName}</span>{' · '}{LEAN_LABEL[art.sourceLean]}{' · '}{MONTHS[d.getMonth()]} {d.getDate()}
                </p>
              </div>
              <span style={{ color:'var(--ink-faint)', fontSize:'0.7rem', flexShrink:0, paddingTop:'2px' }}>↗</span>
            </a>
          );
        })}
      </div>

      {/* YouTube */}
      <VideosSection clusterId={clusterId} />
    </div>
  );
}

/* ── Story card ───────────────────────────────────── */
function StoryCard({ cluster, expandedId, loadingId, data, onExpand }: {
  cluster: ClusterRow; expandedId: string|null; loadingId: string|null;
  data: StoryData|undefined; onExpand: (id:string)=>void;
}) {
  const isOpen    = expandedId === cluster.id;
  const isLoading = loadingId === cluster.id;
  const isPending = cluster.status !== 'synthesized';

  return (
    <div style={{ borderBottom:'2px solid var(--rule-heavy)', paddingBottom:'1.25rem', marginBottom:'0.1rem' }}>
      <div
        role={isPending ? undefined : 'button'} tabIndex={isPending ? -1 : 0}
        onClick={() => !isPending && onExpand(cluster.id)}
        onKeyDown={e => !isPending && e.key==='Enter' && onExpand(cluster.id)}
        className={`story-card${isOpen ? ' expanded' : ''}`}
        style={{ paddingTop:'1rem', outline:'none', cursor: isPending ? 'default' : 'pointer' }}
      >
        <CoverImage src={cluster.coverImage} alt={cluster.canonicalTitle} initials={cluster.canonicalTitle.slice(0,2).toUpperCase()} />
        <div style={{ paddingTop:'0.65rem' }}>
          <div className="sc" style={{ color:'var(--ink-faint)', marginBottom:'0.3rem' }}>
            {shortDate(cluster.createdAt)} · {cluster.articleCount} sources
            {isPending && <span style={{ marginLeft:'0.5rem', color:'var(--gold)' }}>· in press</span>}
            {isOpen  && <span style={{ marginLeft:'0.6rem', color:'var(--ink-muted)' }}>▲ collapse</span>}
          </div>
          <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.1rem,3.5vw,1.4rem)', fontWeight:700, lineHeight:1.25, color:'var(--ink)' }}>
            {cluster.canonicalTitle}
          </h2>
        </div>
      </div>

      {/* Expanded content + Possible Reasons — only when open */}
      {isOpen && (
        <div style={{ paddingBottom:'0.5rem' }}>
          {isLoading
            ? <p className="sc" style={{ padding:'1.25rem 0', color:'var(--ink-faint)' }}>Loading…</p>
            : data ? <StoryContent data={data} clusterId={cluster.id} /> : null
          }
          {!isLoading && (
            <div style={{ padding:'0.65rem 0', borderTop:'1px solid var(--rule)' }}>
              <div className="sc" style={{ color:'var(--ink-muted)', marginBottom:'0.3rem' }}>How did we get here?</div>
              <PossibleReasons clusterId={cluster.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Feed panel (shared for both channels) ────────── */
function FeedPanel({ clusters, expandedId, loadingId, cache, onExpand, hasMore, loadingMore, sentinelRef, emptyMsg }: {
  clusters: ClusterRow[]; expandedId: string|null; loadingId: string|null;
  cache: Record<string,StoryData>; onExpand: (id:string)=>void;
  hasMore: boolean; loadingMore: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  emptyMsg: string;
}) {
  return (
    <div>
      {clusters.length === 0 && !loadingMore && (
        <p style={{ textAlign:'center', padding:'3rem 0', color:'var(--ink-muted)', fontStyle:'italic' }}>{emptyMsg}</p>
      )}
      {clusters.map(c => (
        <StoryCard key={c.id} cluster={c} expandedId={expandedId} loadingId={loadingId} data={cache[c.id]} onExpand={onExpand} />
      ))}
      <div ref={sentinelRef} style={{ height:'1px' }} />
      {loadingMore && <p className="sc" style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>Loading more…</p>}
      {!hasMore && clusters.length > 0 && <p className="sc" style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>All {clusters.length} stories loaded</p>}
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export function StoryFeed({ initialClusters, totalCount }: { initialClusters: ClusterRow[]; totalCount: number }) {
  // Main feed state
  const [mainClusters, setMainClusters] = useState<ClusterRow[]>(initialClusters);
  const [mainHasMore, setMainHasMore]   = useState(initialClusters.length < totalCount);
  const [mainNextOff, setMainNextOff]   = useState(initialClusters.length);
  const [mainLoadingMore, setMainLoadingMore] = useState(false);

  // Good news feed state
  const [goodClusters, setGoodClusters] = useState<ClusterRow[]>([]);
  const [goodHasMore, setGoodHasMore]   = useState(false);
  const [goodNextOff, setGoodNextOff]   = useState(0);
  const [goodLoadingMore, setGoodLoadingMore] = useState(false);
  const [goodLoaded, setGoodLoaded]     = useState(false);

  // Shared state
  const [channel, setChannel]     = useState<Channel>('main');
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [cache, setCache]           = useState<Record<string,StoryData>>({});
  const [loadingId, setLoadingId]   = useState<string|null>(null);
  const [dark, setDark]             = useState(false);

  // Refs
  const mainSentinel = useRef<HTMLDivElement>(null);
  const goodSentinel = useRef<HTMLDivElement>(null);
  const touchStartX  = useRef(0);

  /* dark mode restore */
  useEffect(() => { if (localStorage.getItem('ftp-theme') === 'dark') setDark(true); }, []);

  /* auto-refresh pending */
  useEffect(() => {
    const hasPending = mainClusters.some(c => c.status !== 'synthesized');
    if (!hasPending) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/feed?offset=0&limit=${mainClusters.length}`).then(r => r.json());
      if (res.clusters) setMainClusters(res.clusters);
    }, 30_000);
    return () => clearInterval(id);
  }, [mainClusters]);

  /* channel switch + load good news on first visit */
  const switchChannel = useCallback(async (to: Channel) => {
    setChannel(to);
    setExpandedId(null);
    if (to === 'good' && !goodLoaded) {
      setGoodLoadingMore(true);
      const res = await fetch('/api/feed/positive?offset=0&limit=20').then(r => r.json());
      setGoodClusters(res.clusters ?? []);
      setGoodHasMore(res.hasMore ?? false);
      setGoodNextOff(res.nextOffset ?? 20);
      setGoodLoaded(true);
      setGoodLoadingMore(false);
    }
  }, [goodLoaded]);

  /* main infinite scroll */
  const loadMoreMain = useCallback(async () => {
    if (mainLoadingMore || !mainHasMore) return;
    setMainLoadingMore(true);
    const res = await fetch(`/api/feed?offset=${mainNextOff}&limit=10`).then(r => r.json());
    setMainClusters(prev => {
      const seen = new Set(prev.map(c => c.id));
      return [...prev, ...(res.clusters as ClusterRow[]).filter(c => !seen.has(c.id))];
    });
    setMainHasMore(res.hasMore ?? false);
    setMainNextOff(res.nextOffset ?? mainNextOff + 10);
    setMainLoadingMore(false);
  }, [mainLoadingMore, mainHasMore, mainNextOff]);

  /* good news infinite scroll */
  const loadMoreGood = useCallback(async () => {
    if (goodLoadingMore || !goodHasMore) return;
    setGoodLoadingMore(true);
    const res = await fetch(`/api/feed/positive?offset=${goodNextOff}&limit=10`).then(r => r.json());
    setGoodClusters(prev => {
      const seen = new Set(prev.map(c => c.id));
      return [...prev, ...(res.clusters as ClusterRow[]).filter(c => !seen.has(c.id))];
    });
    setGoodHasMore(res.hasMore ?? false);
    setGoodNextOff(res.nextOffset ?? goodNextOff + 10);
    setGoodLoadingMore(false);
  }, [goodLoadingMore, goodHasMore, goodNextOff]);

  useEffect(() => {
    const el = mainSentinel.current; if (!el) return;
    const obs = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) loadMoreMain(); }, { rootMargin:'300px' });
    obs.observe(el); return () => obs.disconnect();
  }, [loadMoreMain]);

  useEffect(() => {
    const el = goodSentinel.current; if (!el) return;
    const obs = new IntersectionObserver(entries => { if (entries[0]?.isIntersecting) loadMoreGood(); }, { rootMargin:'300px' });
    obs.observe(el); return () => obs.disconnect();
  }, [loadMoreGood]);

  /* dark toggle */
  const toggleDark = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('ftp-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  /* expand synthesis */
  const expand = useCallback(async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (cache[id]) return;
    setLoadingId(id);
    const data: StoryData = await fetch(`/api/story/${id}`).then(r => r.json());
    setCache(c => ({ ...c, [id]: data }));
    setLoadingId(null);
  }, [expandedId, cache]);

  /* swipe detection */
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0]?.clientX ?? 0; }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) < 60) return;
    if (dx < 0 && channel === 'main') switchChannel('good');
    else if (dx > 0 && channel === 'good') switchChannel('main');
  }

  return (
    <>
      {/* ── Sticky masthead ── */}
      <div style={{
        position:'sticky', top:0, zIndex:200,
        background:'var(--paper)', borderBottom:'2px solid var(--rule-heavy)',
        marginLeft:'-1rem', marginRight:'-1rem',
        paddingLeft:'1rem', paddingRight:'1rem',
        transition:'background 0.2s',
      }}>
        {/* Title row */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:'46px' }}>
          <a href="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.05rem,4vw,1.45rem)', fontWeight:700, letterSpacing:'-0.01em', color:'var(--ink)' }}>
              For the People
            </span>
          </a>
          <div style={{ position:'absolute', right:0, display:'flex', alignItems:'center', gap:'0.1rem' }}>
            <button onClick={toggleDark} aria-label="Toggle night mode"
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', fontSize:'1.1rem', padding:'0.3rem 0.45rem', lineHeight:1 }}>
              {dark ? '☀' : '☾'}
            </button>
            <button onClick={() => setExpandedId(null)} aria-label="Collapse all"
              style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', fontSize:'1.25rem', padding:'0.3rem 0.45rem', lineHeight:1, opacity: expandedId ? 1 : 0.3 }}>
              ☰
            </button>
          </div>
        </div>
        {/* Channel tabs */}
        <div style={{ display:'flex', borderTop:'1px solid var(--rule)', height:'32px' }}>
          <button onClick={() => switchChannel('main')}
            style={{
              flex:1, background:'none', border:'none', borderBottom: channel==='main' ? '2px solid var(--ink)' : '2px solid transparent',
              cursor:'pointer', fontFamily:'Helvetica Neue,Arial,sans-serif', fontSize:'0.63rem', fontWeight:700,
              letterSpacing:'0.08em', textTransform:'uppercase',
              color: channel==='main' ? 'var(--ink)' : 'var(--ink-faint)',
              transition:'color 0.15s, border-color 0.15s',
            }}>
            News
          </button>
          <button onClick={() => switchChannel('good')}
            style={{
              flex:1, background:'none', border:'none', borderBottom: channel==='good' ? '2px solid var(--forest)' : '2px solid transparent',
              cursor:'pointer', fontFamily:'Helvetica Neue,Arial,sans-serif', fontSize:'0.63rem', fontWeight:700,
              letterSpacing:'0.08em', textTransform:'uppercase',
              color: channel==='good' ? 'var(--forest)' : 'var(--ink-faint)',
              transition:'color 0.15s, border-color 0.15s',
            }}>
            ✦ Good News
          </button>
        </div>
      </div>

      {/* ── Swipe container ── */}
      <div style={{ overflow:'hidden' }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{
          display:'flex', width:'200%',
          transform: `translateX(${channel === 'main' ? '0%' : '-50%'})`,
          transition:'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
          willChange:'transform',
          alignItems:'flex-start',
        }}>
          {/* Main feed */}
          <div style={{ width:'50%' }}>
            <div className="sc" style={{ color:'var(--ink-muted)', padding:'0.6rem 0 0.4rem', borderBottom:'1px solid var(--rule)' }}>Today's Stories</div>
            <FeedPanel
              clusters={mainClusters} expandedId={expandedId} loadingId={loadingId} cache={cache} onExpand={expand}
              hasMore={mainHasMore} loadingMore={mainLoadingMore} sentinelRef={mainSentinel}
              emptyMsg="No stories yet. Run pnpm ingest:once then pnpm cluster:once."
            />
          </div>
          {/* Good news feed */}
          <div style={{ width:'50%' }}>
            <div className="sc" style={{ color:'var(--forest)', padding:'0.6rem 0 0.4rem', borderBottom:'1px solid var(--rule)' }}>✦ Good News</div>
            {!goodLoaded && channel === 'good' && goodLoadingMore && (
              <p className="sc" style={{ padding:'2rem 0', textAlign:'center', color:'var(--ink-faint)' }}>Finding good news…</p>
            )}
            <FeedPanel
              clusters={goodClusters} expandedId={expandedId} loadingId={loadingId} cache={cache} onExpand={expand}
              hasMore={goodHasMore} loadingMore={goodLoadingMore} sentinelRef={goodSentinel}
              emptyMsg="No positive stories found yet — run more synthesis cycles."
            />
          </div>
        </div>
      </div>
    </>
  );
}
