"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardData } from "@/types";
import { formatAed, formatMonth, getCurrentMonth, prevMonth, nextMonth } from "@/lib/utils";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { PersonChart } from "@/components/dashboard/PersonChart";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?month=${month}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [month]);

  const isCurrentMonth = month === getCurrentMonth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        {/* Month selector */}
        <div className="flex items-center justify-between mt-4 bg-white/20 rounded-xl px-2 py-1">
          <button
            onClick={() => setMonth(prevMonth(month))}
            className="p-2 text-white hover:bg-white/20 rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-white font-semibold">{formatMonth(month)}</span>
          <button
            onClick={() => setMonth(nextMonth(month))}
            disabled={isCurrentMonth}
            className="p-2 text-white hover:bg-white/20 rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Total Spending */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Total Spending</p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {formatAed(data.totalSpending)}
              </p>

              {data.vsLastMonth !== null && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${
                  data.vsLastMonth > 0 ? "text-red-500" : "text-emerald-600"
                }`}>
                  {data.vsLastMonth > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {Math.abs(data.vsLastMonth).toFixed(1)}% vs last month
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Daily Burn Rate</p>
                  <p className="text-lg font-semibold text-slate-700 mt-0.5">
                    {formatAed(data.dailyBurnRate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Month Forecast</p>
                  <p className="text-lg font-semibold text-slate-700 mt-0.5">
                    {formatAed(data.forecastMonthEnd)}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Day {data.daysElapsed} of {data.daysInMonth}</span>
                  <span>{Math.round((data.daysElapsed / data.daysInMonth) * 100)}% through month</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(data.daysElapsed / data.daysInMonth) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {data.byCategory.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-4">By Category</h2>
                <CategoryChart data={data.byCategory} />
              </div>
            )}

            {/* Person Breakdown */}
            {data.byPerson.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-4">By Person</h2>
                <PersonChart data={data.byPerson} />
              </div>
            )}

            {/* Recent Expenses */}
            {data.recentExpenses.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Expenses</h2>
                <RecentExpenses expenses={data.recentExpenses} />
              </div>
            )}

            {data.totalSpending === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg font-medium">No expenses this month</p>
                <p className="text-sm mt-1">Start adding expenses to see your dashboard</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
