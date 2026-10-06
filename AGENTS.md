# AGENTS.md

Personal MCP journaling server ("padrisimo") built on the MCP TypeScript SDK v2.

## Commands

```sh
npm start    # run the server on stdio
npm run dev  # wipes db.sqlite, seeds, then launches the MCP inspector
npm run inspect   # inspector with no server pre-wired (fill in the command yourself)
```

`README.md` tells you to run `npm run serve`. **That script does not exist.** Use `npm run dev`.

There is no test suite: `"test": "test"` is a placeholder that does nothing. `typescript` is not a dependency, so `npx tsc` pulls the unrelated deprecated `tsc@2.0.4` package instead of the compiler. To typecheck, install `typescript` first. There is no lint, formatter, or CI.

Verify changes by running the server and exercising it through the inspector.

## Stack

SDK v2 split packages, already in `package.json`:

- `@modelcontextprotocol/server` — `McpServer`, plus `StdioServerTransport` from the `/stdio` subpath
- `@modelcontextprotocol/node` — Node HTTP transport
- zod `^4` (v2 of the SDK requires Zod 4.2+, not Zod 3)

`DatabaseSync` from `node:sqlite` is a Node builtin, not a dependency. It is stable on Node 24 but needs `--experimental-sqlite` on Node 22, so Node 24+ is the safe floor. `package.json` declares no `engines`, so nothing enforces this.

## Import conventions

Use explicit `.ts` extensions in relative imports (`from "./index.ts"`). This is enabled by `allowImportingTsExtensions` in `tsconfig.json`. `tsx` tolerates `.js` specifiers, so a wrong one passes local runs and only breaks under plain `node` or a real compile — do not reintroduce them.

## Architecture

Single server, single process, stdio.

```
src/index.ts     PadrisimoMCP: constructs McpServer, owns db, calls init()
  src/tools.ts       initializeTools()    — 11 registerTool calls
  src/resources.ts   initializeResources() — 1 static resource, 2 ResourceTemplates
  src/db/index.ts    DB class, all SQL + zod parsing
  src/db/schema.ts   zod schemas and the registerTool input shapes
  src/db/migrations.ts  versioned migrations, applied in DB.getInstance
  src/db/seed.ts     standalone seed script
```

Adding a tool means editing `src/tools.ts`. The `initializeTools`/`initializeResources` split is the extension seam; there is no plugin system or file-based autoloading.

### Things that look like bugs but are deliberate

- **`db/` contains no MCP servers.** These are plain library modules with no transport and no `main()`. A `mcp.json` does nothing here, and no "one server per file" arrangement is needed.
- **`src/late/` is dead legacy.** `ping.ts` and `sum.ts` are complete standalone servers, each with its own `McpServer`, `StdioServerTransport`, and self-invoking `main()`. `src/index.ts` never imports them, so they are dead weight. `ping.ts` registers no tools at all. Leave alone unless asked.
- **Dead code in `db/index.ts`** that is kept intentionally: `listEntries()` (its `tagIds` filter is unimplemented, behind a `// TODO`, and silently returns everything), `listTags()` (duplicates `getTags()`), `getEntryTags()` (duplicates the query inside `getEntry()`), and the whole `subscribe()`/`#notifySubscribers()` mechanism (wired into all 7 write paths but **nobody subscribes**, so no notifications ever fire). Do not wire up `subscribe()` without a caller in mind.
- **`ResourceTemplate`s are created with `list: undefined`**, so template discovery is off and there is nothing to notify anyway.

## Gotchas

- **`npm run dev` destroys data.** `seed.ts` does `fs.unlink(process.cwd()/db.sqlite)` then recreates it. Every `dev` run wipes entries. `db.sqlite` is gitignored.
- **`seed.ts` ignores `PADRISIMO_DB_PATH`.** The server honors the env var (`src/index.ts:49`) and falls back to `./db.sqlite`, but the seed hardcodes `path.join(process.cwd(), "db.sqlite")`. Seeding from a different directory targets a different file.
- **`resources.ts:29` registers the tag template under `epicme://tags/{id}`** while the static one uses `padrismo://tags`. The inconsistency is unintentional but load-bearing for nothing yet.
- **Timestamps are seconds, not ms.** `schema.ts` divides `Date.getTime()` by 1000 and SQLite `CURRENT_TIMESTAMP` is seconds.
- **`src/index.ts` calls `main()` at module scope**, so importing this file for anything else boots a server.