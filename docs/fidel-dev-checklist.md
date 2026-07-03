# ፊደል Tools — Full Development Path to Finished Product

> Every checkbox reflects the actual state of `github.com/Yehonatal/fidel-tools`
> as of the code audit on **2026-07-04**. ✅ = done. ⚠️ = partial. [ ] = not started.

---

## Phase 0 — Foundation (Monorepo & Architecture)

### Repo Structure
- ✅ pnpm monorepo with `pnpm-workspace.yaml`
- ✅ `packages/core/` — core NLP engine (TypeScript)
- ✅ `packages/core-native/` — Rust crate (WASM + PyO3 dual target)
- ✅ `packages/lang-am/` — Amharic language pack
- ✅ `packages/py-fidel-tools/` — Python package with Rust bindings (maturin)
- ✅ `packages/validate-pack/` — language pack validator with CLI
- ✅ `packages/db/` — Drizzle ORM + Neon PostgreSQL (private package)
- ✅ `apps/api/` — Hono REST API (20 endpoints)
- ✅ `apps/web/` — Next.js 16 marketing site + developer console
- ✅ `apps/lab/` — Next.js interactive NLP playground with puzzle games
- ✅ `docs/` directory with architecture documents
- ✅ `benchmark/` directory with regression suite
- ✅ Root `package.json` with workspace build/test scripts
- ✅ `.gitignore` configured
- ✅ `CONTRIBUTING.md` — contributor guide (89 lines — setup, commands, git workflow, code of conduct)
- ⚠️ `CHANGELOG.md` — stub only, points to per-package changelogs (no entries in root file)
- [ ] `LICENSE` file — missing from repo root (MIT is declared in package.json files)

### CI/CD
- ✅ `test.yml` — runs on push/PR to **all branches** (not just main)
  - ✅ Runs pnpm build + test
  - ✅ Runs benchmark regression checks (`node benchmark/run-all.js`)
  - ✅ Sets up Python 3.12, builds Rust bindings via maturin, runs pytest
- ✅ `publish-npm.yml` — publishes on push to main, tags `v*`, or manual dispatch
  - ✅ Publishes `@fidel-tools/core-native` (with version-skip check)
  - ✅ Publishes `@fidel-tools/core`
  - ✅ Publishes `@fidel-tools/lang-am`
  - ✅ Publishes `@fidel-tools/validate-pack`
  - ✅ Multi-platform Python wheel builds (Linux x86_64, Linux aarch64, macOS universal2, Windows x86_64)
  - ✅ Publishes wheels to PyPI (trusted publishing)
- [ ] `deploy.yml` — no deployment workflow exists (Docker build + web deploy)
- [ ] Lint/format CI step (`biome.json` exists but is not run in CI)
- [ ] Dedicated Rust test workflow (`cargo test`)
- [ ] Test coverage reporting (Codecov or similar)

---

## Phase 1 — Core Library (`@fidel-tools/core`)

### Architecture ✅ COMPLETE
- ✅ `types.ts` — `LanguagePack`, `LanguagePackMeta`, `StemmerConfig`, `TransliterationConfig` interfaces
- ✅ `pipeline.ts` — `Pipeline` class binding pack to all functions
- ✅ `index.ts` — clean exports of all types, Pipeline, and individual functions (tree-shakable)
- ✅ All hardcoded Amharic data removed from source files
- ✅ All functions accept `pack: LanguagePack` parameter
- ✅ `stemmer.ts` — `sfx_arr`/`pfx_arr` mutation bug fixed (arrays declared inside `stem()`)
- ✅ `stopword_remover.ts` — uses `replaceAll` instead of `replace`
- ✅ `indexer.ts` — `DocIndexData`/`QueryIndexData` interfaces, pure functions + compat wrapper
- ✅ `term_weighter.ts` — pure `weighTerms` + compat `weigh_terms` wrapper
- ✅ `transliterator.ts` — reads from `pack.transliteration`
- ✅ `lexical_analyzer.ts` — reads from `pack.abbreviations`
- ✅ `normalizer.ts` — applies `pack.normalization.char_map` and `pack.normalization.labialized_map`
- ✅ `sentence_tokenizer.ts` — splits on `pack.tokenization.sentence_boundaries`
- ✅ `package.json` — version 0.1.9, depends on `@fidel-tools/core-native`

