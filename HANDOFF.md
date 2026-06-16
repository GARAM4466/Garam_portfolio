# HANDOFF — Garam Portfolio

_Last updated: 2026-06-15_

## Status: ✅ LIVE & WORKING (on Vercel)
- **Live site:** https://garam-portfolio.vercel.app  ← primary host (Vercel)
- **Fallback (dormant):** https://garam-visual.netlify.app (Netlify free deploys exhausted this month; reads still work since both hosts read the same GitHub data)
- **Repo:** https://github.com/GARAM4466/Garam_portfolio (branch `main`)
- End-to-end verified on Vercel: read APIs, login (401 on wrong / token on correct), image upload → GitHub commit → served via raw URL, auth-enforced writes (401 unauth).

## What was done this session
- Migrated from local Express + disk-JSON storage (broken on Netlify serverless) to **Git-as-CMS**: Netlify Functions commit data/images to the GitHub repo via the Contents API. No separate database.
- Created `netlify/functions/{login,projects,site-data,upload}.ts` + `lib/{github,auth}.ts`, `netlify.toml`.
- Replaced hardcoded `admin`/`1111` client auth with server-side password + HMAC-signed token; all write endpoints require it.
- Frontend (`App.tsx`, `Login.tsx`, `Admin.tsx`) updated for token auth + base64 JSON upload contract.
- Removed Express/multer/Gemini/Vercel config and unused deps.
- Deployed via `npx netlify deploy --build --prod`; site linked + 6 env vars set in Netlify.

## How the user manages content
Site → small **Admin** link (navbar) → login (password `admin`) → Work/Reel/About/Contact tabs. Upload + Save auto-commits to GitHub; changes are near-instant (no redeploy).

## ⚠️ Pending (security)
1. **Rotate GitHub token** — STILL PENDING. `ghp_...` token was pasted in chat (exposed). Revoke at https://github.com/settings/tokens, create a fine-grained PAT (Garam_portfolio → Contents R/W), then update env `GITHUB_TOKEN` on **Vercel** (and Netlify if keeping it), then `npx vercel --prod`.
2. ~~Change admin password~~ — **DONE 2026-06-16**. `ADMIN_PASSWORD` changed from `admin` to a user-chosen value on Vercel (Production + Development) and redeployed. (The value lives only in Vercel env + local `.env`; not in the repo.)

## Deploy / cost (important)
- **On Vercel now.** Deploy CODE changes with `npx vercel --prod` (run `npx tsc --noEmit` first). Project is linked (`.vercel/`).
- **Git is DISCONNECTED from the Vercel project** (2026-06-16) — Vercel was ignoring `vercel.json`'s `git.deploymentEnabled` and kept auto-deploying every push, replacing the working CLI deploy with a function-less git build (caused `/api/*` 404 on the production domain). Fixed via `vercel git disconnect`. Now NOTHING auto-deploys; only `npx vercel --prod` deploys. Do NOT reconnect git unless you re-test thoroughly. The `git` block was removed from `vercel.json` (no longer needed).
- Env vars (6) set on Vercel for Production + Development. (Preview skipped — Vercel prompts for a branch; not needed.)
- After changing any env var, redeploy (`npx vercel --prod`) so functions pick up the new value.
- **Netlify is the dormant fallback.** Its free deploys are exhausted until the monthly reset (~July 1); its auto-build is also disabled (`stop_builds`). To switch back next month: `npx netlify deploy --build --prod`.

## Later enhancements (done, 2026-06-15)
- Per-project thumbnail ratio (masonry) + main-image fallback for no-YouTube projects: **DONE & deployed**.
- Client-side image optimization on upload (resize 2560px + JPEG 85%) + CDN caching on GET reads: **DONE**.
- Site URL is `garam-portfolio.vercel.app` (Netlify name was `garam-visual`, originally `keen-taiyaki-be6256`).
- Migrated Netlify → Vercel because Netlify free deploys hit the monthly limit. Vercel functions live in `api/` (mirror of `netlify/functions/`).

## Notes / next ideas
- Optional enhancement discussed but not done: per-project image folders (`public/uploads/<projectId>/`). Kept flat unique-named uploads for stability (avoids rename-breakage).
- `npm audit` shows some advisories (mostly from `netlify-cli` devDep) — non-blocking for the deployed app.
- See `CLAUDE.md` for architecture/commands/gotchas.
