import { NextRequest } from "next/server";

export const runtime = "edge"; // ultra-fast streaming

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const backend = await fetch(`${API_URL}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Pass-through stream
    const headers = new Headers(backend.headers);
    headers.set("Content-Type", headers.get("Content-Type") || "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache");

    return new Response(backend.body, {
      status: backend.status,
      statusText: backend.statusText,
      headers,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "failed" }), { status: 500 });
  }
}
