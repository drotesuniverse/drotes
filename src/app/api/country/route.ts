// app/api/geo/route.ts (or pages/api/geo.ts)
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const ip = (() => {
      const h = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
      return h ? h.split(",")[0].trim() : "";
    })();

    const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : `https://ipwho.is/`;
    // Important: don't include req.headers here — the provider may see Origin or other browser headers.
    const geoRes = await fetch(url, { cache: "no-store", headers: { "Accept": "application/json" } });

    const geoData = await geoRes.json();
    // handle provider error
    if (geoData?.success === false) {
      console.warn("provider error", geoData);
      return NextResponse.json({ country: "AE", debug: { provider: geoData } });
    }
    const country = geoData;
    return NextResponse.json({ country });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ country: "AE", error: String(e) });
  }
}