### Rust Native Crate (`@fidel-tools/core-native`) ✅ COMPLETE
- ✅ `fidel-tools-core-native` Rust crate (edition 2021)
- ✅ Dual crate types: `cdylib` + `rlib`
- ✅ WASM target via `wasm-bindgen` (inline WASM via `inline-wasm.js`)
- ✅ Python target via `pyo3` (optional `python` feature, `abi3-py38`)
- ✅ `Normalizer` struct in Rust — char_map, labialized_map, gemination collapse
- ✅ `WasmNormalizer` — `#[wasm_bindgen]` wrapper for JS
- ✅ `PyNormalizer` — `#[pyclass]` wrapper for Python
- ✅ Published to npm at v0.1.9

### Resolved Bugs
- ✅ `indexer.ts` imports `fs` only within the asynchronous compatibility wrapper
- ✅ `term_weighter.ts` imports `fs` only within the asynchronous compatibility wrapper
- ✅ `lexical_analyzer.ts` abbreviation loop uses `replaceAll` to expand all occurrences
- ✅ Regex injection vulnerabilities resolved via safe replacements and escaping
- ✅ `types.ts` updated to match the `am.json` schema (prefixes/suffixes arrays and nested scheme objects)

### Tests
- ✅ `stemmer.test.js` — passes with `amPack`
- ✅ `stopword_remover.test.js` — passes with `amPack`
- ✅ `lexical_analyzer.test.js` — present
- ✅ `transliterator.test.js` — present
- ✅ `indexer.test.js` — present
- ✅ `pipeline.test.js` — end-to-end integration tests
- [ ] `normalizer` tests — no test file exists
- [ ] `sentence_tokenizer` tests — no test file exists
- [ ] `term_weighter` tests — no test file exists

---

## Phase 1 — Language Pack (`@fidel-tools/lang-am`)

### Current State ✅ COMPLETE
- ✅ `am.json` — 63KB with stopwords, abbreviations, stemmer lists, transliteration maps, normalization data, and nested schemes matching the core schema
- ✅ `index.ts` — loads and exports JSON with correct type
- ✅ `package.json` — v0.1.9, workspace dependency on core
- ✅ Schema fully matches `types.ts` in core
- ✅ Published to npm at v0.1.9
- ✅ Stopword list expanded to 400+ entries
- ✅ Duplicate stopwords fixed
- ✅ Abbreviation list expanded to 100+
- ✅ `protected_words` added to stemmer config
- ✅ Labialized sequence coverage complete in `normalization.labialized_map`
- ✅ Gemination normalization logic using `gemination_threshold`

---

## Phase 1 — Web App (`apps/web`)

### Stack
- ✅ Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript
- ✅ Better Auth (Drizzle adapter) with credentials/sessions/email verification
- ✅ Drizzle ORM + Neon PostgreSQL
- ✅ Rate limiting via Upstash Redis
- ✅ Email via Resend / Nodemailer

### Marketing Pages
- ✅ Landing page (`/`) — 519 lines, hero section, code snippets, interactive playground, features grid, paradigm shift section, benchmark summary
- ✅ Embedded `<LandingPlayground />` — live sandbox with 6 tabs (Pipeline, Transliteration, Stemmer, Stopwords, Lexical, JS vs WASM Bench)
- ✅ Docs page (`/docs`) — 40KB documentation page
- ✅ Packages page (`/packages`) — monorepo SDK packages overview (11KB)
- ✅ Benchmarks page (`/benchmarks`) — 65KB detailed benchmark data
- ✅ Changelog page (`/changelog`) — 9KB
- ⚠️ Enterprise page (`/enterprise`) — 10KB content exists but blocked by `UnderConstructionOverlay`
- ⚠️ Infrastructure page (`/infrastructure`) — 10KB content with pricing, blocked by `UnderConstructionOverlay`
- [ ] Dedicated pricing page (`/pricing`) — pricing content is embedded in `/infrastructure` which is under construction

### Navigation & Reachability
- ✅ Marketing header with: Docs, Packages, Benchmarks, Infrastructure, Enterprise, Changelog, "Products" dropdown
- ✅ "Products" dropdown → "API Cloud (Console)" links to `/dashboard`
- ✅ "Start Building Free" CTA → `/sign-up`
- ✅ "Open Developer Console" CTA (authenticated) → `/dashboard`
- ✅ Marketing footer with copyright, MIT, GitHub link

