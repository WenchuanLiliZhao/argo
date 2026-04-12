# Argo

This repository is a **technical starting point** for a **desktop application**. The exact product direction is **not decided yet**—the goal here is to have a working stack and release pipeline you can grow from.

## What is here

- **`app/`** — The installable app: [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript for the UI, [Electron](https://www.electronjs.org/) as the desktop shell, and [electron-builder](https://www.electron.build/) to produce macOS `.dmg` and `.zip` builds.
- **GitHub Actions** — On pushing a version tag (`v*`), a workflow builds on `macos-latest` and uploads artifacts to [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

## Quick start

```bash
cd app
npm install
npm run dev
```

This opens an Electron window pointed at the Vite dev server (with hot module replacement for the renderer).

If `npm install` fails because of network or registry issues, use `npm install --registry=https://registry.npmmirror.com` from `app/` (details in [DEVELOPMENT.md](DEVELOPMENT.md)).

For detailed development, local packaging, and release steps, see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

Add a license when you are ready (this repo does not set one by default).
