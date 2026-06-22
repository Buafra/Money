import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toAed, getMonthRange, getCurrentMonth } from "@/lib/utils";
import { Category, Person } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || getCurrentMonth();
  const person = searchParams.get("person") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const { start, end } = getMonthRange(month);

  const where: Record<string, unknown> = {
    date: { gte: start, lte: end },
  };
  if (person) where.person = person;
  if (category) where.category = category;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return NextResponse.json({ expenses, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    merchant,
    date,
    amount,
    currency = "AED",
    category,
    person,
    description,
    items,
    sourceType = "MANUAL",
    rawInput,
    confidence,
    needsReview,
  } = body;

  const amountAed = toAed(amount, currency);

  const expense = await prisma.expense.create({
    data: {
      merchant,
      date: new Date(date),
      amount,
      currency,
      amountAed,
      category: category as Category,
      person: person as Person,
      description: description || null,
      items: items ? JSON.stringify(items) : null,
      sourceType,
      rawInput: rawInput || null,
      confidence: confidence ?? null,
      needsReview: needsReview ?? false,
    },
  });

  await updateRecurringPattern(merchant, category, person, amountAed);

  return NextResponse.json(expense, { status: 201 });
}

async function updateRecurringPattern(
  merchant: string,
  category: string,
  person: string,
  amountAed: number
) {
  const existing = await prisma.recurringPattern.findUnique({
    where: { merchant_person: { merchant, person } },
  });

  if (existing) {
    const newAvg = (existing.avgAmountAed * existing.count + amountAed) / (existing.count + 1);
    await prisma.recurringPattern.update({
      where: { merchant_person: { merchant, person } },
      data: {
        avgAmountAed: newAvg,
        count: existing.count + 1,
        lastSeen: new Date(),
        frequency: existing.count >= 2 ? "monthly" : "occasional",
      },
    });
  } else {
    await prisma.recurringPattern.create({
      data: {
        merchant,
        category,
        person,
        avgAmountAed: amountAed,
        frequency: "occasional",
        lastSeen: new Date(),
        count: 1,
      },
    });
  }
}
