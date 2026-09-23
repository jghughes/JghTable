# ZSUN Club Web Apps - Developer Guide

## Project Overview

This repository contains multiple Single Page Applications (SPAs) hosted on Azure Blob Storage. Each app displays cycling data using AG Grid, built from a shared TypeScript framework for maintainability.

**Current Apps:**

- **`dirt-racing-series/`** - DIRT Racing Series results
- **`wtrl-zrl-league/`** - WTRL ZRL League results
- **`zsun-club-curve-fits/`** - ZSUN rider power curve-fit data
- **`zsun-club-membership/`** - ZSUN membership / rider stats

**Repository:** [https://github.com/jghughes/Zwift-Solution-2025](https://github.com/jghughes/Zwift-Solution-2025)

---

## Project Structure

```
JghTable/
├── dirt-racing-series/
│   ├── src/index.ts        # App-specific configuration (authored)
│   ├── dist/index.js       # Compiled ES module output (generated, gitignored)
│   ├── index.html          # Entry point (loads dist/index.js as type="module")
│   ├── index.css           # App-specific styles
│   ├── 404.html             # Error page
│   └── tsconfig.json
├── wtrl-zrl-league/               # same layout as above
├── zsun-club-curve-fits/   # same layout as above
├── zsun-club-membership/       # same layout as above
│
├── shared-mastercopies/
│   ├── src/base-grid.ts        # Shared AG Grid framework (real ES module, exports GridManager)
│   ├── src/ag-grid-types.d.ts  # Ambient types for the CDN AG Grid global
│   ├── dist/base-grid.js       # Compiled output (generated, gitignored) - imported directly by every app
│   ├── base-grid.css           # Shared styles - linked directly by every app
│   └── tsconfig.json
│
├── deploy-scripts/          # Azure deployment scripts (per-app + shared library)
│
├── .vscode/
│   ├── launch.json         # F5 browser debug configs (Edge + Chrome per app, plus compounds)
│   ├── tasks.json          # "build", "serve", "build and serve", "build:watch" tasks
│   ├── settings.json       # Prettier as default formatter, format-on-save
│   └── extensions.json
│
├── tsconfig.base.json       # Shared compiler options
├── tsconfig.json            # Solution file (project references to all projects)
├── .prettierrc / .prettierignore
├── .gitattributes
├── package.json
└── README.md                # This file
```

Each app folder still deploys with no runtime build step or bundler — but it is **no longer fully self-contained**: apps import the shared framework directly from `shared-mastercopies` via a relative ES module import / stylesheet link, so `shared-mastercopies` must be deployed alongside the apps (see [Deployment](#deployment)).

---

## Prerequisites

- Node.js (npm) for tooling
- VS Code with the **Prettier - Code formatter** extension (recommended on first open)

```bash
npm install
```

---

## Local Development (VS Code, F5 debugging)

1. Press **F5** and choose an app configuration (e.g. `Dirt Racing Series (Edge)` / `(Chrome)`), or one of the **All apps (Edge)** / **All apps (Chrome)** compounds to launch all four at once.
2. This runs the `build and serve` task first — a full `tsc --build` followed by starting the `serve` static server — so you always debug freshly compiled output, then opens the app with the debugger attached (breakpoints, call stack, console all work against your `.ts` sources via source maps).
3. To just run the static server without debugging: `npm run build && npm run serve`, then browse to `http://127.0.0.1:8080/<app folder>/index.html`.

You can also preview any running app in VS Code's built-in **Simple Browser**, or drive it with the Playwright-backed browser tools — this works the same way as any other locally-served static site; there's nothing app-specific to set up for it.

---

## Building (TypeScript)

Source code is authored in TypeScript (`src/*.ts`) as real ES modules, compiled with TypeScript 7 (`tsc`).

```bash
npm run build        # tsc --build (project references), outputs to each project's dist/
npm run build:watch  # tsc --build --watch, recompiles on save
npm run typecheck     # tsc --build --force, full re-check ignoring the incremental cache
npm run clean         # tsc --build --clean, removes build outputs/tsbuildinfo
npm run format        # prettier --write .
```

`dist/` folders are generated and gitignored — they are produced by `npm run build`, not committed.

---

## Shared Code Architecture

### Real ES modules, one shared dependency

`shared-mastercopies` is a small TypeScript "library" project. Its `src/base-grid.ts` exports `GridManager` (and supporting types); each app's `src/index.ts` imports it directly:

```typescript
/// <reference path="../../shared-mastercopies/src/ag-grid-types.d.ts" />
import { GridManager } from "../../shared-mastercopies/dist/base-grid.js";

const gridManager = new GridManager({
  appName: "ZSUN Membership",
  dataUrl: DATA_URL,
  fallbackData: FALLBACK_DATA,
  baseColumnDefs: BASE_COLUMN_DEFS,
  rowHeight: 25,
  headerHeight: 32,
  defaultColWidth: 90,
  sortable: true,
  resizable: true,
  filterable: true,
  minWidth: 40,
});

gridManager.initialize();
```

The import path points at the shared project's **compiled output** (`dist/base-grid.js`), not its source — this is the standard pattern for TypeScript project references across a multi-package build: TypeScript uses the referenced project's `.d.ts` for type-checking, and the same relative path is valid at runtime in the browser, because `shared-mastercopies` is deployed to the same static site root as the apps (see [Deployment](#deployment)).

There is no more master-copy-and-sync step: previously `base-grid.js`/`.css` were copied into every app folder after each edit; now every app references the one deployed copy directly, both for the compiled JS (`import`) and the CSS (`<link>`):

```html
<link rel="stylesheet" href="../shared-mastercopies/base-grid.css" />
...
<script src="https://cdn.jsdelivr.net/npm/ag-grid-community@29.3.4/dist/ag-grid-community.min.js"></script>
<script type="module" src="./dist/index.js"></script>
```

AG Grid itself remains a plain global `<script>` load from a CDN (not a module) — `shared-mastercopies/src/ag-grid-types.d.ts` provides ambient types for it via a triple-slash reference, since it isn't something you `import`.

---

## Adding a New App

1. Create a new folder, e.g. `JghTable/<new-app-name>/` with `src/index.ts`, `index.html`, `index.css`, `404.html`.
2. Copy an existing app's `tsconfig.json` into the new folder (extends `../tsconfig.base.json`, references `../shared-mastercopies`).
3. Add the new project path to the root [tsconfig.json](tsconfig.json)'s `references` array.
4. In `src/index.ts`, import `GridManager` from `"../../shared-mastercopies/dist/base-grid.js"` and reference `../../shared-mastercopies/src/ag-grid-types.d.ts` for AG Grid types.
5. In `index.html`, link `../shared-mastercopies/base-grid.css` and load `./dist/index.js` as `type="module"`.
6. Add Edge + Chrome debug configs for it in [.vscode/launch.json](.vscode/launch.json) (copy an existing pair, update the name/URL/webRoot).
7. Add the new folder name to the `ValidateSet` in `deploy-scripts/deploy-app.ps1` and to the `$apps` array in `deploy-scripts/deploy-all.ps1`.

---

## Develop

Open the repository in VS Code and press <kbd>F5</kbd>. Select the Edge or Chrome launch configuration when prompted.

VS Code builds the app, starts the local server, and opens the calculator at `http://127.0.0.1:8080/index.html`, the port specified in launch.json

## Housekeeping

Format the project with Prettier:

```powershell
npm run format
```

Check formatting, types, and the production build without modifying files:

```powershell
npm run check
```


## Deployment

Deployment is via Azure CLI (`az storage blob upload-batch`) to the `customerzsun` storage account's `$web` container. **`shared-mastercopies` is deployed as its own top-level path** (`$web/shared-mastercopies/`), alongside each app's own path (`$web/<app-folder>/`) — apps resolve it via relative URL, exactly like they do locally.

`deploy-scripts/` contains three runnable scripts (login with `az login` first, one-time):

```powershell
# Build everything, then deploy shared-mastercopies + all 4 apps in order
.\deploy-scripts\deploy-all.ps1

# Or deploy just the shared library (after any base-grid.ts/.css change)
.\deploy-scripts\deploy-shared.ps1

# Or deploy a single app
.\deploy-scripts\deploy-app.ps1 -App "zsun-club-membership"
```

Each script runs `npm run build` (via `deploy-all.ps1`) or expects it to already be up to date (`deploy-shared.ps1`/`deploy-app.ps1` on their own), and uploads with `--exclude-pattern 'src/*;tsconfig.json;tsconfig.tsbuildinfo'` so only `dist/` and static assets (`index.html`, `.css`, `404.html`) are published.

---

## Troubleshooting

- **`Cannot find module '.../shared-mastercopies/dist/base-grid.js'`:** run `npm run build` — `shared-mastercopies` must be built (project reference) before the apps that import it; `tsc --build` handles this automatically in dependency order.
- **Grid not initializing:** check the browser console (F12) for errors, confirm `<script type="module" src="./dist/index.js">` loaded (Network tab, no 404), and that `npm run build` has been run.
- **Styles missing:** confirm `../shared-mastercopies/base-grid.css` resolves (both locally and once deployed, `shared-mastercopies` must exist at the same relative level as the app folder).
- **Deployed changes not visible:** hard refresh (`Ctrl+F5`), and allow a minute for Azure edge caching. Also confirm you redeployed `shared-mastercopies` if you changed the shared framework.

---

## Related Resources

- [AG Grid Documentation](https://www.ag-grid.com/javascript-data-grid/)
- [Azure Blob Storage Static Websites](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/storage/blob)
- [TypeScript](https://www.typescriptlang.org/)
