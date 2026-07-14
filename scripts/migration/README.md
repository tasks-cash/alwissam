# Migration scripts (Phase 2 placeholders)

These scripts will eventually move data from the **legacy PostgreSQL** database
into the **target MongoDB** stack.

| Script | Intent |
|--------|--------|
| `dry-run.ts` | Report what would be migrated without writing |
| `execute.ts` | Run the migration (requires confirmation) |
| `verify.ts` | Compare legacy vs target counts / checksums |

**Status:** not implemented yet. Invoking any script only prints a placeholder message.

## Usage (from repo root)

```bash
pnpm migration:dry-run
pnpm migration:execute
pnpm migration:verify
```

See also `docs/migration/DATA_MIGRATION_PLAN.md` and `.env.target.example`
(`LEGACY_DATABASE_URL`, `MIGRATION_CONFIRM_EXECUTION`, `MIGRATION_VERSION`).
