import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // optional but recommended for lower latency on Vercel

const DEFAULT_COUNTRY = "AE";
const FETCH_TIMEOUT_MS = 3000;

function getClientIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = header ? header.split(",")[0].trim() : "";
  return ip;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function GET(req: NextRequest) {
  try {
    // 1) Quick win: Vercel-provided country header (set by their edge network)
    const vercelCountry = req.headers.get("x-vercel-ip-country");
    if (vercelCountry) {
      return NextResponse.json({ country: vercelCountry, provider: "x-vercel-ip-country" });
    }

    // 2) Try to determine IP from forwarded headers if present
    const clientIp = getClientIp(req);

    // Helper: minimal headers we might forward to an API (DO NOT forward full req.headers)
    const minimalHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    const userAgent = req.headers.get("user-agent");
    if (userAgent) minimalHeaders["User-Agent"] = userAgent;

    // 3) First fallback: ipapi.co (HTTPS, no API key for basic usage)
    // ipapi.co has endpoints like /json/ (caller IP) or /<IP>/json/
    try {
      const ipapiUrl = clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1"
        ? `https://ipapi.co/${encodeURIComponent(clientIp)}/json/`
        : `https://ipapi.co/json/`;
      const ipRes = await fetchWithTimeout(ipapiUrl, { headers: minimalHeaders }, 3000);
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData?.country_code) {
          return NextResponse.json({
            country: String(ipData.country_code).toUpperCase(),
            provider: "ipapi.co",
            debug: { ip: clientIp || "self", ipapi: ipData.country_name ? { country_name: ipData.country_name } : {} },
          });
        }
      }
    } catch (err) {
      // continue to next fallback
      console.warn("[geo] ipapi.co failed:", String(err));
    }

    // 4) Second fallback: ipwho.is (works without API key; calling with IP or without)
    try {
      const ipwhoUrl = clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1"
        ? `https://ipwho.is/${encodeURIComponent(clientIp)}`
        : `https://ipwho.is/`;
      const whoRes = await fetchWithTimeout(ipwhoUrl, { headers: minimalHeaders }, 3000);
      if (whoRes.ok) {
        const whoData = await whoRes.json();
        // ipwho.is returns `success: false` when it didn't like the query
        if (whoData?.success === false) {
          console.warn("[geo] ipwho.is provider returned error:", whoData);
        } else if (whoData?.country_code) {
          return NextResponse.json({
            country: String(whoData.country_code).toUpperCase(),
            provider: "ipwho.is",
            debug: { ip: clientIp || "self" },
          });
        } else if (whoData?.country) {
          // some responses may include a `country` object/string
          return NextResponse.json({
            country: String(whoData.country).toUpperCase(),
            provider: "ipwho.is",
            debug: { ip: clientIp || "self", raw: whoData },
          });
        }
      }
    } catch (err) {
      console.warn("[geo] ipwho.is failed:", String(err));
    }

    // 5) Last resort: return default
    return NextResponse.json({
      country: DEFAULT_COUNTRY,
      provider: "fallback",
      debug: { message: "All geolocation providers failed" },
    });
  } catch (err) {
    console.error("[geo] unexpected error:", err);
    return NextResponse.json({ country: DEFAULT_COUNTRY, error: String(err) }, { status: 500 });
  }
}
