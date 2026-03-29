# AGENTS PLAYBOOK
Purpose-built briefing for any autonomous agent contributing to the Ollamaduct gateway. Follow every section; collective behavior stays consistent only when each rule here is observed literally.

## Repository Orientation
- Runtime: Bun 1.0+, Node.js 18+ for auxiliary tooling.
- Language: TypeScript (ESNext target, strict compiler, bundler-style module resolution).
- Entry points: `src/index.ts` (HTTP gateway), `src/cli/index.ts` (CLI), `src/db` (migrations + seeds), `src/lib/pii` (privacy shield), `src/lib/vector-store.ts` (semantic cache).
- Path alias: `@/*` resolves to `src/*`; prefer during deep imports.
- Database: SQLite stored in `pathway.db`, accessed via `bun:sqlite` SQL template literals in `src/db/index.ts`.

## Toolchain Commands
- `bun install` — sync dependencies after pulling new code.
- `bun run dev` — start the Hono server with hot reload on `http://localhost:3000`.
- `bun run build` — bundle `src/index.ts` into `dist/` (target bun runtime); run before packaging or deployments.
- `bun run migrate` / `bun run seed` — manage schema and fixtures; expect to run before features touching persistence.
- `bun run cli <command>` — invoke gateway CLI utilities (see docs/CLI_COMMANDS.md for subcommands and flags).
- `bun test` — execute entire test suite; implicitly uses Bun’s built-in test runner.

## Focused Test Execution
- Run a single file: `bun test src/lib/vector-store.test.ts` (replace path with the actual file).
- Use multiple filters by passing additional file globs: `bun test src/lib/pii/*.test.ts`.
- Enable watch mode while iterating: `bun test --watch` (can also limit scope: `bun test --watch src/foo.test.ts`).
- Prefer colocated test files suffixed with `.test.ts`; keep them adjacent to implementation for discovery.
- Tests should avoid hitting real Ollama endpoints; use in-memory fakes or dependency injection.

## Quality Gates
- `bun run lint` — Biome lint rules, double-quoted strings, tab indentation, recommended rule-set.
- `bun run format` — Biome autoformatter; safe to run before every commit.
- `bun run typecheck` — strict `tsc --noEmit` to ensure bundle-safe typings.
- Combine quickly with `bun run lint && bun run typecheck && bun test` before submitting PRs.
- No Cursor or Copilot rules exist in this repo as of this document; treat this file as the authoritative contract.

## Formatting Expectations
- Tabs for indentation; Biome enforces this, so avoid spaces unless inside template literals.
- Double quotes in TypeScript/JavaScript; single quotes only inside template literals when semantically required.
- Keep max line length readable (~100-110 chars); break chained calls and object literals across lines similar to `src/index.ts`.
- Trailing commas optional but prefer them in multi-line objects/arrays to preserve diff stability.
- Maintain blank lines between logical sections (imports > constants > functions > exports) mirroring existing files.

## Import Discipline
- Order: external packages first, alias-based or absolute imports next, relative imports last; rely on Biome `organizeImports` action to settle final ordering.
- Prefer type-only imports via `import type { Foo } from "./types";` when the symbol is purely structural; this aligns with `verbatimModuleSyntax`.
- Never use default exports when a module already exposes named ones unless the pattern is established (e.g., `export default app` in `src/index.ts` is intentional and should remain).
- Do not use `require`; repository runs in ESM mode.
- Use the `@/*` alias for cross-cutting utilities to avoid brittle `../../..` paths.

## TypeScript Practices
- Strict mode is on: no `any` or implicit `any`. If a type cannot be known, create a discriminated union or interface inside `src/types.ts`.
- Reuse shared interfaces such as `OllamaRequest`, `UsageStats`, and `SanitizationResult` instead of redefining local shapes.
- Favor readonly objects for configuration constants (e.g., `PII_CONFIG`) to prevent accidental mutation.
- Use `as const` sparingly to lock literal unions when actual narrowing is required.
- Avoid non-null assertions (`!`) unless there is a preceding guard; prefer early returns.

## Naming Conventions
- Files: kebab-case for directories (`lib/vector-store.ts`), but keep PascalCase for TypeScript interfaces and types.
- Variables and functions: descriptive camelCase (`sanitizeRequest`, `cacheEnabled`); booleans should read as predicates (`isStreaming`, `cacheEnabled`).
- Async functions must end in a verb clue (e.g., `logUsageStats`, `searchCache`).
- Database tables use snake_case (see SQL queries inside template literals); align with existing schema when adding columns.
- Environment variables should be FULL_CAPS with underscores (`OLLAMA_URL`, `DEFAULT_MODEL`).

## Error Handling & Logging
- Wrap network/database interactions in `try/catch`; log errors through `console.error` or `LogLayer` depending on scope.
- Propagate user-facing errors as JSON with appropriate HTTP status codes (`401` for auth issues, `502` downstream failure) following `src/index.ts` examples.
- Avoid swallowing errors silently; if ignoring is necessary, leave a short comment `// Ignore` to signal intent, as seen near `executionCtx.waitUntil`.
- Normalize error payloads `{ error: string }` for HTTP responses.
- Log PII detection events only via sanitized metadata (`redactions.byEntity` counts) to prevent leaking content.

