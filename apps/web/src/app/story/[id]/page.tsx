import { notFound } from 'next/navigation';
import { getDb } from '../../../lib/db';
import { clusters, syntheses, articles } from '@ftp/db';
import { eq } from 'drizzle-orm';
import { SOURCE_MAP } from '@ftp/shared';
import type { SynthesisOutput } from '@ftp/shared';
import { ArticleImage } from '../../../components/ArticleImage';

export const revalidate = 60;

function shortDate(d: Date) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

const LEAN_LABEL: Record<string, string> = {
  right_heavy: 'Far Right', right_lean: 'Right', centre: 'Centre',
  left_lean: 'Left', left_heavy: 'Far Left', wire: 'Wire',
};
const LEAN_COLOR: Record<string, string> = {
  right_heavy: 'var(--red)', right_lean: '#b84000',
  centre: 'var(--ink-muted)', left_lean: 'var(--navy)', left_heavy: '#5b2d8b', wire: 'var(--ink-faint)',
};
const FACT_COLOR: Record<string, string> = {
  high: 'var(--forest)', mostly: '#2a5c2a', mixed: 'var(--gold)', low: 'var(--red)',
};

const NARRATIVE_META = {
  right_narrative: { label: 'Right Perspective', color: 'var(--red)', bg: '#fdf5f5' },
  left_narrative: { label: 'Left Perspective', color: 'var(--navy)', bg: '#f5f7fd' },
};

