"use client";
import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Repeat,
  Star,
} from "lucide-react";
import { InsightsData, CATEGORY_LABELS } from "@/types";
import { formatAed, getCurrentMonth } from "@/lib/utils";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400 font-medium">/100</span>
        </div>
      </div>
      <p className="mt-2 text-base font-semibold" style={{ color }}>{label}</p>
      <p className="text-xs text-slate-400">Financial Health Score</p>
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/insights?month=${getCurrentMonth()}`);
      if (!res.ok) throw new Error("Failed to generate insights");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">AI Insights</h1>
        <p className="text-emerald-100 text-sm mt-1">Personal CFO Analysis</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Generate button */}
        {!data && !loading && (
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-sm">
            <Star className="h-16 w-16 text-emerald-400 mb-4" />
            <h2 className="text-lg font-semibold text-slate-800">Get Your Financial Report</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              AI analyzes your spending patterns and provides personalized recommendations
            </p>
            <button
              onClick={generate}
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Generate Report
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center shadow-sm">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Analyzing your finances...</p>
            <p className="text-slate-400 text-sm mt-1">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Health Score */}
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
              <ScoreRing score={data.score} label={data.healthLabel} />
            </div>

            {/* Top Categories */}
            {data.topCategories.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Top Spending Categories
                </h2>
                <div className="space-y-2">
                  {data.topCategories.map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <span className="flex-1 text-sm text-slate-700">
                        {CATEGORY_LABELS[cat.category]}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatAed(cat.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Subscriptions */}
            {data.recurringDetected.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-blue-500" />
                  Recurring Expenses Detected
                </h2>
                <div className="space-y-2">
                  {data.recurringDetected.map((r) => (
                    <div key={r.merchant} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{r.merchant}</p>
                        <p className="text-xs text-slate-400 capitalize">{r.frequency}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        ~{formatAed(r.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {data.alerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alerts
                </h2>
                <ul className="space-y-2">
                  {data.alerts.map((alert, i) => (
                    <li key={i} className="text-sm text-amber-700 flex gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Insights */}
            {data.insights.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Key Findings
                </h2>
                <ul className="space-y-2.5">
                  {data.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {data.suggestions.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h2 className="text-base font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Savings Opportunities
                </h2>
                <ul className="space-y-3">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-700 flex gap-2">
                      <span className="bg-emerald-200 text-emerald-800 font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regenerate */}
            <button
              onClick={generate}
              className="w-full flex items-center justify-center gap-2 py-3.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
