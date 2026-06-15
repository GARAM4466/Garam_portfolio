# HANDOFF — Garam Portfolio

_Last updated: 2026-06-15_

## Status: ✅ LIVE & WORKING
- **Live site:** https://keen-taiyaki-be6256.netlify.app
- **Repo:** https://github.com/GARAM4466/Garam_portfolio (branch `main`)
- End-to-end verified: read APIs, login (401 on wrong / token on correct), image upload → GitHub commit → served via raw URL, write roundtrip, auth-enforced writes. User confirmed a real image upload committed successfully.

## What was done this session
- Migrated from local Express + disk-JSON storage (broken on Netlify serverless) to **Git-as-CMS**: Netlify Functions commit data/images to the GitHub repo via the Contents API. No separate database.
- Created `netlify/functions/{login,projects,site-data,upload}.ts` + `lib/{github,auth}.ts`, `netlify.toml`.
- Replaced hardcoded `admin`/`1111` client auth with server-side password + HMAC-signed token; all write endpoints require it.
- Frontend (`App.tsx`, `Login.tsx`, `Admin.tsx`) updated for token auth + base64 JSON upload contract.
- Removed Express/multer/Gemini/Vercel config and unused deps.
- Deployed via `npx netlify deploy --build --prod`; site linked + 6 env vars set in Netlify.

## How the user manages content
Site → small **Admin** link (navbar) → login (password `admin`) → Work/Reel/About/Contact tabs. Upload + Save auto-commits to GitHub; changes are near-instant (no redeploy).

## ⚠️ Pending (security — user deferred, NOT yet done)
1. **Rotate GitHub token** — `ghp_...` token was pasted in chat (exposed). Revoke at https://github.com/settings/tokens, create a fine-grained PAT (Garam_portfolio → Contents R/W), then update Netlify env `GITHUB_TOKEN` (`npx netlify env:set GITHUB_TOKEN <new>`).
2. **Change admin password** — currently `admin` (weak). Update Netlify env `ADMIN_PASSWORD`.
   - After changing either env var, no redeploy needed for functions to pick them up on next invocation, but a redeploy is safest.

## Notes / next ideas
- Optional enhancement discussed but not done: per-project image folders (`public/uploads/<projectId>/`). Kept flat unique-named uploads for stability (avoids rename-breakage).
- `npm audit` shows some advisories (mostly from `netlify-cli` devDep) — non-blocking for the deployed app.
- See `CLAUDE.md` for architecture/commands/gotchas.
