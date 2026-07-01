import { headers, cookies } from "next/headers";

// Server-side API client to communicate securely with the Hono REST API.
// It appends the API key and handles endpoint routing without exposing credentials to the client.

export async function callFidelApi(
    endpoint: string,
    options: {
        method?: "GET" | "POST";
        body?: unknown;
    } = {},
) {
    const method = options.method || "GET";

    // Base URL for the Hono backend API
    const baseUrl = process.env.FIDEL_API_URL || "http://localhost:3001";

    const apiKey = process.env.FIDEL_API_KEY;

    if (!apiKey) {
        throw new Error("Missing FIDEL_API_KEY environment variable");
    }

    const url = `${baseUrl.replace(/\/$/, "")}/api/v1/nlp/${endpoint.replace(/^\//, "")}`;
    console.log(`[API Client Debug] Sending request to ${url}. API Key prefix: "${apiKey.slice(0, 10)}", Length: ${apiKey.length}`);

    // Dynamically extract passkey and passphrase from incoming client request headers
    let reqHeaders;
    let cookieStore;
    try {
        reqHeaders = await headers();
        cookieStore = await cookies();
    } catch {
        // Fallback if not called in a Next.js server request context
    }

    const clientPasskey = reqHeaders ? reqHeaders.get("x-passkey") || "" : "";
    const clientPassphrase = reqHeaders
        ? reqHeaders.get("x-passphrase") || ""
        : "";

    const accessToken = cookieStore?.get("accessToken")?.value || "";
    const refreshToken = cookieStore?.get("refreshToken")?.value || "";

    const headersObj: Record<string, string> = {
        "x-api-key": apiKey,
        "x-passkey": clientPasskey,
        "x-passphrase": clientPassphrase,
    };

    if (accessToken) {
        headersObj["Authorization"] = `Bearer ${accessToken}`;
    }

    if (method === "POST" && options.body !== undefined) {
        headersObj["Content-Type"] = "application/json";
    }

    let response = await fetch(url, {
        method,
        headers: headersObj,
        body:
            method === "POST" && options.body !== undefined
                ? JSON.stringify(options.body)
                : undefined,
    });

    // Handle token expiration & transparent auto-refresh
    if (response.status === 401 && refreshToken) {
        console.log("[API Client] Access token expired/invalid. Attempting auto-refresh...");
        try {
            const refreshRes = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccessToken = refreshData.accessToken;
                const newRefreshToken = refreshData.refreshToken;

                console.log("[API Client] Auto-refresh succeeded. Updating cookies and retrying...");

                // Save new tokens to cookies
                if (cookieStore) {
                    cookieStore.set("accessToken", newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: 15 * 60,
                    });
                    cookieStore.set("refreshToken", newRefreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: 7 * 24 * 60 * 60,
                    });
                }

                // Retry original request with new access token
                headersObj["Authorization"] = `Bearer ${newAccessToken}`;
                response = await fetch(url, {
                    method,
                    headers: headersObj,
                    body:
                        method === "POST" && options.body !== undefined
                            ? JSON.stringify(options.body)
                            : undefined,
                });
            } else {
                console.warn("[API Client] Token refresh call failed.");
                if (cookieStore) {
                    cookieStore.delete("accessToken");
                    cookieStore.delete("refreshToken");
                }
            }
        } catch (refreshErr) {
            console.error("[API Client] Error during auto-token refresh:", refreshErr);
        }
    }

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
