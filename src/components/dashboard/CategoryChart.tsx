"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { formatAed } from "@/lib/utils";

interface Props {
  data: { category: Category; amount: number; pct: number }[];
}

export function CategoryChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category],
    value: d.amount,
    category: d.category,
    pct: d.pct,
    color: CATEGORY_COLORS[d.category],
  }));

  return (
    <div>
      <div className="flex justify-center mb-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatAed(Number(value)), ""]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.category} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
            />
            <span className="text-sm text-slate-600 flex-1">{CATEGORY_LABELS[item.category]}</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-slate-800">
                {formatAed(item.amount)}
              </span>
              <span className="text-xs text-slate-400 ml-2">{item.pct.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