const STATUS_LABEL: Record<string, string> = {
  TIER_1_CONVICTED: 'Convicted', TIER_2_CHARGED: 'Charged',
  TIER_3_ALLEGED: 'Alleged', PROCEDURAL_BARRIERS_NOTED: 'Alleged†',
};
const STATUS_COLOR: Record<string, string> = {
  TIER_1_CONVICTED: 'var(--red)', TIER_2_CHARGED: '#b84000',
  TIER_3_ALLEGED: 'var(--gold)', PROCEDURAL_BARRIERS_NOTED: 'var(--navy)',
};

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="small-caps" style={{
      borderTop: '1px solid var(--rule-heavy)',
      borderBottom: '1px solid var(--rule)',
      padding: '0.25rem 0',
      marginBottom: '1rem',
      color: 'var(--ink-muted)',
    }}>
      {children}
    </div>
  );
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const [cluster] = await db.select().from(clusters).where(eq(clusters.id, id));
  if (!cluster) notFound();

  const [synthesis] = await db.select().from(syntheses).where(eq(syntheses.clusterId, id));
  const clusterArticles = await db.select().from(articles).where(eq(articles.clusterId, id));
  const output = synthesis?.output as SynthesisOutput | undefined;

  return (
    <>
      <style>{`
        .src-link:hover .src-title { text-decoration: underline; text-decoration-thickness: 1px; }
      `}</style>

      {/* ── Back ── */}
      <div style={{ borderTop: '3px double var(--ink)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
        <a href="/" className="small-caps" style={{ color: 'var(--ink-muted)' }}>← Front Page</a>
      </div>

      {/* ── Hero image ── */}
      {(() => {
        const hero = clusterArticles.find(a => a.imageUrl);
        if (!hero) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.imageUrl!}
            alt={cluster.canonicalTitle}
            style={{
              width: '100%',
              maxHeight: '340px',
              objectFit: 'cover',
              display: 'block',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--rule)',
            }}
          />
        );
      })()}

      {/* ── Headline ── */}
      <h1 style={{
        fontFamily: 'var(--font-head)',
        fontSize: 'clamp(1.75rem, 5vw, 3rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        borderBottom: '1px solid var(--rule)',
        paddingBottom: '1rem',
        marginBottom: '0.75rem',
      }}>
        {cluster.canonicalTitle}
      </h1>

      {/* ── Byline ── */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {output && (
          <span className="small-caps" style={{
            color: output.story_age_band === 'breaking' ? 'var(--red)' : 'var(--ink-muted)',
            fontWeight: output.story_age_band === 'breaking' ? 700 : 400,
          }}>
            {output.story_age_band.toUpperCase()}
          </span>
        )}
        <span className="small-caps" style={{ color: 'var(--ink-muted)' }}>
          {clusterArticles.length} sources
        </span>
        <span className="small-caps" style={{ color: 'var(--ink-muted)' }}>
          {shortDate(new Date(cluster.createdAt))}
        </span>
        {!output && (
          <span className="small-caps" style={{ color: 'var(--gold)' }}>Synthesis pending</span>
        )}
      </div>

      {!output ? (
        <p style={{ fontStyle: 'italic', color: 'var(--ink-muted)' }}>
          This story has not been synthesized yet. Run <code>pnpm synth:one</code>.
        </p>
      ) : (
        <div>
          {/* ── Established Facts ── */}
          {output.established_facts.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Established Facts — Tier I (Adjudicated)</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {output.established_facts.map((f, i) => (
                  <div key={i} style={{
                    borderLeft: '3px solid var(--forest)',
                    paddingLeft: '1rem',
                  }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem' }}>{f.claim}</p>
                    {f.citations.length > 0 && (
                      <p className="small-caps" style={{ color: 'var(--forest)', marginTop: '0.2rem' }}>
                        {f.citations.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Reported Facts ── */}
          {output.reported_facts.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Reported Facts — Tier II (Multi-source)</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {output.reported_facts.map((f, i) => (
                  <div key={i} style={{
                    borderLeft: '3px solid var(--rule-heavy)',
                    paddingLeft: '1rem',
                  }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem' }}>{f.claim}</p>
                    {f.citations.length > 0 && (
                      <p className="small-caps" style={{ color: 'var(--ink-muted)', marginTop: '0.2rem' }}>
                        {f.citations.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Three Perspectives ── */}
          <section style={{ marginBottom: '2rem' }}>
            <SectionHead>Three Perspectives — Contested Claims</SectionHead>
            <div className="perspectives">
              {(['right_narrative', 'left_narrative'] as const).map((key) => {
                const narrative = output.contested_claims[key];
                if (!narrative) return null;
                const meta = NARRATIVE_META[key];
                return (
                  <div key={key} className="perspective-col" style={{ background: meta.bg }}>
                    <div className="small-caps" style={{ color: meta.color, marginBottom: '0.6rem', borderBottom: `1px solid ${meta.color}33`, paddingBottom: '0.3rem' }}>
                      {meta.label}
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                      {narrative.summary}
                    </p>
                    {narrative.key_claims.length > 0 && (
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {narrative.key_claims.map((c, i) => (
                          <li key={i} style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.95rem',
                            color: 'var(--ink-muted)',
                            paddingLeft: '0.75rem',
                            borderLeft: `2px solid ${meta.color}66`,
                          }}>
                            {c.claim}
                          </li>
                        ))}
                      </ul>
                    )}
                    {narrative.sources_used.length > 0 && (
                      <p className="small-caps" style={{ color: 'var(--ink-faint)', marginTop: '0.75rem' }}>
                        Sources: {narrative.sources_used.join(', ')}
                      </p>
                    )}
                  </div>
                );
              })}

              {output.contested_claims.other_narrative && (
                <div className="perspective-col other" style={{ background: '#f9f7f0' }}>
                  <div className="small-caps" style={{ color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
                    Other / Wire Perspective
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.6 }}>
                    {output.contested_claims.other_narrative.summary}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Named Individuals ── */}
          {output.named_individuals.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Named Individuals & Procedural Status</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {output.named_individuals.map((ind, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--rule)',
                    flexWrap: 'wrap',
                    alignItems: 'baseline',
                  }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', fontWeight: 700 }}>
                      {ind.name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                      {ind.role}
                    </span>
                    <span className="small-caps" style={{ fontSize: '0.65rem', color: 'var(--ink-faint)' }}>
                      {ind.party_or_affiliation}
                    </span>
                    <span className="small-caps" style={{
                      fontSize: '0.65rem',
                      color: STATUS_COLOR[ind.procedural_status] ?? 'var(--ink-muted)',
                      border: `1px solid ${STATUS_COLOR[ind.procedural_status] ?? 'var(--rule)'}`,
                      padding: '1px 6px',
                    }}>
                      {STATUS_LABEL[ind.procedural_status] ?? ind.procedural_status}
                    </span>
                    {ind.specific_acts.length > 0 && (
                      <p style={{ width: '100%', fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                        {ind.specific_acts.join('; ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Rhetoric Flags ── */}
          {output.rhetoric_flags.filter(f => f.leader_name).length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Rhetoric & Accountability</SectionHead>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {output.rhetoric_flags.filter(f => f.leader_name).map((flag, i) => (
                  <div key={i} style={{
                    borderLeft: '3px solid var(--red)',
                    paddingLeft: '1rem',
                  }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                      <span className="small-caps" style={{ color: 'var(--red)' }}>{flag.type.replace('_', ' ')}</span>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{flag.leader_name}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-muted)', fontSize: '0.9rem' }}>{flag.party}</span>
                    </div>
                    {flag.quoted_statement && (
                      <blockquote style={{
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        color: 'var(--ink-muted)',
                        margin: '0.25rem 0',
                      }}>
                        "{flag.quoted_statement}"
                      </blockquote>
                    )}
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-muted)' }}>
                      {flag.contradicting_fact_or_question}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Statistics ── */}
          {output.statistics.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Statistics on Record</SectionHead>
              <div className="three-col" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1px',
                background: 'var(--rule)',
                border: '1px solid var(--rule)',
              }}>
                {output.statistics.map((stat, i) => (
                  <div key={i} style={{ background: 'var(--paper)', padding: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700 }}>
                      {stat.value}
                      <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--ink-muted)', marginLeft: '0.3rem' }}>{stat.unit}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{stat.claim}</p>
                    <p className="small-caps" style={{ color: 'var(--ink-faint)', marginTop: '0.25rem' }}>
                      {stat.source_authority} · {stat.year}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Common Ground ── */}
          {output.common_ground && output.common_ground.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Common Ground</SectionHead>
              {output.common_ground.map((cg, i) => (
                <div key={i} style={{
                  border: '1px solid var(--rule)',
                  padding: '1.25rem',
                  marginBottom: '0.75rem',
                }}>
                  <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {cg.proposal}
                  </p>
                  <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div className="small-caps" style={{ color: 'var(--red)', marginBottom: '0.2rem' }}>Why Right might accept</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--ink-muted)' }}>{cg.why_right_might_accept}</p>
                    </div>
                    <div>
                      <div className="small-caps" style={{ color: 'var(--navy)', marginBottom: '0.2rem' }}>Why Left might accept</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--ink-muted)' }}>{cg.why_left_might_accept}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--gold)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                    Risk: {cg.why_it_might_still_fail}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* ── Irreconcilable ── */}
          {output.irreconcilable_disagreements.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <SectionHead>Irreconcilable Disagreements</SectionHead>
              <ul style={{ listStyle: 'none' }}>
                {output.irreconcilable_disagreements.map((d, i) => (
                  <li key={i} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    padding: '0.5rem 0 0.5rem 1rem',
                    borderBottom: '1px solid var(--rule)',
                    borderLeft: '3px solid var(--red)',
                  }}>
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Model Uncertainty ── */}
          <div style={{
            borderTop: '1px solid var(--rule)',
            borderBottom: '1px solid var(--rule)',
            padding: '0.75rem 0',
            marginBottom: '2rem',
          }}>
            <span className="small-caps" style={{ color: 'var(--gold)', marginRight: '0.5rem' }}>
              Editor's Uncertainty Note:
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--ink-muted)' }}>
              {output.model_uncertainty_notes}
            </span>
          </div>
        </div>
      )}

      {/* ── Source Articles ── */}
      <section>
        <SectionHead>Source Articles ({clusterArticles.length})</SectionHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {clusterArticles.map((art) => {
            const source = SOURCE_MAP.get(art.sourceId);
            const lean = source?.lean ?? 'centre';
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const d = new Date(art.publishedAt);
            const dateStr = `${months[d.getMonth()]} ${d.getDate()}`;
            const leanColor = LEAN_COLOR[lean] ?? 'var(--ink-muted)';
            const initials = (source?.name ?? art.sourceId).slice(0, 2).toUpperCase();
            return (
              <a key={art.id} href={art.url} target="_blank" rel="noopener noreferrer"
                className="src-link"
                style={{
                  display: 'flex',
                  gap: '0.875rem',
                  padding: '0.875rem 0',
                  borderBottom: '1px solid var(--rule)',
                  textDecoration: 'none',
                  alignItems: 'flex-start',
                }}>
                {/* Square image */}
                <ArticleImage
                  src={art.imageUrl ?? null}
                  alt={art.title}
                  initials={initials}
                  color={leanColor}
                  size={72}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="src-title" style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    color: 'var(--ink)',
                  }}>
                    {art.title}
                  </p>
                  <p className="small-caps" style={{ color: 'var(--ink-faint)', marginTop: '0.3rem' }}>
                    <span style={{ color: leanColor }}>{source?.name ?? art.sourceId}</span>
                    {' · '}{LEAN_LABEL[lean]}
                    {source?.factuality ? ` · ${source.factuality}` : ''}
                    {' · '}{dateStr}
                  </p>
                </div>
                <span style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>↗</span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