### Authentication Flow ✅ COMPLETE
- ✅ Sign in page (`/sign-in`)
- ✅ Sign up page (`/sign-up`)
- ✅ Forgot password page (`/forgot-password`)
- ✅ Reset password page (`/reset-password`)
- ✅ Email verification page (`/verify-email`)
- ✅ Better Auth catch-all API route (`/api/auth/[...all]`)

### Developer Dashboard ✅ COMPLETE
- ✅ Dashboard overview (`/dashboard`)
- ✅ Execution Console / Playground (`/dashboard/playground`) — 27KB interactive client
- ✅ API Key Management (`/dashboard/api-keys`) — 27KB client for CRUD operations
- ✅ Usage Analytics (`/dashboard/usage`) — 21KB usage charts and data
- ✅ Console Settings (`/dashboard/settings`) — 10KB settings client
- ✅ Dashboard sidebar navigation (collapsible, with localStorage persistence)
- ✅ Onboarding wizard component
- ✅ Quick start component

### API Routes (Frontend)
- ✅ API key CRUD endpoints (`/api/keys/`)
- ✅ NLP proxy endpoints (`/api/v1/normalize`, `/stem`, `/stopwords`, `/tokenize`, `/transliterate`)

### Mobile Responsiveness ✅ IMPLEMENTED
- ✅ Hamburger menu for mobile (`hidden md:flex` / `md:hidden`)
- ✅ Full-screen mobile drawer overlay with all nav links
- ✅ Responsive grid layouts (`grid-cols-1 md:grid-cols-3`)
- ✅ Responsive text sizing (`sm:text-5xl lg:text-6xl`)
- ✅ Collapsible dashboard sidebar

---

## Phase 1 — Interactive Lab (`apps/lab`)

> **NOTE:** This entire app was not mentioned in the previous checklist.

### Stack
- ✅ Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript
- ✅ Recharts for data visualization
- ✅ Client-side only (no auth, no database)
- ✅ Runs on port 3002

### Academic / Dev Mode — 14 Tools
- ✅ Dev Hub (`/dev`) — performance + accuracy benchmarks dashboard
- ✅ Languages (`/dev/languages`) — supported languages & config
- ✅ Pipeline (`/dev/pipeline`) — interactive multi-stage NLP pipeline
- ✅ Normalize (`/dev/normalize`) — orthographic normalization
- ✅ Tokenize (`/dev/tokenize`) — sentence & word tokenizer
- ✅ Remove Stopwords (`/dev/remove-stopwords`) — stopword filtering
- ✅ Stem (`/dev/stem`) — morphological stemmer
- ✅ Transliterate (`/dev/transliterate`) — Ge'ez ↔ SERA bidirectional
- ✅ Lexical Analyze (`/dev/lexical-analyze`) — contraction & abbreviation expansion
- ✅ Search (`/dev/search`) — search & term indexer
- ✅ Analyze (`/dev/analyze`) — text analysis
- ✅ Corpus (`/dev/corpus`) — corpus management
- ✅ Deduplicate (`/dev/deduplicate`)
- ✅ Query Expand (`/dev/query-expand`)

### Puzzle / Fun Mode — 11 Games
- ✅ Puzzle Hub (`/puzzle`) — game selection (12KB)
- ✅ Script Selector (`/puzzle/languages`)
- ✅ Assembly Line (`/puzzle/pipeline`)
- ✅ Variant Sort (`/puzzle/normalize`)
- ✅ Segment Sprint (`/puzzle/tokenize`)
- ✅ Signal Extractor (`/puzzle/remove-stopwords`)
- ✅ Root Cluster (`/puzzle/stem`)
- ✅ Transliteration Rush v2 (`/puzzle/transliterate`)
- ✅ Expand or Explode (`/puzzle/lexical-analyze`)
- ✅ Rank Royale (`/puzzle/search`)
- ✅ Relevance Arena (`/puzzle/relevance-arena`)
- ✅ Trace (`/puzzle/trace`)

### Lab Components
- ✅ `LabShell.tsx` (33KB) — dual sidebar navigation
- ✅ `FidelCompanion.tsx` (14KB) — AI companion/assistant
- ✅ `FidelLoader.tsx` (7KB) — loading animation
- ✅ `GeezCharMap.tsx` (7KB) — Ge'ez character map
- ✅ `PipelineVisualizer.tsx` (10KB) — pipeline visualization
- ✅ Mode context provider (13KB) — academic/fun mode state management
- ✅ 15 API routes covering all NLP operations

