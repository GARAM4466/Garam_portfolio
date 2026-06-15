import type { VercelRequest, VercelResponse } from "@vercel/node";
import { putFile, rawUrl, ghConfigError } from "./_lib/github.js";
import { verifyToken, getBearer } from "./_lib/auth.js";

const MAX_BYTES = 8 * 1024 * 1024;

function getExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx <= 0 || idx === filename.length - 1) return ".jpg";
  return filename.slice(idx).toLowerCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const configError = ghConfigError();
    if (configError) return res.status(500).json({ error: configError });

    const token = getBearer(req.headers.authorization);
    if (!verifyToken(token)) return res.status(401).json({ error: "Unauthorized" });

    const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {};
    const filename = (body.filename as string) || "upload.jpg";
    let contentBase64 = (body.contentBase64 as string) || "";

    // Defensively strip a data URL prefix if present.
    const dataUrlMatch = contentBase64.match(/^data:[^;]*;base64,(.*)$/s);
    if (dataUrlMatch) contentBase64 = dataUrlMatch[1];

    if (!contentBase64) return res.status(400).json({ error: "Missing contentBase64" });

    const bytes = Buffer.from(contentBase64, "base64");
    if (bytes.length > MAX_BYTES) {
      return res.status(413).json({ error: "File too large (max 8MB)" });
    }

    const ext = getExt(filename);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const repoPath = `public/uploads/${name}`;

    const normalizedBase64 = bytes.toString("base64");
    await putFile(repoPath, normalizedBase64, `chore: upload ${name} via admin`);

    return res.status(200).json({ url: rawUrl(repoPath) });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
