import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMonthRange, getCurrentMonth, prevMonth } from "@/lib/utils";
import { generateInsights } from "@/lib/claude";
import { Category } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();

  const { start, end } = getMonthRange(month);
  const { start: prevStart, end: prevEnd } = getMonthRange(prevMonth(month));

  const [currentExpenses, prevExpenses, recurring] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: start, lte: end } },
      select: { amountAed: true, category: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: prevStart, lte: prevEnd } },
      select: { amountAed: true, category: true },
    }),
    prisma.recurringPattern.findMany({
      where: { count: { gte: 2 } },
      orderBy: { avgAmountAed: "desc" },
      take: 10,
    }),
  ]);

  const aggregateByCategory = (expenses: { amountAed: number; category: string }[]) => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amountAed);
    }
    return Array.from(map.entries()).map(([category, amount]) => ({ category, amount }));
  };

  const currentByCategory = aggregateByCategory(currentExpenses);
  const prevByCategory = aggregateByCategory(prevExpenses);
  const totalCurrent = currentExpenses.reduce((s: number, e) => s + e.amountAed, 0);
  const totalLast = prevExpenses.reduce((s: number, e) => s + e.amountAed, 0);

  const recurringMerchants = recurring.map((r) => ({
    merchant: r.merchant,
    amount: r.avgAmountAed,
    count: r.count,
    category: r.category as Category,
    frequency: r.frequency,
  }));

  if (totalCurrent === 0) {
    return NextResponse.json({
      score: 75,
      healthLabel: "Good",
      insights: ["No expenses recorded yet for this month."],
      alerts: [],
      suggestions: ["Start adding your expenses to get personalized insights."],
      recurringDetected: recurringMerchants,
      topCategories: [],
    });
  }

  const aiInsights = await generateInsights({
    currentMonth: currentByCategory,
    lastMonth: prevByCategory,
    threeMonthAvg: prevByCategory,
    totalCurrent,
    totalLast,
    recurringMerchants: recurringMerchants.map((r) => ({
      merchant: r.merchant,
      amount: r.amount,
      count: r.count,
    })),
  });

  const topCategories = currentByCategory
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((c) => ({ category: c.category as Category, amount: c.amount }));

  return NextResponse.json({
    ...aiInsights,
    recurringDetected: recurringMerchants,
    topCategories,
  });
}