---

## Phase 1 — REST API (`apps/api`)

### Stack ✅ COMPLETE
- ✅ Hono v4 framework on `@hono/node-server`
- ✅ PostgreSQL via `pg` driver (SSL for non-localhost)
- ✅ Zod v4 input validation
- ✅ Multi-stage production Dockerfile

### Global Middleware
- ✅ Global IP rate limiter — 150 req/15min per IP
- ✅ CORS — `origin: "*"`, methods `GET/POST/OPTIONS`, custom headers allowed
- ✅ Hono built-in request logger
- ✅ Hono built-in JSON pretty-printer

### NLP Endpoints (11 endpoints, all authenticated + usage-logged + rate-limited)
- ✅ `GET /api/v1/nlp/languages` — list supported languages
- ✅ `POST /api/v1/nlp/pipeline` — custom execution pipeline (sequential/independent modes)
- ✅ `POST /api/v1/nlp/normalize` — text normalization
- ✅ `POST /api/v1/nlp/tokenize` — sentence + word tokenization
- ✅ `POST /api/v1/nlp/remove-stopwords` — stopword removal
- ✅ `POST /api/v1/nlp/stem` — morphological stemming (single word or batch)
- ✅ `POST /api/v1/nlp/transliterate` — Fidel ↔ Latin (felig/sera, am/en)
- ✅ `POST /api/v1/nlp/lexical-analyze` — lexical analysis
- ✅ `POST /api/v1/nlp/index-documents` — document indexing for IR
- ✅ `POST /api/v1/nlp/index-query` — query indexing for IR
- ✅ `POST /api/v1/nlp/weigh-terms` — TF-IDF term weighting

### Auth Endpoints (3 endpoints, public)
- ✅ `POST /api/v1/auth/token` — exchange passkey + passphrase for JWT (15min) + refresh token (7-day)
- ✅ `POST /api/v1/auth/refresh` — rotate refresh token, issue new JWT
- ✅ `POST /api/v1/auth/revoke` — revoke refresh token

### Other Endpoints
- ✅ `GET /` — health check with API status, version, endpoint directory
- ✅ `GET /docs` — redirect to frontend docs
- ✅ `POST /api/v1/notify` + `POST /notify` — email subscription (Zod-validated, rate-limited 10/min/IP)
- ✅ `GET /api/v1/nlp/puzzle/daily/relevance-arena` — daily puzzle (deterministic seeded)
- ✅ `GET /api/v1/nlp/puzzle/daily/trace` — daily trace puzzle

### Authentication & Security
- ✅ Dual-mode auth: JWT Bearer tokens OR `x-passkey`/`x-passphrase` headers
- ✅ Auth middleware applied to all NLP endpoints
- ✅ JWT: HS256, 15min access tokens, 7-day refresh tokens with rotation
- ✅ API key validation against `api_keys` table
- ✅ Internal auth with SHA-256 hashed passkey/passphrase

### Rate Limiting ✅ COMPLETE
- ✅ Global IP limiter: 150 req/15min per IP
- ✅ Standard key limiter: 60 req/15min per key per endpoint
- ✅ Demo key limiter: 2 req/hr per endpoint per IP
- ✅ Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- ✅ 429 responses on exceed

### Usage Logging
- ✅ `logUsage` middleware — fire-and-forget async DB insert after response
- ✅ Logs: `api_key_id`, `user_id`, `endpoint`, `method`, `status_code`, `latency_ms`, `tokens_processed`
- ⚠️ **BUG:** `usage_logs` table is NOT created by `initDb()` — usage logging silently fails

### Database Schema (6 tables)
- ✅ `subscribers` — email subscription list
- ✅ `users` — accounts with tier (free/pro/enterprise) and monthly quota
- ✅ `api_keys` — keys with hash, prefix, status (active/revoked), expiry
- ✅ `internal_auth` — developer auth credentials (hashed)
- ✅ `refresh_tokens` — JWT refresh token storage
- ✅ `daily_puzzles` — cached daily puzzle results

### Input Validation
- ✅ All NLP endpoints use Zod schemas via `parseAndValidate()` helper
- ✅ Schemas: `commonSchema`, `pipelineSchema`, `stemSchema`, `transliterateSchema`, `indexDocumentsSchema`, `indexQuerySchema`, `weighTermsSchema`
- ✅ Returns 400 on validation failure

