import type { VercelRequest, VercelResponse } from "@vercel/node";
import { timingSafeEqual } from "node:crypto";
import { signToken } from "./_lib/auth.js";

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body) || {};
    const password = (body.password as string) || "";

    if (safeEqual(password, adminPassword)) {
      return res.status(200).json({ token: signToken() });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
