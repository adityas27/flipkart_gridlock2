import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getDurationHours(start, end) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60)));
}