### Known Issues
- ⚠️ `usage_logs` table not created in `initDb()` — usageLogger middleware will fail on first write
- ⚠️ Hardcoded secret fallbacks in source (JWT secret, internal passkey/passphrase)
- ⚠️ CORS wide open (`origin: "*"`) — fine for dev, needs tightening for production
- ⚠️ In-memory rate limiting — won't persist across server restarts or scale across instances
- [ ] API not deployed to a live URL (Railway, Fly.io, or Render)

---

## Phase 1 — Python Package (`packages/py-fidel-tools`)

### Build System ✅ COMPLETE
- ✅ `pyproject.toml` — maturin build, `fidel-tools` v0.1.9, Python ≥3.8, MIT license
- ✅ Rust native extension via PyO3 (`fidel_tools_core_native.abi3.so`, 478KB prebuilt)
- ✅ Zero Python runtime dependencies

### NLP Operations — All 10 Ported ✅ COMPLETE
- ✅ `normalize(text, pack)` — char_map, labialized_map, gemination collapse (with Rust-accelerated path)
- ✅ `sentence_tokenize(text, pack)` — configurable sentence boundaries
- ✅ `stem(word, pack)` — full affix-removal stemmer (prefix/suffix/infix + CCV check)
- ✅ `remove_stopwords(corpus, pack)` — regex-based with morphological prefix/suffix awareness
- ✅ `lex_analyze(corpus, pack)` — exception expansion, punctuation/number stripping
- ✅ `felig_transliterate(word, lang, pack)` — Felig scheme, am↔en
- ✅ `sera_transliterate(word, lang, pack)` — SERA scheme, am↔en
- ✅ `index_documents(docs, pack)` — document-level TF indexing
- ✅ `index_query(query, pack)` — query TF indexing
- ✅ `weigh_terms(index, type_of_index)` — TF-IDF weight calculation
- ✅ All functions have camelCase aliases for JS API symmetry

### Pipeline Class ✅ COMPLETE
- ✅ `Pipeline(pack)` class with dual camelCase/snake_case API
- ✅ All 10 operations available as methods
- ✅ `stopwords` property
- ✅ Automatic Rust-accelerated normalization with graceful Python fallback

### Language Pack
- ✅ `am.json` (63KB) bundled at `fidel_tools/lang_am/am.json`
- ✅ `lang_am.py` loader with `get_amharic_pack()` function
- ✅ Loaded via `pkgutil.get_data()` for proper package resource handling

### Integrations
- ✅ `spacy_tokenizer.py` — spaCy tokenizer integration

### Tests
- ✅ `test_pipeline.py` — 91 lines covering normalization (char_map, labialized, gemination), sentence tokenization, stemming, stopword removal, lexical analysis, indexing + weighting, spaCy integration
- [ ] Transliteration tests (SERA/Felig) — zero test coverage
- [ ] Edge case tests (empty strings, malformed input, missing pack keys)

### Publishing ✅ COMPLETE
- ✅ Published to PyPI as `fidel-tools` v0.1.9
- ✅ Multi-platform wheels (Linux x86_64/aarch64, macOS universal2, Windows x86_64)

### Code Quality Gaps
- [ ] No `__all__` export list in `__init__.py`
- [ ] No type hints file (`py.typed` marker or `.pyi` stubs)
- ⚠️ Prebuilt `.so` file committed to repo (478KB binary — normally built by CI only)
- ⚠️ `spacy_tokenizer.py` imports from `.__init__` (circular import pattern — works but fragile)

---

## Phase 1 — Database Package (`packages/db`)

> **NOTE:** This package was not mentioned in the previous checklist.

- ✅ `@fidel-tools/db` v0.1.9 (private, not published)
- ✅ Drizzle ORM with `drizzle-kit` for migrations
- ✅ PostgreSQL via `@neondatabase/serverless` (Neon)
- ✅ Better Auth integration
- ✅ Schema tables: `users` (with tier/quota), `sessions`, `accounts`, `verifications`, `apiKeys`, `refreshTokens`, `usageLogs`, `usageAggregates`
- ✅ Migration support (`migrations/` directory, `drizzle.config.ts`)

---

## Phase 1 — Pack Validation Tool (`@fidel-tools/validate-pack`)

