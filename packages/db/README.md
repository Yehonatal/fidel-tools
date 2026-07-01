# @fidel-tools/db

<p align="center">
  The database schema and connection client for Fidel Tools platform services.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-private-red.svg" alt="Private Package" />
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/maintained%20with-pnpm-ff69b4.svg" alt="pnpm" /></a>
</p>

---

## Overview

`@fidel-tools/db` is a private, internal package that houses the database schema configurations and client interfaces for Fidel Tools. It uses Drizzle ORM to define relational tables and connects to PostgreSQL databases via Neon's serverless client driver. It also integrates schema representations for Better Auth.

---

## Features

- **Neon Postgres Client**: Exports database connector configuration using `@neondatabase/serverless` pools.
- **Relational Drizzle Schema**: Maps standard Postgres tables for users, API keys, sessions, and platform usage metrics.
- **Better Auth Integration**: Houses compliant schemas (users, sessions, accounts, verifications) compatible with Better Auth.
- **Migrations & CLI Control**: Integrated with `drizzle-kit` to easily generate migrations, apply them, and access the database visually using Drizzle Studio.

---

## Configuration

Ensure you have the following environment variables configured:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

---

## Scripts & CLI Commands

You can run these commands from the package directory:

```bash
# Generate migrations from schema changes
pnpm run generate

# Apply migrations to the database
pnpm run migrate

# Open database visualizer console
pnpm run studio
```

---

## API Reference

### Database client
- `db`: Drizzle Postgres database client instance.

### Tables
- `users`: User profiles with tiers (free, pro, enterprise) and monthly quotas.
- `sessions`: Authentication session store.
- `accounts`: Federated OAuth credentials mapping.
- `verifications`: Token verify entries.
- `apiKeys`: Platform API keys with active/revoked statuses and usage tracking.
- `usageLogs`: Logging endpoints hits for accounting and limiting.

---

## License

Private and proprietary. Part of the [Fidel Tools](https://github.com/Yehonatal/fidel-tools) platform. All rights reserved.
