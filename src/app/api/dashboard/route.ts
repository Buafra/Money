import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getMonthRange,
  getCurrentMonth,
  getDaysElapsed,
  prevMonth,
} from "@/lib/utils";
import { getDaysInMonth } from "date-fns";
import { Category, Person, CATEGORIES, PERSONS } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();

  const { start, end } = getMonthRange(month);
  const { start: prevStart, end: prevEnd } = getMonthRange(prevMonth(month));

  const [expenses, prevExpenses, recentExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      select: { amountAed: true, category: true, person: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: prevStart, lte: prevEnd } },
      select: { amountAed: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "desc" },
      take: 10,
    }),
  ]);

  const totalSpending = expenses.reduce((sum: number, e) => sum + e.amountAed, 0);
  const totalLast = prevExpenses.reduce((sum: number, e) => sum + e.amountAed, 0);

  const [year, mon] = month.split("-").map(Number);
  const daysInMonth = getDaysInMonth(new Date(year, mon - 1, 1));
  const daysElapsed = getDaysElapsed(month);
  const dailyBurnRate = daysElapsed > 0 ? totalSpending / daysElapsed : 0;
  const forecastMonthEnd = dailyBurnRate * daysInMonth;

  const vsLastMonth =
    totalLast > 0 ? ((totalSpending - totalLast) / totalLast) * 100 : null;

  const byCategoryMap = new Map<Category, number>();
  for (const cat of CATEGORIES) byCategoryMap.set(cat, 0);
  for (const e of expenses) {
    const cat = e.category as Category;
    byCategoryMap.set(cat, (byCategoryMap.get(cat) ?? 0) + e.amountAed);
  }
  const byCategory = CATEGORIES.map((category) => ({
    category,
    amount: byCategoryMap.get(category) ?? 0,
    pct: totalSpending > 0 ? ((byCategoryMap.get(category) ?? 0) / totalSpending) * 100 : 0,
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const byPersonMap = new Map<Person, number>();
  for (const p of PERSONS) byPersonMap.set(p, 0);
  for (const e of expenses) {
    const person = e.person as Person;
    byPersonMap.set(person, (byPersonMap.get(person) ?? 0) + e.amountAed);
  }
  const byPerson = PERSONS.filter((p) => p !== "NEEDS_ATTRIBUTION").map((person) => ({
    person,
    amount: byPersonMap.get(person) ?? 0,
    pct: totalSpending > 0 ? ((byPersonMap.get(person) ?? 0) / totalSpending) * 100 : 0,
  })).filter((p) => p.amount > 0).sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    totalSpending,
    dailyBurnRate,
    forecastMonthEnd,
    vsLastMonth,
    byCategory,
    byPerson,
    recentExpenses,
    daysInMonth,
    daysElapsed,
    month,
  });
}
