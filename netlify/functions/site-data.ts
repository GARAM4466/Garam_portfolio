import type { Handler } from "@netlify/functions";
import { getJson, putFile, ghConfigError } from "./lib/github";
import { verifyToken, getBearer } from "./lib/auth";

const SITE_DATA_PATH = "src/data/siteData.json";
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
      const { data } = await getJson<Record<string, unknown>>(SITE_DATA_PATH);
      if (data === null) {
        return {
          statusCode: 500,
          headers: JSON_HEADERS,
          body: JSON.stringify({ error: "Failed to read site data" }),
        };
      }
      return {
        statusCode: 200,
        headers: { ...JSON_HEADERS, "Cache-Control": "no-cache" },
        body: JSON.stringify(data),
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

      const siteData = JSON.parse(event.body || "{}");
      const { sha } = await getJson<Record<string, unknown>>(SITE_DATA_PATH);
      const contentBase64 = Buffer.from(
        JSON.stringify(siteData, null, 2),
        "utf-8"
      ).toString("base64");
      await putFile(
        SITE_DATA_PATH,
        contentBase64,
        "chore: update site data via admin",
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
