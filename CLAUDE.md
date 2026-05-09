# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**For the People** (internal codename: `tristhana`) is an Indian news synthesis app. It ingests articles from 35+ outlets across the political spectrum, clusters them by story, then synthesizes each cluster using an LLM into a structured JSON that separates adjudicated facts from reported facts from contested narratives — applying identical epistemological standards to all sides.

## Commands

```bash
# Install dependencies
pnpm install

# Run the Next.js web app (dev server)
pnpm dev

# Run the continuous worker pipeline (ingest → cluster → synthesize on interval)
pnpm worker

# Build the web app
pnpm build

# TypeScript check across the whole monorepo
pnpm typecheck

# Run shared package tests (smoke tests)
pnpm smoke

# Database schema push (apply schema changes to Neon)
pnpm db:push

# Drizzle Studio (DB browser)
pnpm db:studio

# Worker pipeline — run each step once manually
pnpm ingest:once    # Fetch all RSS feeds, store new articles
pnpm cluster:once   # Group unclustered articles into story clusters
pnpm synth:one      # Synthesize ONE pending cluster (run repeatedly; Groq rate limit is the bottleneck)
```

The worker pipeline also runs automatically via a Vercel cron at `/api/cron/pipeline` (every minute). That route uses **Gemini 2.0 Flash** (`GEMINI_API_KEY`). The local CLI worker (`apps/worker/`) uses **Groq LLaMA-3.3-70b** (`GROQ_API_KEY`). These are two separate synthesis code paths that must be kept in sync.

## Environment Variables

Both `apps/web/.env.local` and `apps/worker/.env` (or a root `.env`) are needed:

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | web + worker | Neon PostgreSQL connection string |
| `GROQ_API_KEY` | worker + web trail/chat APIs | Synthesis (CLI worker) + trail builder + story chat |
| `GEMINI_API_KEY` | web cron route | Synthesis (Vercel cron pipeline) |
| `BRAVE_API_KEY` | web cron + trail API | News article ingest + trail web search |
| `YOUTUBE_API_KEY` | web | Video search (optional) |
| `CRON_SECRET` | web cron | Vercel cron authentication |

Groq free tier is 100k tokens/day — shared between the trail builder (`/api/story/:id/trail`) and the CLI synthesis worker. They compete for quota if run simultaneously.

## Architecture

### Monorepo Layout

```
apps/web/       — Next.js 15 app (Vercel)
apps/worker/    — Local CLI worker (not deployed)
packages/db/    — Drizzle ORM schema + Neon client
packages/shared/ — SynthesisOutput Zod schema, synthesis system prompt, sources list
```

Package names: `@ftp/web`, `@ftp/worker`, `@ftp/db`, `@ftp/shared`.

### Data Pipeline

```
ingest.ts  →  cluster.ts  →  synth.ts  →  link.ts
```

1. **Ingest**: Fetches RSS feeds from 35+ sources + Brave News API. Stores articles with `body_excerpt` and `image_url`. Deduplicates by URL.
2. **Cluster**: Groups unclustered articles using Jaccard similarity on title tokens (threshold 0.22, max 72h age gap, min 2 articles from 2+ sources). Calls Gemini (or falls back to first title) to generate a neutral `canonical_title`.
3. **Synthesize**: Calls Groq/Gemini with the full synthesis system prompt (in `packages/shared/src/synthesis-prompt.ts`). Parses response against `SynthesisOutputSchema` (Zod). Stores in `syntheses` table, marks cluster `status = 'synthesized'`.
4. **Link**: Scans synthesized clusters for shared named entities. Creates `cluster_links` rows for related-story navigation.

### Database Schema

Five tables in Neon PostgreSQL (Drizzle ORM in `packages/db/src/schema.ts`):

- `clusters` — story groups with `status` (`pending` | `synthesized`)
- `articles` — individual articles with `cluster_id` FK, `source_id`, `body_excerpt`, `image_url`
- `syntheses` — one row per cluster; `output` is a JSONB `SynthesisOutput`
- `trails` — cached causal trail SSE results per cluster
- `cluster_links` — edges between clusters that share named entities

The `tristhana.db` SQLite file in the repo root is a legacy artifact from before Neon migration. It is unused.

