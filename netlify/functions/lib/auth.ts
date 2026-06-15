import { createHmac, timingSafeEqual } from "node:crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "";

const TOKEN_TTL_MS = 12 * 3600 * 1000;

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function hmac(payloadB64: string): string {
  return base64url(
    createHmac("sha256", AUTH_SECRET).update(payloadB64).digest()
  );
}

export function signToken(): string {
  const payload = { exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = hmac(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
  try {
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, sig] = parts;
    const expected = hmac(payloadB64);

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

    const json = Buffer.from(payloadB64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getBearer(
  headers: Record<string, string | undefined>
): string | undefined {
  let value: string | undefined;
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === "authorization") {
      value = headers[key];
      break;
    }
  }
  if (!value) return undefined;
  return value.replace(/^Bearer\s+/i, "").trim() || undefined;
}
