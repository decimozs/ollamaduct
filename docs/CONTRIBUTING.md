# Contributing

Thank you for your interest in contributing to Ollamaduct!

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- Node.js 18+ (for some tools)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/ollamaduct/ollamaduct.git
cd ollamaduct/gateway

# Install dependencies
bun install

# Copy environment template
cp .env.example .env
```

### Initialize Database

```bash
# Run migrations
bun run migrate

# (Optional) Seed with sample data
bun run seed
```

### Start Development Server

```bash
# Start with hot reload
bun run dev
```

Server runs at `http://localhost:3000`

## Available Scripts

```bash
# Development
bun run dev              # Start with hot reload

# Testing
bun test                 # Run tests
bun test --watch         # Watch mode

# Code Quality
bun run lint             # Check for issues
bun run format           # Auto-format code
bun run typecheck        # TypeScript check

# Build
bun run build            # Production build

# Database
bun run migrate          # Run migrations
bun run seed             # Seed database

# CLI
bun run cli <command>   # Run CLI commands
```

## Code Style

We use [Biome](https://biomejs.dev) for formatting and linting:

```bash
# Format code
bun run format

# Check for issues
bun run lint
```

### TypeScript

All code should be TypeScript with strict type checking. Run typecheck before submitting:

```bash
bun run typecheck
```

## Project Structure

```
gateway/
├── src/
│   ├── cli/                 # CLI commands
│   │   ├── index.ts         # CLI entry point
│   │   └── commands/       # Command implementations
│   ├── db/                  # Database layer
│   │   ├── index.ts        # Database connection
│   │   ├── migrate.ts      # Migrations
│   │   └── seed.ts         # Seed data
│   ├── lib/
│   │   ├── pii/             # PII detection
│   │   ├── embedding.ts     # ML embeddings
│   │   └── vector-store.ts # Semantic cache
│   ├── middleware/
│   │   ├── auth.ts         # Authentication
│   │   └── sanitize.ts     # PII sanitization
│   ├── config.ts           # Configuration
│   ├── index.ts            # Main server
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utilities
├── docs/                   # Documentation
├── package.json
└── tsconfig.json
```

## Making Changes

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** your changes
5. **Format** and **lint** the code
6. **Commit** your changes (`git commit -m 'Add amazing feature'`)
7. **Push** to the branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

## Testing

Write tests for new features and bug fixes:

```bash
# Run all tests
bun test

# Run specific test file
bun test path/to/test.ts

# Watch mode
bun test --watch
```

## Reporting Issues

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Bun version, etc.)
- Relevant logs or error messages

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use case and motivation
- Potential implementation approach
- Any relevant research or examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
