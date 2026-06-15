import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getJson, putFile, ghConfigError } from "./_lib/github";
import { verifyToken, getBearer } from "./_lib/auth";

const SITE_DATA_PATH = "src/data/siteData.json";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const configError = ghConfigError();
    if (configError) return res.status(500).json({ error: configError });

    if (req.method === "GET") {
      const { data } = await getJson<Record<string, unknown>>(SITE_DATA_PATH);
      if (data === null) return res.status(500).json({ error: "Failed to read site data" });
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.setHeader("CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const token = getBearer(req.headers.authorization);
      if (!verifyToken(token)) return res.status(401).json({ error: "Unauthorized" });

      const siteData = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) ?? {};
      const { sha } = await getJson<Record<string, unknown>>(SITE_DATA_PATH);
      const contentBase64 = Buffer.from(JSON.stringify(siteData, null, 2), "utf-8").toString("base64");
      await putFile(SITE_DATA_PATH, contentBase64, "chore: update site data via admin", sha ?? undefined);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
