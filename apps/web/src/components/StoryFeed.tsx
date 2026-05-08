'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SynthesisOutput } from '@ftp/shared';
import { TrailDrawer } from './TrailDrawer';

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
type VideoData  = { videoId: string; title: string; channelTitle: string; publishedAt: string; thumbnail: string | null; hasChapters?: boolean };
type FeedChannel = 'main' | 'good' | 'sports' | 'entertainment' | 'finance' | 'tech' | 'travel' | 'art' | 'politics';
type ActivePanel = 'search' | 'filters' | 'starred' | null;

type ChannelState = {
  clusters: ClusterRow[];
  hasMore: boolean;
  nextOffset: number;
  loadingMore: boolean;
  loaded: boolean;
};

/* ── Channel config ───────────────────────────────── */
const FEED_CHANNELS: FeedChannel[] = ['main', 'good', 'sports', 'entertainment', 'finance', 'tech', 'travel', 'art', 'politics'];
const CHANNEL_LABEL: Record<FeedChannel, string> = {
  main: 'All News', good: 'Positive', sports: 'Sports',
  entertainment: 'Entertainment', finance: 'Finance', tech: 'Tech',
  travel: 'Travel', art: 'Art', politics: 'Politics',
};
const CHANNEL_EMPTY: Record<FeedChannel, string> = {
  main: 'No stories yet. Run pnpm ingest:once then pnpm cluster:once.',
  good: 'No positive stories found yet — run more synthesis cycles.',
  sports: 'No sports stories found yet.',
  entertainment: 'No entertainment stories found yet.',
  finance: 'No finance stories found yet.',
  tech: 'No tech stories found yet.',
  travel: 'No travel stories found yet.',
  art: 'No art stories found yet.',
  politics: 'No politics stories found yet.',
};

function defaultChannelState(): ChannelState {
  return { clusters: [], hasMore: true, nextOffset: 0, loadingMore: false, loaded: false };
}
function initFeeds(initial: ClusterRow[], total: number): Record<FeedChannel, ChannelState> {
  return Object.fromEntries(
    FEED_CHANNELS.map(ch => [
      ch,
      ch === 'main'
        ? { clusters: initial, hasMore: initial.length < total, nextOffset: initial.length, loadingMore: false, loaded: true }
        : defaultChannelState(),
    ])
  ) as Record<FeedChannel, ChannelState>;
}

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