### SynthesisOutput Shape

Defined by Zod in `packages/shared/src/schemas.ts`. Key fields:

- `story_age_band`: `breaking | developing | mature | historical`
- `established_facts` / `reported_facts`: tier 1 and tier 2 facts with citations
- `contested_claims.right_narrative / left_narrative / other_narrative`: steelmanned POVs
- `named_individuals`: each with `procedural_status` (`TIER_1_CONVICTED | TIER_2_CHARGED | TIER_3_ALLEGED | PROCEDURAL_BARRIERS_NOTED`)
- `rhetoric_flags`: `RED_HERRING | BROKEN_PROMISE | EVASION | THREAT | FACTUAL_FALSEHOOD`
- `statistics`, `common_ground`, `irreconcilable_disagreements`, `model_uncertainty_notes`

Invariant enforced by Zod: if `common_ground` is null, `irreconcilable_disagreements` must be non-empty.

### Web App API Routes

- `GET /api/feed` — chronological list of synthesized clusters with synthesis + image
- `GET /api/feed/positive` — keyword + `common_ground` filter
- `GET /api/feed/category?cat=<name>` — title keyword filter by category
- `GET /api/story/:id` — full synthesis + articles for one cluster
- `GET /api/story/:id/trail` — SSE stream; builds causal trail using Groq + Brave Search tool calls
- `POST /api/story/:id/chat` — streaming chat about the story context
- `GET /api/story/:id/reasons` — linked clusters (shared entities via `cluster_links`)
- `GET /api/cron/pipeline` — full ingest + cluster + synthesize pipeline (Vercel cron, every minute)

### Frontend (StoryFeed.tsx)

`apps/web/src/components/StoryFeed.tsx` is a 1000+ line `'use client'` component. It owns all feed UI state: expanded card, active channel (9 horizontal swipe panels), search, starred, video mode, dark mode.

**CSS gotchas that must not be broken:**

1. **`createPortal` for TrailDrawer** — story cards use `CSS transform` for video swipe, which creates a containing block. Any `position: fixed` UI inside a transformed ancestor renders off-screen. `TrailDrawer.tsx` uses `createPortal(content, document.body)` to escape this. Never add `transform`, `filter`, or `will-change` to card containers.

2. **`overflow-anchor: none` on body** (`globals.css`) — prevents browser scroll anchoring from jumping the page when story cards expand.

3. **`suppressHydrationWarning` on `<html>`** — `layout.tsx` injects an inline script that sets `data-theme` from localStorage before React hydrates, causing an intentional server/client HTML mismatch.

4. **Scroll sentinels work per-panel** — The 9 channels are all mounted simultaneously, translated off-screen with `CSS translateX`. Each channel's `IntersectionObserver` only fires when that panel is the active (visible) one.

### Design System

CSS variables defined in `apps/web/src/app/globals.css`. Key tokens:
- `--paper` (#f5f0e3), `--ink` (#1a1008), `--red` (#8b0000), `--navy` (#1a3560), `--forest` (#1e3a1e), `--gold` (#8b6914)
- Dark mode via `[data-theme="dark"]` on `<html>`, toggled via localStorage key `ftp-theme`
- Fonts: Playfair Display (headings), Crimson Text (body), sans-serif for `.sc` metadata labels
- `.sc` class: `font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase`

UI uses **pure inline styles** — no CSS-in-JS library, no Tailwind. Theme values come from CSS variables.

## Known TypeScript Issue (Non-Blocking)

pnpm installs two copies of `drizzle-orm` (one for `packages/db`, one for `apps/web`), causing TS errors about incompatible `PgColumn` private properties in the web API feed routes. The app runs fine at runtime. Build skips lint via `SKIP_LINT=1` in the Vercel build config.

Fix: add to root `package.json`:
```json
"pnpm": { "overrides": { "drizzle-orm": "0.38.4" } }
```

## Deployment

- Vercel auto-deploys on push to `master`. `vercel.json` sets `rootDirectory: "apps/web"`.
- The worker is **not deployed** — it's a local CLI tool for populating the database.
- The Vercel cron (`/api/cron/pipeline`, every minute) handles automated ingest + cluster + synthesis in production using Gemini.
