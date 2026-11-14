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
      { error: "Even wachten — te veel verzoeken." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let payload: {
    body?: string;
    email?: string;
    mode?: ScheduleMode;
    preset?: SchedulePreset;
    customDate?: string;
    audioMime?: string;
    audioBase64?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  try {
    if (!payload.mode || !payload.preset) {
      return NextResponse.json(
        { error: "Kies wanneer je boodschap aankomt." },
        { status: 400 },
      );
    }

    const { deliverAt, label } = resolveDelivery({
      mode: payload.mode,
      preset: payload.preset,
      customDate: payload.customDate,
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
      // Only return the exact moment for chosen dates.
      deliverAt:
        payload.mode === "chosen" ? deliverAt.toISOString() : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Er ging iets mis.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