- ✅ `packages/validate-pack/` — v0.1.9, published to npm
- ✅ CLI binary: `validate-pack` → `./dist/bin.js`
- ✅ CLI usage: `npx @fidel-tools/validate-pack ./am.json` (also supports `--fix` flag)
- ✅ Checks: duplicate stopwords, empty abbreviation values, empty-key transliteration, char_map cycles, required fields
- ✅ Smoke test: instantiate `Pipeline` with the pack, run sample text through all components

---

## Phase 2 — Stabilization & Quality

### Schema & Type Alignment ✅ COMPLETE
- ✅ `types.ts` in core matches `am.json` schema:
  - ✅ `stemmer.prefixes: string[]` and `stemmer.suffixes: string[]` (arrays, not pipe strings)
  - ✅ `stemmer.protected_words: string[]`
  - ✅ `normalization.char_map`, `normalization.labialized_map`, `normalization.gemination_threshold`
  - ✅ `tokenization.split_on_spaces`, `tokenization.sentence_boundaries`, `tokenization.punctuation`, `tokenization.exceptions`
  - ✅ `transliteration.sera.scheme` + `transliteration.sera.map` (nested)
  - ✅ `transliteration.felig.scheme` + `transliteration.felig.map` (nested)
  - ✅ `numbers.ethiopic_to_arabic`
- ✅ `stemmer.ts` uses `pack.stemmer.prefixes` and `pack.stemmer.suffixes` arrays directly
- ✅ `transliterator.ts` reads from `pack.transliteration.felig.map` and `pack.transliteration.sera.map`

### New Pipeline Components ✅ COMPLETE
- ✅ `normalizer.ts` — applies `pack.normalization.char_map` and `pack.normalization.labialized_map`
- ✅ `sentence_tokenizer.ts` — splits on `pack.tokenization.sentence_boundaries`
- ✅ Wire `Normalizer` into `Pipeline` class as first step
- ✅ Wire `SentenceTokenizer` into `Pipeline` class
- ✅ `Pipeline.normalize(text)` and `Pipeline.sentenceTokenize(text)` methods

### Language Pack Quality ✅ COMPLETE
- ✅ Stopword list expanded to 400+ entries
- ✅ Duplicate stopwords fixed
- ✅ Abbreviation list expanded to 100+
- ✅ `protected_words` added to stemmer
- ✅ Labialized sequence coverage complete
- ✅ Gemination normalization logic implemented

### Pack Validation Tool ✅ COMPLETE
- ✅ `packages/validate-pack/` — published to npm
- ✅ JSON schema validation (robust schema/type validations)
- ✅ CLI with `--fix` flag
- ✅ All checks implemented
- ✅ Smoke test integration

### API Authentication ✅ COMPLETE
- ✅ API key generation and storage (SHA-256 hashed, `api_keys` table)
- ✅ Auth middleware for Hono — validates JWT Bearer token or `x-passkey`/`x-passphrase` headers
- ✅ Rate limiting per key per tier (demo: 2/hr, standard: 60/15min, global: 150/15min)
- ✅ Token exchange endpoint (`POST /auth/token`)
- ✅ Usage tracking per key (endpoint, method, status, latency, tokens processed)

