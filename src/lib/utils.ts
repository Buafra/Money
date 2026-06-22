import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfMonth, endOfMonth, getDaysInMonth, getDate } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

export function getMonthRange(month: string): { start: Date; end: Date } {
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getDaysElapsed(month: string): number {
  const [year, mon] = month.split("-").map(Number);
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === mon;
  if (!isCurrentMonth) {
    return getDaysInMonth(new Date(year, mon - 1, 1));
  }
  return getDate(today);
}

export function formatMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  return format(new Date(year, mon - 1, 1), "MMMM yyyy");
}

export function prevMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const d = new Date(year, mon - 2, 1);
  return format(d, "yyyy-MM");
}

export function nextMonth(month: string): string {
  const [year, mon] = month.split("-").map(Number);
  const d = new Date(year, mon, 1);
  return format(d, "yyyy-MM");
}

export function toAed(amount: number, currency: string): number {
  const rates: Record<string, number> = {
    AED: 1,
    USD: 3.67,
    EUR: 4.0,
    GBP: 4.65,
    SAR: 0.98,
    KWD: 12.0,
  };
  return amount * (rates[currency.toUpperCase()] ?? 1);
}
