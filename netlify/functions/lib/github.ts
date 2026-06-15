const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

const API_BASE = "https://api.github.com";

function baseHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-cms",
  };
}

export async function getFile(
  path: string
): Promise<{ contentBase64: string; sha: string } | null> {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: baseHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`getFile failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { content?: string; sha: string };
  const contentBase64 = (data.content || "").replace(/\n/g, "");
  return { contentBase64, sha: data.sha };
}

export async function getJson<T>(
  path: string
): Promise<{ data: T | null; sha: string | null }> {
  const file = await getFile(path);
  if (!file) return { data: null, sha: null };
  const json = Buffer.from(file.contentBase64, "base64").toString("utf-8");
  return { data: JSON.parse(json) as T, sha: file.sha };
}

export async function putFile(
  path: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<void> {
  const url = `${API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const body = {
    message,
    content: contentBase64,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {}),
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...baseHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`putFile failed (${res.status}): ${await res.text()}`);
  }
}

export function rawUrl(path: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}

export function ghConfigError(): string | null {
  const missing: string[] = [];
  if (!GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
  if (!GITHUB_OWNER) missing.push("GITHUB_OWNER");
  if (!GITHUB_REPO) missing.push("GITHUB_REPO");
  if (missing.length) {
    return `Missing required GitHub env var(s): ${missing.join(", ")}`;
  }
  return null;
}
