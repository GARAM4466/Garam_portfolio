import type { Handler } from "@netlify/functions";
import { timingSafeEqual } from "node:crypto";
import { signToken } from "./lib/auth";

const JSON_HEADERS = { "Content-Type": "application/json" };

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Server not configured" }),
      };
    }

    const body = JSON.parse(event.body || "{}") as { password?: string };
    const password = body.password || "";

    if (safeEqual(password, adminPassword)) {
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ token: signToken() }),
      };
    }

    return {
      statusCode: 401,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "Invalid credentials" }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
