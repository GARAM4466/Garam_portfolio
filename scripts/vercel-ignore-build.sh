#!/usr/bin/env bash
# Vercel "Ignored Build Step" — controls whether a git push triggers a deploy.
# Semantics: exit 1 = build (proceed), exit 0 = skip (cancel).
#
# We commit content (project data + uploaded images) to the repo from the admin
# panel. Those content commits must NOT trigger a rebuild — the serverless
# functions read data live from GitHub. Only real code changes should deploy.

# If we cannot determine the diff (e.g. shallow clone with no HEAD^), build to be safe.
if ! changed=$(git diff --name-only HEAD^ HEAD 2>/dev/null); then
  exit 1
fi

# No diff detected — build to be safe.
if [ -z "$changed" ]; then
  exit 1
fi

# Build if any changed file is OUTSIDE the content paths; otherwise skip.
if echo "$changed" | grep -qvE '^(src/data/|public/uploads/)'; then
  exit 1
else
  exit 0
fi
