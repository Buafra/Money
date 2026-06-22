import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toAed } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { amount, currency, ...rest } = body;

  const amountAed = amount && currency ? toAed(amount, currency) : undefined;

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...rest,
      ...(amount !== undefined && { amount }),
      ...(currency !== undefined && { currency }),
      ...(amountAed !== undefined && { amountAed }),
      ...(rest.date && { date: new Date(rest.date) }),
    },
  });

  return NextResponse.json(expense);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