/* ── Cover image ──────────────────────────────────── */
function CoverImage({ src, alt, initials }: { src:string|null; alt:string; initials:string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div style={{ width:'100%', overflow:'hidden', background:'var(--paper-alt)' }}>
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

/* ── Possible Reasons ─────────────────────────────── */
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

/* ── Video card ───────────────────────────────────── */
function VideoCard({ video, onPlay, isPlaying }: { video:VideoData; onPlay:(id:string)=>void; isPlaying:boolean }) {
  const d = new Date(video.publishedAt);
  return (
    <button
      onClick={e => { e.stopPropagation(); onPlay(video.videoId); }}
      style={{
        display:'flex', gap:'0.6rem', alignItems:'center', width:'100%',
        padding:'0.45rem 0', background: isPlaying ? 'var(--paper-alt)' : 'none',
        border:'none', borderBottom:'1px solid var(--rule)',
        cursor:'pointer', textAlign:'left',
      }}
    >
      <div style={{ position:'relative', flexShrink:0, width:'76px', height:'48px', background:'var(--rule)' }}>
        {video.thumbnail && // eslint-disable-line @next/next/no-img-element
          <img src={video.thumbnail} alt={video.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
          background: isPlaying ? 'rgba(204,0,0,0.55)' : 'rgba(0,0,0,0.22)' }}>
          <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'rgba(255,255,255,0.92)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="9" height="9" viewBox="0 0 18 18" style={{ marginLeft:'1px' }}>
              <polygon points="4,2 16,9 4,16" fill={isPlaying ? '#c00' : '#333'} />
            </svg>
          </div>
        </div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontFamily:'var(--font-crimson)', fontSize:'0.85rem', lineHeight:1.3,
          color: isPlaying ? 'var(--ink)' : 'var(--ink-muted)', fontWeight: isPlaying ? 600 : 400,
          overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {video.title}
        </p>
        <p className="sc" style={{ color:'var(--ink-faint)', marginTop:'0.1rem' }}>
          {video.channelTitle} · {MONTHS[d.getMonth()]} {d.getDate()}
          {video.hasChapters && <span style={{ color:'var(--forest)', marginLeft:'0.4rem' }}>◉ segments</span>}
        </p>
      </div>
    </button>
  );
}

/* ── Videos section ───────────────────────────────── */
function VideosSection({ clusterId, onPlay, playingVideoId, prefetched, onFetched, open }: {
  clusterId:string; onPlay:(id:string)=>void; playingVideoId:string|null;
  prefetched:VideoData[]|null; onFetched:(v:VideoData[])=>void; open:boolean;
}) {
  const [videos, setVideos]   = useState<VideoData[]|null>(prefetched);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { if (prefetched && !videos) setVideos(prefetched); }, [prefetched, videos]);

  useEffect(() => {
    if (!open || videos !== null) return;
    setLoading(true);
    fetch(`/api/story/${clusterId}/videos`).then(r => r.json()).then(data => {
      if (data.error) setError(data.error);
      const v = data.videos ?? [];
      setVideos(v);
      onFetched(v);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const displayed = videos ? (showAll ? videos : videos.slice(0, 3)) : [];
  const hiddenCount = videos ? Math.max(0, videos.length - 3) : 0;

  if (!open) return null;
  return (
    <div style={{ paddingBottom:'0.55rem', borderBottom:'1px solid var(--rule)' }}>
      {loading && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.4rem 0' }}>Searching YouTube…</p>}
      {error && <p className="sc" style={{ color:'var(--red)', padding:'0.4rem 0' }}>Add YOUTUBE_API_KEY to .env.local to enable this.</p>}
      {!loading && !error && videos?.length === 0 && <p className="sc" style={{ color:'var(--ink-faint)', padding:'0.4rem 0' }}>No videos found.</p>}
      {displayed.map(v => (
        <VideoCard key={v.videoId} video={v} onPlay={onPlay} isPlaying={playingVideoId === v.videoId} />
      ))}
      {!showAll && hiddenCount > 0 && (
        <button onClick={e => { e.stopPropagation(); setShowAll(true); }} className="ctrl-btn"
          style={{ fontSize:'0.63rem', marginTop:'0.35rem' }}>
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}

/* ── Story content ────────────────────────────────── */
function StoryContent({ data, clusterId, onPlay, playingVideoId, videoCache, onVideosFetched, onTrailOpen }: {
  data:StoryData; clusterId:string;
  onPlay:(id:string)=>void; playingVideoId:string|null;
  videoCache:VideoData[]|null; onVideosFetched:(v:VideoData[])=>void;
  onTrailOpen:()=>void;
}) {
  const { synthesis:s, articles } = data;
  const [expandedPovs, setExpandedPovs] = useState<Set<number>>(new Set());
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

  function togglePov(idx: number) {
    setExpandedPovs(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  }

  return (
    <div className="expand-enter">
      {/* Fact bar + AI trail button */}
      <div style={{ padding:'0.85rem 0 0.7rem', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', gap:'0.85rem' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span className="sc" style={{ color:'var(--ink-muted)' }}>Fact / Narrative</span>
            <span className="sc" style={{ color:col }}>{pct}% factual · {100-pct}% disputed</span>
          </div>
          <div className="fact-bar-track" style={{ marginTop:'0.35rem' }}><div className="fact-bar-fill" style={{ width:`${pct}%`, background:col }} /></div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onTrailOpen(); }}
          title="How did we get here?"
          style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', lineHeight:0, color:'var(--ink-muted)', flexShrink:0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1 L11.8 8.2 L19 10 L11.8 11.8 L10 19 L8.2 11.8 L1 10 L8.2 8.2 Z"/>
          </svg>
        </button>
      </div>

      {/* Videos */}
      <VideosSection clusterId={clusterId} onPlay={onPlay} playingVideoId={playingVideoId} prefetched={videoCache} onFetched={onVideosFetched} open={!!playingVideoId} />

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
        <div style={{ borderBottom:'1px solid var(--rule)' }}>
          {povs.map((pov,idx) => {
            const isExpanded = expandedPovs.has(idx);
            const preview = pov.summary.length > 160
              ? pov.summary.slice(0, 160).replace(/\s+\S*$/, '') + '…'
              : pov.summary;
            return (
              <div key={idx} style={{
                display:'flex', alignItems:'stretch', gap:'0.5rem',
                padding:'0.6rem 0',
                borderTop: idx > 0 ? '1px solid var(--rule-heavy)' : 'none',
              }}>
                <span className="sc" style={{ fontSize:'0.6rem', color:'var(--ink)', flexShrink:0, width:'2.1rem', textAlign:'right', paddingTop:'0.25rem', letterSpacing:'0.04em', fontWeight:700 }}>
                  POV{idx+1}
                </span>
                <div style={{ flex:1, borderLeft:'2px solid var(--ink-muted)', paddingLeft:'0.7rem' }}>
                  <div
                    style={{ display:'flex', alignItems:'flex-start', gap:'0.4rem', cursor:'pointer' }}
                    onClick={e => { e.stopPropagation(); togglePov(idx); }}
                  >
                    <p style={{ flex:1, fontSize:'0.97rem', lineHeight:1.55, color:'var(--ink)', margin:0 }}>
                      {isExpanded ? pov.summary : preview}
                    </p>
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink:0, marginTop:'0.25rem', transition:'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      <polyline points="3,5 8,11 13,5" />
                    </svg>
                  </div>

                  {isExpanded && (
                    <>
                      {pov.key_claims.length > 0 && (
                        <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.35rem', marginTop:'0.55rem' }}>
                          {pov.key_claims.map((c,i) => (
                            <li key={i} style={{ display:'flex', gap:'0.45rem', alignItems:'flex-start', fontSize:'0.88rem', lineHeight:1.5, color:'var(--ink-muted)' }}>
                              <span style={{ color:'var(--ink-muted)', flexShrink:0, fontSize:'0.5rem', marginTop:'0.38rem' }}>▸</span>{c.claim}
                            </li>
                          ))}
                        </ul>
                      )}
                      {pov.framing_devices.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginTop:'0.5rem' }}>
                          {pov.framing_devices.map((f,i) => (
                            <span key={i} className="sc" style={{ fontSize:'0.55rem', padding:'2px 6px', border:'1px solid var(--rule)', color:'var(--ink-muted)', borderRadius:'2px' }}>{f}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
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

      {/* Rhetoric */}
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
      <div style={{ paddingTop:'0.65rem', paddingBottom:'0.5rem' }}>
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
    </div>
  );
}

/* ── Story card ───────────────────────────────────── */
function StoryCard({ cluster, expandedId, loadingId, data, onExpand, videoMode, activeCardId, onActivate, starred, onToggleStar }: {
  cluster: ClusterRow; expandedId: string|null; loadingId: string|null;
  data: StoryData|undefined; onExpand: (id:string)=>void; videoMode: boolean;
  activeCardId: string|null; onActivate: (id: string|null) => void;
  starred: boolean; onToggleStar: () => void;
}) {
  const isOpen    = expandedId === cluster.id;
  const isLoading = loadingId === cluster.id;
  const isPending = cluster.status !== 'synthesized';

  const [playingVideoId, setPlayingVideoId] = useState<string|null>(null);
  const [videoCache, setVideoCache]         = useState<VideoData[]|null>(null);
  const [trailOpen, setTrailOpen]           = useState(false);
  const touchX        = useRef(0);
  const videoCacheRef = useRef<VideoData[]|null>(null);

  useEffect(() => { videoCacheRef.current = videoCache; }, [videoCache]);
  useEffect(() => { if (!isOpen) setPlayingVideoId(null); }, [isOpen]);

  useEffect(() => {
    if (activeCardId !== null && activeCardId !== cluster.id && playingVideoId) {
      setPlayingVideoId(null);
    }
  }, [activeCardId, cluster.id, playingVideoId]);

  async function ensureVideos(): Promise<VideoData[]> {
    if (videoCacheRef.current) return videoCacheRef.current;
    const res = await fetch(`/api/story/${cluster.id}/videos`).then(r => r.json());
    const v: VideoData[] = res.videos ?? [];
    setVideoCache(v);
    videoCacheRef.current = v;
    return v;
  }

  function switchVideo(id: string | null) {
    setPlayingVideoId(id);
    onActivate(id ? cluster.id : null);
  }

  async function navigate(dir: 'left' | 'right') {
    const vids = await ensureVideos();
    if (vids.length === 0) return;
    const total  = vids.length + 1;
    const curPos = playingVideoId ? (vids.findIndex(v => v.videoId === playingVideoId) + 1) : 0;
    const nextPos = dir === 'left' ? (curPos + 1) % total : (curPos - 1 + total) % total;
    switchVideo(nextPos === 0 ? null : (vids[nextPos - 1]?.videoId ?? null));
  }

  // Pre-fetch videos as soon as card opens; also auto-play first if videoMode is on
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      const vids = await ensureVideos();
      if (cancelled || !videoMode || vids.length === 0) return;
      switchVideo(vids[0]?.videoId ?? null);
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, videoMode]);

  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0]?.clientX ?? 0; }
  async function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) < 50) return;
    e.stopPropagation();
    await navigate(dx < 0 ? 'left' : 'right');
  }

  return (
    <div style={{ borderBottom:'2px solid var(--rule-heavy)', paddingBottom:'1.25rem', marginBottom:'0.1rem' }}>
      <div
        role={isPending ? undefined : 'button'} tabIndex={isPending ? -1 : 0}
        onClick={() => !isPending && onExpand(cluster.id)}
        onMouseDown={e => e.preventDefault()}
        onKeyDown={e => !isPending && e.key==='Enter' && onExpand(cluster.id)}
        className={`story-card${isOpen ? ' expanded' : ''}`}
        style={{ paddingTop:'1rem', outline:'none', cursor: isPending ? 'default' : 'pointer' }}
      >
        {/* Media */}
        <div
          style={{ display:'grid', overflow:'hidden', width:'100%' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div style={{
            gridArea:'1/1',
            transform: playingVideoId ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'transform',
            background: 'var(--paper-alt)',
          }}>
            <CoverImage src={cluster.coverImage} alt={cluster.canonicalTitle}
              initials={cluster.canonicalTitle.slice(0,2).toUpperCase()} />
          </div>
          <div
            style={{
              gridArea:'1/1',
              transform: playingVideoId ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              willChange: 'transform',
              position:'relative', paddingTop:'56.25%', background:'#000',
            }}
            onClick={e => e.stopPropagation()}
          >
            {playingVideoId && (
              <>
                <iframe
                  src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
                  title="video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none', display:'block' }}
                />
                {/* Transparent overlay captures swipe gestures — iframe eats all touch events otherwise */}
                <div
                  style={{ position:'absolute', inset:0, zIndex:5 }}
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                />
                <button
                  onClick={e => { e.stopPropagation(); switchVideo(null); }}
                  aria-label="Close video"
                  style={{ position:'absolute', top:'7px', right:'7px',
                    background:'rgba(0,0,0,0.62)', border:'none', color:'#fff',
                    borderRadius:'50%', width:'26px', height:'26px', zIndex:10,
                    cursor:'pointer', fontSize:'0.7rem', lineHeight:1,
                    display:'flex', alignItems:'center', justifyContent:'center' }}
                >✕</button>
              </>
            )}
          </div>
        </div>

        <div style={{ paddingTop:'0.65rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div className="sc" style={{ color:'var(--ink-faint)' }}>
              {shortDate(cluster.createdAt)} · {cluster.articleCount} sources
              {isPending && <span style={{ marginLeft:'0.5rem', color:'var(--gold)' }}>· in press</span>}
              {isOpen  && <span style={{ marginLeft:'0.6rem', color:'var(--ink-muted)' }}>▲ collapse</span>}
            </div>
            <button
              onClick={e => { e.stopPropagation(); onToggleStar(); }}
              aria-label={starred ? 'Unstar' : 'Star'}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'0.15rem 0.3rem', color: starred ? 'var(--gold)' : 'var(--rule-heavy)', lineHeight:1, flexShrink:0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
          <h2 style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.1rem,3.5vw,1.4rem)', fontWeight:700, lineHeight:1.25, color:'var(--ink)', marginTop:'0.2rem' }}>
            {cluster.canonicalTitle}
          </h2>
        </div>
      </div>

      {isOpen && (
        <div style={{ paddingBottom:'0.5rem' }}>
          {isLoading
            ? <p className="sc" style={{ padding:'1.25rem 0', color:'var(--ink-faint)' }}>Loading…</p>
            : data
              ? <StoryContent data={data} clusterId={cluster.id}
                  onPlay={id => { switchVideo(playingVideoId === id ? null : id); }}
                  playingVideoId={playingVideoId} videoCache={videoCache} onVideosFetched={setVideoCache}
                  onTrailOpen={() => setTrailOpen(true)} />
              : null
          }
          <TrailDrawer clusterId={cluster.id} open={trailOpen} onClose={() => setTrailOpen(false)} />
        </div>
      )}
    </div>
  );
}

/* ── Feed panel ───────────────────────────────────── */
function FeedPanel({ clusters, expandedId, loadingId, cache, onExpand, hasMore, loadingMore, emptyMsg, videoMode, activeCardId, onActivate, starredIds, onToggleStar }: {
  clusters: ClusterRow[]; expandedId: string|null; loadingId: string|null;
  cache: Record<string,StoryData>; onExpand: (id:string)=>void;
  hasMore: boolean; loadingMore: boolean; emptyMsg: string; videoMode: boolean;
  activeCardId: string|null; onActivate: (id: string|null) => void;
  starredIds: Set<string>; onToggleStar: (id: string) => void;
}) {
  return (
    <div>
      {clusters.length === 0 && !loadingMore && (
        <p style={{ textAlign:'center', padding:'3rem 0', color:'var(--ink-muted)', fontStyle:'italic' }}>{emptyMsg}</p>
      )}
      {clusters.map(c => (
        <StoryCard key={c.id} cluster={c} expandedId={expandedId} loadingId={loadingId} data={cache[c.id]} onExpand={onExpand} videoMode={videoMode} activeCardId={activeCardId} onActivate={onActivate} starred={starredIds.has(c.id)} onToggleStar={() => onToggleStar(c.id)} />
      ))}
      {loadingMore && <p className="sc" style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>Loading more…</p>}
      {!hasMore && clusters.length > 0 && <p className="sc" style={{ textAlign:'center', padding:'1.5rem 0', color:'var(--ink-faint)' }}>All {clusters.length} stories loaded</p>}
    </div>
  );
}

/* ── Bottom navigation ────────────────────────────── */
function BottomNav({ activePanel, onPanel, feedChannel, onFeedChannel, onCollapseAll }: {
  activePanel: ActivePanel;
  onPanel: (p: 'search' | 'filters' | 'starred') => void;
  feedChannel: FeedChannel;
  onFeedChannel: (ch: FeedChannel) => void;
  onCollapseAll: () => void;
}) {
  const navBtn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '3px', padding: '6px 0',
        color: active ? 'var(--ink)' : 'var(--ink-faint)',
        transition: 'color 0.15s',
      }}
    >
      {icon}
      <span style={{ fontFamily:'Helvetica Neue,Arial,sans-serif', fontSize:'0.48rem', fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</span>
    </button>
  );

  const isPositiveActive = feedChannel === 'good' && !activePanel;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      height: '58px',
      background: 'var(--paper)',
      borderTop: '1px solid var(--rule)',
      display: 'flex', alignItems: 'stretch',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navBtn(activePanel === 'filters', () => onPanel('filters'),
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
        </svg>,
        'Filters'
      )}
      {navBtn(activePanel === 'starred', () => onPanel('starred'),
        <svg width="19" height="19" viewBox="0 0 24 24" fill={activePanel === 'starred' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>,
        'Starred'
      )}
      {/* Center: Positive News */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={() => { onFeedChannel('good'); }}
          aria-label="Positive News"
          style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: isPositiveActive ? 'var(--forest)' : 'var(--btn-bg)',
            border: `1px solid ${isPositiveActive ? 'var(--forest)' : 'var(--rule)'}`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isPositiveActive ? '#fff' : 'var(--ink-muted)',
            marginTop: '-10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            transition: 'background 0.2s, color 0.2s',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
          </svg>
        </button>
      </div>
      {navBtn(activePanel === 'search', () => onPanel('search'),
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>,
        'Search'
      )}
      {navBtn(false, onCollapseAll,
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>,
        'Collapse'
      )}
    </nav>
  );
}

/* ── Profile drawer ───────────────────────────────── */
function ProfileDrawer({ open, onClose, dark, onToggleDark, videoMode, onToggleVideo }: {
  open: boolean; onClose: () => void;
  dark: boolean; onToggleDark: () => void;
  videoMode: boolean; onToggleVideo: () => void;
}) {
  if (!open) return null;

  const toggle = (on: boolean, onToggle: () => void) => (
    <button
      onClick={onToggle}
      style={{
        width: '42px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        background: on ? 'var(--ink)' : 'var(--rule)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '4px', left: on ? '22px' : '4px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: on ? 'var(--paper)' : 'var(--ink-muted)',
        transition: 'left 0.2s',
        display: 'block',
      }} />
    </button>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:400, background:'rgba(0,0,0,0.25)' }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
        width: 'min(300px, 85vw)',
        background: 'var(--paper)',
        borderLeft: '1px solid var(--rule-heavy)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        animation: 'slideInRight 0.22s ease',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.25rem 0' }}>
          <span style={{ fontFamily:'var(--font-playfair)', fontSize:'1.15rem', fontWeight:700 }}>Profile</span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink)', fontSize:'1.1rem', padding:'0.2rem 0.3rem', lineHeight:1 }}>✕</button>
        </div>

        <div style={{ padding:'1.25rem' }}>
          <div className="sc" style={{ color:'var(--ink-faint)', marginBottom:'0.85rem' }}>Settings</div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px solid var(--rule)' }}>
            <div>
              <div style={{ fontSize:'0.93rem' }}>Night mode</div>
              <div className="sc" style={{ color:'var(--ink-faint)', marginTop:'2px' }}>Dark theme</div>
            </div>
            {toggle(dark, onToggleDark)}
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 0', borderBottom:'1px solid var(--rule)' }}>
            <div>
              <div style={{ fontSize:'0.93rem' }}>Auto-play videos</div>
              <div className="sc" style={{ color:'var(--ink-faint)', marginTop:'2px' }}>Open video on expand</div>
            </div>
            {toggle(videoMode, onToggleVideo)}
          </div>

          <div className="sc" style={{ color:'var(--ink-faint)', marginTop:'1.5rem', marginBottom:'0.75rem' }}>About</div>
          <p style={{ fontSize:'0.87rem', color:'var(--ink-muted)', lineHeight:1.65 }}>
            For the People — Indian news synthesized across the political spectrum, without spin.
          </p>
          <p style={{ fontSize:'0.83rem', color:'var(--ink-faint)', marginTop:'0.5rem' }}>Version 1.0</p>
        </div>
      </div>
    </>
  );
}

/* ── Search panel ─────────────────────────────────── */
function SearchPanel({ allClusters, expandedId, loadingId, cache, onExpand, videoMode, activeCardId, onActivate, starredIds, onToggleStar }: {
  allClusters: ClusterRow[];
  expandedId: string|null; loadingId: string|null;
  cache: Record<string,StoryData>; onExpand: (id:string)=>void;
  videoMode: boolean; activeCardId: string|null; onActivate: (id:string|null)=>void;
  starredIds: Set<string>; onToggleStar: (id:string)=>void;
}) {
  const [query, setQuery] = useState('');
  const results = query.trim().length < 2
    ? allClusters.slice(0, 20)
    : allClusters.filter(c => c.canonicalTitle.toLowerCase().includes(query.toLowerCase())).slice(0, 40);

  return (
    <div style={{ paddingTop:'0.75rem' }}>
      <div style={{ position:'relative', marginBottom:'1rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth="2"
          style={{ position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search stories…" autoFocus
          style={{
            width:'100%', padding:'0.65rem 0.9rem 0.65rem 2.3rem',
            background:'var(--paper-alt)', border:'1px solid var(--rule)',
            color:'var(--ink)', fontSize:'0.97rem',
            fontFamily:'var(--font-crimson)', outline:'none',
          }}
        />
      </div>
      {results.length === 0 && (
        <p style={{ color:'var(--ink-muted)', fontStyle:'italic', textAlign:'center', padding:'2rem 0' }}>No stories match.</p>
      )}
      {results.map(c => (
        <StoryCard key={c.id} cluster={c} expandedId={expandedId} loadingId={loadingId}
          data={cache[c.id]} onExpand={onExpand} videoMode={videoMode}
          activeCardId={activeCardId} onActivate={onActivate}
          starred={starredIds.has(c.id)} onToggleStar={() => onToggleStar(c.id)} />
      ))}
    </div>
  );
}

/* ── Starred panel ────────────────────────────────── */
function StarredPanel({ starredIds, allClusters, expandedId, loadingId, cache, onExpand, videoMode, activeCardId, onActivate, onToggleStar }: {
  starredIds: Set<string>; allClusters: ClusterRow[];
  expandedId: string|null; loadingId: string|null;
  cache: Record<string,StoryData>; onExpand: (id:string)=>void;
  videoMode: boolean; activeCardId: string|null; onActivate: (id:string|null)=>void;
  onToggleStar: (id:string)=>void;
}) {
  const starred = allClusters.filter(c => starredIds.has(c.id));
  if (starred.length === 0) return (
    <div style={{ padding:'4rem 0', textAlign:'center', color:'var(--ink-muted)' }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--rule-heavy)" strokeWidth="1.5" style={{ display:'block', margin:'0 auto 0.85rem' }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p style={{ fontStyle:'italic' }}>No starred stories yet.</p>
      <p style={{ fontSize:'0.83rem', color:'var(--ink-faint)', marginTop:'0.4rem' }}>Tap ★ on any story to save it here.</p>
    </div>
  );
  return (
    <div style={{ paddingTop:'0.5rem' }}>
      {starred.map(c => (
        <StoryCard key={c.id} cluster={c} expandedId={expandedId} loadingId={loadingId}
          data={cache[c.id]} onExpand={onExpand} videoMode={videoMode}
          activeCardId={activeCardId} onActivate={onActivate}
          starred={true} onToggleStar={() => onToggleStar(c.id)} />
      ))}
    </div>
  );
}

/* ── Filters panel ────────────────────────────────── */
function FiltersPanel() {
  return (
    <div style={{ padding:'4rem 0', textAlign:'center', color:'var(--ink-muted)' }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--rule-heavy)" strokeWidth="1.5" style={{ display:'block', margin:'0 auto 0.85rem' }}>
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
      </svg>
      <p style={{ fontStyle:'italic' }}>Filters coming soon.</p>
      <p style={{ fontSize:'0.83rem', color:'var(--ink-faint)', marginTop:'0.4rem' }}>Filter by source lean, date range, and more.</p>
    </div>
  );
}

/* ── Main export ──────────────────────────────────── */
export function StoryFeed({ initialClusters, totalCount }: { initialClusters: ClusterRow[]; totalCount: number }) {
  const [feeds, setFeeds]           = useState<Record<FeedChannel, ChannelState>>(() => initFeeds(initialClusters, totalCount));
  const [feedChannel, setFeedChannel] = useState<FeedChannel>('main');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [cache, setCache]           = useState<Record<string,StoryData>>({});
  const [loadingId, setLoadingId]   = useState<string|null>(null);
  const [dark, setDark]             = useState(false);
  const [videoMode, setVideoMode]   = useState(false);
  const [activeCardId, setActiveCardId] = useState<string|null>(null);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [starredIds, setStarredIds]     = useState<Set<string>>(new Set());

  const feedsRef    = useRef(feeds);
  const touchStartX = useRef(0);
  // Sentinel map: one HTMLDivElement per feed channel
  const sentinelMap = useRef<Partial<Record<FeedChannel, HTMLDivElement | null>>>({});

  useEffect(() => { feedsRef.current = feeds; }, [feeds]);

  /* restore prefs */
  useEffect(() => {
    if (localStorage.getItem('ftp-theme') === 'dark') setDark(true);
    if (localStorage.getItem('ftp-videomode') === '1') setVideoMode(true);
    try {
      const s = localStorage.getItem('ftp-starred');
      if (s) setStarredIds(new Set(JSON.parse(s)));
    } catch {}
  }, []);

  /* auto-refresh pending main stories */
  useEffect(() => {
    const hasPending = feeds.main.clusters.some(c => c.status !== 'synthesized');
    if (!hasPending) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/feed?offset=0&limit=${feeds.main.clusters.length}`).then(r => r.json());
      if (res.clusters) setFeeds(prev => ({ ...prev, main: { ...prev.main, clusters: res.clusters } }));
    }, 30_000);
    return () => clearInterval(id);
  }, [feeds.main.clusters]);

  /* load more for a channel */
  const loadMoreChannel = useCallback(async (ch: FeedChannel, offset: number) => {
    const state = feedsRef.current[ch];
    if (state.loadingMore) return;
    if (state.loaded && !state.hasMore) return;

    setFeeds(prev => ({ ...prev, [ch]: { ...prev[ch], loadingMore: true } }));

    let url: string;
    if (ch === 'main') url = `/api/feed?offset=${offset}&limit=10`;
    else if (ch === 'good') url = `/api/feed/positive?offset=${offset}&limit=10`;
    else url = `/api/feed/category?cat=${ch}&offset=${offset}&limit=10`;

    const res = await fetch(url).then(r => r.json());

    setFeeds(prev => {
      const prevCh = prev[ch];
      const seen = new Set(prevCh.clusters.map(c => c.id));
      const newClusters = [...prevCh.clusters, ...(res.clusters as ClusterRow[]).filter(c => !seen.has(c.id))];
      return {
        ...prev,
        [ch]: {
          clusters: newClusters,
          hasMore: res.hasMore ?? false,
          nextOffset: res.nextOffset ?? offset + 10,
          loadingMore: false,
          loaded: true,
        },
      };
    });
  }, []);

  /* switch feed channel */
  const switchFeedChannel = useCallback((to: FeedChannel) => {
    setFeedChannel(to);
    setActivePanel(null);
    setExpandedId(null);
    const state = feedsRef.current[to];
    if (!state.loaded) loadMoreChannel(to, 0);
  }, [loadMoreChannel]);

  /* IntersectionObserver for active channel sentinel */
  useEffect(() => {
    if (activePanel) return;
    const el = sentinelMap.current[feedChannel];
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          const st = feedsRef.current[feedChannel];
          loadMoreChannel(feedChannel, st.nextOffset);
        }
      },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [feedChannel, activePanel, loadMoreChannel]);

  /* dark toggle */
  const toggleDark = useCallback(() => {
    setDark(d => {
      const next = !d;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      localStorage.setItem('ftp-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  /* video mode toggle */
  const toggleVideoMode = useCallback(() => {
    setVideoMode(v => {
      const next = !v;
      localStorage.setItem('ftp-videomode', next ? '1' : '0');
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

  /* star toggle */
  const toggleStar = useCallback((id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('ftp-starred', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  /* toggle overlay panel — second tap closes */
  const togglePanel = useCallback((p: 'search' | 'filters' | 'starred') => {
    setActivePanel(prev => prev === p ? null : p);
    setExpandedId(null);
  }, []);

  /* swipe between feed channels */
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0]?.clientX ?? 0; }
  function onTouchEnd(e: React.TouchEvent) {
    if (activePanel) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) < 60) return;
    const idx = FEED_CHANNELS.indexOf(feedChannel);
    if (dx < 0 && idx < FEED_CHANNELS.length - 1) switchFeedChannel(FEED_CHANNELS[idx + 1]!);
    else if (dx > 0 && idx > 0) switchFeedChannel(FEED_CHANNELS[idx - 1]!);
  }

  /* all loaded clusters for search/starred */
  const allClusters = useMemo(() => {
    const seen = new Set<string>();
    const result: ClusterRow[] = [];
    for (const ch of FEED_CHANNELS) {
      for (const c of feeds[ch].clusters) {
        if (!seen.has(c.id)) { seen.add(c.id); result.push(c); }
      }
    }
    return result;
  }, [feeds]);

  const N = FEED_CHANNELS.length;
  const chIdx = FEED_CHANNELS.indexOf(feedChannel);

  return (
    <>
      {/* ── Masthead ── */}
      <div style={{
        position:'sticky', top:0, zIndex:200,
        background:'var(--paper)', borderBottom:'2px solid var(--rule-heavy)',
        paddingLeft:'1rem', paddingRight:'1rem',
        transition:'background 0.2s',
      }}>
        {/* Title row */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:'46px' }}>
          <div style={{ position:'absolute', left:0 }}>
            <button onClick={toggleVideoMode} aria-label="Toggle video mode"
              title={videoMode ? 'Auto-video on' : 'Photo mode'}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'0.3rem 0.35rem', lineHeight:1,
                display:'flex', flexDirection:'column', alignItems:'center', gap:'1px' }}>
              <span style={{ fontSize:'0.72rem', color: videoMode ? 'var(--forest)' : 'var(--ink-faint)' }}>▶</span>
              <span className="sc" style={{ fontSize:'0.48rem', letterSpacing:'0.07em', color: videoMode ? 'var(--forest)' : 'var(--ink-faint)' }}>
                {videoMode ? 'auto' : 'photo'}
              </span>
            </button>
          </div>
          <a href="/" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:'var(--font-playfair)', fontSize:'clamp(1.05rem,4vw,1.45rem)', fontWeight:700, letterSpacing:'-0.01em', color:'var(--ink)' }}>
              For the People
            </span>
          </a>
          <div style={{ position:'absolute', right:0 }}>
            <button
              onClick={() => setProfileOpen(true)}
              aria-label="Profile & Settings"
              style={{ background:'none', border:'none', cursor:'pointer', padding:'0.3rem 0.35rem', lineHeight:0, color:'var(--ink)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Channel tabs — horizontally scrollable */}
        <div
          className="hide-scrollbar"
          style={{
            display:'flex', overflowX:'auto', whiteSpace:'nowrap',
            borderTop:'1px solid var(--rule)', height:'32px',
            gap:'0',
          }}
        >
          {FEED_CHANNELS.map(ch => (
            <button
              key={ch}
              onClick={() => switchFeedChannel(ch)}
              style={{
                flexShrink: 0,
                background: 'none', border: 'none',
                borderBottom: feedChannel === ch && !activePanel ? '2px solid var(--ink)' : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: 'Helvetica Neue,Arial,sans-serif', fontSize: '0.6rem', fontWeight: 700,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                color: feedChannel === ch && !activePanel ? 'var(--ink)' : 'var(--ink-faint)',
                padding: '0 0.85rem',
                transition: 'color 0.15s, border-color 0.15s',
                height: '100%',
              }}
            >
              {CHANNEL_LABEL[ch]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel overlays ── */}
      {activePanel === 'search' && (
        <SearchPanel allClusters={allClusters} expandedId={expandedId} loadingId={loadingId}
          cache={cache} onExpand={expand} videoMode={videoMode}
          activeCardId={activeCardId} onActivate={setActiveCardId}
          starredIds={starredIds} onToggleStar={toggleStar} />
      )}
      {activePanel === 'starred' && (
        <StarredPanel starredIds={starredIds} allClusters={allClusters}
          expandedId={expandedId} loadingId={loadingId} cache={cache} onExpand={expand}
          videoMode={videoMode} activeCardId={activeCardId} onActivate={setActiveCardId}
          onToggleStar={toggleStar} />
      )}
      {activePanel === 'filters' && <FiltersPanel />}

      {/* ── Swipe feed container ── */}
      {!activePanel && (
        <div
          style={{ overflow:'hidden' }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        >
          <div style={{
            display:'flex', width:`${N * 100}%`,
            transform:`translateX(calc(${-chIdx} * (100% / ${N})))`,
            transition:'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
            willChange:'transform',
            alignItems:'flex-start',
          }}>
            {FEED_CHANNELS.map(ch => {
              const state = feeds[ch];
              return (
                <div key={ch} style={{ width:`${100/N}%`, overflow:'hidden', paddingLeft:'1rem', paddingRight:'1rem' }}>
                  <div className="sc" style={{ color: ch === 'good' ? 'var(--forest)' : 'var(--ink-muted)', padding:'0.6rem 0 0.4rem', borderBottom:'1px solid var(--rule)' }}>
                    {ch === 'good' ? '✦ ' : ''}{CHANNEL_LABEL[ch]}
                  </div>
                  <FeedPanel
                    clusters={state.clusters} expandedId={expandedId} loadingId={loadingId}
                    cache={cache} onExpand={expand}
                    hasMore={state.hasMore} loadingMore={state.loadingMore}
                    emptyMsg={CHANNEL_EMPTY[ch]} videoMode={videoMode}
                    activeCardId={activeCardId} onActivate={setActiveCardId}
                    starredIds={starredIds} onToggleStar={toggleStar}
                  />
                  <div ref={el => { sentinelMap.current[ch] = el; }} style={{ height:'1px' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <BottomNav
        activePanel={activePanel} onPanel={togglePanel}
        feedChannel={feedChannel} onFeedChannel={switchFeedChannel}
        onCollapseAll={() => setExpandedId(null)}
      />

      {/* ── Profile drawer ── */}
      <ProfileDrawer
        open={profileOpen} onClose={() => setProfileOpen(false)}
        dark={dark} onToggleDark={toggleDark}
        videoMode={videoMode} onToggleVideo={toggleVideoMode}
      />
    </>
  );
}
