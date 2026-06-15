import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format an amount in pence as a GBP string, e.g. 1000 -> "£10.00" */
export function formatMoney(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Compact money for tight spaces, e.g. 1000 -> "£10" */
export function formatMoneyShort(pence: number): string {
  const value = pence / 100;
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
  return formatted;
}

/** Parse a user-entered pounds string into pence. Returns null if invalid. */
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (cleaned === "") return null;
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value) || value < 0) return null;
  return Math.round(value * 100);
}

/** Relative time like "in 3h", "2d ago", "now" */
export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const future = diff > 0;

  const units: [number, string][] = [
    [60_000, "s"],
    [3_600_000, "m"],
    [86_400_000, "h"],
    [604_800_000, "d"],
  ];

  const year = 31_536_000_000;
  if (absDiff >= year) {
    const years = Math.round(absDiff / year);
    return future ? `in ${years}y` : `${years}y ago`;
  }

  // Find the largest unit that fits
  let value = absDiff;
  let suffix = "s";
  for (let i = units.length - 1; i >= 0; i--) {
    if (absDiff >= units[i][0]) {
      value = Math.round(absDiff / units[i][0]);
      suffix = units[i][1];
      break;
    }
  }
  if (absDiff < 60_000) {
    return future ? "soon" : "just now";
  }
  const str = `${value}${suffix}`;
  return future ? `in ${str}` : `${str} ago`;
}

/** Countdown like "03:14:22" for open bets, returns null if closed */
export function countdown(date: Date | string): string | null {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(h)}h`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "#7c3aed", "#db2777", "#0891b2", "#ea580c",
  "#16a34a", "#ca8a04", "#dc2626", "#4f46e5",
  "#0d9488", "#9333ea",
];

export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Generate a friendly invite code like "BLUE-FOX-42" */
export function generateInviteCode(): string {
  const adjectives = ["BLUE", "RED", "GOLD", "WILD", "LUCKY", "BOLD", "EPIC", "FAST", "CALM", "KEEN"];
  const nouns = ["FOX", "BEAR", "WOLF", "HAWK", "LION", "DEER", "GOAT", "TIGER", "ORCA", "KOALA"];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${a}-${n}-${num}`;
}
