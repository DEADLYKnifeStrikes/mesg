# mesg

## Deploying / Building on Railway (API)

### Important: avoid double-installing dependencies

This repo uses npm workspaces. Railway (or any CI) should **install once at the repository root** and then run the API build/start scripts from the root.

Running a second `npm ci` inside `packages/api` will:
- waste build time
- risk creating a nested `node_modules` that conflicts with workspace resolution

### Database Migrations

Prisma migrations are committed to the repository in `packages/api/prisma/migrations/` and will be automatically applied during deployment using `prisma migrate deploy`.

**Creating new migrations:**
```sh
cd packages/api
npx prisma migrate dev --name your_migration_description
```

This will:
1. Create a new migration file in `packages/api/prisma/migrations/`
2. Apply the migration to your local database
3. Update the Prisma client

After creating a migration, commit it to the repository:
```sh
git add packages/api/prisma/migrations
git commit -m "Add migration: your_migration_description"
```

On Railway deployment, migrations are applied automatically via the start command: `npx prisma migrate deploy`

### Recommended Railway commands

Set the Railway **Root Directory** to the repository root.

**Install Command**
```sh
npm ci
```

**Build Command**
```sh
npm run -w packages/api build
```

**Start Command**
```sh
npm run -w packages/api start
```

If your API uses a different script name (e.g. `dev`), adjust accordingly.
