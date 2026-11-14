import { NextRequest, NextResponse } from "next/server";
import { createMessage } from "@/lib/messages";
import { rateLimit } from "@/lib/rate-limit";
import {
  resolveDelivery,
  type ScheduleMode,
  type SchedulePreset,
} from "@/lib/schedule";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  const limited = rateLimit(`create:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Slow down — too many requests." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let payload: {
    body?: string;
    email?: string;
    mode?: ScheduleMode;
    preset?: SchedulePreset;
    customDate?: string;
    customTime?: string;
    timezoneOffset?: number;
    audioMime?: string;
    audioBase64?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (!payload.mode || !payload.preset) {
      return NextResponse.json(
        { error: "Choose when your message should arrive." },
        { status: 400 },
      );
    }

    const { deliverAt, label } = resolveDelivery({
      mode: payload.mode,
      preset: payload.preset,
      customDate: payload.customDate,
      customTime: payload.customTime,
      timezoneOffset: payload.timezoneOffset,
    });

    const created = await createMessage({
      body: payload.body ?? "",
      email: payload.email,
      deliverAt,
      scheduleMode: payload.mode,
      scheduleLabel: label,
      audioMime: payload.audioMime,
      audioBase64: payload.audioBase64,
    });

    return NextResponse.json({
      token: created.token,
      scheduleLabel: label,
      revealPath: `/m/${created.token}`,
      deliverAt:
        payload.mode === "chosen" ? deliverAt.toISOString() : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
