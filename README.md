# mesg

## Deploying / Building on Railway (API)

### Important: avoid double-installing dependencies

This repo uses **npm workspaces**. Railway (or any CI) should **install once at the repository root** and then run the API build/start scripts from the root using workspace-aware commands.

Running a second `npm ci` or `npm install` inside `packages/api` or `packages/web` will:
- waste build time
- risk creating nested `node_modules` that conflict with workspace resolution
- potentially cause build failures

### Node.js Version

This project requires **Node.js 20.x LTS**. Railway will use the `engines` field in `package.json` to select the correct version automatically.

### Recommended Railway commands

The repository includes a `railway.json` configuration file that sets up the correct build and start commands automatically. If you need to configure manually, use:

#### API Service

Set the Railway **Root Directory** to `.` (repository root).

**Install Command** (runs automatically during build):
```sh
npm ci
```

**Build Command**:
```sh
npm ci && npm run -w packages/api prisma:generate && npm run -w packages/api build
```

**Start Command**:
```sh
npm run -w packages/api prisma:deploy && npm run -w packages/api start:prod
```

#### Web Service

Set the Railway **Root Directory** to `.` (repository root).

**Install Command** (runs automatically during build):
```sh
npm ci
```

**Build Command**:
```sh
npm ci && npm run -w packages/web build
```

**Start Command**:
```sh
npm run -w packages/web preview -- --host 0.0.0.0 --port $PORT
```

### Key Points

- **Single install**: `npm ci` runs once at the repository root to install all workspace dependencies
- **Workspace commands**: Use `npm run -w packages/<workspace>` to run scripts in specific packages
- **Prisma workflow**: For API, run `prisma:generate` during build and `prisma:deploy` before start
- **No cd commands**: Workspace commands work from the root, no need to change directories
