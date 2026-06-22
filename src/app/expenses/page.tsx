"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Filter,
} from "lucide-react";
import {
  ExpenseRecord,
  CATEGORIES,
  PERSONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  PERSON_LABELS,
} from "@/types";
import { formatAed, getCurrentMonth, formatMonth, prevMonth, nextMonth } from "@/lib/utils";

export default function ExpensesPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [person, setPerson] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ month });
    if (person) params.set("person", person);
    if (category) params.set("category", category);
    fetch(`/api/expenses?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setExpenses(data.expenses || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [month, person, category]);

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setTotal((prev) => prev - 1);
    setDeleting(null);
  };

  const isCurrentMonth = month === getCurrentMonth();
  const grandTotal = expenses.reduce((s, e) => s + e.amountAed, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              showFilters ? "bg-white text-emerald-600" : "bg-white/20 text-white"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between mt-3 bg-white/20 rounded-xl px-2 py-1">
          <button onClick={() => setMonth(prevMonth(month))} className="p-2 text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-white font-semibold">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth(nextMonth(month))}
            disabled={isCurrentMonth}
            className="p-2 text-white disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-slate-100 px-4 py-3 space-y-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full input-field text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <select
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            className="w-full input-field text-sm"
          >
            <option value="">All People</option>
            {PERSONS.map((p) => (
              <option key={p} value={p}>{PERSON_LABELS[p]}</option>
            ))}
          </select>
        </div>
      )}

      {/* Summary bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex justify-between items-center">
        <span className="text-sm text-slate-500">{total} expense{total !== 1 ? "s" : ""}</span>
        <span className="text-sm font-bold text-slate-800">{formatAed(grandTotal)}</span>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium">No expenses found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                >
                  {expense.merchant.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {expense.merchant}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {CATEGORY_LABELS[expense.category]} · {PERSON_LABELS[expense.person]}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(expense.date), "d MMM yyyy")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-slate-800">
                    {formatAed(expense.amountAed)}
                  </p>
                  {expense.currency !== "AED" && (
                    <p className="text-xs text-slate-400">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    disabled={deleting === expense.id}
                    className="mt-1 p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