## Middleware & Privacy Discipline
- Whenever handling request bodies destined for LLMs, route through `sanitizeRequest` before any caching or forwarding.
- Respect `x-pii-mode`, `x-pii-audit`, and `x-pii-response` headers; default behaviors live in `PII_CONFIG`.
- PII replacements must use tokens defined in `PII_CONFIG.replacements`; extend that object rather than hardcoding new placeholders.
- If you add new detection patterns, convert them into regex-safe `customPatterns` entries with explicit `entityType` and optional `score`.
- Sanitize responses only when the client opts in; never redact by default to avoid surprising downstream consumers.

## Semantic Cache Guidance
- Always compute embeddings with `generateEmbedding` before writing to `semantic_cache` to keep similarity search meaningful.
- Keep `SIMILARITY_THRESHOLD` semantics consistent (currently 0.05 for near-duplicate matches); discuss changes in PRs.
- Purge expired items via `cleanupExpiredCache` after schema changes touching cache behavior.
- Avoid synchronous blocking loops; `searchCache` already initializes the in-memory map lazily.
- Cache writes should be best-effort; enclose `upsertCache` calls in `try/catch` and log failures without failing requests.

## Database Notes
- Use `db\`...\`` tagged template from `bun:sqlite`; parameterize inputs with `${value}` placeholders to avoid injection.
- Timestamps are stored as `Date.now()` numbers (ms). Maintain this convention for new tables.
- Migration scripts live in `src/db/migrate.ts`; implement schema evolution there and document assumptions in the script comments if non-trivial.
- Seeds belong in `src/db/seed.ts`; keep realistic sample data to exercise cache and analytics flows.
- Avoid coupling migrations to runtime-only config; keep them deterministic.

## API & Middleware Expectations
- HTTP server is a Hono app; build new routes via `createApp()` from `src/utils.ts` to inherit typed bindings.
- Attach `authMiddleware` to every route that touches workspace data; unauthorized requests must short-circuit early.
- Response headers should include cache and PII metadata as shown in `/api/chat` to aid observability.
- Streaming endpoints should return `application/x-ndjson` and flush partial responses via `ReadableStream`.
- Always capture latency to log usage metrics (`logUsageStats` requires tokens + latency values).

## CLI Development
- Commands belong under `src/cli/commands/`; share helper utilities via `src/cli/utils/`.
- Each CLI command should offer `--help` text and input validation; prefer descriptive errors over silent failures.
- Favor consistent command verbs (`--create`, `--delete`, `--list`) to match existing CLI documentation.
- When commands hit the database, reuse the same SQL helpers from `src/db/index.ts`.
- Keep CLI output JSON-friendly or tabular ASCII; ensure commands exit with non-zero codes on failure.

## Performance Mindset
- Use streaming responses for long-running chats whenever practical; fallback to buffered responses only when the client disables streaming.
- Defer non-critical logging work via `executionCtx.waitUntil` or background promises so HTTP responses stay snappy.
- Memoize embeddings or expensive computations per request when feasible; avoid repeated calls in loops.
- Beware of blocking synchronous crypto or file IO in hot paths; prefer async APIs.
- Profile cache hit rates and adjust `SIMILARITY_THRESHOLD` only with supporting metrics.

## Testing Philosophy
- Unit tests should cover sanitization edge cases, cache matching thresholds, and auth failure paths.
- Mock Ollama dependencies by stubbing `Ollama.chat` and `Ollama.list` rather than calling the real service.
- Verify streaming handlers by testing their generator logic; use Bun’s `ReadableStream` utilities for assertions.
- Database tests should operate on temporary SQLite files or in-memory DBs to keep runs isolated.
- Always run `bun test` locally before pushing; CI assumes the suite passes without further setup.

## Documentation Updates
- When adding new endpoints or headers, update `docs/API_REFERENCE.md` and mention any new CLI surface area in `docs/CLI_COMMANDS.md`.
- Keep `docs/CONTRIBUTING.md` aligned with script names if you rename or add ones.
- This `AGENTS.md` must evolve with new conventions; extend relevant sections instead of appending contradictory notes.
- Mention any fresh external dependencies with a short justification to help audit supply chain.
- If adding Cursor/Copilot rules later, reference them explicitly in a dedicated section right after “Quality Gates.”

## Pull Request Checklist
- Code compiles (`bun run build`).
- Tests pass (`bun test` or targeted subset instructions above).
- Lint + format clean (`bun run lint`, `bun run format`).
- Types tight (`bun run typecheck`).
- Documentation updated (README and docs/* as necessary) alongside this file when conventions shift.

## Operational Tips
- Keep `.env` secrets local; never commit them. Use `.env.example` to document new vars.
- Respect feature flags or headers introduced for enterprise customers; default to backwards-compatible behavior.
- Align logging structure with LogLayer configuration so downstream aggregators stay parseable.
- Prefer dependency-free solutions when possible; every new package increases cold-start time.
- Treat privacy features as must-pass; never bypass sanitization for speed.

## Final Word
- Consistency outweighs cleverness; match the surrounding code even if you would normally structure it differently.
- Leave concise comments only when the intent is non-obvious or behavior is surprising.
- Assume future agents will read your diffs without additional context; clarity wins.
- When in doubt, open an issue or document rationale directly in the PR description.
- Welcome aboard, agent. Execute responsibly.
