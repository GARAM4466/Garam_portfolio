# Garam Portfolio

React 19 + Vite + Tailwind v4 + Motion SPA. **Git-as-CMS** — no database.

## Architecture (critical)
- **Host: Vercel** (live: https://garam-portfolio.vercel.app). Serverless functions in `api/` are the active backend. `netlify/` is a dormant fallback (kept in case of switching back; Vercel ignores it). Do NOT reintroduce disk/filesystem persistence (won't survive on serverless).
- Data is stored IN the GitHub repo, edited via the functions which commit through the GitHub Contents API.
- `api/`: `login`, `projects`, `site-data`, `upload` (Vercel `(req,res)` handlers). Shared helpers in `api/_lib/` (`github.ts`, `auth.ts`). The `netlify/functions/` mirror is the dormant copy — if you change backend logic, update both or just `api/`.
- Data files: `src/data/projects.json`, `src/data/siteData.json` (committed by functions).
- Images: committed to `public/uploads/`, served via `raw.githubusercontent.com` URLs. Admin compresses/resizes images client-side before upload (Admin.tsx `optimizeImage`), so payloads stay small. Upload contract is JSON `{filename, contentBase64}` → `{url}` (one file per request), NOT multipart.
- Auth: server checks `ADMIN_PASSWORD` → returns HMAC-signed token (`_lib/auth.ts`). All write endpoints require `Authorization: Bearer <token>`.
- Frontend talks to `/api/*` (Vercel auto-routes `api/*`; SPA fallback via `vercel.json` rewrite). Token kept in `localStorage` as `admin_token`.

## Frontend
- `src/App.tsx` — tab SPA (Landing/Reel/Work/About/Contact/Admin), switched by `activeTab` state; fetches `/api/projects` + `/api/site-data` on load.
- `src/components/WorkGrid.tsx` — Pinterest-style **masonry** (CSS `columns`); each card uses `project.thumbnailRatio` (default 16:9) so wide images aren't cropped.
- `src/components/ProjectModal.tsx` — hero shows the YouTube embed if `project.youtubeId` is set, else `project.mainImage` (fallback to thumbnail).
- `src/pages/Admin.tsx` — content editor (login gated). `src/types.ts` — `Project`/`SiteData` shapes.
- Project model quirks: `youtubeId` is optional; `mainImage?` is the no-video hero; `thumbnailRatio?` is `"1:1"|"4:3"|"16:9"|"21:9"|"3:4"|"9:16"`.

## Commands
- `npm run dev` — runs `vercel dev` (functions + vite). Needs local `.env` (see `.env.example`).
- `npm run build` — `vite build` (output `dist/`). `npm run lint` — `tsc --noEmit`.
- Deploy: `npx vercel --prod` (project `garam-portfolio`, already linked). Always `npx tsc --noEmit` first.

## Gotchas
- **Content edits need NO redeploy** — functions read live from GitHub. Redeploy ONLY for code changes.
- **Auto-deploy is OFF** via `vercel.json` (`git.deploymentEnabled.main: false`). The Vercel project is git-connected, so without this every content commit (upload/save) would trigger a deploy. Deploy code manually with `npx vercel --prod`. Do NOT remove that vercel.json setting.
- **Vercel functions are ESM** — the project is `"type": "module"`, so relative imports in `api/` MUST use explicit `.js` extensions (e.g. `from "./_lib/auth.js"`) or functions crash at runtime with `ERR_MODULE_NOT_FOUND` / `FUNCTION_INVOCATION_FAILED`.
- Env vars (6) are set on Vercel (Production + Development) and in local `.env`: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `ADMIN_PASSWORD`, `AUTH_SECRET`. (Netlify fallback `garam-visual.netlify.app` also has them but its free deploys were exhausted.)
- Shell is zsh: glob qualifiers like `*(DN)` are evaluated before `cd`; use absolute paths or `find` for moves.
- `포폴백업본_old/` is a local backup, gitignored — never commit it.
