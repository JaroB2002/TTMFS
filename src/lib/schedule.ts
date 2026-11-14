export type ScheduleMode = "chosen" | "random";

export type SchedulePreset =
  | "tomorrow"
  | "week"
  | "month"
  | "year"
  | "five_years"
  | "twenty_years"
  | "surprise_year"
  | "surprise_decade"
  | "surprise_lifetime"
  | "custom"
  | "instant";

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365.25 * DAY_MS;

export function resolveDelivery(input: {
  mode: ScheduleMode;
  preset: SchedulePreset;
  customDate?: string;
  customTime?: string;
  timezoneOffset?: number;
  now?: Date;
}): { deliverAt: Date; label: string } {
  const now = input.now ?? new Date();
  const offset =
    typeof input.timezoneOffset === "number" &&
    Number.isFinite(input.timezoneOffset)
      ? input.timezoneOffset
      : 0;

  if (input.preset === "instant") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Unknown schedule.");
    }
    return {
      deliverAt: new Date(now.getTime() - 1000),
      label: "Instant (local)",
    };
  }

  if (input.mode === "chosen") {
    if (input.preset === "custom") {
      if (!input.customDate) {
        throw new Error("Pick a date.");
      }
      const time = normalizeTime(input.customTime);
      const deliverAt = wallTimeToUtc(input.customDate, time, offset);
      if (Number.isNaN(deliverAt.getTime())) {
        throw new Error("Invalid date or time.");
      }
      const min = new Date(now.getTime() + 60 * 60 * 1000);
      const max = new Date(now.getTime() + 20 * YEAR_MS);
      if (deliverAt < min || deliverAt > max) {
        throw new Error("Pick a moment between one hour from now and 20 years.");
      }
      return {
        deliverAt,
        label: `On ${formatWallLabel(input.customDate, time)}`,
      };
    }

    return chosenPreset(input.preset, now, input.customTime, offset);
  }

  return randomPreset(input.preset, now);
}

function chosenPreset(
  preset: SchedulePreset,
  now: Date,
  customTime?: string,
  timezoneOffset = 0,
): { deliverAt: Date; label: string } {
  const map: Partial<
    Record<SchedulePreset, { offsetMs: number; label: string }>
  > = {
    tomorrow: { offsetMs: DAY_MS, label: "Tomorrow" },
    week: { offsetMs: 7 * DAY_MS, label: "In one week" },
    month: { offsetMs: 30 * DAY_MS, label: "In one month" },
    year: { offsetMs: YEAR_MS, label: "In one year" },
    five_years: { offsetMs: 5 * YEAR_MS, label: "In five years" },
    twenty_years: { offsetMs: 20 * YEAR_MS, label: "In twenty years" },
  };
  const entry = map[preset];
  if (!entry) {
    throw new Error("Unknown schedule.");
  }
  const base = new Date(now.getTime() + entry.offsetMs);
  // Read the calendar day in the visitor's timezone.
  const local = new Date(base.getTime() - timezoneOffset * 60_000);
  const dateStr = `${local.getUTCFullYear()}-${String(local.getUTCMonth() + 1).padStart(2, "0")}-${String(local.getUTCDate()).padStart(2, "0")}`;
  const time = normalizeTime(customTime);
  const deliverAt = wallTimeToUtc(dateStr, time, timezoneOffset);
  return {
    deliverAt,
    label: `${entry.label} at ${time}`,
  };
}

function randomPreset(
  preset: SchedulePreset,
  now: Date,
): { deliverAt: Date; label: string } {
  const ranges: Partial<
    Record<SchedulePreset, { minMs: number; maxMs: number; label: string }>
  > = {
    surprise_year: {
      minMs: DAY_MS,
      maxMs: YEAR_MS,
      label: "Sometime within a year",
    },
    surprise_decade: {
      minMs: YEAR_MS,
      maxMs: 10 * YEAR_MS,
      label: "Sometime within ten years",
    },
    surprise_lifetime: {
      minMs: DAY_MS,
      maxMs: 20 * YEAR_MS,
      label: "Sometime within twenty years",
    },
    week: {
      minMs: DAY_MS,
      maxMs: 7 * DAY_MS,
      label: "Sometime within a week",
    },
    year: {
      minMs: DAY_MS,
      maxMs: YEAR_MS,
      label: "Sometime within a year",
    },
  };
  const entry = ranges[preset] ?? ranges.surprise_lifetime!;
  const span = entry.maxMs - entry.minMs;
  const offset = entry.minMs + Math.floor(Math.random() * span);
  return {
    deliverAt: new Date(now.getTime() + offset),
    label: entry.label,
  };
}

function normalizeTime(customTime?: string): string {
  if (!customTime || !/^\d{2}:\d{2}$/.test(customTime)) {
    return "12:00";
  }
  const [h, m] = customTime.split(":").map(Number);
  if (h! > 23 || m! > 59) {
    throw new Error("Invalid time.");
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function wallTimeToUtc(
  dateStr: string,
  time: string,
  timezoneOffsetMinutes: number,
): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const utcMs =
    Date.UTC(y!, mo! - 1, d!, h!, mi!, 0, 0) + timezoneOffsetMinutes * 60_000;
  return new Date(utcMs);
}

function formatWallLabel(dateStr: string, time: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const probe = new Date(Date.UTC(y!, mo! - 1, d!, h!, mi!));
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(probe);
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatLongDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeWait(deliverAt: Date, now = new Date()): string {
  const ms = deliverAt.getTime() - now.getTime();
  if (ms <= 0) return "now";
  const days = Math.ceil(ms / DAY_MS);
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.ceil(days / 7)} weeks`;
  if (days < 730) return `${Math.ceil(days / 30)} months`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"}`;
}
