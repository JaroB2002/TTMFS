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
  now?: Date;
}): { deliverAt: Date; label: string } {
  const now = input.now ?? new Date();

  if (input.preset === "instant") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Onbekende planning.");
    }
    return {
      deliverAt: new Date(now.getTime() - 1000),
      label: "Direct (lokaal)",
    };
  }

  if (input.mode === "chosen") {
    if (input.preset === "custom") {
      if (!input.customDate) {
        throw new Error("Kies een datum.");
      }
      const deliverAt = new Date(`${input.customDate}T12:00:00.000Z`);
      if (Number.isNaN(deliverAt.getTime())) {
        throw new Error("Ongeldige datum.");
      }
      const min = new Date(now.getTime() + DAY_MS);
      const max = new Date(now.getTime() + 20 * YEAR_MS);
      if (deliverAt < min || deliverAt > max) {
        throw new Error("Kies een datum tussen morgen en 20 jaar.");
      }
      return {
        deliverAt,
        label: `Op ${formatLongDate(deliverAt)}`,
      };
    }

    const chosen = chosenPreset(input.preset, now);
    return chosen;
  }

  return randomPreset(input.preset, now);
}

function chosenPreset(
  preset: SchedulePreset,
  now: Date,
): { deliverAt: Date; label: string } {
  const map: Partial<
    Record<SchedulePreset, { offsetMs: number; label: string }>
  > = {
    tomorrow: { offsetMs: DAY_MS, label: "Morgen" },
    week: { offsetMs: 7 * DAY_MS, label: "Over een week" },
    month: { offsetMs: 30 * DAY_MS, label: "Over een maand" },
    year: { offsetMs: YEAR_MS, label: "Over een jaar" },
    five_years: { offsetMs: 5 * YEAR_MS, label: "Over vijf jaar" },
    twenty_years: { offsetMs: 20 * YEAR_MS, label: "Over twintig jaar" },
  };
  const entry = map[preset];
  if (!entry) {
    throw new Error("Onbekende planning.");
  }
  return {
    deliverAt: new Date(now.getTime() + entry.offsetMs),
    label: entry.label,
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
      label: "Ergens binnen een jaar",
    },
    surprise_decade: {
      minMs: YEAR_MS,
      maxMs: 10 * YEAR_MS,
      label: "Ergens binnen tien jaar",
    },
    surprise_lifetime: {
      minMs: DAY_MS,
      maxMs: 20 * YEAR_MS,
      label: "Ergens binnen twintig jaar",
    },
    week: {
      minMs: DAY_MS,
      maxMs: 7 * DAY_MS,
      label: "Ergens binnen een week",
    },
    year: {
      minMs: DAY_MS,
      maxMs: YEAR_MS,
      label: "Ergens binnen een jaar",
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

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRelativeWait(deliverAt: Date, now = new Date()): string {
  const ms = deliverAt.getTime() - now.getTime();
  if (ms <= 0) return "nu";
  const days = Math.ceil(ms / DAY_MS);
  if (days < 14) return `${days} dag${days === 1 ? "" : "en"}`;
  if (days < 60) return `${Math.ceil(days / 7)} weken`;
  if (days < 730) return `${Math.ceil(days / 30)} maanden`;
  const years = Math.round(days / 365);
  return `${years} jaar`;
}
