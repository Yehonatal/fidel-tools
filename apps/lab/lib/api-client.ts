import { headers } from "next/headers";

// Server-side API client to communicate securely with the Hono REST API.
// It appends the API key and handles endpoint routing without exposing credentials to the client.

export async function callFidelApi(
  endpoint: string,
  options: {
    method?: "GET" | "POST";
    body?: any;
  } = {}
) {
  const method = options.method || "GET";
  
  // Base URL for the Hono backend API
  const baseUrl = process.env.FIDEL_API_URL || "http://localhost:3001";
  
  // Raw API key seeded in the database
  const apiKey = process.env.FIDEL_API_KEY || "fidel_lab_key_2026";

  const url = `${baseUrl.replace(/\/$/, "")}/api/v1/nlp/${endpoint.replace(/^\//, "")}`;

  // Dynamically extract passkey and passphrase from incoming client request headers
  let reqHeaders;
  try {
    reqHeaders = await headers();
  } catch {
    // Fallback if not called in a Next.js server request context
  }

  const clientPasskey = reqHeaders ? reqHeaders.get("x-passkey") || "" : "";
  const clientPassphrase = reqHeaders ? reqHeaders.get("x-passphrase") || "" : "";

  const headersObj: Record<string, string> = {
    "x-api-key": apiKey,
    "x-passkey": clientPasskey,
    "x-passphrase": clientPassphrase,
  };

  if (method === "POST" && options.body !== undefined) {
    headersObj["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: headersObj,
    body: method === "POST" && options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errorMsg = errJson.message;
      } else if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}
