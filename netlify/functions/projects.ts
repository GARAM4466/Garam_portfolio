import type { Handler } from "@netlify/functions";
import { getJson, putFile, ghConfigError } from "./lib/github";
import { verifyToken, getBearer } from "./lib/auth";

const PROJECTS_PATH = "src/data/projects.json";
const JSON_HEADERS = { "Content-Type": "application/json" };

export const handler: Handler = async (event) => {
  try {
    const configError = ghConfigError();
    if (configError) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({ error: configError }),
      };
    }

    if (event.httpMethod === "GET") {
      const { data } = await getJson<unknown[]>(PROJECTS_PATH);
      return {
        statusCode: 200,
        headers: {
          ...JSON_HEADERS,
          // Browser always revalidates; Netlify's edge CDN serves a cached copy
          // for 60s (stale up to 5m) so repeat loads skip the GitHub round-trip.
          "Cache-Control": "public, max-age=0, must-revalidate",
          "Netlify-CDN-Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
        body: JSON.stringify(data ?? []),
      };
    }

    if (event.httpMethod === "POST") {
      const token = getBearer(event.headers as Record<string, string | undefined>);
      if (!verifyToken(token)) {
        return {
          statusCode: 401,
          headers: JSON_HEADERS,
          body: JSON.stringify({ error: "Unauthorized" }),
        };
      }

      const projects = JSON.parse(event.body || "[]");
      const { sha } = await getJson<unknown[]>(PROJECTS_PATH);
      const contentBase64 = Buffer.from(
        JSON.stringify(projects, null, 2),
        "utf-8"
      ).toString("base64");
      await putFile(
        PROJECTS_PATH,
        contentBase64,
        "chore: update projects via admin",
        sha ?? undefined
      );
      return {
        statusCode: 200,
        headers: JSON_HEADERS,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
