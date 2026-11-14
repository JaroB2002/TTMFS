import { randomBytes, randomUUID } from "node:crypto";
import { sql } from "@/lib/db";

export type MessageRow = {
  id: string;
  token: string;
  body: string;
  audio_mime: string | null;
  audio_data: Buffer | Uint8Array | null;
  email: string | null;
  deliver_at: string | Date;
  schedule_mode: string;
  schedule_label: string;
  created_at: string | Date;
  opened_at: string | Date | null;
  notified_at: string | Date | null;
};

const MAX_BODY = 8000;
const MAX_AUDIO_BYTES = 2_500_000;

export function createToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function createMessage(input: {
  body: string;
  email?: string | null;
  deliverAt: Date;
  scheduleMode: string;
  scheduleLabel: string;
  audioMime?: string | null;
  audioBase64?: string | null;
}): Promise<{ id: string; token: string }> {
  const body = input.body.trim();
  if (!body && !input.audioBase64) {
    throw new Error("Write or record a message first.");
  }
  if (body.length > MAX_BODY) {
    throw new Error("Your message is too long.");
  }

  let audioData: Buffer | null = null;
  let audioMime: string | null = null;
  if (input.audioBase64) {
    audioData = Buffer.from(input.audioBase64, "base64");
    if (audioData.length > MAX_AUDIO_BYTES) {
      throw new Error("Audio is too large (max ~2 minutes).");
    }
    audioMime = input.audioMime || "audio/webm";
  }

  const email = normalizeEmail(input.email);
  const id = randomUUID();
  const token = createToken();

  await sql(
    `insert into messages
      (id, token, body, audio_mime, audio_data, email, deliver_at, schedule_mode, schedule_label)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      token,
      body,
      audioMime,
      audioData,
      email,
      input.deliverAt.toISOString(),
      input.scheduleMode,
      input.scheduleLabel,
    ],
  );

  return { id, token };
}

export async function getMessageByToken(
  token: string,
): Promise<MessageRow | null> {
  const rows = await sql<MessageRow>(
    `select id, token, body, audio_mime, audio_data, email, deliver_at,
            schedule_mode, schedule_label, created_at, opened_at, notified_at
     from messages where token = $1 limit 1`,
    [token],
  );
  return rows[0] ?? null;
}

export async function markOpened(token: string): Promise<void> {
  await sql(
    `update messages set opened_at = coalesce(opened_at, now()) where token = $1`,
    [token],
  );
}

export function isUnlocked(
  deliverAt: string | Date,
  now = new Date(),
): boolean {
  return new Date(deliverAt).getTime() <= now.getTime();
}

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  const value = email.trim().toLowerCase();
  if (!value) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254) {
    throw new Error("Invalid email address.");
  }
  return value;
}

export function publicMessageView(
  row: MessageRow,
  now = new Date(),
): {
  unlocked: boolean;
  scheduleLabel: string;
  scheduleMode: string;
  createdAt: string;
  deliverAt?: string;
  body?: string;
  hasAudio?: boolean;
  openedAt?: string | null;
} {
  const unlocked = isUnlocked(row.deliver_at, now);
  const base = {
    unlocked,
    scheduleLabel: row.schedule_label,
    scheduleMode: row.schedule_mode,
    createdAt: new Date(row.created_at).toISOString(),
  };

  if (!unlocked) {
    // Never reveal the exact surprise date for random deliveries.
    if (row.schedule_mode === "chosen") {
      return {
        ...base,
        deliverAt: new Date(row.deliver_at).toISOString(),
      };
    }
    return base;
  }

  return {
    ...base,
    deliverAt: new Date(row.deliver_at).toISOString(),
    body: row.body,
    hasAudio: Boolean(row.audio_data && row.audio_mime),
    openedAt: row.opened_at ? new Date(row.opened_at).toISOString() : null,
  };
}
