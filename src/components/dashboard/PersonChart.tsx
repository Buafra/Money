"use client";
import { Person, PERSON_LABELS } from "@/types";
import { formatAed } from "@/lib/utils";

const PERSON_COLORS: Record<Person, string> = {
  FAISAL: "#6366f1",
  WIFE: "#ec4899",
  CHILD: "#f59e0b",
  SHARED: "#10b981",
  NEEDS_ATTRIBUTION: "#94a3b8",
};

interface Props {
  data: { person: Person; amount: number; pct: number }[];
}

export function PersonChart({ data }: Props) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.person}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-700">
              {PERSON_LABELS[item.person]}
            </span>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-800">
                {formatAed(item.amount)}
              </span>
              <span className="text-xs text-slate-400 ml-1.5">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.pct}%`,
                backgroundColor: PERSON_COLORS[item.person],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
