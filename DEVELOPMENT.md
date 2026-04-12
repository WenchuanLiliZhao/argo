# Development handbook

## Prerequisites

- **Node.js** 20 or newer (22 LTS is recommended; the repo includes [`app/.nvmrc`](app/.nvmrc) with `22` for [nvm](https://github.com/nvm-sh/nvm) users).
- **npm** (bundled with Node).
- **macOS** for building and testing the packaged `.app` locally (GitHub Actions also uses a macOS runner for releases).

## Install

From the repository root:

```bash
cd app
npm install
```

If installation fails (timeouts, registry errors, or unstable network), install using the [npmmirror.com](https://npmmirror.com/) registry:

```bash
cd app
npm install --registry=https://registry.npmmirror.com
```

That only affects the install command; it does not permanently change your global npm configuration unless you add it to a project or user `.npmrc`.

**Electron binary download:** The `electron` package downloads its own platform binary after npm resolves packages. If you see errors during `node install.js` under `electron` (for example `ETIMEDOUT`), the project’s [`app/.npmrc`](.npmrc) sets `electron_mirror` to npmmirror so installs work better in constrained networks. You can override with the `ELECTRON_MIRROR` environment variable if needed.

Use `npm ci` instead of `npm install` when you need a clean, lockfile-exact install (for example in CI or before a release). If you must use the mirror for `npm ci`, pass the same `--registry` flag.

## Day-to-day development

Run the Electron app against the Vite dev server:

```bash
cd app
npm run dev
```

What to expect:

1. The Electron **main** and **preload** scripts compile to `app/dist-electron/` (and recompile on changes).
2. **Vite** serves the React UI at `http://127.0.0.1:5173` (bound to that host on purpose).
3. A third process **waits until Vite responds**, then starts **Electron**. You should see `wait-on` log lines in the terminal, then an **Electron window** opens and loads that URL (DevTools may open in development).

If the window never appears, scroll the terminal for the `[2]` process: `wait-on` errors, `electron` crashes, or a timeout after 120s. After fixing, run `npm run kill:dev-port` and try `npm run dev` again.

Edit files under `app/src/`; the renderer updates via Vite HMR. Changes under `app/electron/` trigger a TypeScript rebuild; you may need to restart the Electron process to pick up main-process changes.

## Build the renderer only

```bash
cd app
npm run build
```

Output: `app/dist/` (static assets for production).

## Build and run a production-like Mac app locally

```bash
cd app
npm run package:mac
```

This runs the renderer build, compiles Electron main/preload, then runs **electron-builder** for macOS. Installable artifacts appear under **`app/release/`** (for example `Argo-<version>.dmg` and a `.zip`, depending on version and configuration).

**Code signing and notarization:** The default setup produces **unsigned** local builds. They may trigger Gatekeeper prompts when you open them. Broader distribution usually requires an Apple Developer account, signing, and notarization—treat that as a follow-up step.

## Preview the static web build (no Electron)

```bash
cd app
npm run build
npm run preview
```

This serves the Vite production build only (useful for UI work without the desktop shell).

## Linting and typecheck

ESLint is not configured in the scaffold. You can run the TypeScript compiler in check-only mode:

```bash
cd app
node ./node_modules/typescript/bin/tsc -b --noEmit
```

## Releases on GitHub

1. Commit your work and ensure `app/package-lock.json` is committed so CI can run `npm ci`.
2. Create and push an annotated or lightweight tag whose name starts with `v`, for example `v0.1.0`:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. The **Release macOS** workflow (see [`.github/workflows/release-macos.yml`](.github/workflows/release-macos.yml)) builds on `macos-latest` and attaches the `.dmg` and `.zip` from `app/release/` to a GitHub Release for that tag.

4. Download the assets from the repository’s **Releases** page.

Ensure **Actions** are enabled for the repository and that the default `GITHUB_TOKEN` is allowed to create releases (default for workflows in the same repo).

## Troubleshooting

- **Port 5173 in use** — Development expects Vite on **5173** (see `app/vite.config.ts` and `app/electron/main.ts`). If Vite prints *“Port 5173 is already in use”*, something else is still listening (often a leftover Vite from another terminal). From `app/`, run `npm run kill:dev-port` to stop the process on 5173 (macOS/Linux), then run `npm run dev` again. Alternatively quit the other dev server or run `lsof -i :5173` and stop the PID manually. Do not rely on Vite auto-switching to 5174—the Electron window always loads `http://127.0.0.1:5173`.
- **`tsc` or `vite` not found** — Run commands from `app/` after a successful `npm install`. Scripts call `node ./node_modules/...` directly so they do not depend on `node_modules/.bin` being on your shell `PATH`. If you still see missing-file errors, remove `node_modules` and run `npm install` again.
- **Stale or broken install** — From `app/`, remove `node_modules` and reinstall: `rm -rf node_modules && npm install`.
- **`npm install` fails (network / registry)** — Retry with the npmmirror registry: `npm install --registry=https://registry.npmmirror.com` (see **Install** above).
- **Electron download issues** — Retry `npm install` with a stable network; Electron’s binary is downloaded post-install. If installs keep failing, try the mirror command above, then run `npm install` again from `app/`.
