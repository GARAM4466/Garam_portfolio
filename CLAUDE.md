# Garam Portfolio

React 19 + Vite + Tailwind v4 + Motion SPA. **Git-as-CMS** — no database.

## Architecture (critical)
- Data is stored IN the GitHub repo, edited via Netlify Functions that commit through the GitHub Contents API. Do NOT reintroduce disk/filesystem persistence (won't survive on Netlify serverless).
- `netlify/functions/`: `login`, `projects`, `site-data`, `upload`. Shared helpers in `netlify/functions/lib/` (`github.ts`, `auth.ts`).
- Data files: `src/data/projects.json`, `src/data/siteData.json` (committed by functions).
- Images: committed to `public/uploads/`, served via `raw.githubusercontent.com` URLs. 8MB/image limit. Upload contract is JSON `{filename, contentBase64}` → `{url}` (one file per request), NOT multipart.
- Auth: server checks `ADMIN_PASSWORD` → returns HMAC-signed token (`lib/auth.ts`). All write endpoints require `Authorization: Bearer <token>`.
- Frontend talks to `/api/*` (mapped to functions via `netlify.toml` redirects). Token kept in `localStorage` as `admin_token`.

## Commands
- `npm run dev` — runs `netlify dev` (functions + vite). Needs local `.env` (see `.env.example`).
- `npm run build` — `vite build` (output `dist/`). `npm run lint` — `tsc --noEmit`.
- Deploy: `npx netlify deploy --build --prod` (site `garam-visual`, already linked).

## Gotchas
- **Content edits need NO redeploy** — functions read live from GitHub. Redeploy ONLY for code changes.
- Env vars (6) live in Netlify + local `.env`: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
- Shell is zsh: glob qualifiers like `*(DN)` are evaluated before `cd`; use absolute paths or `find` for moves.
- `포폴백업본_old/` is a local backup, gitignored — never commit it.
