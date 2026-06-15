import type { Handler } from "@netlify/functions";
import { putFile, rawUrl, ghConfigError } from "./lib/github";
import { verifyToken, getBearer } from "./lib/auth";

const JSON_HEADERS = { "Content-Type": "application/json" };
const MAX_BYTES = 8 * 1024 * 1024;

function getExt(filename: string): string {
  const idx = filename.lastIndexOf(".");
  if (idx <= 0 || idx === filename.length - 1) return ".jpg";
  return filename.slice(idx).toLowerCase();
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

    const configError = ghConfigError();
    if (configError) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: configError }),
      };
    }

    const token = getBearer(event.headers as Record<string, string | undefined>);
    if (!verifyToken(token)) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const body = JSON.parse(event.body || "{}") as {
      filename?: string;
      contentBase64?: string;
    };
    const filename = body.filename || "upload.jpg";
    let contentBase64 = body.contentBase64 || "";

    // Defensively strip a data URL prefix if present.
    const dataUrlMatch = contentBase64.match(/^data:[^;]*;base64,(.*)$/s);
    if (dataUrlMatch) {
      contentBase64 = dataUrlMatch[1];
    }

    if (!contentBase64) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "Missing contentBase64" }),
      };
    }

    const bytes = Buffer.from(contentBase64, "base64");
    if (bytes.length > MAX_BYTES) {
      return {
        statusCode: 413,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: "File too large (max 8MB)" }),
      };
    }

    const ext = getExt(filename);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const repoPath = `public/uploads/${name}`;

    // Re-encode to normalized base64 (no newlines / data prefix) for the API.
    const normalizedBase64 = bytes.toString("base64");
    await putFile(
      repoPath,
      normalizedBase64,
      `chore: upload ${name} via admin`
    );

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ url: rawUrl(repoPath) }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
