import { NextRequest, NextResponse } from "next/server";
import {
  getMessageByToken,
  isUnlocked,
  markOpened,
  publicMessageView,
} from "@/lib/messages";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!token || token.length < 16 || token.length > 64) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  const limited = rateLimit(`read:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Slow down." }, { status: 429 });
  }

  const row = await getMessageByToken(token);
  if (!row) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (isUnlocked(row.deliver_at)) {
    await markOpened(token);
  }

  return NextResponse.json(publicMessageView(row));
}
