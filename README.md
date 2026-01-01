# mesg

## Deploying / Building on Railway (API)

### Important: avoid double-installing dependencies

This repo uses npm workspaces. Railway (or any CI) should **install once at the repository root** and then run the API build/start scripts from the root.

Running a second `npm ci` inside `packages/api` will:
- waste build time
- risk creating a nested `node_modules` that conflicts with workspace resolution

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
