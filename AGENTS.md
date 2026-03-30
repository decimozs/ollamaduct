# AGENTS PLAYBOOK

Purpose-built briefing for any autonomous agent contributing to the Ollamaduct gateway. Follow every section; collective behavior stays consistent only when each rule here is observed literally.

## Repository Orientation

- Runtime: Bun 1.0+, Node.js 18+ for auxiliary tooling.
- Language: TypeScript (ESNext target, strict compiler, bundler-style module resolution).
- Entry points: `src/index.ts` (HTTP gateway), `src/server.ts` (standalone server), `src/cli/index.ts` (CLI), `src/db` (migrations + seeds).
- Path alias: `@/*` resolves to `src/*`; prefer during deep imports.
- Database: SQLite stored in `~/.ollamaduct/ollamaduct.db` (platform-aware via `src/config.ts`), accessed via `bun:sqlite` SQL template literals in `src/db/index.ts`.

## Toolchain Commands

- `bun install` — sync dependencies after pulling new code.
- `bun run dev` — start the Hono server with hot reload on `http://localhost:3000`.
- `bun run build` — bundle `src/index.ts` into `dist/`.
- `bun run build:server` — bundle standalone server.
- `bun run build:cli` — bundle CLI entry point.
- `bun run build:all` — build all targets.
- `bun run migrate` / `bun run seed` — manage schema and fixtures.
- `bun run cli <command>` — invoke gateway CLI utilities.
- `bun test` — execute entire test suite.

## Focused Test Execution

- Run a single file: `bun test src/lib/vector-store.test.ts`.
- Use watch mode: `bun test --watch`.
- Prefer colocated test files suffixed with `.test.ts`.
- Tests should avoid hitting real Ollama endpoints; use in-memory fakes or dependency injection.

## Quality Gates

- `bun run lint` — Biome lint rules, double-quoted strings, tab indentation.
- `bun run format` — Biome autoformatter.
- `bun run typecheck` — strict `tsc --noEmit`.

## Formatting Expectations

- Tabs for indentation; Biome enforces this.
- Double quotes in TypeScript/JavaScript.
- Max line length ~100-110 chars.
- Trailing commas optional but preferred in multi-line objects/arrays.

## Import Discipline

- Order: external packages first, alias-based imports, relative imports last.
- Prefer type-only imports via `import type { Foo } from "./types";`.
- Never use default exports unless the pattern is established (e.g., `export default app` in `src/index.ts`).
- Never use `require`; repository runs in ESM mode.
- Use `@/*` alias for cross-cutting utilities.

## TypeScript Practices

- Strict mode is on: no `any` or implicit `any`.
- Reuse shared interfaces from `src/types.ts`.
- Favor readonly objects for configuration constants.
- Use `as const` sparingly.
- Avoid non-null assertions (`!`) unless there is a preceding guard.

## Naming Conventions

- Files: kebab-case for directories, PascalCase for interfaces/types.
- Variables/functions: descriptive camelCase; booleans should read as predicates (`isStreaming`, `cacheEnabled`).
- Async functions should end in a verb (e.g., `logUsageStats`, `searchCache`).
- Database tables use snake_case.
- Environment variables: FULL_CAPS with underscores.

## Error Handling & Logging

- Wrap network/database interactions in `try/catch`.
- Propagate user-facing errors as JSON with appropriate HTTP status codes.
- Normalize error payloads `{ error: string }` for HTTP responses.
- Log PII detection events only via sanitized metadata.

## Middleware & Privacy Discipline

- Route request bodies through `sanitizeRequest` before caching or forwarding.
- Respect `x-pii-mode`, `x-pii-audit`, `x-pii-response` headers.
- PII replacements use tokens defined in `PII_CONFIG.replacements`.
- Sanitize responses only when the client opts in.

## Semantic Cache Guidance

- Always compute embeddings with `generateEmbedding` before writing to `semantic_cache`.
- Keep `SIMILARITY_THRESHOLD` consistent (currently 0.05).
- Cache writes should be best-effort; log failures without failing requests.

## Database Notes

- Use `db\`...\`` tagged template from `bun:sqlite`.
- Timestamps stored as `Date.now()` numbers (ms).
- Migration scripts in `src/db/migrate.ts`.
- Seeds in `src/db/seed.ts`.

## API & Middleware Expectations

- HTTP server is a Hono app; build routes via `createApp()` from `src/utils.ts`.
- Attach `authMiddleware` to routes touching workspace data.
- Streaming endpoints return `application/x-ndjson`.
- Always capture latency for usage metrics.

## CLI Development

- Commands under `src/cli/commands/`.
- Share utilities via `src/cli/utils/`.
- Each CLI command should offer `--help` and input validation.
- Use consistent command verbs (`--create`, `--delete`, `--list`).

## CLI Commands

- `ollamaduct init` — First-time setup
- `ollamaduct start [--port N] [--detach]` — Start server
- `ollamaduct stop` — Stop server
- `ollamaduct status` — Check server status
- `ollamaduct check` — Check for updates
- `ollamaduct upgrade` — Upgrade to latest version
- `ollamaduct keys` — Manage API keys
- `ollamaduct workspaces` — Manage workspaces
- `ollamaduct models` — List available models
- `ollamaduct logs` — View usage logs
- `ollamaduct stats` — View statistics
- `ollamaduct cache` — Cache management

## Performance Mindset

- Use streaming responses for long-running chats.
- Defer non-critical logging via `executionCtx.waitUntil`.
- Beware of blocking synchronous crypto or file IO.

## Testing Philosophy

- Unit tests should cover sanitization edge cases, cache matching, and auth failures.
- Mock Ollama dependencies by stubbing rather than calling real service.
- Database tests should operate on temporary SQLite files.

## Documentation Updates

- When adding new endpoints/headers, update `docs/API_REFERENCE.md` and `docs/CLI_COMMANDS.md`.
- Keep `docs/CONTRIBUTING.md` aligned with script names.
- This `AGENTS.md` must evolve with new conventions.

## Pull Request Checklist

- Code compiles (`bun run build:all`).
- Lint + format clean (`bun run lint`, `bun run format`).
- Types tight (`bun run typecheck`).
- Documentation updated.

## Publishing

- Package name: `@ollamaduct/gateway`
- npm publishing via GitHub Actions on release (not on every push).
- Wrapper scripts: `cli` (Linux/Mac), `cli.cmd` (Windows).
- Build outputs: `dist/index.js`, `dist/server.js`, `dist/cli.js`.

## Operational Tips

- Keep `.env` secrets local; never commit them.
- Use `.env.example` to document new variables.
- Treat privacy features as must-pass.
- Consistency outweighs cleverness; match the surrounding code.
