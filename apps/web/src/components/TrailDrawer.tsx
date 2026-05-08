'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type TrailNode = {
  id: string;
  title: string;
  date: string;
  summary: string;
  connectionType: 'caused' | 'escalated' | 'context' | 'triggered';
  parentId: string | null;
  isMain: boolean;
  sources: { title: string; url: string }[];
};

const CONN_LABEL: Record<string, string> = {
  caused: 'caused',
  escalated: 'escalated',
  context: 'context',
  triggered: 'triggered',
};

const CONN_COLOR: Record<string, string> = {
  caused: 'var(--red)',
  escalated: '#b84000',
  context: 'var(--ink-muted)',
  triggered: 'var(--navy)',
};

export function TrailDrawer({ clusterId, open, onClose }: {
  clusterId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [nodes, setNodes]           = useState<TrailNode[]>([]);
  const [status, setStatus]         = useState('');
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  const [messages, setMessages]     = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput]           = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef   = useRef<HTMLDivElement>(null);
  const esRef        = useRef<EventSource | null>(null);
  const hasLoadedRef = useRef(false);

  function loadTrail() {
    if (esRef.current) esRef.current.close();
    setNodes([]);
    setStatus('Tracing the causal chain…');
    setDone(false);
    setError('');
    setLoading(true);

    const es = new EventSource(`/api/story/${clusterId}/trail`);
    esRef.current = es;

    es.onmessage = (e) => {
      const d = JSON.parse(e.data) as { type: string; node?: TrailNode; text?: string };
      if (d.type === 'status') setStatus(d.text ?? '');
      if (d.type === 'node' && d.node) setNodes(prev => [...prev, d.node!]);
      if (d.type === 'done')  { setDone(true); setLoading(false); setStatus(''); es.close(); }
      if (d.type === 'error') { setError(d.text ?? 'Error'); setLoading(false); es.close(); }
    };
    es.onerror = () => { setLoading(false); setError('Connection lost.'); es.close(); };
  }

  useEffect(() => {
    if (!open) return;
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadTrail();
    return () => esRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function refresh() {
    hasLoadedRef.current = true;
    await fetch(`/api/story/${clusterId}/trail`, { method: 'DELETE' });
    setMessages([]);
    loadTrail();
  }

  async function sendMessage() {
    if (!input.trim() || chatLoading) return;
    const msg = input.trim();
    setInput('');
    const history = [...messages, { role: 'user' as const, content: msg }];
    setMessages([...history, { role: 'assistant' as const, content: '' }]);
    setChatLoading(true);

    try {
      const res = await fetch(`/api/story/${clusterId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, trailNodes: nodes, history: messages }),
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done: rdone, value } = await reader.read();
        if (rdone) break;
        text += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: text };
          return updated;
        });
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Error getting response.' };
        return updated;
      });
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (messages.length === 0) return;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mainNodes = nodes
    .filter(n => n.isMain)
    .sort((a, b) => parseInt(a.id.replace('n', '')) - parseInt(b.id.replace('n', '')));

  const branchMap = new Map<string, TrailNode[]>();
  nodes.filter(n => !n.isMain).forEach(n => {
    if (n.parentId) {
      if (!branchMap.has(n.parentId)) branchMap.set(n.parentId, []);
      branchMap.get(n.parentId)!.push(n);
    }
  });

  const content = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, pointerEvents: open ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--paper)',
        borderRadius: '16px 16px 0 0',
        maxHeight: '88vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 -4px 28px rgba(0,0,0,0.2)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'var(--rule-heavy)' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.45rem 1rem 0.6rem',
          borderBottom: '2px solid var(--rule-heavy)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>
              How did we get here?
            </div>
            <div className="sc" style={{ color: 'var(--ink-faint)', fontSize: '0.58rem', marginTop: '1px' }}>
              {done
                ? `${nodes.length} events traced`
                : loading
                  ? status
                  : error || 'Trail'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            {(done || error) && (
              <button
                onClick={refresh}
                style={{
                  background: 'none', border: '1px solid var(--rule)', borderRadius: '4px',
                  padding: '3px 8px', cursor: 'pointer', color: 'var(--ink-muted)',
                  fontSize: '0.7rem', fontFamily: 'inherit',
                }}
              >
                ↺ Rebuild
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: '1.1rem', lineHeight: 1, padding: '0.2rem 0.4rem' }}
            >✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 0.5rem' }}>

          {/* Build status */}
          {loading && (
            <div style={{ padding: '0.85rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--navy)', fontSize: '0.85rem' }}>⟳</span>
              <span className="sc" style={{ color: 'var(--ink-muted)', fontSize: '0.7rem' }}>{status}</span>
            </div>
          )}

          {error && !loading && (
            <p className="sc" style={{ color: 'var(--red)', padding: '0.75rem 0', fontSize: '0.75rem' }}>{error}</p>
          )}

          {/* Timeline */}
          {mainNodes.length > 0 && (
            <div style={{ padding: '0.75rem 0' }}>
              {mainNodes.map((node, idx) => {
                const isLast     = idx === mainNodes.length - 1;
                const branches   = branchMap.get(node.id) ?? [];
                const branchOpen = expandedBranches.has(node.id);
                const dotColor   = isLast ? 'var(--ink)' : (CONN_COLOR[node.connectionType] ?? 'var(--ink-muted)');
                const nextConn   = mainNodes[idx + 1]?.connectionType ?? 'caused';

                return (
                  <div key={node.id}>
                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      {/* Gutter */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: '18px' }}>
                        <div style={{
                          width: '11px', height: '11px', borderRadius: '50%',
                          background: dotColor, flexShrink: 0, marginTop: '4px',
                        }} />
                        {!isLast && (
                          <div style={{ flex: 1, width: '2px', background: 'var(--rule)', minHeight: '28px', marginTop: '4px' }} />
                        )}
                      </div>

                      {/* Node content */}
                      <div style={{ flex: 1, paddingBottom: isLast ? '0.5rem' : '0.2rem' }}>
                        <div className="sc" style={{ color: 'var(--ink-faint)', fontSize: '0.58rem', marginBottom: '0.12rem' }}>
                          {node.date}
                        </div>
                        <div style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3, color: 'var(--ink)', marginBottom: '0.28rem' }}>
                          {node.title}
                        </div>
                        <p style={{ fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--ink-muted)', margin: '0 0 0.3rem' }}>
                          {node.summary}
                        </p>

                        {/* Source links */}
                        {node.sources.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.32rem' }}>
                            {node.sources.map((s, si) => (
                              <a key={si} href={s.url} target="_blank" rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={{
                                  fontSize: '0.65rem', color: 'var(--navy)', textDecoration: 'none',
                                  border: '1px solid var(--rule)', borderRadius: '2px', padding: '1px 5px',
                                  maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block',
                                }}>
                                ↗ {s.title.length > 28 ? s.title.slice(0, 28) + '…' : s.title}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Branch toggle */}
                        {branches.length > 0 && (
                          <button
                            onClick={() => setExpandedBranches(prev => {
                              const next = new Set(prev);
                              if (next.has(node.id)) next.delete(node.id); else next.add(node.id);
                              return next;
                            })}
                            className="ctrl-btn"
                            style={{ fontSize: '0.61rem', marginBottom: '0.4rem' }}
                          >
                            {branchOpen ? '▲ Hide branches' : `⊕ ${branches.length} branch${branches.length > 1 ? 'es' : ''}`}
                          </button>
                        )}

                        {/* Branches */}
                        {branchOpen && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.35rem' }}>
                            {branches.map(branch => (
                              <div key={branch.id} style={{
                                borderLeft: `3px solid ${CONN_COLOR[branch.connectionType] ?? 'var(--rule)'}`,
                                paddingLeft: '0.65rem', paddingTop: '0.3rem', paddingBottom: '0.25rem',
                                background: 'var(--paper-alt)',
                              }}>
                                <div className="sc" style={{ color: 'var(--ink-faint)', fontSize: '0.57rem', marginBottom: '0.08rem' }}>
                                  {branch.date} · {CONN_LABEL[branch.connectionType] ?? branch.connectionType}
                                </div>
                                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.18rem' }}>
                                  {branch.title}
                                </div>
                                <p style={{ fontSize: '0.79rem', lineHeight: 1.45, color: 'var(--ink-muted)', margin: 0 }}>
                                  {branch.summary}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connection label between nodes */}
                    {!isLast && (
                      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '0.08rem' }}>
                        <div style={{ width: '18px', display: 'flex', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.58rem', color: CONN_COLOR[nextConn] ?? 'var(--ink-muted)' }}>↓</span>
                        </div>
                        <span className="sc" style={{ fontSize: '0.57rem', color: CONN_COLOR[nextConn] ?? 'var(--ink-muted)' }}>
                          {CONN_LABEL[nextConn] ?? nextConn}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state while building first node */}
          {loading && mainNodes.length === 0 && (
            <div style={{ padding: '0.5rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[80, 60, 70].map((w, i) => (
                <div key={i} style={{ height: '14px', borderRadius: '3px', background: 'var(--rule)', width: `${w}%`, opacity: 0.5 }} />
              ))}
            </div>
          )}

          {/* Chat section */}
          <div style={{ borderTop: '2px solid var(--rule-heavy)', paddingTop: '0.75rem', marginTop: mainNodes.length > 0 ? '0.5rem' : 0 }}>
            <div className="sc" style={{ color: 'var(--ink-muted)', marginBottom: '0.55rem' }}>Ask the trail</div>

            {messages.length === 0 && (
              <p style={{ color: 'var(--ink-faint)', fontSize: '0.82rem', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                Ask why this happened, what came before, or what it means.
              </p>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '0.6rem', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '90%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user' ? 'var(--ink)' : 'var(--paper-alt)',
                  color: m.role === 'user' ? 'var(--paper)' : 'var(--ink)',
                  fontSize: '0.87rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content || (chatLoading && i === messages.length - 1 ? '…' : '')}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom padding so last message isn't hidden by input bar */}
          <div style={{ height: '72px' }} />
        </div>

        {/* Chat input — sticky */}
        <div style={{
          borderTop: '1px solid var(--rule)',
          padding: '0.55rem 1rem',
          display: 'flex',
          gap: '0.5rem',
          background: 'var(--paper)',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
            placeholder={done ? 'Ask about this trail…' : loading ? 'Building trail…' : 'Ask once trail is built…'}
            disabled={!done || chatLoading}
            style={{
              flex: 1, padding: '0.52rem 0.75rem', fontSize: '0.87rem',
              border: '1px solid var(--rule)', borderRadius: '8px',
              background: 'var(--paper)', color: 'var(--ink)', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => void sendMessage()}
            disabled={!done || !input.trim() || chatLoading}
            style={{
              background: 'var(--ink)', color: 'var(--paper)',
              border: 'none', borderRadius: '8px',
              padding: '0.52rem 1rem', fontSize: '0.87rem',
              cursor: 'pointer', fontFamily: 'inherit',
              opacity: (!done || !input.trim() || chatLoading) ? 0.38 : 1,
              transition: 'opacity 0.15s',
            }}
          >→</button>
        </div>
      </div>
    </div>
  );
  return createPortal(content, document.body);
}
