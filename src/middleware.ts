import { NextRequest, NextResponse } from "next/server";

/**
 * Block mainland China (CN) visitors.
 * Netlify / Cloudflare provide country via geo headers.
 * HK / TW / MO are not blocked.
 */
export function middleware(request: NextRequest) {
  const country = (
    request.headers.get("x-nf-country") ||
    request.headers.get("x-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();

  if (country === "CN") {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unavailable in your region</title>
  <style>
    body { font-family: system-ui, sans-serif; display:flex; min-height:100vh; align-items:center; justify-content:center; margin:0; background:#0f172a; color:#e2e8f0; }
    main { text-align:center; padding:2rem; max-width:28rem; }
    h1 { font-size:1.5rem; margin:0 0 0.75rem; }
    p { color:#94a3b8; line-height:1.6; margin:0; }
  </style>
</head>
<body>
  <main>
    <h1>Unavailable in your region</h1>
    <p>This site is only available to readers outside mainland China.</p>
  </main>
</body>
</html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