### Remaining Quality Gaps
- [ ] Fix `usage_logs` table missing from `initDb()` in `apps/api/src/db.ts`
- [ ] Move hardcoded secrets to environment variables only (remove fallback strings)
- [ ] Add missing test files: `normalizer.test.js`, `sentence_tokenizer.test.js`, `term_weighter.test.js`
- [ ] Add Python transliteration tests
- [ ] Add lint/format step to CI (biome.json exists but isn't used)
- [ ] Add `py.typed` marker and `.pyi` stubs for Python package
- [ ] Remove prebuilt `.so` from Python package source tree (should be CI-built only)

---

## Phase 3 — Go To Market

### Documentation (`docs/`)
- ✅ `docs/fidel-architecture.md` (16KB) — detailed architecture document
- ✅ `docs/spacy-vs-fidel-architecture.md` (21KB) — comparison analysis
- ✅ `docs/fidel-dev-checklist.md` (this file)
- ⚠️ `docs/README.md` — placeholder only (23 lines, describes planned structure)
- [ ] Choose docs framework (Starlight/Astro recommended)
- [ ] Getting started guide (npm install, first Pipeline usage)
- [ ] API reference for all `Pipeline` methods
- [ ] REST API reference with curl examples
- [ ] Language pack format spec
- [ ] "How to contribute a language pack" guide
- [ ] Migration guide from `felig-toolkit` v1 to `@fidel-tools/core` v2
- [ ] Python SDK docs
- [ ] Deploy to `docs.fidel.tools` or as subdirectory of main site

### Landing Page & Marketing ✅ MOSTLY COMPLETE
- ✅ Landing page with hero, interactive playground, features, benchmark summary
- ✅ Interactive `<LandingPlayground />` with 6 live tabs on landing page
- ✅ "Start Building Free" and "Open Developer Console" CTAs
- ✅ Packages page with SDK overview
- ✅ Benchmarks page (65KB, very detailed)
- ✅ Changelog page
- ✅ Code examples visible on landing page
- ⚠️ Enterprise page — content exists but behind `UnderConstructionOverlay`
- ⚠️ Infrastructure page — has pricing content but behind `UnderConstructionOverlay`
- [ ] Remove `UnderConstructionOverlay` from Enterprise and Infrastructure pages
- [ ] Testimonials / social proof section
- [ ] Footer with npm, PyPI links (currently just copyright + GitHub)

### Publishing ✅ MOSTLY COMPLETE
- ✅ `@fidel-tools/core` published to npm (v0.1.9)
- ✅ `@fidel-tools/core-native` published to npm (v0.1.9)
- ✅ `@fidel-tools/lang-am` published to npm (v0.1.9)
- ✅ `@fidel-tools/validate-pack` published to npm (v0.1.9)
- ✅ `fidel-tools` published to PyPI (v0.1.9)
- [ ] Deploy REST API to live URL
- [ ] Deploy docs site
- [ ] Announce on dev.to / Hacker News / Ethiopian tech communities / Twitter/X

---

## Phase 4 — Multi-Language & Extensibility

### Script Adapter Layer
- [ ] `packages/script-ethiopic/` — `EthiopicScriptAdapter` class
  - [ ] `isLetter(char)`, `isPunctuation(char)`, `isEthiopic(char)`
  - [ ] Unicode block range detection (U+1200–U+137F)
  - [ ] Unicode normalization (NFC)
  - [ ] Syllabary-aware character splitting
- [ ] `packages/script-latin/` — `LatinScriptAdapter` (for Oromo/Afaan written in Latin)
- [ ] Wire script adapter into `Pipeline` constructor (auto-selected from `pack.meta.script`)

### Tigrinya (`@fidel-tools/lang-ti`)
- [ ] `packages/lang-ti/ti.json` — stopwords, affixes, transliteration map
- [ ] Validate with `@fidel-tools/validate-pack`
- [ ] Publish `@fidel-tools/lang-ti` to npm
- [ ] Add Tigrinya tests to CI

### Oromo (`@fidel-tools/lang-om`)
- [ ] `packages/lang-om/om.json` — uses Latin script, different adapter
- [ ] Validate and publish
- [ ] Add to CI

### Community Language Pack Ecosystem
- [ ] Publish JSON schema for language packs at `schema.fidel.tools`
- [ ] GitHub issue template: "Submit a language pack"
- [ ] `awesome-fidel-tools` community registry (markdown list of community packs)

---

## Phase 5 — Intelligence Layer (ML Features)

### Sentiment Analysis
- [ ] Source or build Amharic sentiment lexicon (positive/negative scored word list)
- [ ] `packages/core/src/sentiment.ts` — lexicon-based scorer
- [ ] `pack.sentiment.lexicon` field consumed by the sentiment component
- [ ] Add `POST /sentiment` to REST API
- [ ] Add Sentiment tab to web demo console
- [ ] Sentiment tests

### Named Entity Recognition (NER) — Rule-Based
- [ ] Curate Amharic name lists: Ethiopian cities, common personal names, major organizations
- [ ] `packages/core/src/ner.ts` — rule-based NER using name lists from `pack.ner.name_lists`
- [ ] `pack.ner.name_lists` field consumed by NER component
- [ ] Add `POST /ner` to REST API
- [ ] Add NER tab to web demo console
- [ ] NER tests

### Number Normalization
- [ ] `packages/core/src/number_normalizer.ts`
- [ ] Wire into Pipeline as optional step
- [ ] Tests

### ML Models (Long Term)
- [ ] Collect and annotate Amharic sentiment training dataset (500+ labeled sentences minimum)
- [ ] Train lightweight sentiment classifier (distilBERT fine-tuned or fastText)
- [ ] Package as `@fidel-tools/models-am-sentiment`
- [ ] Collect and annotate NER training data
- [ ] Train NER model
- [ ] Package as `@fidel-tools/models-am-ner`
- [ ] POS tagger (requires annotated treebank — research partnership needed)
- [ ] Morphological analyzer (research-level, requires morpheme dictionary)

---

## Phase 6 — Platform & Monetization

### Developer Platform
- ✅ Auth system — sign up / sign in (Better Auth, fully implemented in web app)
- ✅ Dashboard — API key management, usage charts (implemented in web app)
- ✅ API key creation (implemented in dashboard + API)
- ✅ Usage analytics per key (usage logging middleware + dashboard page)
- [ ] API key rotation and deletion (from dashboard UI)
- [ ] Upgrade/downgrade plan flow
- [ ] Billing integration (Chapa, Telebirr, Stripe, or similar)
  - [ ] Free tier (1k calls/month, no card required)
  - [ ] Starter $19/month (100k calls/month)
  - [ ] Growth $79/month (1M calls/month)
  - [ ] Enterprise (custom, contact form)
- [ ] Webhook support for async/batch jobs
- [ ] Batch API endpoint `POST /batch` (array of texts, returns array of results)

### Enterprise Features
- [ ] Self-hosted Docker image documentation (Dockerfile already exists)
- [ ] SLA documentation
- [ ] On-premise deployment guide
- [ ] Custom language pack support (enterprise customers can upload private packs)
- [ ] Priority support channel

### Outreach
- [ ] Submit to Lacuna Fund (low-resource language NLP grants)
- [ ] Submit to Mozilla Technology Fund
- [ ] Reach out to Addis Ababa University NLP research group
- [ ] Post on Ethiopian developer communities (ET dev Discord, Telegram groups)
- [ ] Publish introductory blog post on dev.to
- [ ] Submit `@fidel-tools/core` to Awesome NLP lists on GitHub
- [ ] Academic paper or technical report (citable reference for researchers)

---

## Summary — Where Things Stand Right Now

```
Phase 0 — Foundation           █████████░  90%  (missing LICENSE file, CHANGELOG stub, no deploy workflow)
Phase 1 — Core Library         █████████░  95%  (3 missing test files: normalizer, sentence_tokenizer, term_weighter)
Phase 1 — Core Native (Rust)   ██████████ 100%  (WASM + PyO3 dual-target, published)
Phase 1 — lang-am Pack         ██████████ 100%  (63KB, fully expanded, published)
Phase 1 — Web App              █████████░  92%  (enterprise/infrastructure pages under construction)
Phase 1 — Interactive Lab      ██████████ 100%  (14 dev tools + 11 puzzle games)
Phase 1 — REST API             █████████░  90%  (20 endpoints, usage_logs table bug, not deployed)
Phase 1 — Python Package       █████████░  90%  (all ops ported, missing transliteration tests + type stubs)
Phase 1 — Database Package     ██████████ 100%  (Drizzle + Neon, full schema)
Phase 1 — Validate Pack        ██████████ 100%  (CLI + --fix, published)
Phase 2 — Stabilization        █████████░  90%  (schema aligned, auth done, minor quality gaps remain)
Phase 3 — Go To Market         ██████░░░░  55%  (all published, landing done, docs site not built, API not deployed)
Phase 4 — Multi-Language       ░░░░░░░░░░   0%
Phase 5 — ML Features          ░░░░░░░░░░   0%
Phase 6 — Platform             ███░░░░░░░  25%  (auth + dashboard built, no billing/plans)
```

### Immediate Action Items (Highest Impact)

1. **Fix `usage_logs` table bug** — add `CREATE TABLE IF NOT EXISTS usage_logs` to `initDb()` in `apps/api/src/db.ts`
2. **Add `LICENSE` file** — create MIT license file at repo root
3. **Fill out `CHANGELOG.md`** — add actual version history entries
4. **Write missing tests** — `normalizer.test.js`, `sentence_tokenizer.test.js`, `term_weighter.test.js`, Python transliteration tests
5. **Deploy REST API** — get API live on Railway/Fly.io/Render
6. **Remove `UnderConstructionOverlay`** — finish Enterprise and Infrastructure pages
7. **Build docs site** — Starlight/Astro, deploy to `docs.fidel.tools`
8. **Add lint to CI** — wire `biome check` into `test.yml`
