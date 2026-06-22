"use client";
import { format } from "date-fns";
import { ExpenseRecord, CATEGORY_LABELS, CATEGORY_COLORS, PERSON_LABELS } from "@/types";
import { formatAed } from "@/lib/utils";
import Link from "next/link";

interface Props {
  expenses: ExpenseRecord[];
}

export function RecentExpenses({ expenses }: Props) {
  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center gap-3 py-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
          >
            {expense.merchant.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{expense.merchant}</p>
            <p className="text-xs text-slate-400">
              {CATEGORY_LABELS[expense.category]} · {PERSON_LABELS[expense.person]} ·{" "}
              {format(new Date(expense.date), "MMM d")}
            </p>
          </div>
          <p className="text-sm font-bold text-slate-800 shrink-0">
            {formatAed(expense.amountAed)}
          </p>
        </div>
      ))}
      <Link
        href="/expenses"
        className="block text-center text-sm text-emerald-600 font-medium pt-2"
      >
        View all expenses →
      </Link>
    </div>
  );
}
