import { NextRequest, NextResponse } from "next/server";
import { getMessageByToken, isUnlocked } from "@/lib/messages";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!token || token.length < 16 || token.length > 64) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  const limited = rateLimit(`audio:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const row = await getMessageByToken(token);
  if (!row || !row.audio_data || !row.audio_mime) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!isUnlocked(row.deliver_at)) {
    return new NextResponse("Sealed", { status: 403 });
  }

  const bytes = Buffer.isBuffer(row.audio_data)
    ? row.audio_data
    : Buffer.from(row.audio_data);

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.audio_mime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
